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
    scopes: ScopeVo[]
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
    id: string
    name: string
}

interface MenuVo {
    id: string
    name: string
    url: string
    parentId: string
    moduleId: string
    children: MenuVo[]
}

interface ScopeVo {
    id: string
    name: string
    menuId: string
    children: ScopeVo[]
}

interface OperationVo {
    id: string
    name: string
    code: string
    scopeId: string
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
    roleIds: string[]
    groupIds: string[]
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
    scopes: ScopeVo[]
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
    powerIds: string[]
    enable: boolean
}

interface PowerSetVo {
    moduleList: ModuleVo[]
    menuList: MenuVo[]
    scopeList: ScopeVo[]
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
    roleIds: string[]
    enable: boolean
}

interface GroupChangeStatusParam {
    id: string
    enable: boolean
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

interface ApiSettingsVo {
    defaultRateLimitPerMin: number
    defaultQuota: number
    defaultQuotaPeriodSeconds: number
    accessKeyLength: number
    secretKeyLength: number
    balanceCheckEnabled: boolean
    cacheTtlSeconds: number
}

interface ApiSettingsParam {
    defaultRateLimitPerMin: number
    defaultQuota: number
    defaultQuotaPeriodSeconds: number
    accessKeyLength: number
    secretKeyLength: number
    balanceCheckEnabled: boolean
    cacheTtlSeconds: number
}

interface SoftwareInfoVo {
    serviceVersion: string
    os: string
    bitness: number
    javaVersion: string
    javaVersionDate: string
    javaVendor: string
    jvm: string
    jvmVersion: string
    jvmInfo: string
    jvmVendor: string
    javaClassVersion: string
    osBootTime: string
    serverStartupTime: string
}

interface HardwareInfoVo {
    cpu: string
    arch: string
    is64Bit: boolean
    cpuPhysicalPackageCount: number
    cpuPhysicalProcessorCount: number
    cpuLogicalProcessorCount: number
    microarchitecture: string
    memories: string
    disks: string
}

interface CpuInfoVo {
    user: number
    nice: number
    system: number
    idle: number
    iowait: number
    irq: number
    softirq: number
    steal: number
    total: number
    processors: CpuInfoVo[]
}

interface StorageInfoVo {
    memoryTotal: number
    memoryFree: number
    virtualMemoryInUse: number
    virtualMemoryMax: number
    swapTotal: number
    swapUsed: number
    jvmTotal: number
    jvmFree: number
    fileStores: FileStoreInfoVo[]
}

interface FileStoreInfoVo {
    mount: string
    total: number
    free: number
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

interface ApiAccountVo {
    id: string
    userId: string
    balance: string
    enable: boolean
    createTime: string
    updateTime: string
    userVo: UserWithInfoVo
}

interface ApiAccountGetParam extends PageParam {
    enable?: boolean
}

interface ApiAuditVo {
    id: string
    event: string
    operateUserId: string
    operateTime: string
    detail: string
    userVo?: UserWithInfoVo
    keyVo?: ApiKeyVo
    targetUserVo?: UserWithInfoVo
}

interface ApiAuditGetParam extends PageParam {
    event?: string
    startTime?: string
    endTime?: string
}

interface ApiInterfaceVo {
    id: string
    pluginId: string
    code: string
    name: string
    description: string
    path: string
    method: string
    apiVersion: number
    price: string
    billingMode: string
    needKey: boolean
    rateLimit: number
    enable: boolean
    accessMode: string
    createTime: string
    updateTime: string
}

interface ApiGroupVo {
    pluginId: string
    pluginName: string
    pluginDescription: string
    interfaces: ApiInterfaceVo[]
}

interface ApiInterfaceGetParam extends PageParam {
    searchCode?: string
    searchName?: string
    pluginId?: string
    enable?: boolean
}

interface ApiInterfaceUpdateParam {
    id: string
    price: string
    billingMode: string
    needKey: boolean
    rateLimit: number
    enable: boolean
    accessMode: string
}

interface ApiInterfaceUpdateStatusParam {
    id: string
    enable: boolean
}

interface ApiKeyVo {
    id: string
    userId: string
    accessKey: string
    name: string
    permissions: string[]
    enable: boolean
    expireTime: string
    ipWhitelist: string
    rateLimit: number
    quota: number
    quotaPeriod: number
    lastUsedTime: string
    remark: string
    createTime: string
    updateTime: string
}

interface ApiKeyWithSecretVo {
    apiKey: ApiKeyVo
    secretKey: string
}

interface ApiKeyAddParam {
    userId?: string
    name: string
    permissionCodes?: string[]
    expireTime?: string
    ipWhitelist?: string
    rateLimit?: number
    quota?: number
    quotaPeriod?: number
    remark?: string
}

interface ApiKeyDeleteParam {
    ids: string[]
}

interface ApiKeyGetParam extends PageParam {
    searchName?: string
    enable?: boolean
    userId?: string
}

interface ApiKeyUpdateParam {
    id: string
    name: string
    permissionCodes?: string[]
    enable: boolean
    expireTime?: string
    ipWhitelist?: string
    rateLimit?: number
    quota?: number
    quotaPeriod?: number
    remark?: string
}

interface ApiKeyUpdateStatusParam {
    id: string
    enable: boolean
}

interface ApiMonitorItemVo {
    apiCode: string
    count: number
    error: number
    latencyMs: number
    pluginVo?: ApiPluginVo
    interfaceVo?: ApiInterfaceVo
}

interface ApiTopVo {
    apiCode: string
    count: number
    cost: string
    pluginVo?: ApiPluginVo
    interfaceVo?: ApiInterfaceVo
}

interface ApiTopUpParam {
    userId: string
    amount: string
    orderNo?: string
    remark?: string
}

interface ApiMonitorDashboardVo {
    live: ApiMonitorItemVo[]
    totalToday: number
    errorToday: number
    activeKeys: number
    topApis: ApiTopVo[]
}

interface ApiPluginTrustKeyVo {
    id: string
    keyId: string
    alias: string
    enable: boolean
    createTime: string
}

interface ApiPluginTrustKeyGetParam extends PageParam {
    searchAlias?: string
    enable?: boolean
}

interface ApiPluginTrustKeyAddParam {
    publicKey: string
    alias: string
}

interface apiPluginTrustKeyUpdateStatusParam {
    keyId: string
    enable: boolean
}

interface ApiPluginVo {
    id: string
    pluginId: string
    name: string
    description: string
    enable: boolean
    defaultPrice: string
    defaultRateLimit: number
    defaultAccessMode: string
    source: string
    versionName: string
    versionCode: number
    jarName: string
    signerKeyId: string
    loadError: string
    createTime: string
    updateTime: string
}

interface ApiPluginGetParam extends PageParam {
    searchName?: string
    enable?: boolean
}

interface ApiPluginUpdateParam {
    id: string
    name: string
    description: string
    enable: boolean
    defaultPrice: string
    defaultRateLimit: number
    defaultAccessMode: string
}

interface ApiPluginUpdateStatusParam {
    id: string
    enable: boolean
}

interface ApiReportVo {
    apiKeyId: string
    date: string
    apiCode: string
    apiName: string
    count: number
    cost: string
    keyVo?: ApiKeyVo
    userVo?: UserWithInfoVo
    pluginVo?: ApiPluginVo
    interfaceVo?: ApiInterfaceVo
}

interface ApiReportGetParam extends PageParam {
    apiKeyId?: string
    startTime?: string
    endTime?: string
    limit?: number
    tzOffset?: number
}

interface ApiTransactionVo {
    id: string
    userId: string
    apiKeyId: string
    apiUsageId: string
    orderNo: string
    type: string
    amount: string
    balanceAfter: string
    remark: string
    createTime: string
}

interface ApiTransactionGetParam extends PageParam {
    userId?: string
    type?: string
    startTime?: string
    endTime?: string
}

interface ApiUsageVo {
    id: string
    apiKeyId: string
    apiId: string
    apiCode: string
    apiName: string
    apiDescription: string
    userId: string
    requestPath: string
    requestMethod: string
    responseCode: number
    success: boolean
    executeTime: number
    requestIp: string
    traceId: string
    cost: string
    billingMode: string
    createTime: string
}

interface ApiUsageGetParam extends PageParam {
    userId?: string
    apiKeyId?: string
    apiCode?: string
    success?: boolean
    startTime?: string
    endTime?: string
}

interface ApiDocPluginVo {
    pluginId: string
    name: string
    description: string
    versionName: string
    versionCode: string
    enable: boolean
    interfaces: ApiInterfaceVo[]
    openapi: unknown
}
