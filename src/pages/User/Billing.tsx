import useStyles from '@/assets/css/pages/user/billing.style'
import { message } from '@/utils/common'
import { utcToLocalTime } from '@/utils/datetime'
import { r_user_api_account_get, r_user_api_account_transactions } from '@/services/user'
import FitFullscreen from '@/components/common/FitFullscreen'
import HideScrollbar from '@/components/common/HideScrollbar'
import FlexBox from '@/components/common/FlexBox'
import Card from '@/components/common/Card'
import LoadingMask from '@/components/common/LoadingMask'

const Billing = () => {
    const { styles } = useStyles()
    const [accountData, setAccountData] = useState<ApiAccountVo>()
    const [transactionsData, setTransactionsData] = useState<ApiTransactionVo[]>([])
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

    const dataColumns: _ColumnsType<ApiTransactionVo> = [
        {
            title: '流水类型',
            dataIndex: 'type',
            align: 'center',
            ellipsis: true,
            render: (value) => {
                switch (value) {
                    case 'TOPUP':
                        return '充值'
                    case 'DEDUCT':
                        return '扣费'
                    case 'REFUND':
                        return '退款'
                    default:
                        return '调整'
                }
            }
        },
        {
            title: '金额',
            dataIndex: 'amount',
            align: 'center',
            ellipsis: true
        },
        {
            title: '变更后余额',
            dataIndex: 'balanceAfter',
            align: 'center',
            ellipsis: true
        },
        {
            title: '时间',
            dataIndex: 'createTime',
            align: 'center',
            ellipsis: true,
            render: (value) => utcToLocalTime(value, 'YYYY-MM-DD HH:mm:ss')
        },
        {
            title: '备注',
            dataIndex: 'remark',
            ellipsis: true,
            render: (value, record) =>
                record.type === 'TOTUP' ? `充值订单号：${record.orderNo} ; ${value}` : value
        }
    ]

    const handleOnTableChange = (
        pagination: _TablePaginationConfig,
        filters: Record<string, _FilterValue | null>,
        sorter: _SorterResult<ApiTransactionVo> | _SorterResult<ApiTransactionVo>[]
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
            setTransactionsData([])
        }
    }

    const getAccount = () => {
        r_user_api_account_get().then((res) => {
            const response = res.data
            if (response.success) {
                setAccountData(response.data!)
            } else {
                void message.error('获取账户信息失败，请稍后重试')
            }
        })
    }

    const getTransactions = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)

        r_user_api_account_transactions({
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
                    setTransactionsData(records)
                    setTableParams({
                        ...tableParams,
                        pagination: {
                            ...tableParams.pagination,
                            total: response.data!.total
                        }
                    })
                } else {
                    void message.error('获取流水信息失败，请稍后重试')
                }
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    useEffect(() => {
        getTransactions()
    }, [
        JSON.stringify(tableParams.filters),
        JSON.stringify(tableParams.sortField),
        JSON.stringify(tableParams.sortOrder),
        JSON.stringify(tableParams.pagination?.pageSize),
        JSON.stringify(tableParams.pagination?.current)
    ])

    useEffect(() => {
        getAccount()
    }, [])

    const title = (
        <AntdTypography>
            <AntdTypography.Title level={3}>账单</AntdTypography.Title>
        </AntdTypography>
    )

    const account = (
        <Card>
            <FlexBox className={styles.account} direction={'horizontal'}>
                <LoadingMask hidden={!!accountData}>
                    <span>账户余额</span>
                    <span>{Number(accountData?.balance).toFixed(2)}</span>
                </LoadingMask>
            </FlexBox>
        </Card>
    )

    const table = (
        <Card>
            <AntdTable
                rowKey={(record) => record.id}
                columns={dataColumns}
                dataSource={transactionsData}
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
                className={styles.root}
                isShowVerticalScrollbar
                autoHideWaitingTime={1000}
            >
                <FlexBox gap={20}>
                    {title}
                    {account}
                    {table}
                </FlexBox>
            </HideScrollbar>
        </FitFullscreen>
    )
}

export default Billing
