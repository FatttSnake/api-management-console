import Icon from '@ant-design/icons'
import { useTheme } from 'antd-style'
import { DATABASE_SELECT_SUCCESS } from '@/constants/common.constants'
import { message } from '@/utils/common'
import { utcToLocalTime } from '@/utils/datetime'
import { navigateToTransactions } from '@/utils/navigation'
import { r_sys_api_account_get } from '@/services/system'
import Card from '@/components/common/Card'
import FitFullscreen from '@/components/common/FitFullscreen'
import HideScrollbar from '@/components/common/HideScrollbar'
import FlexBox from '@/components/common/FlexBox'
import { hasPermission } from '@/utils/auth.ts'

const Account = () => {
    const navigate = useNavigate()
    const theme = useTheme()
    const [accountData, setAccountData] = useState<ApiAccountVo[]>([])
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

    const dataColumns: _ColumnsType<ApiAccountVo> = [
        {
            dataIndex: ['userVo', 'username'],
            title: '用户名'
        },
        {
            dataIndex: ['userVo', 'userInfo', 'avatar'],
            title: '头像',
            render: (value) => (
                <AntdAvatar
                    src={
                        <AntdImage
                            preview={{ mask: <Icon component={IconConsoleEye} /> }}
                            src={`data:image/png;base64,${value}`}
                            alt={''}
                        />
                    }
                    style={{ background: theme.colorBgLayout }}
                />
            ),
            width: '0',
            align: 'center'
        },
        {
            dataIndex: ['userVo', 'userInfo', 'nickname'],
            title: '昵称'
        },
        {
            dataIndex: ['balance'],
            title: '余额',
            align: 'center',
            ellipsis: true,
            render: (value: string) => Number(value).toFixed(4)
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            align: 'center',
            ellipsis: true,
            render: (value: string) => utcToLocalTime(value)
        },
        {
            title: '修改时间',
            dataIndex: 'updateTime',
            align: 'center',
            ellipsis: true,
            render: (value: string) => utcToLocalTime(value)
        },
        {
            title: '状态',
            dataIndex: 'enable',
            align: 'center',
            ellipsis: true,
            render: (value) =>
                value ? <AntdTag color={'success'}>启用</AntdTag> : <AntdTag>禁用</AntdTag>
        }
    ]

    const handleOnTableChange = (
        pagination: _TablePaginationConfig,
        filters: Record<string, _FilterValue | null>,
        sorter: _SorterResult<ApiAccountVo> | _SorterResult<ApiAccountVo>[]
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
            setAccountData([])
        }
    }

    const getAccount = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)

        r_sys_api_account_get({
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
                if (response.code === DATABASE_SELECT_SUCCESS) {
                    const records = response.data!.records
                    setAccountData(records)
                    setTableParams({
                        ...tableParams,
                        pagination: {
                            ...tableParams.pagination,
                            total: response.data!.total
                        }
                    })
                } else {
                    void message.error('获取失败，请稍后重试')
                }
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    useEffect(() => {
        getAccount()
    }, [
        JSON.stringify(tableParams.filters),
        JSON.stringify(tableParams.sortField),
        JSON.stringify(tableParams.sortOrder),
        JSON.stringify(tableParams.pagination?.pageSize),
        JSON.stringify(tableParams.pagination?.current)
    ])

    const toolbar = <></>

    const table = (
        <Card>
            <AntdTable
                rowKey={(record) => record.id}
                columns={dataColumns}
                dataSource={accountData}
                pagination={tableParams.pagination}
                loading={isLoading}
                scroll={{ x: true }}
                onChange={handleOnTableChange}
                onRow={(record) =>
                    hasPermission('system:operations:account:transactions')
                        ? {
                              style: { cursor: 'pointer' },
                              onClick: () => navigateToTransactions(navigate, record.userId)
                          }
                        : {}
                }
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

export default Account
