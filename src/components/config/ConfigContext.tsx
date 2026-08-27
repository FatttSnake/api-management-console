import { initRequestConfig } from '@/services'
import FitFullscreen from '@/components/common/FitFullscreen'
import FitCenter from '@/components/common/FitCenter'
import FullscreenLoadingMask from '@/components/common/FullscreenLoadingMask'
import ConfigLoader from '@/components/config/loader'

const MaintenancePage = () => {
    return (
        <FitFullscreen>
            <FitCenter>
                <AntdResult
                    status={'error'}
                    title={'🔧 系统维护中'}
                    subTitle={'抱歉，系统正在进行维护或配置加载失败，请稍后再试。'}
                    extra={
                        <AntdButton type={'primary'} onClick={() => window.location.reload()}>
                            重新加载
                        </AntdButton>
                    }
                />
            </FitCenter>
        </FitFullscreen>
    )
}

const ConfigContext = createContext<ConfigState>({
    mode: 'loading',
    config: null,
    error: null
})

interface ConfigProviderProps {
    children: ReactNode
    fallback?: ReactNode
    retryCount?: number
    retryDelay?: number
}

export const ConfigProvider = ({
    children,
    fallback,
    retryCount = 3,
    retryDelay = 2e3
}: ConfigProviderProps) => {
    const [state, setState] = useState<ConfigState>({
        mode: 'loading',
        config: null,
        error: null
    })

    useEffect(() => {
        let mounted = true
        let retries = 0

        const loadConfig = async () => {
            try {
                const config = await ConfigLoader.loadConfig()
                await initRequestConfig()

                if (mounted) {
                    setState({
                        mode: 'online',
                        config,
                        error: null
                    })
                }
            } catch (error) {
                console.error('Config load error:', error)

                if (retries < retryCount) {
                    retries++
                    console.log(`Retrying config load (${retries}/${retryCount})...`)

                    setTimeout(() => {
                        if (mounted) {
                            loadConfig()
                        }
                    }, retryDelay * retries)

                    return
                }

                if (mounted) {
                    setState({
                        mode: 'offline',
                        config: null,
                        error: error as Error
                    })
                }
            }
        }

        void loadConfig()

        return () => {
            mounted = false
        }
    }, [retryCount, retryDelay])

    if (state.mode === 'loading') {
        return fallback ? fallback : <FullscreenLoadingMask />
    }

    if (state.mode === 'offline') {
        return <MaintenancePage />
    }

    return <ConfigContext.Provider value={state}>{children}</ConfigContext.Provider>
}

export const useConfig = () => {
    const context = useContext(ConfigContext)
    if (!context) {
        throw new Error('useConfig must be used within ConfigProvider')
    }

    return context
}

export const useIsConfigLoaded = (): boolean => {
    const { mode, config } = useConfig()
    return mode !== 'loading' && config !== null
}

export const useReloadConfig = () => {
    return async () => {
        ConfigLoader.clearConfig()
        window.location.reload()
    }
}

export const useSystemConfig = (): SystemConfig => {
    const { config } = useConfig()
    if (!config) {
        throw new Error('Config not loaded')
    }
    return config
}

export const useConfigValue = <K extends keyof SystemConfig>(key: K): SystemConfig[K] => {
    const { config } = useConfig()
    if (!config) {
        throw new Error(`Config not loaded when accessing ${String(key)}`)
    }
    return config[key]
}

export const useConfigValues = <const K extends readonly (keyof SystemConfig)[]>(
    keys: K
): { [P in keyof K]: SystemConfig[K[P] & keyof SystemConfig] } => {
    const { config } = useConfig()
    if (!config) {
        throw new Error('Config not loaded')
    }

    return keys.map((key) => config[key]) as unknown as {
        [P in keyof K]: SystemConfig[K[P] & keyof SystemConfig]
    }
}
