declare namespace StrApi {

    export interface ReqLogin {
        /**
         * 用户名称
         */
        identifier: string,
        /**
         * 用户密码
         */
        password: string,
    }

    export interface ResLogin {
        /**
         * 签名
         */
        jwt: string
        user: UserInfo
    }

    /**
     * 用户数据
     */
    export interface UserInfo {
        /**
         * 锁
         */
        blocked: boolean
        /**
         * 确认
         */
        confirmed: boolean
        /**
         * 创建时间
         */
        createdAt: string
        /**
         * 邮箱
         */
        email: string
        /**
         * id
         */
        id: number
        /**
         * 揽括
         */
        provider: string
        /**
         * 更新时间
         */
        updatedAt: string
        /**
         * 用户名称
         */
        username: string
    }

    export interface Pagination<T> {
        /**
         * 当前页数
         */
        page?: number
        /**
         * 一页多少数量
         */
        pageSize?: number
        /**
         * 当前页面
         */
        pageCount?: numebr
        /**
         * 总数量
         */
        total?: numebr
        /**
         * 总的数量限制
         */
        limit?: number
        /**
         * 关系型数据
         */
        populate?: string
        /**
         * 过滤数据
         */
        filters?: T,

    }

    export interface ReqChefsFilters {
        age?: number
        dingniRoomsName?: string
        name?: string
        createdAt?: string
    }


    export interface ReqChefsList extends Pagination<ReqChefsFilters> {

    }

    export interface ResChefsListItem {
        id?: number
        age?: number
        createdAt?: string
        dingni_rooms?: ResDingniRoomList
        name?: string
        publishedAt?: string
        updatedAt?: string
    }


    export interface Attributes<T> {
        id?: number

        attributes?: T
    }


    export interface ResDingniRoomListItem {
        id?: number
        address?: string
        createdAt?: string
        chefs?: ResChefsList
        name?: string
        publishedAt?: string
        updatedAt?: string
    }

    export interface ResChefsList {
        meta?: { pagination: Pagination }
        data: Attributes<ResChefsListItem>[]
    }

    export interface ReqDingniRoomFilters {
        address?: string
        dingniRoomsName?: string
        name?: string
        createdAt?: string
    }


    export interface ReqDingniRoomList extends Pagination<ReqDingniRoomFilters> {

    }

    export interface ResDingniRoomList {
        meta?: { pagination: Pagination }
        data: Attributes<ResDingniRoomListItem>[]
    }

    export interface ReqDeleteById {
        id: number
    }

    export interface ResDeleteById {

    }

    export interface ReqAddChef {
        name: stirng,
        age: number,
        dingni_rooms: string[]
    }


    export interface ReqAddDingniRoom {
        name: stirng,
        address: string,
        chefs: string[]
    }

}