import { notify, handleUrlAsign } from './dingNotify'

const chalk = require('chalk')
const logSymbols = require('log-symbols')
const path = require('path')
const fs = require('fs')
const yargs = require('yargs')
const enquirer = require('enquirer')
// const figures = require('figures');
const semver = require('semver')
const simplegit = require('simple-git')
const branch = require('./branch')
const exec = require('child_process').exec
const execa = require('execa')
const ora = require('ora')
// 计算下一个版本号
function nextVersion(
    version,
    releaseType = 'patch',
    identifier = ''
): Promise<string> {
    return semver.inc(version, releaseType, identifier)
}

// 修改 package.json 的版本号
function changeVersion(
    version: string,
    pkgConfig: any,
    pkgConfigFile: string
): Promise<string> {
    version = String(version).trim()
    return new Promise((resolve, reject) => {
        if (version.trim() === pkgConfig.version) {
            resolve(version)
            return version
        }
        pkgConfig.version = version
        const packageJSON = JSON.stringify(pkgConfig, null, 4) + '\n'
        fs.writeFile(pkgConfigFile, packageJSON, 'utf8', (err) => {
            if (err) {
                return reject(err)
            }
            resolve(version)
        })
    })
}

export interface configOptions {
    /*! 钉钉群机器人 */
    dingTalk?: { url: string; asign: string }
    /*! 项目配置 */
    apps: Apps
    /*! 项目环境配置 */
    envs: Envs[]
    /*! 项目生产环境 */
    prdAppEnv: string
}

interface Envs {
    /*! 环境名称 */
    name?: string
    /*! tag后缀 */
    identifier?: string
    /*! 环境所在的分支代码 */
    releaseBranch?: string
    /*! 是否是npm包 */
    isNpm?: boolean
}

interface Apps {
    /*! 标签 */
    label: string
    /*! 项目名字 */
    name: string
    /*! 项目路径 */
    projectPath: string
    /*! 项目版本 */
    version?: string
}

export async function preBuild(configs: configOptions) {
    const git = simplegit()
    const diff = await git.diff()
    // if (diff)
    //     return console.log(logSymbols.error, chalk.red('当前有未提交的修改'))
    const {
        apps,
        dingTalk,
        envs = [
            { name: 'dev', identifier: 'dev' },
            { name: 'sit', identifier: 'rc' },
            { name: 'deploy', identifier: '' },
        ],
        prdAppEnv = 'deploy',
    } = configs
    const envNames = envs.map((v) => v.name)
    if (!apps.projectPath) return
    const packageJsonPath = path.join(apps.projectPath, './package.json')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const packageJson = require(packageJsonPath)
    const curVersion = packageJson.version

    // 获取 env 参数
    const args = yargs
        // @ts-ignore
        .usage('$0 <appEnv>', '构建前准备', (y) => {
            y.positional('appEnv', {
                describe: 'App Env',
                choices: envNames,
            }).option('remote', {
                description: '远端仓库的名称，默认是 origin',
                default: 'origin',
            })
        })
        .version(false)
        .help().argv
    const appEnv = args.appEnv
    // 环境配置
    const envConfig: Envs = envs.find((v) => v.name === appEnv) || {}
    // 版本后缀名，比如 dev 是 dev, sit 是 rc, deploy 是空的
    const versionIdentifier = envConfig.identifier || ''
    // 检查分支是否在对应环境的发布分支
    const releaseBranch = envConfig.releaseBranch
    if (releaseBranch) {
        const curBranch = await branch.getCurrentBranch()
        if (curBranch !== releaseBranch) {
            console.log(
                chalk.bgRed(
                    `当前分支和当前 appEnv:${appEnv} 的发布分支不匹配!(${curBranch}!==${releaseBranch})`
                )
            )
            return
        }
        // 应用版本
        try {
            const selectVersion = await enquirer.prompt({
                name: apps.name,
                message: `请输入${apps.label}要打包的版本[当前：${packageJson.version}]`,
                type: 'select',
                choices: function () {
                    if (appEnv === prdAppEnv) {
                        return [
                            {
                                message: 'patch(小版本)',
                                name: 'patch',
                            },
                            {
                                message: 'minor(中版本)',
                                name: 'minor',
                            },
                            {
                                message: 'major(大版本)',
                                name: 'major',
                            },
                        ]
                    } else {
                        return [
                            {
                                message: 'prerelease(build 加一)',
                                name: 'prerelease',
                            },
                            {
                                message: 'prepatch(小版本)',
                                name: 'prepatch',
                            },
                            {
                                message: 'preminor(中版本)',
                                name: 'preminor',
                            },
                            {
                                message: 'premajor(大版本)',
                                name: 'premajor',
                            },
                        ]
                    }
                },
                format: function (value) {
                    return nextVersion(curVersion, value, versionIdentifier)
                },
                initial: appEnv === prdAppEnv ? 'patch' : 'prerelease',
            })
            if (!selectVersion) return console.log(chalk.red('取消打包'))
            apps.version = await nextVersion(
                curVersion,
                selectVersion[apps.name],
                versionIdentifier
            )
        } catch (err) {
            console.log(err)
        }
        if (!apps.version) {
            return
        }
        // 确认版本
        const answers = await enquirer.prompt([
            {
                name: 'confirm',
                message: `是否确认打包 ${apps.name}: ${apps.version}`,
                type: 'confirm',
            },
        ])
        if (!answers.confirm) return console.log(chalk.red('取消打包'))
        if (!semver.valid(apps.version))
            return console.log(logSymbols.error, chalk.red('版本号格式错误'))
        // 修改版本号
        await changeVersion(apps.version, packageJson, packageJsonPath)
        const spinner = ora()

        try {
            //package.json 版本号

            await git.add(apps.projectPath + '/*')
            await git.commit(`prebuild: ${apps.version}`)
            spinner.start('正在推送代码到远程中... 😎')
            await git.push('origin', releaseBranch)
            spinner.succeed('推送远程代码成功 🥂')
            // const isExist = await git.show(`v${nextVersion}`);
            spinner.start('正在创建本地tag... 😎')
            await git.tag([`${apps.version}`])
            // if (!isExist) await git.tag([`v${nextVersion}`]);
            spinner.start('正在推送远程tag... 😎')
            await git.push(['origin', `${apps.version}`])
            spinner.succeed('推送远程tag成功 🥂')
            if (dingTalk) {
             
                const url = await handleUrlAsign(dingTalk.url, dingTalk.asign)
                const msg = `
## 🎉🎉 [${apps.name}] 打包成功 🥳 
- version: **${apps.version}** ;
- 操作人: ${process.env.GITLAB_USER_NAME || process.env.USER}
;`
                notify(url, msg, apps.name)
            }
            //如果是npm包直接推送npm
            if (appEnv === prdAppEnv && envConfig.isNpm) {
                // await execa('npm', ['publish'], { execPath: packageJsonPath })
                exec('npm publish', (err, stdout, stderr) => {
                    if (err) {
                        console.log(chalk.bgRed(`npm包推送失败 ${err}`))
                    } else {
                        console.log(
                            logSymbols.success,
                            chalk.green(
                                `推送npm包: ${apps.name}成功，--version: ${apps.version}`
                            )
                        )
                    }
                })
            }
        } catch (err) {
          spinner.fail(`推送远程失败... 😎，: + ${err}`)
            if (dingTalk) {
                const url = await handleUrlAsign(dingTalk.url, dingTalk.asign)
                const msg = `
## 🎉🎉 [${apps.name}] 
- 打包失败 😭😭 version: **${apps.version}** ;
- 操作人: ${process.env.GITLAB_USER_NAME || process.env.USER} ;
- 原因: git提交失败: ${err}
;`
                notify(url, msg, apps.name)
            }
        }

        return
    }
}
