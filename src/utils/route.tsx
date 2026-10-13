import { hasPathPermission, hasPermission } from '@/utils/auth'

export const getRedirectUrl = (path: string, redirectUrl: string): string => {
    return `${path}?redirect=${encodeURIComponent(redirectUrl)}`
}

export const getFullTitle = (data: _DataNode, preTitle?: string) => {
    data.fullTitle = `${preTitle ? `${preTitle}-` : ''}${data.title as string}`
    data.children?.forEach((value) => {
        getFullTitle(value, data.fullTitle)
    })

    return data
}

export const getAuthRoute = (
    route: RouteJsonObject[],
    parentPermission: boolean = false
): RouteJsonObject[] =>
    route
        .filter(
            (value) =>
                value.path === '*' ||
                !(value.permission || parentPermission) ||
                (hasPathPermission(value.absolutePath) &&
                    (!value.operationCode || hasPermission(value.operationCode)))
        )
        .map((value) => ({
            ...value,
            children: value.children
                ? getAuthRoute(value.children, parentPermission || value.permission)
                : value.children
        }))

export const mapJsonToRoute = (jsonObject: RouteJsonObject[]): RouteObject[] => {
    return jsonObject.map((value) => ({
        path: value.path,
        id: value.id,
        element: value.element,
        Component: value.component,
        handle: {
            absolutePath: value.absolutePath,
            name: value.name,
            titlePrefix: value.titlePrefix,
            title: value.title,
            titlePostfix: value.titlePostfix,
            icon: value.icon,
            menu: value.menu,
            auth: value.auth,
            permission: value.permission,
            operationCode: value.operationCode
        },
        children: value.children && mapJsonToRoute(value.children)
    }))
}

export const setTitle = (jsonObject: RouteJsonObject[], title: string): RouteJsonObject[] =>
    jsonObject.map((value) => ({
        ...value,
        title: value.title ?? title,
        children: value.children ? setTitle(value.children, title) : value.children
    }))
