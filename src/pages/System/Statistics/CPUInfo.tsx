import * as echarts from 'echarts/core'
import { BarSeriesOption } from 'echarts/charts'
import useStyles from '@/assets/css/pages/system/statistics/common.style'
import { r_sys_statistics_cpu } from '@/services/system'
import FlexBox from '@/components/common/FlexBox'
import { barDefaultSeriesOption, barEChartsBaseOption } from '@/pages/System/Statistics/shared'
import StatisticsCard from '@/components/system/StatisticsCard'

const cpuDefaultSeriesOption: BarSeriesOption = {
    ...barDefaultSeriesOption,
    tooltip: {
        valueFormatter: (value) => `${((value as number) * 100).toFixed(2)}%`
    }
}

const cpuInfoVoToCpuInfoData = (cpuInfoVo: CpuInfoVo): BarSeriesOption[] =>
    Object.entries(cpuInfoVo)
        .filter(([key]) => !['total', 'processors'].includes(key))
        .map(([key, value]) => ({
            ...cpuDefaultSeriesOption,
            name: key,
            data: [(value as number) / cpuInfoVo.total]
        }))
        .sort((a, b) => {
            const order = ['steal', 'irq', 'softirq', 'iowait', 'system', 'nice', 'user', 'idle']
            return order.indexOf(a.name) - order.indexOf(b.name)
        })

const CPUInfo = () => {
    const { styles } = useStyles()
    const chartValueDivRef = useRef<HTMLDivElement>(null)
    const cpuInfoEChartsRef = useRef<echarts.EChartsType[]>([])
    const isLoadingRef = useRef(false)
    const [isLoading, setIsLoading] = useState(true)
    const [refreshInterval, setRefreshInterval] = useState('5')
    const [cpuInfoList, setCpuInfoList] = useState<BarSeriesOption[][]>([])

    const getCpuInfo = useCallback(() => {
        if (isLoadingRef.current) {
            return
        }

        isLoadingRef.current = true

        r_sys_statistics_cpu()
            .then((res) => {
                const response = res.data
                if (!response.success) {
                    return
                }
                const data = response.data
                if (!data) {
                    return
                }

                const dataList = data.processors.map((value) => cpuInfoVoToCpuInfoData(value))
                dataList.unshift(cpuInfoVoToCpuInfoData(data))

                setCpuInfoList(dataList)
            })
            .catch(() => {})
            .finally(() => {
                isLoadingRef.current = false
                setIsLoading(false)
            })
    }, [])

    useEffect(() => {
        const container = chartValueDivRef.current
        if (!container || !cpuInfoList.length) {
            return
        }

        const chartDoms = Array.from(container.children) as HTMLDivElement[]

        chartDoms.forEach((dom, index) => {
            let chart = echarts.getInstanceByDom(dom)
            if (!chart) {
                chart = echarts.init(dom, null, { renderer: 'svg' })
            }
            chart.setOption({
                ...barEChartsBaseOption,
                yAxis: {
                    ...barEChartsBaseOption.yAxis,
                    data: [index === 0 ? '总占用' : `CPU ${index - 1}`]
                },
                series: cpuInfoList[index]
            })
            cpuInfoEChartsRef.current[index] = chart
        })

        if (chartDoms.length < cpuInfoEChartsRef.current.length) {
            cpuInfoEChartsRef.current.slice(chartDoms.length).forEach((value) => value.dispose())
        }
        cpuInfoEChartsRef.current.length = chartDoms.length
    }, [cpuInfoList])

    useEffect(() => {
        const container = chartValueDivRef.current
        if (!container) {
            return
        }

        const chartResizeObserver = new ResizeObserver(() => {
            cpuInfoEChartsRef.current.forEach((value) => value.resize())
        })
        chartResizeObserver.observe(container)

        return () => {
            chartResizeObserver.disconnect()
        }
    }, [isLoading])

    useEffect(() => {
        return () => {
            cpuInfoEChartsRef.current.forEach((value) => value.dispose())
            cpuInfoEChartsRef.current = []
        }
    }, [])

    useEffect(() => {
        getCpuInfo()
        const intervalId = setInterval(getCpuInfo, parseInt(refreshInterval) * 1000)

        return () => {
            clearInterval(intervalId)
        }
    }, [getCpuInfo, refreshInterval])

    return (
        <StatisticsCard
            icon={IconConsoleCpu}
            title={'CPU 信息'}
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
                    {cpuInfoList.map((_, index) => (
                        <div key={index}>{index === 0 ? '总占用' : `CPU ${index - 1}`}</div>
                    ))}
                </FlexBox>
                <FlexBox className={styles.chartValue} ref={chartValueDivRef}>
                    {cpuInfoList.map((_, index) => (
                        <div key={index} />
                    ))}
                </FlexBox>
                <FlexBox className={styles.percentValue}>
                    {cpuInfoList.map((value, index) => {
                        const idle = value.find((item) => item.name === 'idle')?.data?.[0]
                        return (
                            <div key={index}>
                                {idle !== undefined
                                    ? `${((1 - (idle as number)) * 100).toFixed(2)}%`
                                    : 'Unknown'}
                            </div>
                        )
                    })}
                </FlexBox>
            </FlexBox>
        </StatisticsCard>
    )
}

export default CPUInfo
