import { cloneDeep } from 'lodash'
import { AxiosResponse } from 'axios'
import {
    STORAGE_ACCESS_TOKEN_KEY,
    STORAGE_CSRF_TOKEN_KEY,
    STORAGE_USER_INFO_KEY,
    DATABASE_SELECT_SUCCESS
} from '@/constants/common.constants'
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
    scopes: ScopeVo[],
    operations: OperationVo[]
): _DataNode[] => {
    const moduleChildrenMap = new Map<string, _DataNode[]>()
    const menuChildrenMap = new Map<string, _DataNode[]>()
    const scopeChildrenMap = new Map<string, _DataNode[]>()

    operations.forEach((operation) => {
        if (scopeChildrenMap.get(operation.scopeId)) {
            scopeChildrenMap.get(operation.scopeId)?.push({
                title: operation.name,
                key: operation.id,
                value: operation.id
            })
        } else {
            scopeChildrenMap.set(operation.scopeId, [
                {
                    title: operation.name,
                    key: operation.id,
                    value: operation.id
                }
            ])
        }
    })

    scopes.forEach((scope) => {
        if (menuChildrenMap.get(scope.menuId)) {
            menuChildrenMap.get(scope.menuId)?.push({
                title: scope.name,
                key: scope.id,
                value: scope.id,
                children: scopeChildrenMap.get(scope.id)
            })
        } else {
            menuChildrenMap.set(scope.menuId, [
                {
                    title: scope.name,
                    key: scope.id,
                    value: scope.id,
                    children: scopeChildrenMap.get(scope.id)
                }
            ])
        }
    })

    const menuTrees = parentToTree(
        menus.map((menu) => ({
            title: menu.name,
            key: menu.id,
            value: menu.id,
            parentId: menu.parentId,
            children: menuChildrenMap.get(menu.id)
        }))
    )

    const menuModuleIdMap = new Map<string, string>()
    menus.forEach((menu) => menuModuleIdMap.set(menu.id, menu.moduleId))

    menuTrees.forEach((menu) => {
        const moduleId = menuModuleIdMap.get(menu.key as string)
        if (moduleId && moduleChildrenMap.get(moduleId)) {
            moduleChildrenMap.get(moduleId)?.push(menu)
        } else if (moduleId) {
            moduleChildrenMap.set(moduleId, [menu])
        }
    })

    return modules.map((module) =>
        getFullTitle({
            title: module.name,
            key: module.id,
            value: module.id,
            children: moduleChildrenMap.get(module.id)
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
