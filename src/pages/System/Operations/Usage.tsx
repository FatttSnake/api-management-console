import useStyles from '@/assets/css/pages/system/usage.style'
import { utcToLocalTime } from '@/utils/datetime.tsx'
import { message } from '@/utils/common.tsx'
import Card from '@/components/common/Card.tsx'
import FitFullscreen from '@/components/common/FitFullscreen.tsx'
import HideScrollbar from '@/components/common/HideScrollbar.tsx'
import FlexBox from '@/components/common/FlexBox.tsx'
import { r_sys_api_usage_get, r_sys_user_info_get_basic_by_id } from '@/services/system.ts'
import { DATABASE_NO_RECORD_FOUND, DATABASE_SELECT_SUCCESS } from '@/constants/common.constants.ts'
import { navigateToApiKeys, navigateToUserManagement } from '@/utils/navigation.ts'
import Icon from '@ant-design/icons'

const Usage = () => {
    const navigate = useNavigate()
    const { userId } = useParams()
    const { styles, theme } = useStyles()
    const [usageData, setUsageData] = useState<ApiUsageVo[]>([])
    const [userData, setUserData] = useState<UserWithInfoVo>()
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

        r_sys_api_usage_get({
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

    const getUserInfo = () => {
        r_sys_user_info_get_basic_by_id(userId!).then((res) => {
            const response = res.data
            switch (response.code) {
                case DATABASE_SELECT_SUCCESS:
                    setUserData(response.data!)
                    break
                case DATABASE_NO_RECORD_FOUND:
                    message.warning('用户不存在').then(() => {
                        navigateToUserManagement(navigate)
                    })
                    break
                default:
                    void message.error('获取失败请稍后重试')
            }
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

    useEffect(() => {
        getUserInfo()
    }, [])

    const toolbar = (
        <Card>
            <FlexBox className={styles.toolbar} direction={'horizontal'}>
                <FlexBox className={styles.title} direction={'horizontal'} gap={12}>
                    <AntdButton
                        color={'default'}
                        variant={'link'}
                        size={'small'}
                        icon={<Icon component={IconConsoleBack} />}
                        onClick={() => {
                            navigateToApiKeys(navigate, userId!)
                        }}
                    />
                    <FlexBox direction={'horizontal'} gap={4}>
                        <div className={styles.avatarBox}>
                            <AntdAvatar
                                src={
                                    <img
                                        src={`data:image/png;base64,${userData?.userInfo.avatar}`}
                                        alt={''}
                                    />
                                }
                                style={{
                                    background: theme.colorBgLayout
                                }}
                                className={styles.avatar}
                            />
                        </div>
                        <div className={styles.nickname}>{userData?.userInfo.nickname}</div>
                    </FlexBox>
                </FlexBox>
            </FlexBox>
        </Card>
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

export default Usage
