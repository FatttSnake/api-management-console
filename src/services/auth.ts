import {
    URL_FORGET,
    URL_LOGIN,
    URL_LOGOUT,
    URL_REGISTER,
    URL_RESEND,
    URL_RETRIEVE,
    URL_TWO_FACTOR,
    URL_VERIFY
} from '@/constants/urls.constants'
import { SHA512 } from '@/utils/crypto'
import request from '@/services'

export const r_auth_register = (param: RegisterParam) =>
    request.post<TokenVo>(URL_REGISTER, {
        ...param,
        password: SHA512(param.password).toString()
    } as RegisterParam)

export const r_auth_resend = () => request.post(URL_RESEND)

export const r_auth_verify = (param: VerifyParam) => request.post(URL_VERIFY, param)

export const r_auth_forget = (param: ForgetParam) => request.post(URL_FORGET, param)

export const r_auth_retrieve = (param: RetrieveParam) =>
    request.post(URL_RETRIEVE, {
        ...param,
        password: SHA512(param.password).toString()
    } as RetrieveParam)

export const r_auth_login = (param: LoginParam) =>
    request.post<TokenVo>(URL_LOGIN, {
        ...param,
        password: SHA512(param.password).toString()
    } as LoginParam)

export const r_auth_two_factor_create = () => request.get<TwoFactorVo>(URL_TWO_FACTOR)

export const r_auth_two_factor_validate = (param: TwoFactorValidateParam) =>
    request.post(URL_TWO_FACTOR, param)

export const r_auth_two_factor_remove = (param: TwoFactorRemoveParam) =>
    request.delete(URL_TWO_FACTOR, param)

export const r_auth_logout = () => request.post(URL_LOGOUT)
