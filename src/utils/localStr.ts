import { get, set, rm, setPrefix } from 'lockr';
import { encryptByAES, decryptByAES } from './secret'
// const tokenName = 'tokenName'
// const username = 'username';
// const password = 'password';
// setPrefix('tuo')

/** 设置localStorage
 * @param  {string} tokenName //localStorage名称
 * @param  {string} token //localStorage数据
 * @returns string  设置的localStorage
 */
export function setLockr(tokenName: string, token: string) {
    const data = encryptByAES(token)
    set(tokenName, data);
}

/** 获取localStorage
 * @param  {string} tokenName //localStorage名称
 * @returns string  localStorage数据
 */
export function getLockr(tokenName: string): string {
    return decryptByAES(get(tokenName))
}

/** 移除localStorage
 * @param  {string} tokenName //localStorage名称
 */
export function removeLockr(tokenName: string) {
    rm(tokenName);
}