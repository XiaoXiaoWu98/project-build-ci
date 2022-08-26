import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, } from 'axios'
import { useContext } from 'react'
import { userInfoContext } from '../App'
import { useNavigate } from 'react-router-dom'
import qs from 'qs'
import { getLockr } from '../utils/localStr'
import { message } from 'antd'

const baseURL = process.env.REACT_APP_BASE_URL

const instance = axios.create({
    baseURL: baseURL,
    timeout: 20000,
    responseType: 'json',
    paramsSerializer: function (params: any) {
        return qs.stringify(params, { arrayFormat: 'comma' })
    }
})
// 添加请求拦截器
instance.interceptors.request.use(
    async (config: AxiosRequestConfig) => {
        const token = await getLockr('jwt')
        config.headers!.Authorization = `Bearer ${token}`;
        if (config.method === 'post') {
            config.data = {
                ...config.data,

            }
        } else {
            config.params = {
                ...config.params,
            }
        }
        // const navigate = useNavigate()
        // console.log('info1:')
        // const info = useContext(userInfoContext)
        // console.log('info2:', info)
        return config
    },
    (err) => {
        return Promise.reject(err)
    }
)

// 添加响应拦截器
instance.interceptors.response.use(
    (res: AxiosRequestConfig) => {
        return res
    },
    (err: AxiosError) => {
        return Promise.reject(err)
    }
)

//请求接口弹出信息截流处理
function throttle(fn: any, delay: number) {
    let valid = false
    return function (msg: string) {
        if (!valid) {
            //休息时间 暂不接客
            return
        }
        // 工作时间，执行函数并且在间隔期内把状态位设为无效
        valid = false
        setTimeout(() => {
            fn(msg)
            valid = true;
        }, delay)
    }
}

function notify (msg: string) {
    const handleErrorMessage = throttle(message.error, 2000)
    return handleErrorMessage(msg)
}

// 错误处理
const handleApiError = async (error: AxiosError) => {
    let code = 500
    let data = null
    if (error.response) {
        data = error.response.data
        code = error.response.status
    }

    if ([401].includes(code)) {

        return Promise.reject(error)
    } else {
        let msg = '未知错误'
        const errorMsg = error.message || ''

        if (errorMsg.includes('Network Error')) {
            msg =
                '请检查网络' +
                (error.config && error.config.url
                    ? error.config.url
                    : JSON.stringify(error.request))
        } else if (errorMsg.includes('timeout') && errorMsg.includes('exceeded')) {
            msg = '请求超时'
        }

        if (data) {
            // @ts-ignore
            msg = data.msg
        }

        // @ts-ignore
        if (!error.config || !error.config.hideToast) {
            console.log(msg || '系统错误，请稍后重试')
        }

        return Promise.reject(error)
    }
}

export default async function request<T>(url: string, options: AxiosRequestConfig, _ns?: string) {
    return instance
        .request<T>({
            url,
            ...options,
            responseType: options.responseType || 'json'
        })
        .then((res: AxiosResponse) => {
            // @ts-ignore
            return res.data as T
        })
        .catch((err: AxiosError) => {
            notify(err.message || '系统错误，请稍后重试')
            handleApiError(err)
            throw err
        })
}
