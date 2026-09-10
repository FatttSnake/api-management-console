import dayjs from 'dayjs'
import * as echarts from 'echarts/core'
import useStyles from '@/assets/css/pages/system/report.style'
import {
    DATABASE_SELECT_SUCCESS,
    SYSTEM_EXPORT_TOO_MANY_RECORDS
} from '@/constants/common.constants'
import { message } from '@/utils/common'
import {
    dayjsToUtc,
    getNowLocalTime,
    getTimeZoneOffsetMinutes,
    getTimesBetweenTwoTimes
} from '@/utils/datetime'
import {
    r_sys_api_report_cost,
    r_sys_api_report_download,
    r_sys_api_report_export,
    r_sys_api_report_export_detail,
    r_sys_api_report_top,
    r_sys_api_report_usage
} from '@/services/system'
import {
    calcDayOverDay,
    DayOverDay,
    formatDayOverDay,
    formatDiff,
    formatRatio,
    trendLineOption
} from '@/pages/System/Operations/shared'
import Card from '@/components/common/Card'
import FitFullscreen from '@/components/common/FitFullscreen'
import HideScrollbar from '@/components/common/HideScrollbar'
import FlexBox from '@/components/common/FlexBox'
import Icon from '@ant-design/icons'

type UsageMetric = 'count' | 'cost'

interface DailyRow {
    date: string
    count: number
    cost: number
    countDayOverDay: DayOverDay
    costDayOverDay: DayOverDay
}

const METRIC_DIGIT: Record<UsageMetric, number> = { count: 0, cost: 4 }

const buildDateAxis = (start: string, end: string) => {
    const startOfDay = dayjsToUtc(dayjs(start).startOf('day'))
    const endOfDay = dayjsToUtc(dayjs(end).startOf('day'))

    return getTimesBetweenTwoTimes(startOfDay, endOfDay, 'day').map((time) =>
        dayjs(time).format('YYYY-MM-DD')
    )
}

const buildDailyRows = (rows: ApiReportVo[]): DailyRow[] => {
    const totalMap = new Map<string, { count: number; cost: number }>()
    rows.forEach((row) => {
        if (!row.date) {
            return
        }
        const date = dayjs(row.date).format('YYYY-MM-DD')
        const item = totalMap.get(date) ?? { count: 0, cost: 0 }
        item.count += row.count ?? 0
        item.cost += Number(row.cost ?? 0)
        totalMap.set(date, item)
    })

    const dates = [...totalMap.keys()].sort()
    const axis = dates.length ? buildDateAxis(dates[0], dates[dates.length - 1]) : []

    const result: DailyRow[] = []
    axis.forEach((date) => {
        const previous = result[result.length - 1]
        const item = totalMap.get(date) ?? { count: 0, cost: 0 }

        result.push({
            date,
            ...item,
            countDayOverDay: calcDayOverDay(item.count, previous?.count),
            costDayOverDay: calcDayOverDay(item.cost, previous?.cost)
        })
    })

    return result
}

const buildUsageOption = (rows: DailyRow[], metric: UsageMetric): echarts.EChartsCoreOption => {
    return trendLineOption(
        rows.map((row) => row.date),
        rows.map((row) => (metric === 'cost' ? row.cost : row.count)),
        metric === 'cost' ? '费用' : '调用次数',
        METRIC_DIGIT[metric]
    )
}

const saveBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
}

const Report = () => {
    const { styles, theme } = useStyles()
    const [usageMetric, setUsageMetric] = useState<UsageMetric>('count')
    const [timeRange, setTimeRange] = useState<[string, string] | undefined>([
        dayjsToUtc(dayjs().subtract(29, 'day')),
        dayjsToUtc(dayjs())
    ])
    const [topLimit, setTopLimit] = useState(10)
    const [usageData, setUsageData] = useState<ApiReportVo[]>([])
    const [costData, setCostData] = useState<ApiReportVo[]>([])
    const [topData, setTopData] = useState<ApiTopVo[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const usageChartDivRef = useRef<HTMLDivElement>(null)
    const usageEChartsRef = useRef<{
        instance: echarts.EChartsType
        dom: HTMLDivElement
    } | null>(null)

    const dailyRows = useMemo(() => buildDailyRows(usageData), [usageData])
    const usageChartOption = useMemo(
        () => buildUsageOption(dailyRows, usageMetric),
        [dailyRows, usageMetric]
    )

    const isCostMetric = usageMetric === 'cost'
    const metricDigit = METRIC_DIGIT[usageMetric]
    const trendColor = (diff: number | null) =>
        diff === null || diff === 0
            ? undefined
            : diff > 0
              ? theme.colorErrorText
              : theme.colorSuccessText
    const latestRow = dailyRows[dailyRows.length - 1]
    const latestDayOverDay = latestRow
        ? isCostMetric
            ? latestRow.costDayOverDay
            : latestRow.countDayOverDay
        : undefined

    useEffect(() => {
        const div = usageChartDivRef.current
        if (!div) {
            return
        }

        if (!usageEChartsRef.current || usageEChartsRef.current.dom !== div) {
            usageEChartsRef.current?.instance.dispose()
            usageEChartsRef.current = {
                instance: echarts.init(div, null, { renderer: 'svg' }),
                dom: div
            }
        }
        usageEChartsRef.current.instance.setOption(usageChartOption)
    }, [usageChartOption, isLoading])

    useEffect(() => {
        return () => {
            usageEChartsRef.current?.instance.dispose()
            usageEChartsRef.current = null
        }
    }, [])

    useEffect(() => {
        const chartResizeObserver = new ResizeObserver(() => {
            usageEChartsRef.current?.instance.resize()
        })

        usageChartDivRef.current && chartResizeObserver.observe(usageChartDivRef.current)

        return () => {
            usageChartDivRef.current && chartResizeObserver.unobserve(usageChartDivRef.current)
        }
    }, [isLoading])

    const costColumns: _ColumnsType<ApiReportVo> = [
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
            title: 'Key',
            align: 'center',
            ellipsis: true,
            render: (_, record) =>
                record.keyVo ? (
                    <AntdSpace>
                        <Icon component={IconConsoleKey} />
                        {record.keyVo.name ? (
                            <span title={record.keyVo.accessKey}>{record.keyVo.name}</span>
                        ) : (
                            record.keyVo.accessKey || record.keyVo.id || '-'
                        )}
                    </AntdSpace>
                ) : (
                    '-'
                )
        },
        {
            title: '所属用户',
            dataIndex: ['userVo', 'userId'],
            align: 'center',
            ellipsis: true,
            render: (value, record) =>
                record.userVo?.username ? (
                    <AntdSpace title={record.userVo?.username}>
                        <AntdAvatar
                            src={
                                <AntdImage
                                    preview={{ mask: <Icon component={IconConsoleEye} /> }}
                                    src={`data:image/png;base64,${record.userVo.userInfo.avatar}`}
                                    alt={''}
                                />
                            }
                            style={{ background: theme.colorBgLayout }}
                        />
                        {record.userVo.userInfo.nickname}
                    </AntdSpace>
                ) : (
                    value || '-'
                )
        },
        {
            title: '调用次数',
            dataIndex: 'count',
            align: 'center',
            ellipsis: true,
            render: (value) => (value ?? 0).toLocaleString()
        },
        {
            title: '费用',
            dataIndex: 'cost',
            align: 'right',
            ellipsis: true,
            render: (value) => Number(value ?? 0).toFixed(4)
        }
    ]

    const topColumns: _ColumnsType<ApiTopVo> = [
        {
            title: '排名',
            align: 'center',
            ellipsis: true,
            render: (_value, _record, index) => index + 1
        },
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
            title: '调用次数',
            dataIndex: 'count',
            align: 'center',
            ellipsis: true,
            render: (value) => (value ?? 0).toLocaleString()
        },
        {
            title: '费用',
            dataIndex: 'cost',
            align: 'right',
            ellipsis: true,
            render: (value) => Number(value ?? 0).toFixed(4)
        }
    ]

    const dailyColumns: _ColumnsType<(typeof dailyRows)[number]> = [
        {
            title: '日期',
            dataIndex: 'date',
            align: 'center',
            ellipsis: true
        },
        {
            title: '调用次数',
            dataIndex: 'count',
            align: 'center',
            ellipsis: true,
            render: (value) => (value ?? 0).toLocaleString()
        },
        {
            title: '费用',
            dataIndex: 'cost',
            align: 'right',
            ellipsis: true,
            render: (value) => Number(value ?? 0).toFixed(4)
        },
        {
            title: `${isCostMetric ? '费用' : '调用次数'}较前日`,
            align: 'right',
            ellipsis: true,
            render: (_value, record) => {
                const { diff } = isCostMetric ? record.costDayOverDay : record.countDayOverDay
                return (
                    <span style={{ color: trendColor(diff) }}>{formatDiff(diff, metricDigit)}</span>
                )
            }
        },
        {
            title: '较前日涨跌幅',
            align: 'right',
            ellipsis: true,
            render: (_value, record) => {
                const { diff, ratio } = isCostMetric
                    ? record.costDayOverDay
                    : record.countDayOverDay
                return <span style={{ color: trendColor(diff) }}>{formatRatio(ratio)}</span>
            }
        }
    ]

    const handleOnDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
        if (dates && dates[0] && dates[1]) {
            setTimeRange([dayjsToUtc(dates[0]), dayjsToUtc(dates[1])])
        } else {
            setTimeRange(undefined)
        }
    }

    const handleOnUsageMetricChange = (value: string | number) => {
        setUsageMetric(value as UsageMetric)
    }

    const handleOnQueryBtnClick = () => {
        getReport()
    }

    const handleOnTopLimitChange = (value: number) => {
        setTopLimit(value)
        getTop(value)
    }

    const getReport = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)

        const param = {
            startTime: timeRange && timeRange[0],
            endTime: timeRange && timeRange[1],
            tzOffset: getTimeZoneOffsetMinutes()
        }

        Promise.all([
            r_sys_api_report_usage(param),
            r_sys_api_report_cost(param),
            r_sys_api_report_top({ ...param, limit: topLimit })
        ])
            .then((responses) => {
                const usageResponse = responses[0].data
                const costResponse = responses[1].data
                const topResponse = responses[2].data
                if (
                    usageResponse.code !== DATABASE_SELECT_SUCCESS ||
                    costResponse.code !== DATABASE_SELECT_SUCCESS ||
                    topResponse.code !== DATABASE_SELECT_SUCCESS
                ) {
                    void message.error('获取报表数据失败，请稍后重试')
                    return
                }

                const usageRows = usageResponse.data ?? []
                setUsageData(usageRows)
                setCostData(costResponse.data ?? [])
                setTopData(topResponse.data ?? [])
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    const getTop = (limit: number) => {
        if (isLoading) {
            return
        }
        setIsLoading(true)

        r_sys_api_report_top({
            startTime: timeRange && timeRange[0],
            endTime: timeRange && timeRange[1],
            limit,
            tzOffset: getTimeZoneOffsetMinutes()
        })
            .then((res) => {
                const response = res.data
                if (response.code !== DATABASE_SELECT_SUCCESS) {
                    void message.error('获取 Top 列表失败，请稍后重试')
                    return
                }
                setTopData(response.data ?? [])
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    const handleOnExportBtnClick = (detail: boolean) => {
        if (isLoading) {
            return
        }
        setIsLoading(true)

        const exportApi = detail ? r_sys_api_report_export_detail : r_sys_api_report_export

        exportApi({
            startTime: timeRange && timeRange[0],
            endTime: timeRange && timeRange[1],
            tzOffset: getTimeZoneOffsetMinutes()
        })
            .then((res) => {
                const response = res.data
                if (response.code !== DATABASE_SELECT_SUCCESS || !response.data) {
                    void message.error(response.msg || '导出失败，请稍后重试')
                    return
                }

                return r_sys_api_report_download(response.data).then((blob) => {
                    saveBlob(
                        blob,
                        `api-report-${detail ? 'detail' : 'summary'}-${getNowLocalTime(
                            'YYYYMMDD-HHmmss'
                        )}.csv`
                    )
                    void message.success('导出成功')
                })
            })
            .catch((error: _Response<never> | undefined) => {
                void message.error(
                    error?.code === SYSTEM_EXPORT_TOO_MANY_RECORDS
                        ? '导出数据量过大，请缩小时间范围后重试'
                        : '导出失败，请稍后重试'
                )
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    useEffect(() => {
        getReport()
    }, [])

    const usagePanel = (
        <FlexBox gap={20}>
            <Card>
                <FlexBox className={styles.panelHead} direction={'horizontal'} gap={10}>
                    <FlexBox className={styles.panelTitle} direction={'horizontal'} gap={8}>
                        <span className={styles.panelTitleText}>调用趋势</span>
                        {latestRow && latestDayOverDay && (
                            <span
                                className={styles.panelTrend}
                                style={{ color: trendColor(latestDayOverDay.diff) }}
                            >
                                {latestRow.date} 较前日{' '}
                                {formatDayOverDay(latestDayOverDay, metricDigit)}
                            </span>
                        )}
                    </FlexBox>
                    <AntdSegmented
                        value={usageMetric}
                        onChange={handleOnUsageMetricChange}
                        options={[
                            { label: '调用次数', value: 'count' },
                            { label: '费用', value: 'cost' }
                        ]}
                    />
                </FlexBox>
                <div className={styles.chart} ref={usageChartDivRef} />
            </Card>
            <Card>
                <FlexBox className={styles.panelHead} direction={'horizontal'} gap={10}>
                    <FlexBox className={styles.panelTitle} direction={'horizontal'} gap={8}>
                        <span className={styles.panelTitleText}>按日汇总</span>
                    </FlexBox>
                </FlexBox>
                <FlexBox className={styles.panelBody}>
                    <AntdTable
                        rowKey={'date'}
                        columns={dailyColumns}
                        dataSource={dailyRows}
                        pagination={false}
                        loading={isLoading}
                        scroll={{ x: true }}
                    />
                </FlexBox>
            </Card>
        </FlexBox>
    )

    const costPanel = (
        <Card>
            <AntdTable
                rowKey={(record) => `${record.apiKeyId}-${record.apiCode}`}
                columns={costColumns}
                dataSource={costData}
                loading={isLoading}
                scroll={{ x: true }}
            />
        </Card>
    )

    const topPanel = (
        <Card>
            <FlexBox className={styles.panelHead} direction={'horizontal'} gap={10}>
                <FlexBox className={styles.panelTitle} direction={'horizontal'} gap={8}>
                    <span className={styles.panelTitleText}>API 调用排行</span>
                </FlexBox>
                <AntdSelect
                    value={topLimit}
                    onChange={handleOnTopLimitChange}
                    options={[10, 20, 50].map((value) => ({
                        label: `Top ${value}`,
                        value
                    }))}
                />
            </FlexBox>
            <FlexBox className={styles.panelBody}>
                <AntdTable
                    rowKey={'apiCode'}
                    columns={topColumns}
                    dataSource={topData}
                    pagination={false}
                    loading={isLoading}
                    scroll={{ x: 'max-content' }}
                />
            </FlexBox>
        </Card>
    )

    return (
        <FitFullscreen>
            <HideScrollbar
                style={{ padding: 20 }}
                isShowVerticalScrollbar
                autoHideWaitingTime={1000}
            >
                <FlexBox>
                    <AntdTabs
                        items={[
                            {
                                key: 'usage',
                                label: '用量',
                                children: usagePanel
                            },
                            {
                                key: 'cost',
                                label: '费用',
                                children: costPanel
                            },
                            {
                                key: 'top',
                                label: 'Top 排行',
                                children: topPanel
                            }
                        ]}
                        tabBarExtraContent={
                            <AntdSpace>
                                <AntdDatePicker.RangePicker
                                    showTime
                                    allowClear
                                    value={
                                        timeRange
                                            ? [dayjs(timeRange[0]), dayjs(timeRange[1])]
                                            : undefined
                                    }
                                    onChange={handleOnDateRangeChange}
                                />
                                <AntdButton
                                    onClick={handleOnQueryBtnClick}
                                    type={'primary'}
                                    loading={isLoading}
                                >
                                    查询
                                </AntdButton>
                                <AntdButton
                                    onClick={() => handleOnExportBtnClick(false)}
                                    disabled={isLoading}
                                >
                                    导出汇总
                                </AntdButton>
                                <AntdButton
                                    onClick={() => handleOnExportBtnClick(true)}
                                    disabled={isLoading}
                                >
                                    导出明细
                                </AntdButton>
                            </AntdSpace>
                        }
                    />
                </FlexBox>
            </HideScrollbar>
        </FitFullscreen>
    )
}

export default Report
