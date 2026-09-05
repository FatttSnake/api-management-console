import { ChangeEvent, KeyboardEvent } from 'react'
import Icon from '@ant-design/icons'
import { useTheme } from 'antd-style'
import {
    API_PLATFORM_PLUGIN_INSTALL_FAILED,
    DATABASE_DELETE_SUCCESS,
    DATABASE_INSERT_SUCCESS,
    DATABASE_UPDATE_SUCCESS
} from '@/constants/common.constants'
import { message, modal } from '@/utils/common'
import { utcToLocalTime } from '@/utils/datetime'
import {
    r_sys_api_plugin_key_add,
    r_sys_api_plugin_key_delete,
    r_sys_api_plugin_key_get,
    r_sys_api_plugin_key_update
} from '@/services/system'
import FitFullscreen from '@/components/common/FitFullscreen'
import HideScrollbar from '@/components/common/HideScrollbar'
import FlexBox from '@/components/common/FlexBox'
import Card from '@/components/common/Card'
import Permission from '@/components/common/Permission'

const PluginTrustKey = () => {
    const theme = useTheme()
    const [form] = AntdForm.useForm<ApiPluginTrustKeyAddParam>()
    const formValues = AntdForm.useWatch([], form)
    const [keyData, setKeyData] = useState<ApiPluginTrustKeyVo[]>([])
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
    const [searchAlias, setSearchAlias] = useState('')
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isSubmittable, setIsSubmittable] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const dataColumns: _ColumnsType<ApiPluginTrustKeyVo> = [
        {
            title: '公钥指纹',
            dataIndex: 'keyId'
        },
        {
            title: '密钥别名',
            dataIndex: 'alias',
            width: '15%'
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            width: '10%',
            align: 'center',
            render: (value: string) => utcToLocalTime(value)
        },
        {
            title: '状态',
            dataIndex: 'enable',
            minWidth: 80,
            width: '5%',
            align: 'center',
            render: (value) =>
                value ? <AntdTag color={'success'}>启用</AntdTag> : <AntdTag>禁用</AntdTag>
        },
        {
            title: '操作',
            dataIndex: 'enable',
            width: '15em',
            align: 'center',
            render: (value, record) => (
                <AntdSpace size={'medium'}>
                    <Permission operationCode={['system:plugin:key:status']}>
                        {value ? (
                            <a
                                style={{ color: theme.colorPrimary }}
                                onClick={handleOnChangeStatusBtnClick(record.keyId, false)}
                            >
                                禁用
                            </a>
                        ) : (
                            <a
                                style={{ color: theme.colorPrimary }}
                                onClick={handleOnChangeStatusBtnClick(record.keyId, true)}
                            >
                                启用
                            </a>
                        )}
                    </Permission>
                    <Permission operationCode={['system:plugin:key:remove']}>
                        <a
                            style={{ color: theme.colorPrimary }}
                            onClick={handleOnDeleteBtnClick(record)}
                        >
                            删除
                        </a>
                    </Permission>
                </AntdSpace>
            )
        }
    ]

    const handleOnTableChange = (
        pagination: _TablePaginationConfig,
        filters: Record<string, _FilterValue | null>,
        sorter: _SorterResult<ApiPluginTrustKeyVo> | _SorterResult<ApiPluginTrustKeyVo>[]
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
            setKeyData([])
        }
    }

    const handleOnAddBtnClick = () => {
        setIsDrawerOpen(true)
        form.resetFields()
    }

    const handleOnChangeStatusBtnClick = (keyId: string, newStatus: boolean) => {
        return () => {
            if (isLoading) {
                return
            }
            setIsLoading(true)

            r_sys_api_plugin_key_update({ keyId, enable: newStatus })
                .then((res) => {
                    const response = res.data
                    if (response.code === DATABASE_UPDATE_SUCCESS) {
                        void message.success('更新成功')
                        setTimeout(() => {
                            getKey()
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

    const handleOnDeleteBtnClick = (value: ApiPluginTrustKeyVo) => {
        return () => {
            modal
                .confirm({
                    centered: true,
                    mask: { closable: true },
                    title: '确定删除',
                    content: `确定删除签名 ${value.alias ?? value.keyId} 吗？`
                })
                .then(
                    (confirmed) => {
                        if (confirmed) {
                            setIsLoading(true)

                            r_sys_api_plugin_key_delete(value.keyId)
                                .then((res) => {
                                    const response = res.data
                                    if (response.code === DATABASE_DELETE_SUCCESS) {
                                        void message.success('删除成功')
                                        setTimeout(() => {
                                            getKey()
                                        })
                                    } else {
                                        void message.error('删除失败，请稍后重试')
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

        r_sys_api_plugin_key_add(formValues)
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case DATABASE_INSERT_SUCCESS:
                        setIsDrawerOpen(false)
                        void message.success('添加成功')
                        getKey()
                        break
                    case API_PLATFORM_PLUGIN_INSTALL_FAILED:
                        void message.error(response.msg)
                        break
                    default:
                        void message.error('添加失败，请稍后重试')
                }
            })
            .finally(() => {
                setIsSubmitting(false)
            })
    }

    const handleOnSearchAliasChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchAlias(e.target.value)
    }

    const handleOnSearchAliasKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            getKey()
        }
    }

    const handleOnQueryBtnClick = () => {
        getKey()
    }

    const getKey = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)

        r_sys_api_plugin_key_get({
            currentPage: tableParams.pagination?.current,
            pageSize: tableParams.pagination?.pageSize,
            sortField:
                tableParams.sortField && tableParams.sortOrder
                    ? (tableParams.sortField as string)
                    : undefined,
            sortOrder:
                tableParams.sortField && tableParams.sortOrder ? tableParams.sortOrder : undefined,
            searchAlias: searchAlias.trim().length ? searchAlias : undefined,
            ...tableParams.filters
        })
            .then((res) => {
                const response = res.data
                if (response.success) {
                    const records = response.data!.records
                    setKeyData(records)
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
        getKey()
    }, [
        JSON.stringify(tableParams.filters),
        JSON.stringify(tableParams.sortField),
        JSON.stringify(tableParams.sortOrder),
        JSON.stringify(tableParams.pagination?.pageSize),
        JSON.stringify(tableParams.pagination?.current)
    ])

    const toolbar = (
        <FlexBox direction={'horizontal'} gap={10}>
            <Permission operationCode={['system:plugin:key:add']}>
                <Card style={{ overflow: 'inherit', flex: '0 0 auto' }}>
                    <AntdButton
                        type={'primary'}
                        style={{ padding: '4px 8px' }}
                        onClick={handleOnAddBtnClick}
                    >
                        <Icon component={IconConsolePlus} style={{ fontSize: '1.2em' }} />
                    </AntdButton>
                </Card>
            </Permission>
            <Card style={{ overflow: 'inherit' }}>
                <AntdSpace.Compact block>
                    <AntdSpace.Addon>别名</AntdSpace.Addon>
                    <AntdInput
                        allowClear
                        value={searchAlias}
                        onChange={handleOnSearchAliasChange}
                        onKeyDown={handleOnSearchAliasKeyDown}
                        placeholder={'请输入搜索内容'}
                    />
                </AntdSpace.Compact>
            </Card>
            <Card style={{ overflow: 'inherit', flex: '0 0 auto' }}>
                <AntdButton onClick={handleOnQueryBtnClick} type={'primary'}>
                    查询
                </AntdButton>
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
                rowKey={(record) => record.id}
                columns={dataColumns}
                dataSource={keyData}
                pagination={tableParams.pagination}
                loading={isLoading}
                scroll={{ x: true }}
                onChange={handleOnTableChange}
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

    const addForm = (
        <AntdForm form={form} disabled={isSubmitting} layout={'vertical'}>
            <AntdForm.Item
                name={'publicKey'}
                label={'公钥 (SPKI PEM)'}
                rules={[{ required: true, whitespace: true }]}
            >
                <AntdInput.TextArea allowClear autoSize={{ minRows: 6 }} />
            </AntdForm.Item>
            <AntdForm.Item name={'alias'} label={'别名'}>
                <AntdInput allowClear placeholder={'请输入别名'} />
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
                title={'添加签名'}
                onClose={handleOnDrawerClose}
                open={isDrawerOpen}
                closable={!isSubmitting}
                mask={{ closable: !isSubmitting }}
                extra={drawerToolbar}
            >
                {addForm}
            </AntdDrawer>
        </>
    )
}

export default PluginTrustKey
