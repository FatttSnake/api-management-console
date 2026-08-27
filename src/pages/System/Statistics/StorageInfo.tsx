import * as echarts from 'echarts/core'
import { BarSeriesOption } from 'echarts/charts'
import useStyles from '@/assets/css/pages/system/statistics/common.style'
import { formatByteSize } from '@/utils/common'
import { r_sys_statistics_storage } from '@/services/system'
import FlexBox from '@/components/common/FlexBox'
import {
    barDefaultSeriesOption,
    barEChartsBaseOption,
    EChartsOption
} from '@/pages/System/Statistics/shared'
import StatisticsCard from '@/components/system/StatisticsCard'

const StorageInfo = () => {
    const { styles } = useStyles()
    const keyDivRef = useRef<HTMLDivElement>(null)
    const percentDivRef = useRef<HTMLDivElement>(null)
    const storageInfoDivRef = useRef<HTMLDivElement>(null)
    const storageInfoEChartsRef = useRef<echarts.EChartsType[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [refreshInterval, setRefreshInterval] = useState('5')
    const [storageInfoEChartsOption, setStorageInfoEChartsOption] = useState<EChartsOption[]>([])

    const storageDefaultSeriesOption: BarSeriesOption = {
        ...barDefaultSeriesOption,
        tooltip: { valueFormatter: (value) => formatByteSize(value as number) }
    }

    useEffect(() => {
        const chartResizeObserver = new ResizeObserver(() => {
            storageInfoEChartsRef.current.forEach((value) => value.resize())
        })

        storageInfoDivRef.current && chartResizeObserver.observe(storageInfoDivRef.current)

        return () => {
            storageInfoDivRef.current && chartResizeObserver.unobserve(storageInfoDivRef.current)
        }
    }, [storageInfoDivRef.current])

    useEffect(() => {
        const intervalId = setInterval(getStorageInfo(), parseInt(refreshInterval) * 1000)

        return () => {
            clearInterval(intervalId)
        }
    }, [refreshInterval])

    const getStorageInfo = () => {
        r_sys_statistics_storage().then((res) => {
            const response = res.data
            if (response.success) {
                const data = response.data
                if (data) {
                    if (isLoading) {
                        setIsLoading(false)
                    }

                    setTimeout(() => {
                        const eChartsOptions = [
                            storageInfoVoToStorageEChartsOption(
                                '物理内存',
                                data.memoryTotal - data.memoryFree,
                                data.memoryFree
                            ),
                            storageInfoVoToStorageEChartsOption(
                                '虚拟内存',
                                data.virtualMemoryInUse,
                                data.virtualMemoryMax - data.virtualMemoryInUse
                            ),
                            storageInfoVoToStorageEChartsOption(
                                'swap',
                                data.swapUsed,
                                data.swapTotal - data.swapUsed
                            ),
                            storageInfoVoToStorageEChartsOption(
                                'jvm 内存',
                                data.jvmTotal - data.jvmFree,
                                data.jvmFree
                            )
                        ]
                        data.fileStores.forEach((value) =>
                            eChartsOptions.push(
                                storageInfoVoToStorageEChartsOption(
                                    value.mount,
                                    value.total - value.free,
                                    value.free
                                )
                            )
                        )
                        setStorageInfoEChartsOption(eChartsOptions)

                        if (percentDivRef.current && keyDivRef.current) {
                            keyDivRef.current.innerHTML = ''
                            percentDivRef.current.innerHTML = ''
                            eChartsOptions.forEach((value) => {
                                const keyElement = document.createElement('div')
                                const percentElement = document.createElement('div')
                                keyElement.innerText = value.yAxis.data[0]
                                percentElement.innerText = `${(
                                    (value.series[0].data[0] /
                                        (value.series[0].data[0] + value.series[1].data[0])) *
                                    100
                                ).toFixed(2)}%`

                                keyDivRef.current?.appendChild(keyElement)
                                percentDivRef.current?.appendChild(percentElement)
                            })
                        }

                        if (!storageInfoEChartsRef.current.length) {
                            storageInfoDivRef.current && (storageInfoDivRef.current.innerHTML = '')

                            eChartsOptions.forEach(() => {
                                const element = document.createElement('div')
                                storageInfoDivRef.current?.appendChild(element)
                                storageInfoEChartsRef.current.push(
                                    echarts.init(element, null, { renderer: 'svg' })
                                )
                            })
                        }
                    })
                }
            }
        })

        return getStorageInfo
    }

    const storageInfoVoToStorageEChartsOption = (label: string, used: number, free: number) => ({
        ...barEChartsBaseOption,
        xAxis: {
            ...barEChartsBaseOption.xAxis,
            max: used + free
        },
        yAxis: {
            ...barEChartsBaseOption.yAxis,
            data: [label]
        },
        series: [
            {
                ...storageDefaultSeriesOption,
                name: 'used',
                data: [used]
            },
            {
                ...storageDefaultSeriesOption,
                name: 'free',
                data: [free]
            }
        ]
    })

    useEffect(() => {
        storageInfoEChartsRef.current?.forEach((value, index) => {
            try {
                value.setOption(storageInfoEChartsOption[index])
            } catch (e) {
                /* empty */
            }
        })
    }, [storageInfoEChartsOption])

    return (
        <StatisticsCard
            icon={IconConsoleMemory}
            title={'内存信息'}
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
                <FlexBox className={styles.chartValue} ref={storageInfoDivRef} />
                <FlexBox className={styles.percentValue} ref={percentDivRef} />
            </FlexBox>
        </StatisticsCard>
    )
}

export default StorageInfo
