import Icon from '@ant-design/icons'
import * as echarts from 'echarts/core'
import useStyles from '@/assets/css/pages/system/statistics/common.style'
import { getTimesBetweenTwoTimes } from '@/utils/datetime'
import { r_sys_statistics_online } from '@/services/system'
import FlexBox from '@/components/common/FlexBox'
import { getTooltipTimeFormatter, lineEChartsBaseOption } from '@/pages/System/Statistics/shared'
import StatisticsCard from '@/components/system/StatisticsCard'

const OnlineInfo = () => {
    const { styles } = useStyles()
    const onlineInfoDivRef = useRef<HTMLDivElement>(null)
    const onlineInfoEChartsRef = useRef<{
        instance: echarts.EChartsType
        dom: HTMLDivElement
    } | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [currentOnlineCount, setCurrentOnlineCount] = useState(-1)
    const [scope, setScope] = useState('WEEK')
    const [onlineInfoEChartsOption, setOnlineInfoEChartsOption] =
        useState<echarts.EChartsCoreOption | null>(null)

    useEffect(() => {
        const div = onlineInfoDivRef.current
        if (!div) {
            return
        }

        if (!onlineInfoEChartsRef.current || onlineInfoEChartsRef.current.dom !== div) {
            onlineInfoEChartsRef.current?.instance.dispose()
            onlineInfoEChartsRef.current = {
                instance: echarts.init(div, null, { renderer: 'svg' }),
                dom: div
            }
        }
        if (onlineInfoEChartsOption) {
            onlineInfoEChartsRef.current.instance.setOption(onlineInfoEChartsOption)
        }
    }, [onlineInfoEChartsOption, isLoading])

    useEffect(() => {
        return () => {
            onlineInfoEChartsRef.current?.instance.dispose()
            onlineInfoEChartsRef.current = null
        }
    }, [])

    useEffect(() => {
        const chartResizeObserver = new ResizeObserver(() => {
            onlineInfoEChartsRef.current?.instance.resize()
        })

        onlineInfoDivRef.current && chartResizeObserver.observe(onlineInfoDivRef.current)

        return () => {
            onlineInfoDivRef.current && chartResizeObserver.unobserve(onlineInfoDivRef.current)
        }
    }, [isLoading])

    useEffect(() => {
        getOnlineInfo()
    }, [])

    const handleOnScopeChange = (value: string) => {
        setScope(value)
        getOnlineInfo(value)
    }

    const handleOnRefresh = () => {
        getOnlineInfo()
    }

    const getOnlineInfo = (_scope: string = scope) => {
        if (isLoading) {
            return
        }

        setIsLoading(true)
        setCurrentOnlineCount(-1)

        r_sys_statistics_online({ scope: _scope })
            .then((res) => {
                const response = res.data
                if (!response.success) {
                    return
                }
                const data = response.data
                if (!data) {
                    return
                }

                const chunkSize = 20
                const timeList = getTimesBetweenTwoTimes(
                    data.history[0].time,
                    data.history[data.history.length - 1].time,
                    _scope === 'DAY' || _scope === 'WEEK'
                        ? 'minute'
                        : _scope === 'MONTH'
                          ? 'hour'
                          : 'day'
                )
                const processChunk = (
                    chunk: string[],
                    history: { time: string; record: string }[]
                ) => {
                    const lengthMap: Record<string, number> = {
                        DAY: 16,
                        WEEK: 16,
                        MONTH: 13,
                        default: 10
                    }
                    const substrLength = lengthMap[_scope] || lengthMap.default

                    return chunk.map((time) => {
                        const timePrefix = time.substring(0, substrLength)
                        const records: number[] = []

                        history.forEach(({ time, record }) => {
                            if (time.substring(0, substrLength) === timePrefix) {
                                records.push(Number(record))
                            }
                        })

                        return [timePrefix, records.length ? Math.max(...records) : 0]
                    })
                }
                const processDataAsync = async () => {
                    const result: (string | number)[][] = []

                    for (let i = 0; i < timeList.length; i += chunkSize) {
                        const chunk = timeList.slice(i, i + chunkSize)
                        result.push(...processChunk(chunk, data.history))

                        await new Promise((resolve) => setTimeout(resolve))
                    }

                    return result
                }

                return processDataAsync().then((dataList) => {
                    setCurrentOnlineCount(data.current)
                    setOnlineInfoEChartsOption({
                        ...lineEChartsBaseOption,
                        tooltip: {
                            ...lineEChartsBaseOption.tooltip,
                            formatter: getTooltipTimeFormatter(
                                _scope === 'DAY'
                                    ? 'YYYY-MM-DD HH:mm'
                                    : _scope === 'WEEK'
                                      ? 'YYYY-MM-DD HH:mm'
                                      : _scope === 'MONTH'
                                        ? 'YYYY-MM-DD HH时'
                                        : 'YYYY-MM-DD'
                            )
                        },
                        xAxis: {
                            ...lineEChartsBaseOption.xAxis
                        },
                        series: [
                            {
                                name: '在线人数',
                                type: 'line',
                                smooth: true,
                                symbol: 'none',
                                areaStyle: {},
                                data: dataList
                            }
                        ]
                    })
                })
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    return (
        <StatisticsCard
            icon={IconConsoleOnline}
            title={
                <FlexBox gap={10} direction={'horizontal'}>
                    <span style={{ whiteSpace: 'nowrap' }}>在线用户</span>
                    <AntdTag>
                        {currentOnlineCount === -1 ? '获取中...' : `当前 ${currentOnlineCount}`}
                    </AntdTag>
                </FlexBox>
            }
            loading={isLoading}
            expand={
                <>
                    <AntdSelect
                        value={scope}
                        onChange={handleOnScopeChange}
                        disabled={isLoading}
                        style={{ width: '8em' }}
                    >
                        <AntdSelect.Option key={'DAY'}>最近24小时</AntdSelect.Option>
                        <AntdSelect.Option key={'WEEK'}>最近7天</AntdSelect.Option>
                        <AntdSelect.Option key={'MONTH'}>最近30天</AntdSelect.Option>
                        <AntdSelect.Option key={'QUARTER'}>最近3月</AntdSelect.Option>
                        <AntdSelect.Option key={'YEAR'}>最近12月</AntdSelect.Option>
                        <AntdSelect.Option key={'TWO_YEARS'}>最近2年</AntdSelect.Option>
                        <AntdSelect.Option key={'THREE_YEARS'}>最近3年</AntdSelect.Option>
                        <AntdSelect.Option key={'FIVE_YEARS'}>最近5年</AntdSelect.Option>
                        <AntdSelect.Option key={'ALL'}>全部</AntdSelect.Option>
                    </AntdSelect>
                    <AntdButton title={'刷新'} onClick={handleOnRefresh} disabled={isLoading}>
                        <Icon component={IconConsoleRefresh} />
                    </AntdButton>
                </>
            }
        >
            <FlexBox className={styles.content} direction={'horizontal'}>
                <div className={styles.bigChart} ref={onlineInfoDivRef} />
            </FlexBox>
        </StatisticsCard>
    )
}

export default OnlineInfo
