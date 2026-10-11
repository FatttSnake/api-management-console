import { ChangeEvent, KeyboardEvent } from 'react'
import { PrismLight as CodeHighlighter } from 'react-syntax-highlighter'
import { vs, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import useStyles from '@/assets/css/pages/user/apis.style'
import { message } from '@/utils/common'
import { r_user_api_doc_get, r_user_api_doc_get_one } from '@/services/user'
import { AppContext } from '@/App'
import { useConfigValue } from '@/components/config/ConfigContext'
import FitFullscreen from '@/components/common/FitFullscreen'
import HideScrollbar from '@/components/common/HideScrollbar'
import FlexBox from '@/components/common/FlexBox'
import Card from '@/components/common/Card'
import OpenApiDoc from '@/components/plugin/OpenApiDoc'

const BILLING_MODE_LABEL: Record<ApiInterfaceBillingMode, string> = {
    FREE: '免费',
    SUCCESS_ONLY: '仅成功',
    ALWAYS: '总是'
}

const Apis = () => {
    const { styles } = useStyles()
    const { isDarkMode } = useContext(AppContext)
    const navigate = useNavigate()
    const detailCacheRef = useRef<Record<string, ApiDocVo>>({})
    const [apiGroups, setApiGroups] = useState<ApiDocVo[]>([])
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
    const [searchName, setSearchName] = useState('')
    const [isDetailLoading, setIsDetailLoading] = useState(false)
    const [selected, setSelected] = useState<ApiInterfaceVo>()
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const apiUrl = useConfigValue('apiUrl')
    const baseUrl = apiUrl.replace(/\/+$/, '')

    const buildCallExample = (apiPath?: string) =>
        [
            "curl -H \"Authorization: Basic $(printf '%s' 'ACCESS_KEY:SECRET_KEY' | base64)\" \\",
            `  '${baseUrl}${apiPath ?? '<请求路径>'}'`
        ].join('\n')

    const dataColumns: _ColumnsType<ApiDocVo> = [
        {
            title: '插件名称',
            dataIndex: 'name',
            ellipsis: true,
            render: (value, record) => (
                <AntdSpace>
                    {value}
                    <AntdTag>{record.interfaces.length} 个接口</AntdTag>
                </AntdSpace>
            )
        },
        {
            title: '插件描述',
            dataIndex: 'description',
            ellipsis: true
        }
    ]

    const subDataColumns: _ColumnsType<ApiInterfaceVo> = [
        {
            title: '名称',
            dataIndex: 'name',
            ellipsis: true,
            render: (value, record) => (
                <AntdSpace>
                    {value}
                    <AntdTag>v{record.apiVersion}</AntdTag>
                </AntdSpace>
            )
        },
        {
            title: '描述',
            dataIndex: 'description',
            ellipsis: true
        },
        {
            title: '请求方式',
            dataIndex: 'method',
            align: 'center',
            ellipsis: true,
            render: (value) => <AntdTag>{value}</AntdTag>
        },
        {
            title: '请求路径',
            dataIndex: 'path',
            ellipsis: true
        },
        {
            title: '需要 API Key',
            dataIndex: 'needKey',
            align: 'center',
            ellipsis: true,
            render: (value: boolean) => (value ? '是' : '否')
        },
        {
            title: '每分钟限流',
            dataIndex: 'rateLimit',
            align: 'center',
            ellipsis: true,
            render: (value: number) => (value ? `${value} 次` : '不限制')
        },
        {
            title: '单价',
            dataIndex: 'price',
            align: 'center',
            ellipsis: true,
            render: (value) =>
                Number(value) ? (
                    <AntdTag color={'processing'}>{value}</AntdTag>
                ) : (
                    <AntdTag color={'success'}>免费</AntdTag>
                )
        },
        {
            title: '计费模式',
            dataIndex: 'billingMode',
            align: 'center',
            ellipsis: true,
            render: (value: ApiInterfaceBillingMode) => (
                <AntdTag>{BILLING_MODE_LABEL[value]}</AntdTag>
            )
        }
    ]

    const handleOnTableChange = (
        pagination: _TablePaginationConfig,
        filters: Record<string, _FilterValue | null>,
        sorter: _SorterResult<ApiDocVo> | _SorterResult<ApiDocVo>[]
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
            setApiGroups([])
        }
    }

    const handleOnSearchNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchName(e.target.value)
    }

    const handleOnSearchKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            getApis()
        }
    }

    const handleOnQueryBtnClick = () => {
        getApis()
    }

    const expandedRowRender = (record: ApiDocVo) => (
        <AntdTable
            rowKey={(record) => record.id}
            columns={subDataColumns}
            dataSource={record.interfaces}
            pagination={false}
            scroll={{ x: true }}
            onRow={(record) => ({
                style: { cursor: 'pointer' },
                onClick: handleOnShowDetail(record)
            })}
        />
    )

    const handleOnShowDetail = (record: ApiInterfaceVo) => () => {
        setSelected(record)
        setIsDrawerOpen(true)

        if (Object.keys(detailCacheRef.current).includes(record.pluginId)) {
            return
        }
        setIsDetailLoading(true)

        r_user_api_doc_get_one(record.pluginId)
            .then((res) => {
                const response = res.data
                if (response.success) {
                    detailCacheRef.current[record.pluginId] = response.data!
                } else {
                    void message.error('获取接口文档失败，请稍后重试')
                }
            })
            .finally(() => {
                setIsDetailLoading(false)
            })
    }

    const handleOnDrawerClose = () => {
        setIsDrawerOpen(false)
    }

    const getApis = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)

        r_user_api_doc_get({
            currentPage: tableParams.pagination?.current,
            pageSize: tableParams.pagination?.pageSize,
            sortField:
                tableParams.sortField && tableParams.sortOrder
                    ? (tableParams.sortField as string)
                    : undefined,
            sortOrder:
                tableParams.sortField && tableParams.sortOrder ? tableParams.sortOrder : undefined,
            ...tableParams.filters,
            searchName: searchName.length ? searchName : undefined
        })
            .then((res) => {
                const response = res.data
                if (response.success) {
                    setApiGroups(response.data!.records)
                    setTableParams({
                        ...tableParams,
                        pagination: {
                            ...tableParams.pagination,
                            total: response.data!.total
                        }
                    })
                } else {
                    void message.error('获取可用 API 失败，请稍后重试')
                }
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    useEffect(() => {
        getApis()
    }, [
        JSON.stringify(tableParams.filters),
        JSON.stringify(tableParams.sortField),
        JSON.stringify(tableParams.sortOrder),
        JSON.stringify(tableParams.pagination?.pageSize),
        JSON.stringify(tableParams.pagination?.current)
    ])

    const title = (
        <AntdTypography>
            <AntdTypography.Title level={3}>可用 API</AntdTypography.Title>
            <AntdTypography.Paragraph>
                以下是你当前可以调用的接口，展开插件即可查看接口列表与调用方式；
                价格、限流均为最终生效值。
            </AntdTypography.Paragraph>
        </AntdTypography>
    )

    const callout = (
        <AntdCollapse
            items={[
                {
                    key: 'how-to-use',
                    label: '如何调用',
                    children: (
                        <AntdTypography>
                            <AntdTypography.Paragraph>
                                网关地址：
                                <AntdTypography.Text code>{baseUrl}</AntdTypography.Text>
                            </AntdTypography.Paragraph>
                            <AntdTypography.Paragraph>
                                所有 <AntdTypography.Text code>/api/**</AntdTypography.Text>{' '}
                                接口均使用 API Key 做 Basic 认证，请求头为{' '}
                                <AntdTypography.Text code>
                                    Authorization: Basic base64(accessKey:secretKey)
                                </AntdTypography.Text>
                                ；密钥可在{' '}
                                <AntdTypography.Link onClick={() => navigate('/api-keys')}>
                                    API Keys 页面
                                </AntdTypography.Link>{' '}
                                创建。
                            </AntdTypography.Paragraph>
                            <AntdTypography.Paragraph>
                                形如 <AntdTypography.Text code>{'{id}'}</AntdTypography.Text>{' '}
                                的路径参数请在调用时替换为实际值。
                            </AntdTypography.Paragraph>
                            <AntdTypography.Paragraph>
                                示例：
                                <CodeHighlighter
                                    language={'shell'}
                                    style={isDarkMode ? vscDarkPlus : vs}
                                >
                                    {buildCallExample()}
                                </CodeHighlighter>
                            </AntdTypography.Paragraph>
                        </AntdTypography>
                    )
                },
                {
                    key: 'price-desc',
                    label: '计费说明',
                    children: (
                        <FlexBox direction={'vertical'} gap={8}>
                            <AntdSpace>
                                <AntdTag color={'success'}>免&ensp;&ensp;费</AntdTag>
                                调用不产生费用
                            </AntdSpace>
                            <AntdSpace>
                                <AntdTag color={'processing'}>仅成功</AntdTag>
                                仅在接口成功返回时按单价扣费
                            </AntdSpace>
                            <AntdSpace>
                                <AntdTag color={'warning'}>总&ensp;&ensp;是</AntdTag>
                                每次调用都按单价扣费
                            </AntdSpace>
                            <AntdTypography>
                                <AntdTypography.Paragraph>
                                    费用从账户的预付费余额中扣除，余额不足时调用会被拒绝；可在{' '}
                                    <AntdTypography.Link onClick={() => navigate('/billing')}>
                                        账单页面
                                    </AntdTypography.Link>{' '}
                                    查看余额与流水。
                                </AntdTypography.Paragraph>
                            </AntdTypography>
                        </FlexBox>
                    )
                }
            ]}
            accordion
        />
    )

    const toolbar = (
        <FlexBox direction={'horizontal'} gap={10}>
            <Card style={{ overflow: 'inherit' }}>
                <AntdSpace.Compact block>
                    <AntdSpace.Addon>插件名称</AntdSpace.Addon>
                    <AntdInput
                        allowClear
                        value={searchName}
                        onChange={handleOnSearchNameChange}
                        onKeyDown={handleOnSearchKeyDown}
                        placeholder={'请输入搜索内容'}
                    />
                </AntdSpace.Compact>
            </Card>
            <Card style={{ overflow: 'inherit', flex: '0 0 auto' }}>
                <AntdButton onClick={handleOnQueryBtnClick} type={'primary'}>
                    查询
                </AntdButton>
            </Card>
        </FlexBox>
    )

    const table = (
        <Card>
            <AntdTable
                rowKey={(record) => record.pluginId}
                columns={dataColumns}
                dataSource={apiGroups}
                expandable={{ expandedRowRender }}
                pagination={tableParams.pagination}
                loading={isLoading}
                scroll={{ x: true }}
                locale={{
                    emptyText: (
                        <AntdEmpty
                            image={AntdEmpty.PRESENTED_IMAGE_SIMPLE}
                            description={'暂无可用的 API，请联系管理员授权'}
                        />
                    )
                }}
                onChange={handleOnTableChange}
            />
        </Card>
    )

    const drawer = (
        <AntdDrawer
            title={
                <AntdSpace>
                    {selected?.name}
                    <AntdTag>v{selected?.apiVersion}</AntdTag>
                </AntdSpace>
            }
            open={isDrawerOpen}
            loading={isDetailLoading}
            closable={{ placement: 'end' }}
            defaultSize={'large'}
            resizable
            onClose={handleOnDrawerClose}
        >
            {selected && (
                <FlexBox gap={20}>
                    <Card>
                        <AntdDescriptions
                            column={2}
                            bordered
                            items={[
                                {
                                    label: '名称',
                                    children: selected.name,
                                    style: { textWrap: 'nowrap' }
                                },
                                {
                                    label: '版本',
                                    children: `v${selected.apiVersion}`
                                },
                                {
                                    label: '描述',
                                    children: selected.description,
                                    span: 'filled'
                                },
                                {
                                    label: '请求方式',
                                    children: <AntdTag>{selected.method}</AntdTag>
                                },
                                {
                                    label: '请求路径',
                                    children: selected.path
                                },
                                {
                                    label: '需要 API Key',
                                    children: selected.needKey ? '是' : '否'
                                },
                                {
                                    label: '每分钟限流',
                                    children: selected.rateLimit
                                        ? `${selected.rateLimit} 次`
                                        : '不限制'
                                },
                                {
                                    label: '单价',
                                    children: Number(selected.price) ? (
                                        selected.price
                                    ) : (
                                        <AntdTag color={'success'}>免费</AntdTag>
                                    )
                                },
                                {
                                    label: '计费模式',
                                    children: (
                                        <AntdTag>
                                            {BILLING_MODE_LABEL[selected.billingMode]}
                                        </AntdTag>
                                    )
                                }
                            ]}
                        />
                    </Card>
                    <Card className={styles.layout}>
                        调用方式：
                        <CodeHighlighter language={'shell'} style={isDarkMode ? vscDarkPlus : vs}>
                            {buildCallExample(selected.path)}
                        </CodeHighlighter>
                    </Card>
                    <Card className={styles.layout}>
                        <OpenApiDoc
                            key={selected.id}
                            doc={detailCacheRef.current[selected.pluginId]?.openapi}
                            path={selected.path}
                            method={selected.method}
                        />
                    </Card>
                </FlexBox>
            )}
        </AntdDrawer>
    )

    return (
        <FitFullscreen>
            <HideScrollbar
                style={{ padding: '32px 40px' }}
                isShowVerticalScrollbar
                autoHideWaitingTime={1000}
            >
                <FlexBox gap={20}>
                    {title}
                    {toolbar}
                    {table}
                    {callout}
                </FlexBox>
            </HideScrollbar>
            {drawer}
        </FitFullscreen>
    )
}

export default Apis
