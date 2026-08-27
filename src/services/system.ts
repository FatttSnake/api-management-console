import { Key } from 'react'
import {
    URL_SYS_USER_INFO,
    URL_SYS_USER,
    URL_SYS_POWER_LIST,
    URL_SYS_ROLE,
    URL_SYS_ROLE_LIST,
    URL_SYS_GROUP,
    URL_SYS_GROUP_LIST,
    URL_SYS_LOG,
    URL_SYS_SETTINGS_MAIL,
    URL_SYS_STATISTICS_ONLINE,
    URL_SYS_STATISTICS_ACTIVE,
    URL_SYS_SETTINGS_BASE,
    URL_SYS_SETTINGS_SENSITIVE,
    URL_SYS_SETTINGS_TWO_FACTOR,
    URL_SYS_SETTINGS_API,
    URL_SYS_API_ACCOUNT,
    URL_SYS_API_ACCOUNT_TRANSACTIONS,
    URL_SYS_API_ACCOUNT_TOPUP,
    URL_SYS_API_KEY,
    URL_SYS_API_USAGE,
    URL_SYS_API_PLUGIN,
    URL_SYS_API,
    URL_SYS_API_REPORT_USAGE,
    URL_SYS_API_REPORT_COST,
    URL_SYS_API_REPORT_TOP,
    URL_SYS_API_REPORT_EXPORT,
    URL_SYS_API_MONITOR_DASHBOARD,
    URL_SYS_API_AUDIT,
    URL_SYS_STATISTICS_SOFTWARE,
    URL_SYS_STATISTICS_HARDWARE,
    URL_SYS_STATISTICS_CPU,
    URL_SYS_STATISTICS_STORAGE
} from '@/constants/urls.constants'
import { SHA512 } from '@/utils/crypto'
import request from '@/services'

export const r_sys_user_info_get = () => request.get<UserWithPowerInfoVo>(URL_SYS_USER_INFO)

export const r_sys_user_info_get_basic = (username: string) =>
    request.get<UserWithInfoVo>(`${URL_SYS_USER_INFO}/${username}`)

export const r_sys_user_info_update = (param: UserInfoUpdateParam) =>
    request.patch(URL_SYS_USER_INFO, param)

export const r_sys_user_info_change_password = (param: UserChangePasswordParam) =>
    request.post(URL_SYS_USER_INFO, {
        originalPassword: SHA512(param.originalPassword).toString(),
        newPassword: SHA512(param.newPassword).toString()
    } as UserChangePasswordParam)

export const r_sys_user_get = (param: UserGetParam) =>
    request.get<PageVo<UserWithRoleInfoVo>>(URL_SYS_USER, param)

export const r_sys_user_add = (param: UserAddEditParam) =>
    request.post(URL_SYS_USER, {
        ...param,
        password: param.password ? SHA512(param.password) : param.password
    } as UserAddEditParam)

export const r_sys_user_update = (param: UserAddEditParam) => request.put(URL_SYS_USER, param)

export const r_sys_user_change_password = (param: UserUpdatePasswordParam) =>
    request.patch(URL_SYS_USER, {
        ...param,
        password: SHA512(param.password).toString()
    } as UserUpdatePasswordParam)

export const r_sys_user_delete = (id: string) => request.delete(`${URL_SYS_USER}/${id}`)

export const r_sys_user_delete_list = (ids: Key[]) => request.delete(URL_SYS_USER, { ids })

export const r_sys_power_get_list = () => request.get<PowerSetVo>(URL_SYS_POWER_LIST)

export const r_sys_role_get = (param: RoleGetParam) =>
    request.get<PageVo<RoleWithPowerGetVo>>(URL_SYS_ROLE, param)

export const r_sys_role_get_list = () => request.get<RoleVo[]>(URL_SYS_ROLE_LIST)

export const r_sys_role_change_status = (param: RoleChangeStatusParam) =>
    request.patch<never>(URL_SYS_ROLE, param)

export const r_sys_role_add = (param: RoleAddEditParam) => request.post(URL_SYS_ROLE, param)

export const r_sys_role_update = (param: RoleAddEditParam) => request.put(URL_SYS_ROLE, param)

export const r_sys_role_delete = (id: string) => request.delete(`${URL_SYS_ROLE}/${id}`)

export const r_sys_role_delete_list = (ids: Key[]) => request.delete(URL_SYS_ROLE, { ids })

export const r_sys_group_get = (param: GroupGetParam) =>
    request.get<PageVo<GroupWithRoleGetVo>>(URL_SYS_GROUP, param)

export const r_sys_group_get_list = () => request.get<GroupVo[]>(URL_SYS_GROUP_LIST)

export const r_sys_group_change_status = (param: GroupChangeStatusParam) =>
    request.patch<never>(URL_SYS_GROUP, param)

export const r_sys_group_add = (param: GroupAddEditParam) => request.post(URL_SYS_GROUP, param)

export const r_sys_group_update = (param: GroupAddEditParam) => request.put(URL_SYS_GROUP, param)

export const r_sys_group_delete = (id: string) => request.delete(`${URL_SYS_GROUP}/${id}`)

export const r_sys_group_delete_list = (ids: Key[]) => request.delete(URL_SYS_GROUP, { ids })

export const r_sys_log_get = (param: SysLogGetParam) =>
    request.get<PageVo<SysLogGetVo>>(URL_SYS_LOG, param)

export const r_sys_settings_base_get = () => request.get<BaseSettingsVo>(URL_SYS_SETTINGS_BASE)

export const r_sys_settings_base_update = (param: BaseSettingsParam) =>
    request.put(URL_SYS_SETTINGS_BASE, param)

export const r_sys_settings_mail_get = () => request.get<MailSettingsVo>(URL_SYS_SETTINGS_MAIL)

export const r_sys_settings_mail_update = (param: MailSettingsParam) =>
    request.put(URL_SYS_SETTINGS_MAIL, param)

export const r_sys_settings_mail_send = (param: MailSendParam) =>
    request.post(URL_SYS_SETTINGS_MAIL, param)

export const r_sys_settings_sensitive_get = () =>
    request.get<SensitiveWordVo[]>(URL_SYS_SETTINGS_SENSITIVE)

export const r_sys_settings_sensitive_add = (param: SensitiveWordAddParam) =>
    request.post(URL_SYS_SETTINGS_SENSITIVE, param)

export const r_sys_settings_sensitive_update = (param: SensitiveWordUpdateParam) =>
    request.put(URL_SYS_SETTINGS_SENSITIVE, param)

export const r_sys_settings_sensitive_delete = (id: string) =>
    request.delete(`${URL_SYS_SETTINGS_SENSITIVE}/${id}`)

export const r_sys_settings_two_factor_get = () =>
    request.get<TwoFactorSettingsVo>(URL_SYS_SETTINGS_TWO_FACTOR)

export const r_sys_settings_two_factor_update = (param: TwoFactorSettingsParam) =>
    request.put(URL_SYS_SETTINGS_TWO_FACTOR, param)

export const r_sys_settings_api_get = () => request.get<ApiSettingsVo>(URL_SYS_SETTINGS_API)

export const r_sys_settings_api_update = (param: ApiSettingsParam) =>
    request.put(URL_SYS_SETTINGS_API, param)

export const r_sys_statistics_software = () =>
    request.get<SoftwareInfoVo>(URL_SYS_STATISTICS_SOFTWARE)

export const r_sys_statistics_hardware = () =>
    request.get<HardwareInfoVo>(URL_SYS_STATISTICS_HARDWARE)

export const r_sys_statistics_cpu = () => request.get<CpuInfoVo>(URL_SYS_STATISTICS_CPU)

export const r_sys_statistics_storage = () => request.get<StorageInfoVo>(URL_SYS_STATISTICS_STORAGE)

export const r_sys_statistics_online = (param: OnlineInfoGetParam) =>
    request.get<OnlineInfoVo>(URL_SYS_STATISTICS_ONLINE, param)

export const r_sys_statistics_active = (param: ActiveInfoGetParam) =>
    request.get<ActiveInfoVo>(URL_SYS_STATISTICS_ACTIVE, param)

export const r_sys_api_get_plugin = (param: ApiPluginGetParam) =>
    request.get<PageVo<ApiPluginVo>>(URL_SYS_API_PLUGIN, param)

export const r_sys_api_get = (param: ApiInterfaceGetParam) =>
    request.get<PageVo<ApiInterfaceVo>>(URL_SYS_API, param)

export const r_sys_api_update_plugin = (param: ApiPluginUpdateParam) =>
    request.put(URL_SYS_API_PLUGIN, param)

export const r_sys_api_update = (param: ApiInterfaceUpdateParam) => request.put(URL_SYS_API, param)

export const r_sys_api_account_get = (userId?: string) =>
    request.get<ApiAccountVo>(URL_SYS_API_ACCOUNT, { userId })

export const r_sys_api_account_transactions = (param: ApiTransactionGetParam) =>
    request.get<PageVo<ApiTransactionVo>>(URL_SYS_API_ACCOUNT_TRANSACTIONS, param)

export const r_sys_api_account_topup = (param: ApiTopUpParam) =>
    request.post<ApiTransactionVo>(URL_SYS_API_ACCOUNT_TOPUP, param)

export const r_sys_api_key_get_one = (id: string) =>
    request.get<ApiKeyVo>(`${URL_SYS_API_KEY}/${id}`)

export const r_sys_api_key_get = (param: ApiKeyGetParam) =>
    request.get<PageVo<ApiKeyVo>>(URL_SYS_API_KEY, param)

export const r_sys_api_key_add = (param: ApiKeyAddParam) =>
    request.post<ApiKeyWithSecretVo>(URL_SYS_API_KEY, param)

export const r_sys_api_key_update = (param: ApiKeyUpdateParam) =>
    request.put(URL_SYS_API_KEY, param)

export const r_sys_api_key_status = (param: ApiKeyUpdateStatusParam) =>
    request.patch(URL_SYS_API_KEY, param)

export const r_sys_api__key_regenerate = (id: string) =>
    request.post<ApiKeyWithSecretVo>(`${URL_SYS_API_KEY}/${id}/regenerate`)

export const r_sys_api_key_delete = (id: string) => request.delete(`${URL_SYS_API_KEY}/${id}`)

export const r_sys_api_key_delete_list = (param: ApiKeyDeleteParam) =>
    request.delete(URL_SYS_API_KEY, param)

export const r_sys_api_usage_get = (param: ApiUsageGetParam) =>
    request.get<PageVo<ApiUsageVo>>(URL_SYS_API_USAGE, param)

export const r_sys_api_report_usage = (param: ApiReportGetParam) =>
    request.get<ApiReportVo[]>(URL_SYS_API_REPORT_USAGE, param)

export const r_sys_api_report_cost = (param: ApiReportGetParam) =>
    request.get<ApiReportVo[]>(URL_SYS_API_REPORT_COST, param)

export const r_sys_api_report_top = (param: ApiReportGetParam) =>
    request.get<ApiTopVo>(URL_SYS_API_REPORT_TOP, param)

export const r_sys_api_report_export = (param: ApiReportGetParam) =>
    request.get<string>(URL_SYS_API_REPORT_EXPORT, param)

export const r_sys_api_report_download = (fileHash: string) =>
    request.get(`${URL_SYS_API_REPORT_EXPORT}/${fileHash}`)

export const r_sys_api_monitor_dashboard = () =>
    request.get<ApiMonitorDashboardVo>(URL_SYS_API_MONITOR_DASHBOARD)

export const r_sys_api_audit_get = (param: ApiAuditGetParam) =>
    request.get<PageVo<ApiAuditVo>>(URL_SYS_API_AUDIT, param)
