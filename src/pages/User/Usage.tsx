import { message } from '@/utils/common'
import { utcToLocalTime } from '@/utils/datetime'
import { r_user_api_key_usage_get } from '@/services/user'
import FitFullscreen from '@/components/common/FitFullscreen'
import HideScrollbar from '@/components/common/HideScrollbar'
import FlexBox from '@/components/common/FlexBox'
import Card from '@/components/common/Card'

const Usage = () => {
    const [usageData, setUsageData] = useState<ApiUsageVo[]>()
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

    const dataColumns: _ColumnsType<ApiUsageVo> = [
        {
            title: '接口名称',
            dataIndex: 'apiName',
            ellipsis: true
        },
        {
            title: '接口描述',
            dataIndex: 'apiDescription',
            ellipsis: true
        },
        {
            title: '请求路径',
            dataIndex: 'requestPath',
            ellipsis: true
        },
        {
            title: '请求方式',
            dataIndex: 'requestMethod',
            align: 'center',
            ellipsis: true,
            render: (value) => <AntdTag>{value}</AntdTag>
        },
        {
            title: '响应码',
            dataIndex: 'responseCode',
            ellipsis: true
        },
        {
            title: '结果',
            dataIndex: 'success',
            align: 'center',
            render: (value) =>
                value ? (
                    <AntdTag color={'success'}>成功</AntdTag>
                ) : (
                    <AntdTag color={'error'}>失败</AntdTag>
                )
        },
        {
            title: '执行耗时',
            dataIndex: 'executeTime',
            align: 'center',
            ellipsis: true,
            render: (value) => `${value}ms`
        },
        {
            title: '请求 IP',
            dataIndex: 'requestIp',
            align: 'center',
            ellipsis: true
        },
        {
            title: '计费金额',
            dataIndex: 'cost',
            ellipsis: true,
            render: (value) => <AntdTag>{Number(value).toFixed(4)}</AntdTag>
        },
        {
            title: '计费模式',
            dataIndex: 'billingMode',
            align: 'center',
            ellipsis: true,
            render: (value) => (
                <AntdTag>
                    {value === 'SUCCESS_ONLY' ? '仅成功' : value === 'ALWAYS' ? '总是' : '免费'}
                </AntdTag>
            )
        },
        {
            title: '调用时间',
            dataIndex: 'createTime',
            align: 'center',
            ellipsis: true,
            render: (value: string) => utcToLocalTime(value, 'YYYY-MM-DD HH:mm:ss')
        }
    ]

    const handleOnTableChange = (
        pagination: _TablePaginationConfig,
        filters: Record<string, _FilterValue | null>,
        sorter: _SorterResult<ApiUsageVo> | _SorterResult<ApiUsageVo>[]
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
            setUsageData([])
        }
    }

    const getUsage = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)

        r_user_api_key_usage_get({
            currentPage: tableParams.pagination?.current,
            pageSize: tableParams.pagination?.pageSize,
            sortField:
                tableParams.sortField && tableParams.sortOrder
                    ? (tableParams.sortField as string)
                    : undefined,
            sortOrder:
                tableParams.sortField && tableParams.sortOrder ? tableParams.sortOrder : undefined,
            ...tableParams.filters
        })
            .then((res) => {
                const response = res.data
                if (response.success) {
                    const records = response.data!.records
                    setUsageData(records)
                    setTableParams({
                        ...tableParams,
                        pagination: {
                            ...tableParams.pagination,
                            total: response.data!.total
                        }
                    })
                } else {
                    void message.error('获取用量信息失败，请稍后重试')
                }
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    useEffect(() => {
        getUsage()
    }, [
        JSON.stringify(tableParams.filters),
        JSON.stringify(tableParams.sortField),
        JSON.stringify(tableParams.sortOrder),
        JSON.stringify(tableParams.pagination?.pageSize),
        JSON.stringify(tableParams.pagination?.current)
    ])

    const title = (
        <AntdTypography>
            <AntdTypography.Title level={3}>用量信息</AntdTypography.Title>
        </AntdTypography>
    )

    const table = (
        <Card>
            <AntdTable
                rowKey={(record) => record.id}
                columns={dataColumns}
                dataSource={usageData}
                pagination={tableParams.pagination}
                loading={isLoading}
                scroll={{ x: true }}
                onChange={handleOnTableChange}
            />
        </Card>
    )

    return (
        <FitFullscreen>
            <HideScrollbar
                isShowVerticalScrollbar
                autoHideWaitingTime={1000}
                style={{ padding: '32px 40px' }}
            >
                <FlexBox gap={20}>
                    {title}
                    {table}
                </FlexBox>
            </HideScrollbar>
        </FitFullscreen>
    )
}

export default Usage
