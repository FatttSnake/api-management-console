import * as echarts from 'echarts/core'
import { BarSeriesOption } from 'echarts/charts'
import useStyles from '@/assets/css/pages/system/statistics/common.style'
import { r_sys_statistics_cpu } from '@/services/system'
import FlexBox from '@/components/common/FlexBox'
import {
    barDefaultSeriesOption,
    barEChartsBaseOption,
    EChartsOption
} from '@/pages/System/Statistics/shared'
import StatisticsCard from '@/components/system/StatisticsCard'

const CPUInfo = () => {
    const { styles } = useStyles()
    const keyDivRef = useRef<HTMLDivElement>(null)
    const percentDivRef = useRef<HTMLDivElement>(null)
    const cpuInfoDivRef = useRef<HTMLDivElement>(null)
    const cpuInfoEChartsRef = useRef<echarts.EChartsType[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [refreshInterval, setRefreshInterval] = useState('5')
    const [cpuInfoEChartsOption, setCpuInfoEChartsOption] = useState<EChartsOption[]>([])

    const cpuDefaultSeriesOption: BarSeriesOption = {
        ...barDefaultSeriesOption,
        tooltip: {
            valueFormatter: (value) => `${((value as number) * 100).toFixed(2)}%`
        }
    }

    useEffect(() => {
        const chartResizeObserver = new ResizeObserver(() => {
            cpuInfoEChartsRef.current.forEach((value) => value.resize())
        })

        cpuInfoDivRef.current && chartResizeObserver.observe(cpuInfoDivRef.current)

        return () => {
            cpuInfoDivRef.current && chartResizeObserver.unobserve(cpuInfoDivRef.current)
        }
    }, [cpuInfoDivRef.current])

    useEffect(() => {
        const intervalId = setInterval(getCpuInfo(), parseInt(refreshInterval) * 1000)

        return () => {
            clearInterval(intervalId)
        }
    }, [refreshInterval])

    const getCpuInfo = () => {
        r_sys_statistics_cpu().then((res) => {
            const response = res.data
            if (response.success) {
                const data = response.data
                if (data) {
                    if (isLoading) {
                        setIsLoading(false)
                    }

                    setTimeout(() => {
                        const dataList = data.processors.map((value) =>
                            cpuInfoVoToCpuInfoData(value)
                        )
                        dataList.unshift(cpuInfoVoToCpuInfoData(data))

                        setCpuInfoEChartsOption(
                            dataList.map((value, index) => ({
                                ...barEChartsBaseOption,
                                yAxis: {
                                    ...barEChartsBaseOption.yAxis,
                                    data: [index === 0 ? '总占用' : `CPU ${index - 1}`]
                                },
                                series: value
                            }))
                        )

                        if (percentDivRef.current) {
                            percentDivRef.current.innerHTML = ''
                            dataList.forEach((value) => {
                                const percentElement = document.createElement('div')
                                const idle = value.find((item) => item.name === 'idle')?.data[0]
                                percentElement.innerText =
                                    idle !== undefined
                                        ? `${((1 - idle) * 100).toFixed(2)}%`
                                        : 'Unknown'
                                percentDivRef.current?.appendChild(percentElement)
                            })
                        }

                        if (!cpuInfoEChartsRef.current.length) {
                            keyDivRef.current && (keyDivRef.current.innerHTML = '')
                            cpuInfoDivRef.current && (cpuInfoDivRef.current.innerHTML = '')
                            for (let i = 0; i < dataList.length; i++) {
                                const keyElement = document.createElement('div')
                                keyElement.innerText = i === 0 ? '总占用' : `CPU ${i - 1}`
                                keyDivRef.current?.appendChild(keyElement)

                                const valueElement = document.createElement('div')
                                cpuInfoDivRef.current?.appendChild(valueElement)
                                cpuInfoEChartsRef.current.push(
                                    echarts.init(valueElement, null, { renderer: 'svg' })
                                )
                            }
                        }
                    })
                }
            }
        })

        return getCpuInfo
    }

    const cpuInfoVoToCpuInfoData = (cpuInfoVo: CpuInfoVo) =>
        Object.entries(cpuInfoVo)
            .filter(([key]) => !['total', 'processors'].includes(key))
            .map(([key, value]) => ({
                ...cpuDefaultSeriesOption,
                name: key,
                data: [(value as number) / cpuInfoVo.total]
            }))
            .sort((a, b) => {
                const order = [
                    'steal',
                    'irq',
                    'softirq',
                    'iowait',
                    'system',
                    'nice',
                    'user',
                    'idle'
                ]
                return order.indexOf(a.name) - order.indexOf(b.name)
            })

    useEffect(() => {
        cpuInfoEChartsRef.current?.forEach((value, index) => {
            try {
                value.setOption(cpuInfoEChartsOption[index])
            } catch (e) {
                /* empty */
            }
        })
    }, [cpuInfoEChartsOption])

    return (
        <StatisticsCard
            icon={IconConsoleCpu}
            title={'CPU 信息'}
            loading={isLoading}
            expand={
                <AntdSelect value={refreshInterval} onChange={(value) => setRefreshInterval(value)}>
                    <AntdSelect.Option key={1}>1秒</AntdSelect.Option>
                    <AntdSelect.Option key={2}>2秒</AntdSelect.Option>
                    <AntdSelect.Option key={3}>3秒</AntdSelect.Option>
                    <AntdSelect.Option key={5}>5秒</AntdSelect.Option>
                    <AntdSelect.Option key={10}>10秒</AntdSelect.Option>
                    <AntdSelect.Option key={15}>15秒</AntdSelect.Option>
                    <AntdSelect.Option key={20}>20秒</AntdSelect.Option>
                    <AntdSelect.Option key={30}>30秒</AntdSelect.Option>
                    <AntdSelect.Option key={60}>60秒</AntdSelect.Option>
                    <AntdSelect.Option key={120}>2分</AntdSelect.Option>
                    <AntdSelect.Option key={180}>3分</AntdSelect.Option>
                    <AntdSelect.Option key={300}>5分</AntdSelect.Option>
                    <AntdSelect.Option key={600}>10分</AntdSelect.Option>
                </AntdSelect>
            }
        >
            <FlexBox className={styles.content} direction={'horizontal'}>
                <FlexBox className={styles.key} ref={keyDivRef} />
                <FlexBox className={styles.chartValue} ref={cpuInfoDivRef} />
                <FlexBox className={styles.percentValue} ref={percentDivRef} />
            </FlexBox>
        </StatisticsCard>
    )
}

export default CPUInfo
