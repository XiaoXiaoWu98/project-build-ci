import request from "../request"

type Options = Parameters<typeof request>['1']

/**
 * 获取餐饮店列表 
 * */
export function getDingniRoomList(
    params: StrApi.ReqDingniRoomList,
    options: Options = {}
) {

    const url = '/api/dingni-rooms'

    return request<StrApi.ResDingniRoomList>(
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
 * 获取删除某个餐饮店的信息 
 * */
export function deleteDingniRoomOne(
    paths: StrApi.ReqDeleteById,
    options: Options = {}
) {

    const url = `/api/dingni-rooms/${paths.id}`

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
 * 添加餐饮店
 * */
export function addDingniRoom(
    data: { data: StrApi.ReqAddDingniRoom },
    options: Options = {}
) {

    const url = `/api/dingni-rooms`

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
 * 修改餐饮店信息
 * */
export function editDingniRoom(
    paths: StrApi.ReqDeleteById,
    data: { data: StrApi.ReqAddDingniRoom },
    options: Options = {}
) {

    const url = `/api/dingni-rooms/${paths.id}`

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


