/// <reference types="vite/client" />
/// <reference types="./ant-design" />

declare const __APP_VERSION__: string

interface LocalConfig {
    apiUrl: string
}

interface RemoteConfig {
    systemName: string
    tokenExpiryBufferMs: number
    tokenExpiryCheckIntervalMs: number
    turnstileSiteKey: string
    homeUrl: string
}

interface SystemConfig extends LocalConfig, RemoteConfig {}

type ConnectivityMode = 'loading' | 'online' | 'offline'

interface ConfigState {
    mode: ConnectivityMode
    config: SystemConfig | null
    error: Error | null
}

interface RouteJsonObject {
    path: string
    absolutePath: string
    id?: string
    element?: React.JSX.Element
    component?: React.ComponentType
    name?: string
    titlePrefix?: string
    title?: string
    titlePostfix?: string
    icon?: IconComponent
    menu?: boolean
    auth?: boolean
    permission?: boolean
    operationCode?: string
    children?: RouteJsonObject[]
}

interface RouteHandle {
    absolutePath: string
    name?: string
    titlePrefix?: string
    title?: string
    titlePostfix?: string
    icon?: IconComponent
    menu?: boolean
    auth?: boolean
    permission?: boolean
    operationCode?: string
}

interface _Response<T> {
    code: number
    success: boolean
    msg: string
    data: T | null
}

interface TokenVo {
    refreshToken: string
    accessToken: string
    csrfToken: string
}

interface UserInfoUpdateParam {
    avatar?: string
    nickname?: string
}

interface RegisterParam {
    username: string
    email: string
    password: string
    captchaCode: string
}

interface VerifyParam {
    code: string
    nickname?: string
    avatar?: string
}

interface ForgetParam {
    email: string
    captchaCode: string
}

interface RetrieveParam {
    code: string
    password: string
    captchaCode: string
}

interface LoginParam {
    account: string
    password: string
    captchaCode: string
    twoFactorCode?: string
}

interface UserChangePasswordParam {
    originalPassword: string
    newPassword: string
}

interface TwoFactorValidateParam {
    code: string
}

interface TwoFactorRemoveParam {
    code: string
}

interface UserWithInfoVo {
    id: string
    username: string
    twoFactor: boolean
    verified: boolean
    locking: boolean
    expiration: string
    credentialsExpiration: string
    enable: boolean
    currentLoginTime: string
    currentLoginIp: string
    lastLoginTime: string
    lastLoginIp: string
    createTime: string
    updateTime: string
    userInfo: UserInfoVo
}

interface UserWithPowerInfoVo {
    id: string
    username: string
    twoFactor: boolean
    verified: boolean
    locking: boolean
    expiration: string
    credentialsExpiration: string
    enable: boolean
    currentLoginTime: string
    currentLoginIp: string
    lastLoginTime: string
    lastLoginIp: string
    createTime: string
    updateTime: string
    userInfo: UserInfoVo
    modules: ModuleVo[]
    menus: MenuVo[]
    funcs: FuncVo[]
    operations: OperationVo[]
}

interface UserWithRoleInfoVo {
    id: string
    username: string
    twoFactor: boolean
    verify: string
    locking: boolean
    expiration: string
    credentialsExpiration: string
    enable: boolean
    currentLoginTime: string
    currentLoginIp: string
    lastLoginTime: string
    lastLoginIp: string
    createTime: string
    updateTime: string
    userInfo: UserInfoVo
    roles: RoleVo[]
    groups: GroupVo[]
}

interface UserInfoVo {
    id: string
    userId: string
    nickname: string
    avatar: string
    email: string
}

interface TwoFactorVo {
    qrCodeSVGBase64: string
}

interface ModuleVo {
    id: number
    name: string
}

interface MenuVo {
    id: number
    name: string
    url: string
    parentId: number
    moduleId: number
    children: MenuVo[]
}

interface FuncVo {
    id: number
    name: string
    parentId: number
    menuId: number
    children: FuncVo[]
}

interface OperationVo {
    id: number
    name: string
    code: string
    funcId: number
}

interface RoleVo {
    id: string
    name: string
    enable: boolean
    createTime: string
    updateTime: string
}

interface GroupVo {
    id: string
    name: string
    enable: boolean
    createTime: string
    updateTime: string
}

interface PageVo<T> {
    current: number
    pages: number
    size: number
    total: number
    records: T[]
}

interface PageParam {
    currentPage?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
}

interface TableParam {
    pagination?: _TablePaginationConfig
    sortField?: React.Key | readonly React.Key[]
    sortOrder?: _SortOrder
    filters?: Record<string, _FilterValue | null>
}

interface UserGetParam extends PageParam {
    searchType?: string
    searchValue?: string
    searchRegex?: boolean
}

interface UserAddEditParam {
    id?: string
    username: string
    password?: string
    verified: boolean
    locking?: boolean
    expiration?: string
    credentialsExpiration?: string
    enable?: boolean
    nickname?: string
    avatar?: string
    email?: string
    roleIds: number[]
    groupIds: number[]
}

interface UserUpdatePasswordParam {
    id: string
    password: string
    credentialsExpiration?: string
}

interface SysLogGetParam extends PageParam {
    searchTraceId?: string
    searchRequestUrl?: string
    searchStartTime?: string
    searchEndTime?: string
}

interface SysLogGetVo {
    id: string
    logType: string
    traceId?: string
    operateUserId: string
    operateTime: string
    requestUri?: string
    requestMethod?: string
    requestParams?: string
    requestIp: string
    requestServerAddress: string
    exception: boolean
    exceptionInfo?: string
    startTime: string
    endTime: string
    executeTime?: number
    userAgent?: string
    operateUsername?: string
}

interface RoleGetParam extends PageParam {
    searchName?: string
    searchRegex?: boolean
}

interface RoleWithPowerGetVo {
    id: string
    name: string
    enable: string
    createTime: string
    updateTime: string
    modules: ModuleVo[]
    menus: MenuVo[]
    funcs: FuncVo[]
    operations: OperationVo[]
    tree: _DataNode[]
}

interface RoleChangeStatusParam {
    id: string
    enable: boolean
}

interface RoleAddEditParam {
    id?: string
    name: string
    powerIds: number[]
    enable: boolean
}

interface PowerSetVo {
    moduleList: ModuleVo[]
    menuList: MenuVo[]
    funcList: FuncVo[]
    operationList: OperationVo[]
}

interface GroupGetParam extends PageParam {
    searchName?: string
    searchRegex?: boolean
}

interface GroupWithRoleGetVo {
    id: string
    name: string
    enable: boolean
    createTime: string
    updateTime: string
    roles: RoleVo[]
}

interface GroupAddEditParam {
    id?: string
    name: string
    roleIds: number[]
    enable: boolean
}

interface GroupChangeStatusParam {
    id: string
    enable: boolean
}

interface AvatarBase64Vo {
    base64: string
}

interface BaseSettingsVo {
    systemName?: string
    tokenExpiryBufferMs?: number
    tokenExpiryCheckIntervalMs?: number
    turnstileSiteKey?: string
    turnstileSecretKey?: string
    homeUrl?: string
}

interface BaseSettingsParam {
    systemName: string
    tokenExpiryBufferMs: number
    tokenExpiryCheckIntervalMs: number
    turnstileSiteKey: string
    turnstileSecretKey: string
    homeUrl: string
}

interface MailSettingsVo {
    host?: string
    port?: number
    securityType?: string
    username?: string
    password?: string
    from?: string
    fromName?: string
}

interface MailSettingsParam {
    host?: string
    port?: number
    securityType?: string
    username?: string
    password?: string
    from?: string
    fromName?: string
}

interface MailSendParam {
    to: string
}

interface SensitiveWordVo {
    id: string
    word: string
    useFor: string[]
    enable: boolean
}

interface SensitiveWordAddParam {
    word: string
    useFor?: string[]
    enable?: boolean
}

interface SensitiveWordUpdateParam {
    ids: string[]
}

interface TwoFactorSettingsVo {
    issuer: string
    secretKeyLength: number
}

interface TwoFactorSettingsParam {
    issuer: string
    secretKeyLength: number
}

interface OnlineInfoVo {
    current: number
    history: {
        time: string
        record: string
    }[]
}

interface OnlineInfoGetParam {
    scope: string
}

interface ActiveInfoVo {
    registerHistory: {
        time: string
        count: number
    }[]
    loginHistory: {
        time: string
        count: number
    }[]
    verifyHistory: {
        time: string
        count: number
    }[]
}

interface ActiveInfoGetParam {
    scope: string
}
