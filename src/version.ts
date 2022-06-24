/* eslint-disable import/no-commonjs */
/**
 * 更新版本号
 */


const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const packageConfig = require('../../package.json')

const packagePath = path.join(__dirname, '.', '../../package.json')

export default function setVersion(type: string) {
    const version = packageConfig.version
    let newVersion = version

    if (/^\d+\.\d+\.\d+$/.test(type)) {
        newVersion = type
    } else {
        let numList: (string | number)[] = version.split('.')

        switch (type) {
            case 'patch':
                numList[2] = Number(numList[2]) + 1
                break
            case 'minor':
                numList[1] = Number(numList[1]) + 1
                numList[2] = 0
                break
            case 'major':
                numList[0] = Number(numList[0]) + 1
                numList[1] = numList[2] = 0
                break
            default:
                console.log(chalk.red('请输入合法的版本号或“patch”、“minor”、“major”'))
                return
        }

        newVersion = numList.join('.')
    }

    packageConfig.version = newVersion

    let packageJSON = JSON.stringify(packageConfig, null, 4)
    fs.writeFile(packagePath, packageJSON, 'utf8', (err: { message: string }) => {
        if (err) {
            throw new Error(err.message)
        }
    })

    console.log(chalk.green(`\n\n version: ${version} ===> ${newVersion} \n\n`))
}

// const Command: yargs.CommandModule = {
//     command: ['version [type]'],
//     describe: '更新版本号',
//     handler(args: any) {
//         const { type } = args
//         setVersion(type)
//     },
// }

// export default Command
