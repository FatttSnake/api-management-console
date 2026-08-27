import Icon from '@ant-design/icons'
import useStyles from '@/assets/css/components/common/sidebar/footer.style'
import { THEME_DARK, THEME_FOLLOW_SYSTEM, THEME_LIGHT } from '@/constants/common.constants'
import { getThemeMode, notification, setThemeMode, ThemeMode } from '@/utils/common'
import { getRedirectUrl } from '@/utils/route'
import { getAvatar, getLoginStatus, getNickname, removeAllToken } from '@/utils/auth'
import { navigateToLogin, navigateToUser } from '@/utils/navigation'
import { r_auth_logout } from '@/services/auth'
import { SidebarContext } from '@/components/common/Sidebar/index'

const Footer = () => {
    const { styles, theme, cx } = useStyles()
    const { isCollapse } = useContext(SidebarContext)
    const matches = useMatches()
    const lastMatch = matches.reduce((_, second) => second)
    const location = useLocation()
    const navigate = useNavigate()
    const [isExiting, setIsExiting] = useState(false)
    const [nickname, setNickname] = useState('')
    const [avatar, setAvatar] = useState('')

    const handleClickAvatar = () => {
        if (getLoginStatus()) {
            navigateToUser(navigate)
        } else {
            navigateToLogin(navigate, undefined, `${lastMatch.pathname}${location.search}`)
        }
    }

    const handleLogout = () => {
        if (isExiting) {
            return
        }

        setIsExiting(true)
        r_auth_logout().finally(() => {
            removeAllToken()
            notification.info({
                message: '已退出登录',
                icon: <Icon component={IconConsoleExit} style={{ color: theme.colorErrorText }} />
            })
            setTimeout(() => {
                window.location.reload()
            }, 1500)
        })
    }

    const loginStatus = getLoginStatus()

    useEffect(() => {
        if (getLoginStatus()) {
            getNickname().then((nickname) => {
                setNickname(nickname ?? '')

                getAvatar().then((avatar) => {
                    setAvatar(avatar ? `data:image/png;base64,${avatar}` : '')
                })
            })
        }
    }, [loginStatus])

    return (
        <div className={styles.root}>
            <span
                className={styles.icon}
                onClick={handleClickAvatar}
                title={getLoginStatus() ? '个人中心' : '登录'}
            >
                {avatar ? (
                    <img src={avatar} alt={''} />
                ) : (
                    <Icon viewBox={'-20 0 1024 1024'} component={IconConsoleUser} />
                )}
            </span>
            <span hidden={getLoginStatus()} className={styles.text}>
                未
                <NavLink to={getRedirectUrl('/login', `${lastMatch.pathname}${location.search}`)}>
                    登录
                </NavLink>
            </span>
            {!getLoginStatus() && !isCollapse && (
                <AntdSegmented<ThemeMode>
                    options={[
                        {
                            icon: <Icon component={IconConsoleThemeSystem} />,
                            title: '跟随系统',
                            value: THEME_FOLLOW_SYSTEM
                        },
                        {
                            label: <Icon component={IconConsoleThemeLight} />,
                            title: '亮色',
                            value: THEME_LIGHT
                        },
                        {
                            label: <Icon component={IconConsoleThemeDark} />,
                            title: '深色',
                            value: THEME_DARK
                        }
                    ]}
                    defaultValue={getThemeMode()}
                    onChange={setThemeMode}
                    size={'small'}
                    block
                />
            )}
            <span
                hidden={!getLoginStatus()}
                className={cx(styles.text, isCollapse ? styles.collapsedText : '')}
                title={nickname}
            >
                {nickname}
            </span>
            <div
                hidden={!getLoginStatus()}
                className={cx(
                    isCollapse ? styles.collapsedExit : '',
                    !getLoginStatus() ? styles.hide : ''
                )}
            >
                <div
                    className={cx(
                        styles.exitContent,
                        isCollapse ? styles.collapsedExitContent : ''
                    )}
                >
                    <span
                        hidden={!getLoginStatus()}
                        className={cx(styles.exitIcon, isCollapse ? styles.collapsedExitIcon : '')}
                        onClick={handleLogout}
                    >
                        <Icon
                            component={isExiting ? IconConsoleLoading : IconConsoleExit}
                            spin={isExiting}
                        />
                    </span>
                </div>
            </div>
        </div>
    )
}

export default Footer
