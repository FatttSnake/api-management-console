import request from '@/services'
import {
    URL_USER_API_ACCOUNT,
    URL_USER_API_ACCOUNT_TRANSACTIONS,
    URL_USER_API_KEY,
    URL_USER_API_KEY_AVAILABLE_APIS,
    URL_USER_API_USAGE
} from '@/constants/urls.constants'

export const r_user_api_account_get = () => request.get<ApiAccountVo>(URL_USER_API_ACCOUNT)

export const r_user_api_account_transactions = (param: ApiTransactionGetParam) =>
    request.get<PageVo<ApiTransactionVo>>(URL_USER_API_ACCOUNT_TRANSACTIONS, param)

export const r_user_api_key_get_one = (id: string) =>
    request.get<ApiKeyVo>(`${URL_USER_API_KEY}/${id}`)

export const r_user_api_key_get = (param: ApiKeyGetParam) =>
    request.get<PageVo<ApiKeyVo>>(URL_USER_API_KEY, param)

export const r_user_api_key_add = (param: ApiKeyAddParam) =>
    request.post<ApiKeyWithSecretVo>(URL_USER_API_KEY, param)

export const r_user_api_key_update = (param: ApiKeyUpdateParam) =>
    request.put(URL_USER_API_KEY, param)

export const r_user_api_key_status = (param: ApiKeyUpdateStatusParam) =>
    request.patch(URL_USER_API_KEY, param)

export const r_user_api_key_regenerate = (id: string) =>
    request.post<ApiKeyWithSecretVo>(`${URL_USER_API_KEY}/${id}/regenerate`)

export const r_user_api_key_delete = (id: string) => request.delete(`${URL_USER_API_KEY}/${id}`)

export const r_user_api_key_delete_list = (param: ApiKeyDeleteParam) =>
    request.delete(URL_USER_API_KEY, param)

export const r_user_api_key_available_apis = () =>
    request.get<ApiGroupVo[]>(URL_USER_API_KEY_AVAILABLE_APIS)

export const r_user_api_key_usage_get = (param: ApiUsageGetParam) =>
    request.get<PageVo<ApiUsageVo>>(URL_USER_API_USAGE, param)
