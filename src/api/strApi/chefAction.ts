import request from "../request"

type Options = Parameters<typeof request>['1']

/**
 * 获取厨师列表 
 * */
export function getChefsList(
    params: StrApi.ReqChefsList,
    options: Options = {}
) {

    const url = '/api/chefs'

    return request<StrApi.ResChefsList>(
        url,
        {
            method: 'GET',
            params,
            ...options,
            headers: {
                ...(options.headers || {}),
            },
        },
        'StrApi'
    )
}

/**
 * 获取删除某个厨师信息 
 * */
export function deleteChefOne(
    paths: StrApi.ReqDeleteById,
    options: Options = {}
) {

    const url = `/api/chefs/${paths.id}`

    return request<StrApi.ResDeleteById>(
        url,
        {
            method: 'DELETE',
            ...options,
            headers: {
                ...(options.headers || {}),
            },
        },
        'StrApi'
    )
}

/**
 * 添加厨师
 * */
export function addChef(
    data: { data: StrApi.ReqAddChef },
    options: Options = {}
) {

    const url = `/api/chefs`

    return request<StrApi.ResDeleteById>(
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

/**
 * 修改厨师信息
 * */
export function editChef(
    paths: StrApi.ReqDeleteById,
    data: { data: StrApi.ReqAddChef },
    options: Options = {}
) {

    const url = `/api/chefs/${paths.id}`

    return request<StrApi.ResDeleteById>(
        url,
        {
            method: 'PUT',
            data,
            ...options,
            headers: {
                ...(options.headers || {}),
            },
        },
        'StrApi'
    )
}

