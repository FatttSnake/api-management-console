import { ChangeEvent, KeyboardEvent, MouseEvent } from 'react'
import Icon from '@ant-design/icons'
import { useTheme } from 'antd-style'
import {
    API_PLATFORM_PLUGIN_INSTALL_FAILED,
    DATABASE_DELETE_SUCCESS,
    DATABASE_INSERT_SUCCESS
} from '@/constants/common.constants.ts'
import { formatBytes, message, modal } from '@/utils/common'
import { utcToLocalTime } from '@/utils/datetime'
import {
    r_sys_api_plugin_module_delete,
    r_sys_api_plugin_module_gc,
    r_sys_api_plugin_module_get,
    r_sys_api_plugin_module_install
} from '@/services/system'
import Card from '@/components/common/Card'
import FitFullscreen from '@/components/common/FitFullscreen'
import FlexBox from '@/components/common/FlexBox'
import HideScrollbar from '@/components/common/HideScrollbar'
import Permission from '@/components/common/Permission'
import PluginModuleFetchModal from '@/components/plugin/PluginModuleFetchModal'
import { usePluginModuleFetch } from '@/hooks/usePluginModuleFetch'

const PluginModule = () => {
    const theme = useTheme()
    const moduleFileInputRef = useRef<HTMLInputElement>(null)
    const fetchFileInputRef = useRef<HTMLInputElement>(null)
    const uploadControllerRef = useRef(new AbortController())
    const [moduleData, setModuleData] = useState<PluginModuleVo[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [tableParams, setTableParams] = useState<TableParam>({
        pagination: {
            current: 1,
            pageSize: 50,
            pageSizeOptions: [50, 100, 200, 500],
            position: ['bottomCenter'],
            showTotal: (total, range) =>
                `第 ${
                    range[0] === range[1] ? `${range[0]}` : `${range[0]}~${range[1]}`
                } 项 共 ${total} 项`
        }
    })
    const [searchGroup, setSearchGroup] = useState('')
    const [searchArtifact, setSearchArtifact] = useState('')
    const [searchSha, setSearchSha] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isFetchModalOpen, setIsFetchModalOpen] = useState(false)
    const {
        task: fetchTask,
        error: fetchError,
        start: startFetch,
        cancel: cancelFetch,
        reset: resetFetch
    } = usePluginModuleFetch()

    const dataColumns: _ColumnsType<PluginModuleVo> = [
        {
            title: '坐标',
            ellipsis: true,
            render: (_, record) => (
                <span style={{ fontFamily: 'monospace' }}>{coordinate(record)}</span>
            )
        },
        {
            title: 'SHA-256',
            dataIndex: 'sha256',
            ellipsis: true,
            render: (value: string) => (
                <AntdTypography.Text
                    style={{ fontFamily: 'monospace' }}
                    ellipsis={{ tooltip: value }}
                    copyable={{ text: value }}
                >
                    {value}
                </AntdTypography.Text>
            )
        },
        {
            title: '大小',
            dataIndex: 'size',
            align: 'center',
            ellipsis: true,
            render: (value: number) => formatBytes(value ?? 0)
        },
        {
            title: '来源',
            dataIndex: 'source',
            ellipsis: true,
            render: (value?: string) => value ?? '—'
        },
        {
            title: '引用',
            dataIndex: 'referenced',
            align: 'center',
            render: (value: boolean, record) =>
                value ? (
                    <AntdTooltip title={referenceNames(record)}>
                        <AntdBadge
                            color={theme.colorPrimary}
                            count={record.referencedBy.length}
                            size={'small'}
                        >
                            <AntdTag color={'success'}>被引用</AntdTag>
                        </AntdBadge>
                    </AntdTooltip>
                ) : (
                    <AntdTag>未引用</AntdTag>
                ),
            filterMultiple: false,
            filters: [
                {
                    text: '已引用',
                    value: true
                },
                {
                    text: '未引用',
                    value: false
                }
            ]
        },
        {
            title: '安装时间',
            dataIndex: 'installTime',
            align: 'center',
            render: (value?: string) => (value ? utcToLocalTime(value) : '—')
        },
        {
            title: '操作',
            dataIndex: 'referenced',
            align: 'center',
            ellipsis: true,
            render: (value: boolean, record) => (
                <Permission operationCode={['system:plugin:plugin:uninstall']}>
                    <AntdTypography.Link onClick={handleOnDeleteBtnClick(record)} disabled={value}>
                        删除
                    </AntdTypography.Link>
                </Permission>
            )
        }
    ]

    const handleOnTableChange = (
        pagination: _TablePaginationConfig,
        filters: Record<string, _FilterValue | null>,
        sorter: _SorterResult<PluginModuleVo> | _SorterResult<PluginModuleVo>[]
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
            setModuleData([])
        }
    }

    const handleOnUploadBtnClick = () => {
        moduleFileInputRef.current?.click()
    }

    const handleOnFetchBtnClick = () => {
        fetchFileInputRef.current?.click()
    }

    const handleOnModuleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) {
            return
        }
        if (!file.name.toLowerCase().endsWith('.jar')) {
            void message.warning('请选择 .jar 后缀的文件')
            e.target.value = ''
            return
        }

        await uploadModule(file)
    }

    const handleOnFetchFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) {
            return
        }
        if (!file.name.toLowerCase().endsWith('.jar')) {
            void message.warning('请选择 .jar 后缀的文件')
            e.target.value = ''
            return
        }

        setIsFetchModalOpen(true)
        setIsUploading(true)
        setUploadProgress(0)
        try {
            const result = await startFetch(file, setUploadProgress)
            if (result?.status === 'SUCCESS') {
                void message.success(
                    result.modules.length
                        ? `依赖获取完成，共 ${result.modules.length} 个模块`
                        : '该插件没有依赖模块'
                )
                getModule()
            }
        } finally {
            setIsUploading(false)
            if (fetchFileInputRef.current) {
                fetchFileInputRef.current.value = ''
            }
        }
    }

    const handleOnCancelUpload = () => {
        uploadControllerRef.current.abort()
        cancelFetch()
        setIsFetchModalOpen(false)
        resetFetch()
    }

    const handleOnFetchModalClose = () => {
        setIsFetchModalOpen(false)
        resetFetch()
    }

    const handleOnDeleteBtnClick = (record: PluginModuleVo) => {
        return (e: MouseEvent) => {
            e.stopPropagation()
            if (record.referenced) {
                void message.warning(`模块仍被 ${referenceNames(record)} 引用，无法删除`)
                return
            }

            void modal
                .confirm({
                    centered: true,
                    mask: { closable: true },
                    title: '确定删除',
                    content: `确定删除模块 ${coordinate(record)} 吗？`,
                    okType: 'danger'
                })
                .then(
                    (confirmed) => {
                        if (!confirmed) {
                            return
                        }
                        r_sys_api_plugin_module_delete(record.sha256)
                            .then((res) => {
                                const response = res.data
                                switch (response.code) {
                                    case DATABASE_DELETE_SUCCESS:
                                        void message.success('删除成功')
                                        getModule()
                                        break
                                    case API_PLATFORM_PLUGIN_INSTALL_FAILED:
                                        void message.error(response.msg)
                                        break
                                    default:
                                        void message.error('删除失败，请稍后重试')
                                }
                            })
                            .catch(() => {
                                void message.error('删除失败，请稍后重试')
                            })
                    },
                    () => {}
                )
        }
    }

    const handleOnGcBtnClick = () => {
        void modal
            .confirm({
                centered: true,
                mask: { closable: true },
                title: '确定回收',
                content: '确定回收所有超过宽限期且未被插件引用的模块吗？'
            })
            .then(
                (confirmed) => {
                    if (!confirmed) {
                        return
                    }
                    r_sys_api_plugin_module_gc()
                        .then((res) => {
                            const response = res.data
                            if (response.success) {
                                void message.success(`已回收 ${response.data ?? 0} 个模块`)
                                getModule()
                            } else {
                                void message.error(response.msg ?? '回收失败，请稍后重试')
                            }
                        })
                        .catch(() => {
                            void message.error('回收失败，请稍后重试')
                        })
                },
                () => {}
            )
    }

    const handleOnSearchKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            getModule()
        }
    }

    const uploadModule = async (file: File) => {
        try {
            setIsUploading(true)
            setUploadProgress(0)

            const res = await r_sys_api_plugin_module_install(
                file,
                setUploadProgress,
                uploadControllerRef.current.signal
            )
            const response = res.data

            switch (response.code) {
                case DATABASE_INSERT_SUCCESS:
                    void message.success('上传成功')
                    getModule()
                    break
                case API_PLATFORM_PLUGIN_INSTALL_FAILED:
                    void message.error(`上传失败：${response.msg}`)
                    break
                default:
                    void message.error('上传失败，请稍后重试')
            }
        } finally {
            uploadControllerRef.current = new AbortController()
            setIsUploading(false)
            if (moduleFileInputRef.current) {
                moduleFileInputRef.current.value = ''
            }
        }
    }

    const getModule = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)

        r_sys_api_plugin_module_get({
            currentPage: tableParams.pagination?.current,
            pageSize: tableParams.pagination?.pageSize,
            sortField:
                tableParams.sortField && tableParams.sortOrder
                    ? (tableParams.sortField as string)
                    : undefined,
            sortOrder:
                tableParams.sortField && tableParams.sortOrder ? tableParams.sortOrder : undefined,
            searchGroup: searchGroup.trim() || undefined,
            searchArtifact: searchArtifact.trim() || undefined,
            searchSha: searchSha.trim() || undefined,
            ...tableParams.filters
        })
            .then((res) => {
                const response = res.data
                if (response.success) {
                    setModuleData(response.data!.records)
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
            .finally(() => setIsLoading(false))
    }

    useEffect(() => {
        getModule()
    }, [
        JSON.stringify(tableParams.filters),
        JSON.stringify(tableParams.sortField),
        JSON.stringify(tableParams.sortOrder),
        JSON.stringify(tableParams.pagination?.pageSize),
        JSON.stringify(tableParams.pagination?.current)
    ])

    const toolbar = (
        <FlexBox direction={'vertical'} gap={10}>
            <FlexBox direction={'horizontal'} gap={10}>
                <input
                    ref={moduleFileInputRef}
                    type={'file'}
                    accept={'.jar'}
                    onChange={handleOnModuleFileChange}
                    style={{ display: 'none' }}
                    disabled={isUploading}
                />
                <input
                    ref={fetchFileInputRef}
                    type={'file'}
                    accept={'.jar'}
                    onChange={handleOnFetchFileChange}
                    style={{ display: 'none' }}
                    disabled={isUploading}
                />
                <Permission operationCode={['system:plugin:plugin:install']}>
                    <Card style={{ overflow: 'inherit', flex: '0 0 auto' }}>
                        <AntdDropdown
                            menu={{
                                items: [
                                    {
                                        key: 'jar',
                                        label: <a onClick={handleOnUploadBtnClick}>上传模块 jar</a>
                                    },
                                    {
                                        key: 'fetch',
                                        label: <a onClick={handleOnFetchBtnClick}>从插件获取依赖</a>
                                    }
                                ]
                            }}
                            disabled={isUploading}
                            arrow
                        >
                            <AntdButton type={'primary'} style={{ padding: '4px 8px' }}>
                                <Icon
                                    component={IconConsoleInstall}
                                    style={{ fontSize: '1.2em' }}
                                />
                            </AntdButton>
                        </AntdDropdown>
                    </Card>
                </Permission>
                <Permission operationCode={['system:plugin:plugin:install']}>
                    <Card style={{ overflow: 'inherit', flex: '0 0 auto' }}>
                        <AntdTooltip title={'回收未引用模块'}>
                            <AntdButton
                                style={{ padding: '4px 8px' }}
                                onClick={handleOnGcBtnClick}
                                disabled={isUploading}
                            >
                                <Icon component={IconConsoleClear} style={{ fontSize: '1.2em' }} />
                            </AntdButton>
                        </AntdTooltip>
                    </Card>
                </Permission>
                <Card style={{ overflow: 'inherit' }}>
                    <AntdSpace.Compact block>
                        <AntdSpace.Addon>Group</AntdSpace.Addon>
                        <AntdInput
                            allowClear
                            value={searchGroup}
                            onChange={(e) => setSearchGroup(e.target.value)}
                            onKeyDown={handleOnSearchKeyDown}
                            placeholder={'请输入搜索内容'}
                        />
                    </AntdSpace.Compact>
                </Card>
                <Card style={{ overflow: 'inherit' }}>
                    <AntdSpace.Compact block>
                        <AntdSpace.Addon>Artifact</AntdSpace.Addon>
                        <AntdInput
                            allowClear
                            value={searchArtifact}
                            onChange={(e) => setSearchArtifact(e.target.value)}
                            onKeyDown={handleOnSearchKeyDown}
                            placeholder={'请输入搜索内容'}
                        />
                    </AntdSpace.Compact>
                </Card>
                <Card style={{ overflow: 'inherit' }}>
                    <AntdSpace.Compact block>
                        <AntdSpace.Addon>SHA-256</AntdSpace.Addon>
                        <AntdInput
                            allowClear
                            value={searchSha}
                            onChange={(e) => setSearchSha(e.target.value)}
                            onKeyDown={handleOnSearchKeyDown}
                            placeholder={'请输入 SHA-256 前缀'}
                        />
                    </AntdSpace.Compact>
                </Card>
                <Card style={{ overflow: 'inherit', flex: '0 0 auto' }}>
                    <AntdButton onClick={getModule} type={'primary'}>
                        查询
                    </AntdButton>
                </Card>
            </FlexBox>
            {isUploading && !isFetchModalOpen && (
                <AntdAlert
                    title={'上传中'}
                    description={<AntdProgress percent={uploadProgress} />}
                    closable={{ onClose: handleOnCancelUpload }}
                />
            )}
        </FlexBox>
    )

    const table = (
        <Card>
            <AntdTable
                rowKey={(record) => record.sha256}
                columns={dataColumns}
                dataSource={moduleData}
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
            <PluginModuleFetchModal
                open={isFetchModalOpen}
                task={fetchTask}
                error={fetchError}
                uploadPercent={uploadProgress}
                onClose={handleOnFetchModalClose}
            />
        </>
    )
}

const coordinate = (record: PluginModuleVo) =>
    record.groupId && record.artifactId && record.moduleVersion
        ? `${record.groupId}:${record.artifactId}:${record.moduleVersion}`
        : `sha256:${record.sha256.slice(0, 12)}`

const referenceNames = (record: PluginModuleVo) =>
    record.referencedBy
        .map((plugin) => plugin.name ?? plugin.pluginId)
        .filter((name): name is string => !!name)
        .join(', ')

export default PluginModule
