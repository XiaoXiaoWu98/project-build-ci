import request from "../request"

type Options = Parameters<typeof request>['1']

/**
 * 用户登录 
 * */
 export function uerLogin(
    data: StrApi.ReqLogin,
    options: Options = {}
) {

    const url = '/api/auth/local'

    return request<StrApi.ResLogin>(
        url,
        {
            method: 'POST',
            data,
            ...options,
            headers: {
                ...(options.headers || {}),
            },
        },
        'StrApi'
    )
}
