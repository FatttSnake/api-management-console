import dayjs from 'dayjs'
import Icon from '@ant-design/icons'
import { useTheme } from 'antd-style'
import { DATABASE_SELECT_SUCCESS } from '@/constants/common.constants'
import { message } from '@/utils/common'
import { dayjsToUtc, utcToLocalTime } from '@/utils/datetime'
import { r_sys_api_audit_get } from '@/services/system'
import FitFullscreen from '@/components/common/FitFullscreen'
import Card from '@/components/common/Card'
import HideScrollbar from '@/components/common/HideScrollbar'
import FlexBox from '@/components/common/FlexBox'

const EVENT_LIST: { text: string; value: EventLogEvent; color: string }[] = [
    { text: '创建 Key', value: 'KEY_CREATE', color: 'green' },
    { text: '编辑 Key', value: 'KEY_UPDATE', color: 'blue' },
    { text: '删除 Key', value: 'KEY_DELETE', color: 'red' },
    { text: '启停 Key', value: 'KEY_STATUS', color: 'orange' },
    { text: '重新生成', value: 'KEY_REGENERATE', color: 'purple' },
    { text: '余额充值', value: 'KEY_TOPUP', color: 'cyan' }
]

const EVENT_META: Record<string, { text: string; color: string }> = EVENT_LIST.reduce(
    (pre, item) => {
        pre[item.value] = { text: item.text, color: item.color }
        return pre
    },
    {} as Record<string, { text: string; color: string }>
)

const Audit = () => {
    const theme = useTheme()
    const [auditData, setAuditData] = useState<ApiAuditVo[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [tableParams, setTableParams] = useState<TableParam>({
        pagination: {
            current: 1,
            pageSize: 20,
            position: ['bottomCenter'],
            showTotal: (total, range) =>
                `第 ${
                    range[0] === range[1] ? `${range[0]}` : `${range[0]}~${range[1]}`
                } 项 共 ${total} 项`
        }
    })
    const [event, setEvent] = useState<EventLogEvent>()
    const [timeRange, setTimeRange] = useState<[string, string]>()

    const dataColumns: _ColumnsType<ApiAuditVo> = [
        {
            title: '事件',
            dataIndex: 'event',
            align: 'center',
            width: 130,
            render: (value) => {
                const meta = EVENT_META[value]
                return meta ? (
                    <AntdTag color={meta.color}>{meta.text}</AntdTag>
                ) : (
                    <AntdTag>{value}</AntdTag>
                )
            }
        },
        {
            title: '操作人',
            dataIndex: 'operateUserId',
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
            title: '对象',
            align: 'center',
            ellipsis: true,
            render: (_, record) => {
                if (record.keyVo) {
                    return (
                        <AntdSpace>
                            <Icon component={IconConsoleKey} />
                            {record.keyVo.name ? (
                                <span title={record.keyVo.accessKey}>{record.keyVo.name}</span>
                            ) : (
                                record.keyVo.accessKey || record.keyVo.id || '-'
                            )}
                        </AntdSpace>
                    )
                }
                if (record.targetUserVo) {
                    return record.targetUserVo?.username ? (
                        <AntdSpace title={record.targetUserVo?.username}>
                            <AntdAvatar
                                src={
                                    <AntdImage
                                        preview={{ mask: <Icon component={IconConsoleEye} /> }}
                                        src={`data:image/png;base64,${record.targetUserVo.userInfo.avatar}`}
                                        alt={''}
                                    />
                                }
                                style={{ background: theme.colorBgLayout }}
                            />
                            {record.targetUserVo.userInfo.nickname}
                        </AntdSpace>
                    ) : (
                        record.targetUserVo.id || '-'
                    )
                }
                return '-'
            }
        },
        {
            title: '操作时间',
            dataIndex: 'operateTime',
            align: 'center',
            sorter: true,
            ellipsis: true,
            render: (value) => utcToLocalTime(value)
        },
        {
            title: '详情',
            dataIndex: 'detail',
            ellipsis: true,
            render: (value) => value || '-'
        }
    ]

    const handleOnTableChange = (
        pagination: _TablePaginationConfig,
        filters: Record<string, _FilterValue | null>,
        sorter: _SorterResult<ApiAuditVo> | _SorterResult<ApiAuditVo>[]
    ) => {
        pagination = { ...tableParams.pagination, ...pagination }
        if (Array.isArray(sorter)) {
            setTableParams({
                pagination,
                filters,
                sortField: sorter.map((value) => value.field).join(',')
            })
        } else {
            setTableParams({
                pagination,
                filters,
                sortField: sorter.field,
                sortOrder: sorter.order
            })
        }

        if (pagination.pageSize !== tableParams.pagination?.pageSize) {
            setAuditData([])
        }
    }

    const handleOnEventChange = (value: EventLogEvent) => {
        setEvent(value)
    }

    const handleOnDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
        if (dates && dates[0] && dates[1]) {
            setTimeRange([dayjsToUtc(dates[0]), dayjsToUtc(dates[1])])
        } else {
            setTimeRange(undefined)
        }
    }

    const handleOnQueryBtnClick = () => {
        getAudit()
    }

    const getAudit = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)

        r_sys_api_audit_get({
            currentPage: tableParams.pagination?.current,
            pageSize: tableParams.pagination?.pageSize,
            sortField:
                tableParams.sortField && tableParams.sortOrder
                    ? (tableParams.sortField as string)
                    : undefined,
            sortOrder:
                tableParams.sortField && tableParams.sortOrder ? tableParams.sortOrder : undefined,
            event: event ? event : undefined,
            startTime: timeRange && timeRange[0],
            endTime: timeRange && timeRange[1]
        })
            .then((res) => {
                const response = res.data
                if (response.code === DATABASE_SELECT_SUCCESS) {
                    const records = response.data!.records
                    setAuditData(records)
                    setTableParams({
                        ...tableParams,
                        pagination: {
                            ...tableParams.pagination,
                            total: response.data!.total
                        }
                    })
                } else {
                    void message.error('获取审计数据失败，请稍后重试')
                }
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    useEffect(() => {
        getAudit()
    }, [
        JSON.stringify(tableParams.filters),
        JSON.stringify(tableParams.sortField),
        JSON.stringify(tableParams.sortOrder),
        JSON.stringify(tableParams.pagination?.pageSize),
        JSON.stringify(tableParams.pagination?.current)
    ])

    const toolbar = (
        <FlexBox direction={'horizontal'} gap={10}>
            <Card style={{ overflow: 'inherit' }}>
                <AntdSpace.Compact block>
                    <AntdSpace.Addon>事件类型</AntdSpace.Addon>
                    <AntdSelect
                        allowClear
                        value={event}
                        onChange={handleOnEventChange}
                        placeholder={'请选择事件类型'}
                        style={{ width: '100%' }}
                        options={EVENT_LIST.map((item) => ({
                            label: item.text,
                            value: item.value
                        }))}
                    />
                </AntdSpace.Compact>
            </Card>
            <Card style={{ overflow: 'inherit', flex: '0 0 auto' }}>
                <AntdDatePicker.RangePicker
                    showTime
                    allowClear
                    onChange={handleOnDateRangeChange}
                />
            </Card>
            <Card style={{ overflow: 'inherit', flex: '0 0 auto' }}>
                <AntdButton onClick={handleOnQueryBtnClick} type={'primary'} loading={isLoading}>
                    查询
                </AntdButton>
            </Card>
        </FlexBox>
    )

    const table = (
        <Card>
            <AntdTable
                rowKey={(record) => record.id}
                columns={dataColumns}
                dataSource={auditData}
                pagination={tableParams.pagination}
                loading={isLoading}
                onChange={handleOnTableChange}
                scroll={{ x: 'max-content' }}
            />
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
                    {table}
                </FlexBox>
            </HideScrollbar>
        </FitFullscreen>
    )
}

export default Audit
