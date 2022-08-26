/*
 * @Description: 更改前请留下你的姓名
 * @Author: Tokyo
 * @Date: 2021-06-02 20:12:31
 * @LastEditTime: 2021-06-03 16:28:37
 * @LastEditors: Tokyo
 * @FilePath: \russia-h5\src\utils\cookie.ts
 */
import Cookie from 'js-cookie';
import { encryptByAES, decryptByAES } from './secret'
// const tokenName = 'tokenName'
// const username = 'username';
// const password = 'password';


/** 设置cookie
 * @param  {string} tokenName //cookie名称
 * @param  {string} token //cookie数据
 * @returns string  设置的cookie
 */
export function setToken(tokenName: string, token: string): string | undefined {
  const data = encryptByAES(token)
  return Cookie.set(tokenName, data, { expires: 7 });
}

/** 获取cookie
 * @param  {string} tokenName //cookie名称
 * @returns string  cookie数据
 */
export function getToken(tokenName: string): string | undefined {
  return encryptByAES(Cookie.get(tokenName) as string);
}

/** 移除cookie
 * @param  {string} tokenName //cookie名称
 */
export function removeToken(tokenName: string) {
  Cookie.remove(tokenName);
}
