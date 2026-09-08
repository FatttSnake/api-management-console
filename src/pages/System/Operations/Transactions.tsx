import Icon from '@ant-design/icons'
import useStyles from '@/assets/css/pages/system/transactions.style'
import { message } from '@/utils/common'
import { utcToLocalTime } from '@/utils/datetime'
import { navigateToApiAccount } from '@/utils/navigation'
import {
    r_sys_api_account_get_one,
    r_sys_api_account_topup,
    r_sys_api_account_transactions
} from '@/services/system'
import Card from '@/components/common/Card'
import FlexBox from '@/components/common/FlexBox'
import FitFullscreen from '@/components/common/FitFullscreen'
import HideScrollbar from '@/components/common/HideScrollbar'
import Permission from '@/components/common/Permission'

const Transactions = () => {
    const navigate = useNavigate()
    const { userId } = useParams()
    const { styles, theme } = useStyles()
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
    const [topupForm] = AntdForm.useForm<ApiTopUpParam>()
    const [isTopupShow, setIsTopupShow] = useState(false)
    const [selectedTopupOption, setSelectedTopupOption] = useState(10)
    const [isSubmitting, setIsSubmitting] = useState(false)

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

    const handleOnTopupBtnClick = () => {
        topupForm.setFieldsValue({ amount: '10', remark: '' })
        setSelectedTopupOption(10)
        setIsTopupShow(true)
    }

    const handleOnTopup = () => {
        topupForm.validateFields().then(
            ({ amount, remark }) => {
                if (isSubmitting) {
                    return
                }
                setIsSubmitting(true)

                r_sys_api_account_topup({ userId: userId!, amount: amount!.toString(), remark })
                    .then((res) => {
                        const response = res.data
                        if (response.success) {
                            void message.success('充值成功')
                            setIsTopupShow(false)
                            getTransactions()
                        } else {
                            void message.error('充值失败，请稍后重试')
                        }
                    })
                    .finally(() => {
                        setIsSubmitting(false)
                    })
            },
            () => {}
        )
    }

    const getAccount = () => {
        r_sys_api_account_get_one(userId!).then((res) => {
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

        r_sys_api_account_transactions({
            currentPage: tableParams.pagination?.current,
            pageSize: tableParams.pagination?.pageSize,
            sortField:
                tableParams.sortField && tableParams.sortOrder
                    ? (tableParams.sortField as string)
                    : undefined,
            sortOrder:
                tableParams.sortField && tableParams.sortOrder ? tableParams.sortOrder : undefined,
            userId,
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

    const toolbar = (
        <Card>
            <FlexBox className={styles.toolbar} direction={'horizontal'}>
                <FlexBox className={styles.title} direction={'horizontal'}>
                    <AntdButton
                        color={'default'}
                        variant={'link'}
                        size={'small'}
                        icon={<Icon component={IconConsoleBack} />}
                        onClick={() => {
                            navigateToApiAccount(navigate)
                        }}
                    />
                    <FlexBox direction={'horizontal'} gap={4}>
                        <div className={styles.avatarBox}>
                            <AntdAvatar
                                src={
                                    <img
                                        src={`data:image/png;base64,${accountData?.userVo.userInfo.avatar}`}
                                        alt={''}
                                    />
                                }
                                style={{
                                    background: theme.colorBgLayout
                                }}
                                className={styles.avatar}
                            />
                        </div>
                        <div className={styles.nickname}>
                            {accountData?.userVo.userInfo.nickname}
                        </div>
                    </FlexBox>
                </FlexBox>

                <AntdSpace>
                    <span>余额：{Number(accountData?.balance).toFixed(4)}</span>
                    <Permission operationCode={['system:operations:account:topup']}>
                        <AntdButton
                            type={'primary'}
                            onClick={handleOnTopupBtnClick}
                            loading={isLoading}
                            size={'small'}
                        >
                            充值
                        </AntdButton>
                    </Permission>
                </AntdSpace>
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
        <>
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
            <AntdModal
                centered
                title={'充值'}
                open={isTopupShow}
                closable={false}
                confirmLoading={isSubmitting}
                cancelButtonProps={{ disabled: isSubmitting }}
                okText={isSubmitting ? '充值中' : '充值'}
                onCancel={() => {
                    if (isSubmitting) {
                        return
                    }
                    setIsTopupShow(false)
                }}
                onOk={handleOnTopup}
            >
                <AntdForm style={{ margin: '40px 0' }} form={topupForm} disabled={isSubmitting}>
                    <AntdForm.Item>
                        <AntdSpace wrap>
                            {[
                                {
                                    label: 10,
                                    value: 10
                                },
                                {
                                    label: 20,
                                    value: 20
                                },
                                {
                                    label: 50,
                                    value: 50
                                },
                                {
                                    label: 100,
                                    value: 100
                                },
                                {
                                    label: 300,
                                    value: 300
                                },
                                {
                                    label: 500,
                                    value: 500
                                },
                                {
                                    label: '自定义',
                                    value: 0
                                }
                            ].map(({ label, value }) => (
                                <AntdButton
                                    type={selectedTopupOption === value ? 'primary' : 'default'}
                                    onClick={() => {
                                        topupForm.setFieldValue('amount', value || null)
                                        setSelectedTopupOption(value)
                                    }}
                                >
                                    {label}
                                </AntdButton>
                            ))}
                        </AntdSpace>
                    </AntdForm.Item>
                    <AntdForm.Item
                        name={'amount'}
                        htmlFor={'amount'}
                        hidden={selectedTopupOption !== 0}
                    >
                        <AntdSpace.Compact block>
                            <AntdSpace.Addon>金额</AntdSpace.Addon>
                            <AntdForm.Item
                                name={'amount'}
                                label={'金额'}
                                noStyle
                                rules={[{ required: true }]}
                            >
                                <AntdInputNumber
                                    style={{ width: '100%' }}
                                    defaultValue={10}
                                    min={1}
                                    step={1}
                                    precision={0}
                                />
                            </AntdForm.Item>
                        </AntdSpace.Compact>
                    </AntdForm.Item>
                    <AntdForm.Item name={'remark'} htmlFor={'remark'}>
                        <AntdSpace.Compact block>
                            <AntdSpace.Addon>备注</AntdSpace.Addon>
                            <AntdForm.Item name={'remark'} label={'备注'} noStyle>
                                <AntdInput.TextArea maxLength={200} />
                            </AntdForm.Item>
                        </AntdSpace.Compact>
                    </AntdForm.Item>
                </AntdForm>
            </AntdModal>
        </>
    )
}

export default Transactions
