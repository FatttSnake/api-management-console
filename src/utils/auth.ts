import { cloneDeep } from 'lodash'
import { AxiosResponse } from 'axios'
import {
    STORAGE_ACCESS_TOKEN_KEY,
    STORAGE_CSRF_TOKEN_KEY,
    STORAGE_USER_INFO_KEY,
    DATABASE_SELECT_SUCCESS
} from '@/constants/common.constants'
import { floorNumber } from '@/utils/common'
import { getLocalStorage, removeLocalStorage, setLocalStorage } from '@/utils/browser'
import { getFullTitle } from '@/utils/route'
import { r_sys_user_info_get } from '@/services/system'

let requestUserInfoPromise: Promise<AxiosResponse<_Response<UserWithPowerInfoVo>>> | undefined

export const getAccessToken = () => getLocalStorage(STORAGE_ACCESS_TOKEN_KEY) ?? undefined

export const setAccessToken = (accessToken: string) =>
    setLocalStorage(STORAGE_ACCESS_TOKEN_KEY, accessToken)

export const getCsrfToken = () => getLocalStorage(STORAGE_CSRF_TOKEN_KEY) ?? undefined

export const setCsrfToken = (csrfToken: string) =>
    setLocalStorage(STORAGE_CSRF_TOKEN_KEY, csrfToken)

export const requestUserInfo = async () => {
    if (!requestUserInfoPromise) {
        requestUserInfoPromise = r_sys_user_info_get().finally(() => {
            requestUserInfoPromise = undefined
        })
    }

    const response = (await requestUserInfoPromise).data
    if (response.code === DATABASE_SELECT_SUCCESS) {
        setUserInfo(response.data!)
        return response.data!
    }
    throw Error('获取用户信息失败')
}

export const getUserInfo = async (force = false): Promise<UserWithPowerInfoVo> => {
    if (getLocalStorage(STORAGE_USER_INFO_KEY) && !force) {
        return JSON.parse(getLocalStorage(STORAGE_USER_INFO_KEY) as string) as UserWithPowerInfoVo
    }
    return requestUserInfo()
}

export const setUserInfo = (userInfo?: UserWithPowerInfoVo) =>
    setLocalStorage(STORAGE_USER_INFO_KEY, JSON.stringify(userInfo))

export const removeAllToken = () => {
    removeLocalStorage(STORAGE_USER_INFO_KEY)
    removeLocalStorage(STORAGE_ACCESS_TOKEN_KEY)
    removeLocalStorage(STORAGE_CSRF_TOKEN_KEY)
}

export const getLoginStatus = () => !!getAccessToken()

export const getVerifyStatus = () =>
    getLocalStorage(STORAGE_USER_INFO_KEY) === null ||
    (JSON.parse(getLocalStorage(STORAGE_USER_INFO_KEY) as string) as UserWithPowerInfoVo).verified

export const getNickname = async () => {
    const user = await getUserInfo()

    return user?.userInfo.nickname
}

export const getAvatar = async () => {
    const user = await getUserInfo()

    return user?.userInfo.avatar
}

export const getUserId = async () => {
    const user = await getUserInfo()

    return user?.id
}

export const powerListToPowerTree = (
    modules: ModuleVo[],
    menus: MenuVo[],
    funcs: FuncVo[],
    operations: OperationVo[]
): _DataNode[] => {
    const moduleChildrenMap = new Map<string, _DataNode[]>()
    const menuChildrenMap = new Map<string, _DataNode[]>()
    const funcChildrenMap = new Map<string, _DataNode[]>()

    operations.forEach((operation) => {
        if (funcChildrenMap.get(String(operation.funcId))) {
            funcChildrenMap.get(String(operation.funcId))?.push({
                title: operation.name,
                key: operation.id,
                value: operation.id
            })
        } else {
            funcChildrenMap.set(String(operation.funcId), [
                {
                    title: operation.name,
                    key: operation.id,
                    value: operation.id
                }
            ])
        }
    })

    const funcTrees = parentToTree(
        funcs.map((func) => ({
            title: func.name,
            key: func.id,
            value: func.id,
            parentId: func.parentId,
            children: funcChildrenMap.get(String(func.id))
        }))
    )

    funcTrees.forEach((func) => {
        if (menuChildrenMap.get(String(floorNumber(func.key as number, 5)))) {
            menuChildrenMap.get(String(floorNumber(func.key as number, 5)))?.push(func)
        } else {
            menuChildrenMap.set(String(floorNumber(func.key as number, 5)), [func])
        }
    })

    const menuTrees = parentToTree(
        menus.map((menu) => ({
            title: menu.name,
            key: menu.id,
            value: menu.id,
            parentId: menu.parentId,
            children: menuChildrenMap.get(String(menu.id))
        }))
    )

    menuTrees.forEach((menu) => {
        if (moduleChildrenMap.get(String(floorNumber(menu.key as number, 7)))) {
            moduleChildrenMap.get(String(floorNumber(menu.key as number, 7)))?.push(menu)
        } else {
            moduleChildrenMap.set(String(floorNumber(menu.key as number, 7)), [menu])
        }
    })

    return modules.map((module) =>
        getFullTitle({
            title: module.name,
            key: module.id,
            value: module.id,
            children: moduleChildrenMap.get(String(module.id))
        })
    )
}

const parentToTree = (data: _DataNode[]): _DataNode[] => {
    const parents = data.filter((value) => !value.parentId)
    const children = data.filter((value) => value.parentId)

    const translator = (parents: _DataNode[], children: _DataNode[]) => {
        parents.forEach((parent) => {
            children.forEach((current, index) => {
                if (current.parentId === parent.key) {
                    const temp = cloneDeep(children)
                    temp.splice(index, 1)
                    translator([current], temp)
                    typeof parent.children !== 'undefined'
                        ? parent.children.push({ ...current })
                        : (parent.children = [current])
                }
            })
        })
    }

    translator(parents, children)

    return parents
}

export const getPermissionPath = (): string[] => {
    const s = getLocalStorage(STORAGE_USER_INFO_KEY)
    if (s === null) {
        return []
    }
    const user = JSON.parse(s) as UserWithPowerInfoVo

    return user.menus.map((menu) => menu.url)
}

export const hasPathPermission = (path: string) =>
    getPermissionPath().some((value) => RegExp(value).test(path))

export const getPermission = (): string[] => {
    const s = getLocalStorage(STORAGE_USER_INFO_KEY)
    if (s === null) {
        return []
    }
    const user = JSON.parse(s) as UserWithPowerInfoVo

    return user.operations.map((operation) => operation.code)
}

export const hasPermission = (operationCode: string) => getPermission().includes(operationCode)
