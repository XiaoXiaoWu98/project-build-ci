/*
 * @Description: 更改前请留下你的姓名
 * @Author: Tokyo
 * @Date: 2021-06-02 20:12:31
 * @LastEditTime: 2021-06-03 16:28:37
 * @LastEditors: Tokyo
 * @FilePath: \russia-h5\src\utils\cookie.ts
 */
import Cookie from 'js-cookie';

// const tokenName = 'tokenName'
// const username = 'username';
// const password = 'password';

export function setToken(tokenName: string, token: string): string | undefined {
  return Cookie.set(tokenName, token, { expires: 7 });
}

export function getToken(tokenName: string): string | undefined {
  return Cookie.get(tokenName);
}

export function removeToken(tokenName: string) {
  Cookie.remove(tokenName);
}
