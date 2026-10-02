import { ChangeEvent, MouseEvent, KeyboardEvent } from 'react'
import Icon from '@ant-design/icons'
import { useTheme } from 'antd-style'
import {
    API_PLATFORM_PLUGIN_INSTALL_FAILED,
    API_PLATFORM_PLUGIN_NOT_TRUSTED,
    API_PLATFORM_PLUGIN_SIGNATURE_INVALID,
    API_PLATFORM_PLUGIN_VERSION_CONFLICT,
    DATABASE_DELETE_SUCCESS,
    DATABASE_INSERT_SUCCESS,
    DATABASE_UPDATE_SUCCESS
} from '@/constants/common.constants'
import { message, modal } from '@/utils/common'
import { utcToLocalTime } from '@/utils/datetime'
import { navigateToPluginConfig } from '@/utils/navigation'
import {
    r_sys_api_plugin_get,
    r_sys_api_plugin_install,
    r_sys_api_plugin_status,
    r_sys_api_plugin_uninstall,
    r_sys_api_plugin_update
} from '@/services/system'
import FlexBox from '@/components/common/FlexBox'
import Permission from '@/components/common/Permission'
import Card from '@/components/common/Card'
import FitFullscreen from '@/components/common/FitFullscreen'
import HideScrollbar from '@/components/common/HideScrollbar'

const Plugin = () => {
    const navigate = useNavigate()
    const theme = useTheme()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const uploadControllerRef = useRef(new AbortController())
    const [form] = AntdForm.useForm<ApiPluginUpdateParam>()
    const formValues = AntdForm.useWatch([], form)
    const [pluginData, setPluginData] = useState<ApiPluginVo[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
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
    const [searchName, setSearchName] = useState<string>('')
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)
    const [isSubmittable, setIsSubmittable] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const dataColumns: _ColumnsType<ApiPluginVo> = [
        {
            title: '名称',
            dataIndex: 'name',
            width: '10%',
            minWidth: 100
        },
        {
            title: '描述',
            dataIndex: 'description',
            width: '30%',
            minWidth: 300
        },
        {
            title: '版本',
            dataIndex: 'versionName',
            width: 200,
            align: 'center',
            render: (value, record) => `${value}(${record.versionCode})`
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            width: '10%',
            align: 'center',
            render: (value: string) => utcToLocalTime(value)
        },
        {
            title: '修改时间',
            dataIndex: 'updateTime',
            width: '10%',
            align: 'center',
            render: (value: string) => utcToLocalTime(value)
        },
        {
            title: '状态',
            dataIndex: 'enable',
            width: '5%',
            align: 'center',
            render: (value, record) =>
                value ? (
                    record.loadError ? (
                        <AntdTag color={'error'}>{record.loadError}</AntdTag>
                    ) : (
                        <AntdTag color={'success'}>启用</AntdTag>
                    )
                ) : (
                    <AntdTag>禁用</AntdTag>
                )
        },
        {
            title: '操作',
            dataIndex: 'enable',
            width: '15em',
            align: 'center',
            render: (value, record) => (
                <AntdSpace size={'medium'}>
                    <Permission operationCode={['system:plugin:plugin:status']}>
                        {value ? (
                            <a
                                style={{ color: theme.colorPrimary }}
                                onClick={handleOnChangeStatusBtnClick(record.id, false)}
                            >
                                禁用
                            </a>
                        ) : (
                            <a
                                style={{ color: theme.colorPrimary }}
                                onClick={handleOnChangeStatusBtnClick(record.id, true)}
                            >
                                启用
                            </a>
                        )}
                    </Permission>
                    <Permission operationCode={['system:plugin:plugin:modify']}>
                        <a
                            style={{ color: theme.colorPrimary }}
                            onClick={handleOnPriceBtnClick(record)}
                        >
                            定价
                        </a>
                    </Permission>
                    <Permission operationCode={['system:plugin:config:query']}>
                        <a
                            style={{ color: theme.colorPrimary }}
                            onClick={handleOnConfigBtnClick(record)}
                        >
                            配置
                        </a>
                    </Permission>
                    <Permission operationCode={['system:plugin:plugin:uninstall']}>
                        <a
                            style={{ color: theme.colorPrimary }}
                            onClick={handleOnUninstallBtnClick(record)}
                        >
                            卸载
                        </a>
                    </Permission>
                </AntdSpace>
            )
        }
    ]

    const handleOnTableChange = (
        pagination: _TablePaginationConfig,
        filters: Record<string, _FilterValue | null>,
        sorter: _SorterResult<ApiPluginVo> | _SorterResult<ApiPluginVo>[]
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
            setPluginData([])
        }
    }

    const handleOnAddBtnClick = () => {
        fileInputRef.current?.click()
    }

    const handleOnFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || !files.length) {
            return
        }
        const file = files[0]

        if (!file.name.toLowerCase().endsWith('.jar')) {
            void message.warning('请选择 .jar 后缀的文件')
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
            return
        }

        await uploadFile(file)
    }

    const handleOnCancelUpload = () => {
        uploadControllerRef.current.abort()
    }

    const handleOnShowDetail = (record: ApiPluginVo) => {
        return () => {
            void modal.info({
                centered: true,
                mask: { closable: true },
                width: 'fit-content',
                title: '插件信息',
                content: (
                    <AntdDescriptions
                        items={[
                            {
                                label: '名称',
                                children: record.name,
                                style: { textWrap: 'nowrap' }
                            },
                            {
                                label: '版本',
                                children: `${record.versionName}(${record.versionCode})`,
                                style: { textWrap: 'nowrap' }
                            },
                            {
                                label: '状态',
                                children: record.enable ? (
                                    <AntdTag color={'success'}>启用</AntdTag>
                                ) : (
                                    <AntdTag>禁用</AntdTag>
                                )
                            },
                            {
                                label: '描述',
                                children: record.description,
                                span: 'filled'
                            },
                            {
                                label: '默认每次调用单价',
                                children: Number(record.defaultPrice)
                                    ? record.defaultPrice
                                    : '免费',
                                style: { textWrap: 'nowrap' }
                            },
                            {
                                label: '默认每分钟限流次数',
                                children: record.defaultRateLimit || '不限制',
                                style: { textWrap: 'nowrap' }
                            },
                            {
                                label: '默认访问模式',
                                children:
                                    record.defaultAccessMode === 'DEFAULT' ? '公开' : '仅授权',
                                style: { textWrap: 'nowrap' }
                            },
                            {
                                label: '插件 ID',
                                children: record.pluginId,
                                style: { textWrap: 'nowrap' }
                            },
                            {
                                label: '来源',
                                children: record.source === 'BUILT_IN' ? '内置' : '上传',
                                style: { textWrap: 'nowrap' }
                            },
                            {
                                label: 'jar 文件名',
                                children: record.jarName,
                                style: { textWrap: 'nowrap' }
                            },
                            {
                                label: '签名公钥指纹',
                                children: record.signerKeyId,
                                span: 'filled'
                            },
                            {
                                label: '最近挂载错误信息',
                                children: record.loadError,
                                span: 'filled'
                            },
                            {
                                label: '创建时间',
                                children: utcToLocalTime(record.createTime),
                                style: { wordBreak: 'keep-all' },
                                span: 1.5
                            },
                            {
                                label: '修改时间',
                                children: utcToLocalTime(record.updateTime),
                                style: { wordBreak: 'keep-all' },
                                span: 1.5
                            }
                        ]}
                        column={3}
                        bordered
                    />
                )
            })
        }
    }

    const handleOnChangeStatusBtnClick = (id: string, newStatus: boolean) => {
        return (e: MouseEvent) => {
            e.stopPropagation()

            if (isLoading) {
                return
            }
            setIsLoading(true)

            r_sys_api_plugin_status({ id, enable: newStatus })
                .then((res) => {
                    const response = res.data
                    if (response.code === DATABASE_UPDATE_SUCCESS) {
                        void message.success('更新成功')
                        setTimeout(() => {
                            getPlugin()
                        })
                    } else {
                        void message.error('更新失败，请稍后重试')
                    }
                })
                .finally(() => {
                    setIsLoading(false)
                })
        }
    }

    const handleOnPriceBtnClick = (value: ApiPluginVo) => {
        return (e: MouseEvent) => {
            e.stopPropagation()

            setIsDrawerOpen(true)
            form.setFieldValue('id', value.id)
            form.setFieldValue('enable', value.enable)
            form.setFieldValue('defaultPrice', value.defaultPrice)
            form.setFieldValue('defaultRateLimit', value.defaultRateLimit)
            form.setFieldValue('defaultAccessMode', value.defaultAccessMode)
            void form.validateFields()
        }
    }

    const handleOnConfigBtnClick = (value: ApiPluginVo) => {
        return (e: MouseEvent) => {
            e.stopPropagation()

            navigateToPluginConfig(navigate, value.pluginId)
        }
    }

    const handleOnUninstallBtnClick = (value: ApiPluginVo) => {
        return (e: MouseEvent) => {
            e.stopPropagation()

            modal
                .confirm({
                    centered: true,
                    mask: { closable: true },
                    title: '确定卸载',
                    content: `确定卸载插件 ${value.name} 吗？`
                })
                .then(
                    (confirmed) => {
                        if (confirmed) {
                            setIsLoading(true)

                            r_sys_api_plugin_uninstall(value.pluginId)
                                .then((res) => {
                                    const response = res.data
                                    if (response.code === DATABASE_DELETE_SUCCESS) {
                                        void message.success('卸载成功')
                                        setTimeout(() => {
                                            getPlugin()
                                        })
                                    } else {
                                        void message.error('卸载失败，请稍后重试')
                                    }
                                })
                                .finally(() => {
                                    setIsLoading(false)
                                })
                        }
                    },
                    () => {}
                )
        }
    }

    const handleOnDrawerClose = () => {
        setIsDrawerOpen(false)
    }

    const handleOnSubmit = () => {
        if (isSubmitting) {
            return
        }
        setIsSubmitting(true)

        r_sys_api_plugin_update(formValues)
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case DATABASE_UPDATE_SUCCESS:
                        setIsDrawerOpen(false)
                        void message.success('修改成功')
                        getPlugin()
                        break
                    default:
                        void message.error('修改失败，请稍后重试')
                }
            })
            .finally(() => {
                setIsSubmitting(false)
            })
    }

    const handleOnSearchNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchName(e.target.value)
    }

    const handleOnSearchNameKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            getPlugin()
        }
    }

    const handleOnQueryBtnClick = () => {
        getPlugin()
    }

    const uploadFile = async (file: File) => {
        try {
            setIsUploading(true)
            setUploadProgress(0)

            const res = await r_sys_api_plugin_install(
                file,
                setUploadProgress,
                uploadControllerRef.current.signal
            )
            const response = res.data

            switch (response.code) {
                case DATABASE_INSERT_SUCCESS:
                    void message.success('安装成功')
                    getPlugin()
                    break
                case API_PLATFORM_PLUGIN_INSTALL_FAILED:
                    void message.error(`安装失败：${response.msg}`)
                    break
                case API_PLATFORM_PLUGIN_SIGNATURE_INVALID:
                    void message.error(`插件签名验证失败`)
                    break
                case API_PLATFORM_PLUGIN_NOT_TRUSTED:
                    void message.error('插件签名不可信')
                    break
                case API_PLATFORM_PLUGIN_VERSION_CONFLICT:
                    void message.error('插件版本冲突')
                    break
                default:
                    void message.error('安装失败，请稍后重试')
            }
        } finally {
            uploadControllerRef.current = new AbortController()
            setIsUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const getPlugin = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)

        r_sys_api_plugin_get({
            currentPage: tableParams.pagination?.current,
            pageSize: tableParams.pagination?.pageSize,
            sortField:
                tableParams.sortField && tableParams.sortOrder
                    ? (tableParams.sortField as string)
                    : undefined,
            sortOrder:
                tableParams.sortField && tableParams.sortOrder ? tableParams.sortOrder : undefined,
            searchName: searchName.trim().length ? searchName : undefined,
            ...tableParams.filters
        })
            .then((res) => {
                const response = res.data
                if (response.success) {
                    const records = response.data!.records
                    setPluginData(records)
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
        form.validateFields({ validateOnly: true }).then(
            () => {
                setIsSubmittable(true)
            },
            () => {
                setIsSubmittable(false)
            }
        )
    }, [formValues])

    useEffect(() => {
        getPlugin()
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
                    ref={fileInputRef}
                    type={'file'}
                    accept={'.jar'}
                    onChange={handleOnFileChange}
                    style={{ display: 'none' }}
                    disabled={isUploading}
                />
                <Permission operationCode={['system:plugin:key:add']}>
                    <Card style={{ overflow: 'inherit', flex: '0 0 auto' }}>
                        <AntdButton
                            type={'primary'}
                            style={{ padding: '4px 8px' }}
                            onClick={handleOnAddBtnClick}
                            disabled={isUploading}
                        >
                            <Icon component={IconConsoleInstall} style={{ fontSize: '1.2em' }} />
                        </AntdButton>
                    </Card>
                </Permission>
                <Card style={{ overflow: 'inherit' }}>
                    <AntdSpace.Compact block>
                        <AntdSpace.Addon>名称</AntdSpace.Addon>
                        <AntdInput
                            allowClear
                            value={searchName}
                            onChange={handleOnSearchNameChange}
                            onKeyDown={handleOnSearchNameKeyDown}
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
            {isUploading && (
                <AntdAlert
                    title={'安装中'}
                    description={<AntdProgress percent={uploadProgress} />}
                    closable={{ onClose: handleOnCancelUpload }}
                />
            )}
        </FlexBox>
    )

    const table = (
        <Card>
            <AntdTable
                rowKey={(record) => record.id}
                columns={dataColumns}
                dataSource={pluginData}
                pagination={tableParams.pagination}
                loading={isLoading}
                scroll={{ x: true }}
                onChange={handleOnTableChange}
                onRow={(record) => ({
                    style: { cursor: 'pointer' },
                    onClick: handleOnShowDetail(record)
                })}
            />
        </Card>
    )

    const drawerToolbar = (
        <AntdSpace>
            <AntdButton onClick={handleOnDrawerClose} disabled={isSubmitting}>
                取消
            </AntdButton>
            <AntdButton
                type={'primary'}
                disabled={!isSubmittable}
                loading={isSubmitting}
                onClick={handleOnSubmit}
            >
                提交
            </AntdButton>
        </AntdSpace>
    )

    const priceForm = (
        <AntdForm form={form} disabled={isSubmitting} layout={'vertical'}>
            <AntdForm.Item name={'id'} label={'ID'} hidden>
                <AntdInput disabled />
            </AntdForm.Item>
            <AntdForm.Item
                valuePropName={'checked'}
                name={'enable'}
                label={'状态'}
                rules={[{ required: true, type: 'boolean' }]}
                hidden
            >
                <AntdSwitch checkedChildren={'启用'} unCheckedChildren={'禁用'} disabled />
            </AntdForm.Item>
            <AntdForm.Item name={'defaultPrice'} label={'默认每次调用单价'}>
                <AntdInputNumber
                    style={{ width: '100%' }}
                    min={'0'}
                    step={'0.01'}
                    precision={4}
                    stringMode
                    placeholder={'免费'}
                />
            </AntdForm.Item>
            <AntdForm.Item name={'defaultRateLimit'} label={'默认每分钟限流次数'}>
                <AntdInputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={0}
                    placeholder={'不限制'}
                />
            </AntdForm.Item>
            <AntdForm.Item
                name={'defaultAccessMode'}
                label={'默认访问模式'}
                rules={[{ required: true }]}
            >
                <AntdSelect
                    options={[
                        { label: '公开', value: 'DEFAULT' },
                        { label: '仅授权', value: 'RESTRICTED' }
                    ]}
                />
            </AntdForm.Item>
        </AntdForm>
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
            <AntdDrawer
                title={'插件定价'}
                onClose={handleOnDrawerClose}
                open={isDrawerOpen}
                closable={!isSubmitting}
                mask={{ closable: !isSubmitting }}
                extra={drawerToolbar}
            >
                {priceForm}
            </AntdDrawer>
        </>
    )
}

export default Plugin
