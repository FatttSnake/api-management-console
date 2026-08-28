import Icon from '@ant-design/icons'
import useStyles from '@/assets/css/pages/sign/forget.style'
import {
    PERMISSION_FORGET_SUCCESS,
    PERMISSION_RETRIEVE_CODE_ERROR_OR_EXPIRED,
    PERMISSION_RETRIEVE_SUCCESS,
    PERMISSION_USER_NOT_FOUND,
    SYSTEM_INVALID_CAPTCHA_CODE
} from '@/constants/common.constants'
import { useConfigValue } from '@/components/config/ConfigContext'
import { message } from '@/utils/common'
import { navigateToLogin } from '@/utils/navigation'
import { r_auth_forget, r_auth_retrieve } from '@/services/auth'
import { AppContext } from '@/App'
import FitCenter from '@/components/common/FitCenter'
import FlexBox from '@/components/common/FlexBox'
import Captcha, { CaptchaElement } from '@/components/common/Captcha'

const Forget = () => {
    const { styles } = useStyles()
    const { isDarkMode } = useContext(AppContext)
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const captchaRef = useRef<CaptchaElement>(null)
    const retrieveCaptchaRef = useRef<CaptchaElement>(null)
    const [isSending, setIsSending] = useState(false)
    const [isSent, setIsSent] = useState(false)
    const [isChanging, setIsChanging] = useState(false)
    const [isChanged, setIsChanged] = useState(false)
    const [captchaCode, setCaptchaCode] = useState('')
    const [retrieveCaptchaCode, setRetrieveCaptchaCode] = useState('')
    const turnstileSiteKey = useConfigValue('turnstileSiteKey')

    useEffect(() => {
        if (!isSending) {
            setCaptchaCode('')
            captchaRef.current?.refresh()
        }
    }, [isSending])

    useEffect(() => {
        if (!isChanging) {
            setRetrieveCaptchaCode('')
            retrieveCaptchaRef.current?.refresh()
        }
    }, [isChanging])

    const handleOnSend = (forgetParam: ForgetParam) => {
        if (isSending) {
            return
        }
        setIsSending(true)

        if (turnstileSiteKey && !captchaCode) {
            void message.warning('请先通过验证')
            setIsSending(false)
            return
        }

        r_auth_forget({ email: forgetParam.email, captchaCode })
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case PERMISSION_FORGET_SUCCESS:
                        void message.success('已发送验证邮件，请查收')
                        setIsSent(true)
                        break
                    case PERMISSION_USER_NOT_FOUND:
                        void message.error('用户不存在')
                        break
                    case SYSTEM_INVALID_CAPTCHA_CODE:
                        void message.error('验证码有误，请重试')
                        break
                    default:
                        void message.error('出错了，请稍后重试')
                }
            })
            .finally(() => {
                setIsSending(false)
            })
    }

    const handleOnRetry = () => {
        setIsSent(false)
    }

    const handleOnChange = (retrieveParam: RetrieveParam) => {
        if (isChanging) {
            return
        }
        setIsChanging(true)

        if (turnstileSiteKey && !retrieveCaptchaCode) {
            void message.warning('请先通过验证')
            setIsChanging(false)
            return
        }

        r_auth_retrieve({
            code: searchParams.get('code') ?? '',
            password: retrieveParam.password,
            captchaCode: retrieveCaptchaCode
        })
            .then((res) => {
                const response = res.data

                switch (response.code) {
                    case PERMISSION_RETRIEVE_SUCCESS:
                        void message.success('密码已更新')
                        setIsChanged(true)
                        break
                    case PERMISSION_RETRIEVE_CODE_ERROR_OR_EXPIRED:
                        void message.error('请重新获取邮件')
                        break
                    case SYSTEM_INVALID_CAPTCHA_CODE:
                        void message.error('验证码有误，请重试')
                        break
                    default:
                        void message.error('出错了，请稍后重试')
                }
            })
            .finally(() => {
                setIsChanging(false)
            })
    }

    return (
        <FitCenter>
            <FlexBox>
                <div className={styles.title}>
                    <div className={styles.primary}>找回密码</div>
                    <div className={styles.secondary}>Retrieve password</div>
                </div>
                <div className={styles.form}>
                    {!searchParams.get('code') ? (
                        !isSent ? (
                            <AntdForm autoComplete={'on'} onFinish={handleOnSend}>
                                <AntdForm.Item
                                    name={'email'}
                                    rules={[
                                        { required: true, message: '请输入邮箱' },
                                        { type: 'email', message: '不是有效的邮箱地址' }
                                    ]}
                                >
                                    <AntdInput
                                        prefix={<Icon component={IconConsoleEmail} />}
                                        disabled={isSending}
                                        placeholder={'邮箱'}
                                    />
                                </AntdForm.Item>
                                {location.pathname === '/forget' &&
                                    !searchParams.get('code') &&
                                    turnstileSiteKey && (
                                        <AntdForm.Item>
                                            <Captcha
                                                ref={captchaRef}
                                                turnstileSiteKey={turnstileSiteKey}
                                                isDarkMode={isDarkMode}
                                                action={'forget'}
                                                onSuccess={setCaptchaCode}
                                            />
                                        </AntdForm.Item>
                                    )}
                                <AntdForm.Item>
                                    <AntdButton
                                        style={{ width: '100%' }}
                                        type={'primary'}
                                        htmlType={'submit'}
                                        disabled={isSending}
                                        loading={isSending}
                                    >
                                        确&ensp;&ensp;&ensp;&ensp;定
                                    </AntdButton>
                                </AntdForm.Item>
                            </AntdForm>
                        ) : (
                            <div className={styles.retry}>
                                我们向您发送了一封包含找回密码链接的邮件，如未收到，可能被归为垃圾邮件，请仔细检查。
                                <a onClick={handleOnRetry}>重新发送</a>
                            </div>
                        )
                    ) : !isChanged ? (
                        <AntdForm autoComplete={'on'} onFinish={handleOnChange}>
                            <AntdForm.Item
                                name={'password'}
                                rules={[
                                    { required: true, message: '请输入密码' },
                                    { whitespace: true, message: '密码不能为空字符' },
                                    { min: 10, message: '密码至少为10位' },
                                    { max: 30, message: '密码最多为30位' }
                                ]}
                            >
                                <AntdSpace.Compact>
                                    <AntdSpace.Addon>
                                        新&nbsp;&nbsp;密&nbsp;&nbsp;码
                                    </AntdSpace.Addon>
                                    <AntdInput.Password
                                        id={'forget-password'}
                                        disabled={isChanging}
                                        placeholder={'密码'}
                                    />
                                </AntdSpace.Compact>
                            </AntdForm.Item>
                            <AntdForm.Item
                                name={'passwordConfirm'}
                                rules={[
                                    { required: true, message: '请确认密码' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve()
                                            }
                                            return Promise.reject(Error('两次密码输入必须一致'))
                                        }
                                    })
                                ]}
                            >
                                <AntdSpace.Compact>
                                    <AntdSpace.Addon>确认密码</AntdSpace.Addon>
                                    <AntdInput.Password
                                        id={'forget-password-confirm'}
                                        disabled={isChanging}
                                        placeholder={'确认密码'}
                                    />
                                </AntdSpace.Compact>
                            </AntdForm.Item>
                            {location.pathname === '/forget' &&
                                searchParams.get('code') &&
                                turnstileSiteKey && (
                                    <AntdForm.Item>
                                        <Captcha
                                            ref={retrieveCaptchaRef}
                                            turnstileSiteKey={turnstileSiteKey}
                                            isDarkMode={isDarkMode}
                                            action={'retrieve'}
                                            onSuccess={setRetrieveCaptchaCode}
                                        />
                                    </AntdForm.Item>
                                )}
                            <AntdForm.Item>
                                <AntdButton
                                    style={{ width: '100%' }}
                                    type={'primary'}
                                    htmlType={'submit'}
                                    disabled={isChanging}
                                    loading={isChanging}
                                >
                                    更&ensp;&ensp;&ensp;&ensp;改
                                </AntdButton>
                            </AntdForm.Item>
                        </AntdForm>
                    ) : (
                        <div className={styles.success}>恭喜你，密码已更新，请重新登录。</div>
                    )}
                    <AntdForm>
                        <div className={styles.footer}>
                            找到了？
                            <a
                                onClick={() =>
                                    navigateToLogin(navigate, location.search, undefined, {
                                        replace: true
                                    })
                                }
                            >
                                登录
                            </a>
                        </div>
                    </AntdForm>
                </div>
            </FlexBox>
        </FitCenter>
    )
}

export default Forget
