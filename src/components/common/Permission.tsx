import { PropsWithChildren } from 'react'
import { hasPathPermission, hasPermission } from '@/utils/auth'

interface PermissionProps {
    operationCode?: string[]
    path?: string
}

const Permission = (props: PropsWithChildren<PermissionProps>) => {
    if (
        (!props.operationCode || props.operationCode.some(hasPermission)) &&
        (!props.path || hasPathPermission(props.path))
    ) {
        return props.children
    }

    return <></>
}

export default Permission
