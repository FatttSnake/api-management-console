import {
    r_sys_api_plugin_module_fetch,
    r_sys_api_plugin_module_fetch_status
} from '@/services/system'

const POLL_INTERVAL_MS = 500

export const usePluginModuleFetch = () => {
    const [task, setTask] = useState<PluginModuleFetchVo>()
    const [isRunning, setIsRunning] = useState(false)
    const [error, setError] = useState<string>()
    const timerRef = useRef<number | undefined>(undefined)
    const controllerRef = useRef<AbortController | undefined>(undefined)
    const resolverRef = useRef<((task?: PluginModuleFetchVo) => void) | undefined>(undefined)
    const sessionRef = useRef(0)

    const stopTimer = () => {
        if (timerRef.current !== undefined) {
            window.clearTimeout(timerRef.current)
            timerRef.current = undefined
        }
    }

    const settle = (session: number, value?: PluginModuleFetchVo) => {
        if (session !== sessionRef.current) {
            return
        }
        stopTimer()
        setIsRunning(false)
        if (value?.status === 'FAILED') {
            setError(value.message ?? '获取依赖失败')
        }
        resolverRef.current?.(value)
        resolverRef.current = undefined
    }

    const fail = (session: number, message: string) => {
        if (session !== sessionRef.current) {
            return
        }
        setError(message)
        settle(session, undefined)
    }

    const poll = (taskId: string, session: number) => {
        timerRef.current = window.setTimeout(() => {
            r_sys_api_plugin_module_fetch_status(taskId)
                .then((res) => {
                    if (session !== sessionRef.current) {
                        return
                    }
                    const response = res.data
                    if (!response.success || !response.data) {
                        fail(session, response.msg ?? '获取依赖失败')
                        return
                    }
                    setTask(response.data)
                    if (response.data.status === 'RUNNING') {
                        poll(taskId, session)
                    } else {
                        settle(session, response.data)
                    }
                })
                .catch((e: Error) => {
                    fail(session, e?.message || '获取依赖失败')
                })
        }, POLL_INTERVAL_MS)
    }

    const start = async (file: File, onProgress?: (percent: number) => void) => {
        stopTimer()
        controllerRef.current?.abort()
        const session = ++sessionRef.current
        const controller = new AbortController()
        controllerRef.current = controller
        setTask(undefined)
        setError(undefined)
        setIsRunning(true)

        const finished = new Promise<PluginModuleFetchVo | undefined>((resolve) => {
            resolverRef.current = resolve
        })

        try {
            const res = await r_sys_api_plugin_module_fetch(file, onProgress, controller.signal)
            if (session !== sessionRef.current) {
                return finished
            }
            const response = res.data
            if (!response.success || !response.data) {
                fail(session, response.msg ?? '获取依赖失败')
            } else if (response.data.status === 'RUNNING') {
                setTask(response.data)
                poll(response.data.taskId, session)
            } else {
                setTask(response.data)
                settle(session, response.data)
            }
        } catch (e) {
            if (controller.signal.aborted) {
                settle(session, undefined)
            } else {
                fail(session, e instanceof Error ? e.message : '获取依赖失败')
            }
        }

        return finished
    }

    const cancel = () => {
        sessionRef.current += 1
        controllerRef.current?.abort()
        stopTimer()
        setIsRunning(false)
        resolverRef.current?.(undefined)
        resolverRef.current = undefined
    }

    const reset = () => {
        sessionRef.current += 1
        stopTimer()
        resolverRef.current?.(undefined)
        resolverRef.current = undefined
        setTask(undefined)
        setError(undefined)
        setIsRunning(false)
    }

    useEffect(() => {
        return () => {
            sessionRef.current += 1
            controllerRef.current?.abort()
            stopTimer()
            resolverRef.current?.(undefined)
            resolverRef.current = undefined
        }
    }, [])

    return { task, isRunning, error, start, cancel, reset }
}
