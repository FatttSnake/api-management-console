import Icon from '@ant-design/icons'
import * as echarts from 'echarts/core'
import useStyles from '@/assets/css/pages/system/monitor.style'
import { message } from '@/utils/common'
import { r_sys_api_monitor_dashboard } from '@/services/system'
import { topBarOption } from '@/pages/System/Operations/shared'
import Card from '@/components/common/Card'
import FitFullscreen from '@/components/common/FitFullscreen'
import HideScrollbar from '@/components/common/HideScrollbar'
import FlexBox from '@/components/common/FlexBox'

type TopRange = 'total' | 'today'

const Monitor = () => {
    const { styles } = useStyles()
    const topChartDivRef = useRef<HTMLDivElement>(null)
    const topEChartsRef = useRef<{
        instance: echarts.EChartsType
        dom: HTMLDivElement
    } | null>(null)
    const isEnabledAutoRefreshRef = useRef(true)
    const [monitorData, setMonitorData] = useState<ApiMonitorDashboardVo>()
    const [isLoading, setIsLoading] = useState(false)
    const [isEnabledAutoRefresh, setIsEnabledAutoRefresh] = useState<boolean>(true)
    const [topRange, setTopRange] = useState<TopRange>('today')

    const errorRate =
        monitorData && monitorData.totalToday > 0
            ? (monitorData.errorToday / monitorData.totalToday) * 100
            : 0

    const topList = topRange === 'today' ? monitorData?.todayTopApis : monitorData?.topApis
    const topChartOption = useMemo(() => (topList ? topBarOption(topList) : null), [topList])

    const liveColumns: _ColumnsType<ApiMonitorItemVo> = [
        {
            title: '插件',
            dataIndex: ['pluginVo', 'name'],
            ellipsis: true,
            render: (value, record) => (
                <span title={record.pluginVo?.description}>
                    {`${value}(${record.pluginVo?.pluginId})`}
                </span>
            )
        },
        {
            title: '接口',
            dataIndex: ['interfaceVo', 'name'],
            ellipsis: true,
            render: (value, record) => (
                <span title={record.interfaceVo?.description}>
                    {`${value}(${record.interfaceVo?.method} ${record.interfaceVo?.path})`}
                </span>
            )
        },
        {
            title: 'API 编码',
            dataIndex: 'apiCode',
            align: 'center',
            ellipsis: true,
            render: (value) => <AntdTag>{value}</AntdTag>
        },
        {
            title: '请求次数',
            dataIndex: 'count',
            align: 'center',
            ellipsis: true,
            render: (value) => (value ?? 0).toLocaleString()
        },
        {
            title: '错误次数',
            dataIndex: 'error',
            align: 'center',
            ellipsis: true,
            render: (value) =>
                value > 0 ? <AntdTag color={'error'}>{value}</AntdTag> : (value ?? 0)
        },
        {
            title: '平均耗时',
            dataIndex: 'latencyMs',
            align: 'center',
            ellipsis: true,
            render: (_value, record) =>
                record.count ? `${Math.round(record.latencyMs / record.count)}ms` : '-'
        }
    ]

    const handleOnSwitchAutoRefresh = () => {
        isEnabledAutoRefreshRef.current = !isEnabledAutoRefresh
        setIsEnabledAutoRefresh(!isEnabledAutoRefresh)
    }

    const handleOnTopRangeChange = (value: string | number) => {
        setTopRange(value as TopRange)
    }

    const getMonitor = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)

        r_sys_api_monitor_dashboard()
            .then((res) => {
                const response = res.data
                if (response.success) {
                    const data = response.data
                    setMonitorData(data!)
                } else {
                    void message.error('获取监控数据失败，请稍后重试')
                }
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    useEffect(() => {
        const div = topChartDivRef.current
        if (!div) {
            return
        }

        if (!topEChartsRef.current || topEChartsRef.current.dom !== div) {
            topEChartsRef.current?.instance.dispose()
            topEChartsRef.current = {
                instance: echarts.init(div, null, { renderer: 'svg' }),
                dom: div
            }
        }
        if (topChartOption) {
            topEChartsRef.current.instance.setOption(topChartOption)
        }
    }, [topChartOption, isLoading])

    useEffect(() => {
        const chartResizeObserver = new ResizeObserver(() => {
            topEChartsRef.current?.instance.resize()
        })

        topChartDivRef.current && chartResizeObserver.observe(topChartDivRef.current)

        return () => {
            topChartDivRef.current && chartResizeObserver.unobserve(topChartDivRef.current)
        }
    }, [isLoading])

    useEffect(() => {
        getMonitor()

        const interval = setInterval(() => {
            if (!isEnabledAutoRefreshRef.current) {
                return
            }

            getMonitor()
        }, 5000)

        return () => {
            clearInterval(interval)
            topEChartsRef.current?.instance.dispose()
            topEChartsRef.current = null
        }
    }, [])

    const toolbar = (
        <Card>
            <FlexBox className={styles.toolbar} direction={'horizontal'}>
                <FlexBox className={styles.toolbarTitle} direction={'horizontal'} gap={10}>
                    <span className={styles.toolbarTitleText}>监控看板</span>
                    <AntdTag color={errorRate > 0 ? 'warning' : 'success'}>
                        {monitorData ? `今日成功率 ${(100 - errorRate).toFixed(2)}%` : '加载中...'}
                    </AntdTag>
                </FlexBox>
                <AntdButton
                    title={'自动刷新'}
                    type={isEnabledAutoRefresh ? 'primary' : 'dashed'}
                    onClick={handleOnSwitchAutoRefresh}
                >
                    <Icon component={IconConsoleRefresh} />
                </AntdButton>
            </FlexBox>
        </Card>
    )

    const metricCards = (
        <FlexBox direction={'horizontal'} gap={10}>
            <Card>
                <FlexBox className={styles.metric} direction={'vertical'}>
                    <span className={styles.metricTitle}>今日请求总数</span>
                    <span className={styles.metricValue}>
                        {monitorData ? monitorData.totalToday : '-'}
                    </span>
                </FlexBox>
            </Card>
            <Card>
                <FlexBox className={styles.metric} direction={'vertical'}>
                    <span className={styles.metricTitle}>今日错误</span>
                    <span
                        className={
                            monitorData && monitorData.errorToday > 0
                                ? styles.metricValueError
                                : styles.metricValue
                        }
                    >
                        {monitorData ? monitorData.errorToday.toLocaleString() : '-'}
                    </span>
                    <span className={styles.metricDesc}>
                        {monitorData ? `错误率 ${errorRate.toFixed(2)}%` : ''}
                    </span>
                </FlexBox>
            </Card>
            <Card>
                <FlexBox className={styles.metric} direction={'vertical'}>
                    <span className={styles.metricTitle}>当前活跃 Key</span>
                    <span className={styles.metricValue}>
                        {monitorData ? monitorData.activeKeys.toLocaleString() : '-'}
                    </span>
                </FlexBox>
            </Card>
            <Card>
                <FlexBox className={styles.metric} direction={'vertical'}>
                    <span className={styles.metricTitle}>窗口内 API 数</span>
                    <span className={styles.metricValue}>
                        {monitorData ? monitorData.live.length : '-'}
                    </span>
                </FlexBox>
            </Card>
        </FlexBox>
    )

    const livePanel = (
        <Card className={styles.panel}>
            <FlexBox className={styles.panelHead} direction={'horizontal'} gap={10}>
                <FlexBox className={styles.panelTitle} direction={'horizontal'} gap={8}>
                    <span style={{ whiteSpace: 'nowrap' }}>实时指标</span>
                    <AntdTag>当前窗口</AntdTag>
                </FlexBox>
            </FlexBox>
            <AntdTable
                rowKey={(record, index) => `${record.apiCode}-${index}`}
                columns={liveColumns}
                dataSource={monitorData?.live ?? []}
                pagination={false}
                loading={isLoading}
                scroll={{ x: true }}
            />
        </Card>
    )

    const topPanel = (
        <Card className={styles.panel}>
            <FlexBox className={styles.panelHead} direction={'horizontal'} gap={10}>
                <FlexBox className={styles.panelTitle} direction={'horizontal'} gap={8}>
                    <span style={{ whiteSpace: 'nowrap' }}>调用排行 Top</span>
                </FlexBox>
                <AntdSegmented
                    value={topRange}
                    onChange={handleOnTopRangeChange}
                    options={[
                        { label: '今日', value: 'today' },
                        { label: '累计', value: 'total' }
                    ]}
                />
            </FlexBox>
            <div className={styles.chart} ref={topChartDivRef} />
        </Card>
    )

    return (
        <FitFullscreen>
            <HideScrollbar
                style={{ padding: 20 }}
                isShowVerticalScrollbar
                autoHideWaitingTime={1000}
            >
                <FlexBox gap={20}>
                    {toolbar}
                    {metricCards}
                    {livePanel}
                    {topPanel}
                </FlexBox>
            </HideScrollbar>
        </FitFullscreen>
    )
}

export default Monitor
