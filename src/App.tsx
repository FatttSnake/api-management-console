import { theme } from 'antd'
import zh_CN from 'antd/locale/zh_CN'
import BaseStyles from '@/assets/css/base.style'
import CommonStyles from '@/assets/css/common.style'
import {
    COLOR_ACTIVE,
    COLOR_HOVER,
    COLOR_PRIMARY,
    THEME_DARK,
    THEME_FOLLOW_SYSTEM,
    THEME_LIGHT
} from '@/constants/common.constants'
import { ConfigProvider } from '@/components/config/ConfigContext'
import { getThemeMode, init } from '@/utils/common'
import { getRouter } from '@/routers'
import FullscreenLoadingMask from '@/components/common/FullscreenLoadingMask'

export const AppContext = createContext({
    refreshRouter: () => {},
    isDarkMode: false
})

const App = () => {
    const [messageInstance, messageHolder] = message.useMessage()
    const [notificationInstance, notificationHolder] = notification.useNotification()
    const [modalInstance, modalHolder] = AntdModal.useModal()
    const [routerState, setRouterState] = useState(getRouter)
    const [themeMode, setThemeMode] = useState(getThemeMode())
    const [isSystemDarkMode, setIsSystemDarkMode] = useState(false)

    const getIsDark = () => {
        switch (themeMode) {
            case THEME_FOLLOW_SYSTEM:
                return isSystemDarkMode
            case THEME_LIGHT:
                return false
            case THEME_DARK:
                return true
        }
    }

    useEffect(() => {
        const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)')
        setIsSystemDarkMode(darkThemeMq.matches)
        const darkThemeMqChangeListener = (ev: MediaQueryListEvent) => {
            setIsSystemDarkMode(ev.matches)
        }
        darkThemeMq.addEventListener('change', darkThemeMqChangeListener)

        const themeModeChangeListener = () => {
            setThemeMode(getThemeMode())
        }
        window.addEventListener('localStorageChange', themeModeChangeListener)

        init(messageInstance, notificationInstance, modalInstance)

        return () => {
            darkThemeMq.removeEventListener('change', darkThemeMqChangeListener)
            window.removeEventListener('localStorageChange', themeModeChangeListener)
        }
    }, [])

    return (
        <AntdConfigProvider
            theme={{
                algorithm: getIsDark() ? theme.darkAlgorithm : theme.defaultAlgorithm,
                token: {
                    colorPrimary: COLOR_PRIMARY,
                    colorLink: COLOR_PRIMARY,
                    colorLinkHover: COLOR_HOVER,
                    colorLinkActive: COLOR_ACTIVE,
                    colorInfo: COLOR_PRIMARY
                },
                components: {
                    Tree: {
                        colorBgContainer: 'transparent'
                    }
                }
            }}
            locale={zh_CN}
        >
            <BaseStyles />
            <CommonStyles />
            <ConfigProvider>
                <AppContext.Provider
                    value={{
                        refreshRouter: () => {
                            setRouterState(getRouter())
                        },
                        isDarkMode: getIsDark()
                    }}
                >
                    <Suspense fallback={<FullscreenLoadingMask />}>
                        <RouterProvider router={routerState} />
                    </Suspense>
                </AppContext.Provider>
                {messageHolder}
                {notificationHolder}
                {modalHolder}
            </ConfigProvider>
        </AntdConfigProvider>
    )
}

export default App
