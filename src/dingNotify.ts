import axios from 'axios'
import chalk from 'chalk'
import crypto from 'crypto'

const ora = require('ora')

interface NotifyOptions {
    msgtype: string
    markdown: {
        title
        text: string
    }
}
export async function request(url: string, options: NotifyOptions) {
    const res = await axios.post(url, options, {
        headers: {
            'Content-Type': 'application/json',
        },
    })
    return res
}

//给标签加密才能接入后缀参数
export async function handleUrlAsign(dingWebHook, secret) {
    var time = Date.now() //当前时间
    var stringToSign = time + '\n' + secret
    var base = crypto
        .createHmac('sha256', secret)
        .update(stringToSign)
        .digest('base64')
    var sign = encodeURIComponent(base) //签名
    const url = dingWebHook + `&timestamp=${time}&sign=${sign}`
    return url
}

/**
 * 钉钉通知
 * @export
 * @param {*} msg 通知信息, markdown 格式
 * @param {string} [title=''] 钉钉消息 title
 * @returns
 */

export async function notify(dingtalkWebhook, msg, title = '[打包信息]') {
    const spinner = ora()

    spinner.start('正在推送消息到钉钉群... 😎')
    try {
        await request(dingtalkWebhook, {
            msgtype: 'markdown',
            markdown: {
                title,
                text: msg,
            },
        })
        spinner.succeed(chalk.green('消息推送成功 🥂'))
    } catch (error) {
        spinner.succeed(chalk.green(`钉钉机器人消息推送失败 🥂 ${error}`))
    }
}
