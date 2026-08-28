import * as echarts from 'echarts/core'
import { BarSeriesOption } from 'echarts/charts'
import useStyles from '@/assets/css/pages/system/statistics/common.style'
import { formatByteSize } from '@/utils/common'
import { r_sys_statistics_storage } from '@/services/system'
import FlexBox from '@/components/common/FlexBox'
import { barDefaultSeriesOption, barEChartsBaseOption } from '@/pages/System/Statistics/shared'
import StatisticsCard from '@/components/system/StatisticsCard'

interface StorageChartData {
    label: string
    used: number
    free: number
}

const storageDefaultSeriesOption: BarSeriesOption = {
    ...barDefaultSeriesOption,
    tooltip: { valueFormatter: (value) => formatByteSize(value as number) }
}

const StorageInfo = () => {
    const { styles } = useStyles()
    const chartValueDivRef = useRef<HTMLDivElement>(null)
    const storageInfoEChartsRef = useRef<echarts.EChartsType[]>([])
    const isLoadingRef = useRef(false)
    const [isLoading, setIsLoading] = useState(true)
    const [refreshInterval, setRefreshInterval] = useState('5')
    const [storageChartData, setStorageChartData] = useState<StorageChartData[]>([])

    const getStorageInfo = useCallback(() => {
        if (isLoadingRef.current) {
            return
        }

        isLoadingRef.current = true

        r_sys_statistics_storage()
            .then((res) => {
                const response = res.data
                if (!response.success) {
                    return
                }
                const data = response.data
                if (!data) {
                    return
                }

                const chartData: StorageChartData[] = [
                    {
                        label: '物理内存',
                        used: data.memoryTotal - data.memoryFree,
                        free: data.memoryFree
                    },
                    {
                        label: '虚拟内存',
                        used: data.virtualMemoryInUse,
                        free: data.virtualMemoryMax - data.virtualMemoryInUse
                    },
                    {
                        label: 'swap',
                        used: data.swapUsed,
                        free: data.swapTotal - data.swapUsed
                    },
                    {
                        label: 'jvm 内存',
                        used: data.jvmTotal - data.jvmFree,
                        free: data.jvmFree
                    }
                ]
                data.fileStores.forEach((value) => {
                    chartData.push({
                        label: value.mount,
                        used: value.total - value.free,
                        free: value.free
                    })
                })

                setStorageChartData(chartData)
            })
            .finally(() => {
                isLoadingRef.current = false
                setIsLoading(false)
            })
    }, [])

    useEffect(() => {
        const container = chartValueDivRef.current
        if (!container || !storageChartData.length) {
            return
        }

        const chartDoms = Array.from(container.children) as HTMLDivElement[]

        chartDoms.forEach((dom, index) => {
            let chart = echarts.getInstanceByDom(dom)
            if (!chart) {
                chart = echarts.init(dom, null, { renderer: 'svg' })
            }

            const item = storageChartData[index]
            chart.setOption({
                ...barEChartsBaseOption,
                xAxis: {
                    ...barEChartsBaseOption.xAxis,
                    max: item.used + item.free
                },
                yAxis: {
                    ...barEChartsBaseOption.yAxis,
                    data: [item.label]
                },
                series: [
                    {
                        ...storageDefaultSeriesOption,
                        name: 'used',
                        data: [item.used]
                    },
                    {
                        ...storageDefaultSeriesOption,
                        name: 'free',
                        data: [item.free]
                    }
                ]
            })
            storageInfoEChartsRef.current[index] = chart
        })

        if (chartDoms.length < storageInfoEChartsRef.current.length) {
            storageInfoEChartsRef.current
                .slice(chartDoms.length)
                .forEach((value) => value.dispose())
        }
        storageInfoEChartsRef.current.length = chartDoms.length
    }, [storageChartData])

    useEffect(() => {
        const container = chartValueDivRef.current
        if (!container) {
            return
        }

        const chartResizeObserver = new ResizeObserver(() => {
            storageInfoEChartsRef.current.forEach((value) => value.resize())
        })
        chartResizeObserver.observe(container)

        return () => {
            chartResizeObserver.disconnect()
        }
    }, [isLoading])

    useEffect(() => {
        return () => {
            storageInfoEChartsRef.current.forEach((value) => value.dispose())
            storageInfoEChartsRef.current = []
        }
    }, [])

    useEffect(() => {
        getStorageInfo()
        const intervalId = setInterval(getStorageInfo, parseInt(refreshInterval) * 1000)

        return () => {
            clearInterval(intervalId)
        }
    }, [getStorageInfo, refreshInterval])

    return (
        <StatisticsCard
            icon={IconConsoleMemory}
            title={'内存信息'}
            loading={isLoading}
            expand={
                <AntdSelect
                    value={refreshInterval}
                    onChange={(value) => setRefreshInterval(value)}
                    options={[
                        { label: '1秒', value: '1' },
                        { label: '2秒', value: '2' },
                        { label: '3秒', value: '3' },
                        { label: '5秒', value: '5' },
                        { label: '10秒', value: '10' },
                        { label: '15秒', value: '15' },
                        { label: '20秒', value: '20' },
                        { label: '30秒', value: '30' },
                        { label: '60秒', value: '60' },
                        { label: '2分', value: '120' },
                        { label: '3分', value: '180' },
                        { label: '5分', value: '300' },
                        { label: '10分', value: '600' }
                    ]}
                />
            }
        >
            <FlexBox className={styles.content} direction={'horizontal'}>
                <FlexBox className={styles.key}>
                    {storageChartData.map((value, index) => (
                        <div key={index}>{value.label}</div>
                    ))}
                </FlexBox>
                <FlexBox className={styles.chartValue} ref={chartValueDivRef}>
                    {storageChartData.map((_, index) => (
                        <div key={index} />
                    ))}
                </FlexBox>
                <FlexBox className={styles.percentValue}>
                    {storageChartData.map((value, index) => {
                        const total = value.used + value.free
                        return (
                            <div key={index}>
                                {total > 0
                                    ? `${((value.used / total) * 100).toFixed(2)}%`
                                    : '0.00%'}
                            </div>
                        )
                    })}
                </FlexBox>
            </FlexBox>
        </StatisticsCard>
    )
}

export default StorageInfo
