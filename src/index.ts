const chalk = require('chalk');
const logSymbols = require('log-symbols');
const path = require('path');
const fs = require('fs');
const yargs = require('yargs');
const enquirer = require('enquirer');
// const figures = require('figures');
const semver = require('semver');
const simplegit = require('simple-git');
const branch = require('./branch');

// 计算下一个版本号
function nextVersion(
  version,
  releaseType = 'patch',
  identifier = '',
): Promise<string> {
  return semver.inc(version, releaseType, identifier);
}

// 修改 package.json 的版本号
function changeVersion(
  version: string,
  pkgConfig: any,
  pkgConfigFile: string,
): Promise<string> {
  version = String(version).trim();
  return new Promise((resolve, reject) => {
    if (version.trim() === pkgConfig.version) {
      resolve(version);
      return version;
    }
    pkgConfig.version = version;
    const packageJSON = JSON.stringify(pkgConfig, null, 4) + '\n';
    fs.writeFile(pkgConfigFile, packageJSON, 'utf8', (err) => {
      if (err) {
        return reject(err);
      }
      resolve(version);
    });
  });
}

async function preBuild(configs) {
  const git = simplegit();
  const diff = await git.diff();
  if (diff)
    return console.log(logSymbols.error, chalk.red('当前有未提交的修改'));
  const {
    apps = {},
    envs = [
      { name: 'dev', identifier: 'dev' },
      { name: 'sit', identifier: 'rc' },
      { name: 'deploy', identifier: '' },
    ],
    prdAppEnv = 'deploy',
  } = configs;
  const envNames = envs.map((v) => v.name);
  if (!apps.projectPath) return;
  const packageJsonPath = path.join(apps.projectPath, './package.json');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const packageJson = require(packageJsonPath);
  const curVersion = packageJson.version;

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
      });
    })
    .version(false)
    .help().argv;
  const appEnv = args.appEnv;
  // 环境配置
  const envConfig = envs.find((v) => v.name === appEnv);
  // 版本后缀名，比如 dev 是 dev, sit 是 rc, deploy 是空的
  const versionIdentifier = envConfig.identifier || '';
  // 检查分支是否在对应环境的发布分支
  const releaseBranch = envConfig.releaseBranch;
  if (releaseBranch) {
    const curBranch = await branch.getCurrentBranch();
    if (curBranch !== releaseBranch) {
      console.log(
        chalk.bgRed(
          `当前分支和当前 appEnv:${appEnv} 的发布分支不匹配!(${curBranch}!==${releaseBranch})`,
        ),
      );
      return;
    }
    // 应用版本
    try {
      const answers = await enquirer.prompt({
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
            ];
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
            ];
          }
        },
        format: function (value) {
          return nextVersion(curVersion, value, versionIdentifier);
        },
        initial: appEnv === prdAppEnv ? 'patch' : 'prerelease',
      });
      apps.version = nextVersion(
        curVersion,
        answers[apps.name],
        versionIdentifier,
      );
      if (!apps.version) {
        return;
      }
    } catch (err) {
      console.log(err);
    }

    // 确认版本
    const answers = await enquirer.prompt([
      {
        name: 'confirm',
        message: `是否确认打包 ${apps.name}: ${apps.version}`,
        type: 'confirm',
      },
    ]);
    if (!answers) return console.log(chalk.red('取消打包'));
    if (!semver.valid(apps.version))
      return console.log(logSymbols.error, chalk.red('版本号格式错误'));
    // 修改版本号
    await changeVersion(apps.version, packageJson, packageJsonPath);
    await git.add(apps.projectPath + '/*');
    await git.commit(`prebuild: v${nextVersion}`);
    console.log(logSymbols.success, chalk.green('推送代码到远程中'));
    console.log('releaseBranch:', releaseBranch)
    await git.push('origin', releaseBranch);
    console.log(logSymbols.success, chalk.green('推送代码成功'));
    // const isExist = await git.show(`v${nextVersion}`);
    await git.tag([`${nextVersion}`]);
    // if (!isExist) await git.tag([`v${nextVersion}`]);
    await git.push(['origin', `v${nextVersion}`]);
    console.log(logSymbols.success, chalk.green('推送tag成功'));
    return;
  }
}
exports.preBuild = preBuild;
