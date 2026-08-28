import useStyles from '@/assets/css/pages/sign/verify.style'
import {
    PERMISSION_ACCOUNT_NEED_INIT,
    PERMISSION_NO_VERIFICATION_REQUIRED,
    PERMISSION_RESEND_SUCCESS,
    PERMISSION_VERIFY_SUCCESS,
    SYSTEM_MATCH_SENSITIVE_WORD
} from '@/constants/common.constants'
import { message } from '@/utils/common'
import { getLoginStatus, getUserInfo, requestUserInfo } from '@/utils/auth'
import { navigateToLogin, navigateToRedirect, navigateToRoot } from '@/utils/navigation'
import { r_auth_resend, r_auth_verify } from '@/services/auth'
import { r_api_avatar_random_base64 } from '@/services/api/avatar'
import { AppContext } from '@/App'
import FitCenter from '@/components/common/FitCenter'
import FlexBox from '@/components/common/FlexBox'

const Verify = () => {
    const { styles, theme } = useStyles()
    const { refreshRouter } = useContext(AppContext)
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [hasCode, setHasCode] = useState(true)
    const [needVerify, setNeedVerify] = useState(true)
    const [isValid, setIsValid] = useState(true)
    const [isSending, setIsSending] = useState(false)
    const [isGettingAvatar, setIsGettingAvatar] = useState(false)
    const [avatar, setAvatar] = useState('')
    const [isVerifying, setIsVerifying] = useState(false)

    useEffect(() => {
        if (location.pathname !== '/verify') {
            return
        }

        if (!getLoginStatus()) {
            navigateToLogin(navigate, location.search, undefined, {
                replace: true
            })
            return
        }

        const code = searchParams.get('code')

        if (!code) {
            setHasCode(false)
            return
        }
        r_auth_verify({ code })
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case PERMISSION_ACCOUNT_NEED_INIT:
                        getUserInfo().then((user) => {
                            setAvatar(user.userInfo.avatar)
                        })
                        break
                    case PERMISSION_NO_VERIFICATION_REQUIRED:
                        void message.success('无需验证')
                        setNeedVerify(false)
                        break
                    default:
                        setIsValid(false)
                }
            })
            .catch(() => {
                setIsValid(false)
            })
    }, [location.pathname])

    const handleOnResend = () => {
        if (isSending) {
            return
        }
        setIsSending(true)
        void message.loading({ content: '发送中', key: 'SENDING', duration: 0 })
        r_auth_resend()
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case PERMISSION_RESEND_SUCCESS:
                        void message.success('已发送验证邮件，请查收')
                        break
                    case PERMISSION_NO_VERIFICATION_REQUIRED:
                        void message.warning('账户已验证')
                        navigateToRoot(navigate)
                        break
                    default:
                        void message.error('出错了，请稍后重试')
                }
            })
            .finally(() => {
                message.destroy('SENDING')
                setIsSending(false)
            })
    }

    const handleOnChangeAvatar = () => {
        if (isGettingAvatar) {
            return
        }
        setIsGettingAvatar(true)
        r_api_avatar_random_base64()
            .then((res) => {
                const response = res.data
                if (response.success) {
                    response.data?.base64 && setAvatar(response.data.base64)
                }
            })
            .finally(() => {
                setIsGettingAvatar(false)
            })
    }

    const handleOnFinish = (verifyParam: VerifyParam) => {
        if (isVerifying) {
            return
        }
        setIsVerifying(true)

        r_auth_verify({
            code: searchParams.get('code') ?? '',
            avatar,
            nickname: verifyParam.nickname
        }).then((res) => {
            const response = res.data
            switch (response.code) {
                case PERMISSION_VERIFY_SUCCESS:
                    message.success('恭喜你，完成了').then(() => {
                        requestUserInfo().then(() => {
                            refreshRouter()
                            navigateToRedirect(navigate, searchParams, '/repository')
                        })
                    })
                    break
                case SYSTEM_MATCH_SENSITIVE_WORD:
                    void message.error('昵称包含敏感词，请重试')
                    setIsVerifying(false)
                    break
                default:
                    void message.error('出错了，请稍后重试')
                    setIsVerifying(false)
            }
        })
    }

    return (
        <FitCenter>
            <FlexBox>
                <div className={styles.title}>
                    <div className={styles.primary}>验证账号</div>
                    <div className={styles.secondary}>Verify account</div>
                </div>
                <AntdForm className={styles.form} onFinish={handleOnFinish}>
                    <div hidden={needVerify}>
                        账号已验证通过，无需验证，点击&nbsp;<a href={'/'}>回到首页</a>
                    </div>
                    <div hidden={!needVerify || !hasCode || !isValid}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                marginBottom: 20
                            }}
                        >
                            <AntdTooltip title={'点击获取新头像'}>
                                <AntdAvatar
                                    src={<img src={`data:image/png;base64,${avatar}`} alt={''} />}
                                    size={100}
                                    style={{
                                        background: theme.colorBgLayout,
                                        cursor: 'pointer'
                                    }}
                                    onClick={handleOnChangeAvatar}
                                />
                            </AntdTooltip>
                        </div>
                        <AntdForm.Item hidden name={'avatar'}>
                            <AntdInput value={avatar} />
                        </AntdForm.Item>
                        <AntdForm.Item
                            name={'nickname'}
                            rules={[
                                { required: true, message: '请输入昵称' },
                                { whitespace: true, message: '昵称不能为空字符' },
                                { min: 3, message: '昵称至少为3个字符' }
                            ]}
                        >
                            <AntdSpace.Compact>
                                <AntdSpace.Addon>昵称</AntdSpace.Addon>
                                <AntdInput disabled={isVerifying} maxLength={20} showCount />
                            </AntdSpace.Compact>
                        </AntdForm.Item>
                        <AntdForm.Item>
                            <AntdButton
                                style={{ width: '100%' }}
                                type={'primary'}
                                htmlType={'submit'}
                                disabled={isVerifying}
                                loading={isVerifying}
                            >
                                确&ensp;&ensp;&ensp;&ensp;定
                            </AntdButton>
                        </AntdForm.Item>
                    </div>
                    <div hidden={hasCode}>
                        在继续使用之前，我们需要确定您的电子邮箱地址的有效性，请点击&nbsp;
                        <a onClick={handleOnResend}>发送验证邮件</a>
                    </div>
                    <div hidden={!hasCode || isValid}>
                        此链接有误或已失效，请点击&nbsp;
                        <a onClick={handleOnResend}>重新发送验证邮件</a>
                    </div>
                </AntdForm>
            </FlexBox>
        </FitCenter>
    )
}

export default Verify
