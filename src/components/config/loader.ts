import axios from 'axios'

class ConfigLoader {
    private static instance: ConfigLoader
    private config: SystemConfig | null = null
    private loadPromise: Promise<SystemConfig> | null = null
    private configLoadedCallbacks: ((config: SystemConfig) => void)[] = []

    static getInstance(): ConfigLoader {
        if (!ConfigLoader.instance) {
            ConfigLoader.instance = new ConfigLoader()
        }

        return ConfigLoader.instance
    }

    async loadConfig(): Promise<SystemConfig> {
        if (this.config) {
            return this.config
        }

        if (this.loadPromise) {
            return this.loadPromise
        }

        this.loadPromise = this.loadConfigInternal()

        try {
            const config = await this.loadPromise
            this.config = config
            this.notifyConfigLoaded(config)
            return config
        } finally {
            this.loadPromise = null
        }
    }

    getConfig(): SystemConfig {
        if (!this.config) {
            throw new Error('Config not loaded')
        }

        return this.config
    }

    isConfigLoaded(): boolean {
        return this.config !== null
    }

    onConfigLoaded(callback: (config: SystemConfig) => void): () => void {
        if (this.config) {
            callback(this.config)
            return () => {}
        }

        this.configLoadedCallbacks.push(callback)
        return () => {
            this.configLoadedCallbacks = this.configLoadedCallbacks.filter((cb) => cb !== callback)
        }
    }

    clearConfig(): void {
        this.config = null
        this.loadPromise = null
    }

    private async loadConfigInternal(): Promise<SystemConfig> {
        try {
            const localConfig = await this.loadLocalConfig()
            const remoteConfig = await this.loadRemoteConfig(localConfig.apiUrl)

            return {
                ...localConfig,
                ...remoteConfig
            }
        } catch (error) {
            console.error('Failed to load configuration:', error)
            throw new Error('CONFIG_LOAD_FAILED', { cause: error })
        }
    }

    private async loadLocalConfig(): Promise<LocalConfig> {
        try {
            const { data: config } = await axios.get<LocalConfig>('/config.json', {
                headers: {
                    'Cache-Control': 'no-cache'
                }
            })
            this.validateLocalConfig(config)

            return config
        } catch (error) {
            console.error('Failed to load local config:', error)
            throw error
        }
    }

    private async loadRemoteConfig(apiUrl: string): Promise<RemoteConfig> {
        try {
            const { data: config } = await axios.get<RemoteConfig>('/config', {
                baseURL: apiUrl,
                timeout: 3e4,
                headers: {
                    'Cache-Control': 'no-cache'
                }
            })
            this.validateRemoteConfig(config)

            return config
        } catch (error) {
            console.error('Failed to load remote config:', error)
            throw error
        }
    }

    private validateLocalConfig(config: LocalConfig): asserts config is LocalConfig {
        const requiredFields: (keyof LocalConfig)[] = ['apiUrl']

        for (const field of requiredFields) {
            if (!config[field] || typeof config[field] !== 'string') {
                throw new Error(`Missing or invalid local config field: ${field}`)
            }
        }
    }

    private validateRemoteConfig(config: RemoteConfig): asserts config is RemoteConfig {
        const requiredFields: (keyof RemoteConfig)[] = [
            'systemName',
            'tokenExpiryBufferMs',
            'tokenExpiryCheckIntervalMs',
            'turnstileSiteKey',
            'homeUrl'
        ]

        for (const field of requiredFields) {
            if (config[field] === undefined || config[field] === null) {
                throw new Error(`Missing remote config field: ${field}`)
            }
        }
    }

    private notifyConfigLoaded(config: SystemConfig): void {
        this.configLoadedCallbacks.forEach((callback) => callback(config))
        this.configLoadedCallbacks = []
    }
}

export default ConfigLoader.getInstance()
