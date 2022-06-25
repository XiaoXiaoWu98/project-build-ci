import axios from 'axios';
import crypto from 'crypto'

interface NotifyOptions {
  msgtype: string;
  markdown: {
    title;
    text: string;
  };
}
export async function request(url: string, options: NotifyOptions) {
  const res = await axios.post(url, options, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return res;
}

//给标签加密才能接入后缀参数
export async function handleUrlAsign(dingWebHook, secret) {
  var time = Date.now(); //当前时间
  var stringToSign = time + '\n' + secret;
  var base = crypto
    .createHmac('sha256', secret)
    .update(stringToSign)
    .digest('base64');
  var sign = encodeURIComponent(base); //签名
  const url = dingWebHook + `&timestamp=${time}&sign=${sign}`;
  return url;
}

/**
 * 钉钉通知
 * @export
 * @param {*} msg 通知信息, markdown 格式
 * @param {string} [title=''] 钉钉消息 title
 * @returns
 */

export function notify(dingtalkWebhook, msg, title = '[打包信息]') {
  return request(dingtalkWebhook, {
    msgtype: 'markdown',
    markdown: {
      title,
      text: msg,
    },
  });
}
