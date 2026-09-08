import { ChangeEvent, MouseEvent, KeyboardEvent } from 'react'
import { useTheme } from 'antd-style'
import { DATABASE_UPDATE_SUCCESS } from '@/constants/common.constants'
import { message, modal } from '@/utils/common'
import { utcToLocalTime } from '@/utils/datetime'
import {
    r_sys_api_interface_get,
    r_sys_api_interface_status,
    r_sys_api_interface_update
} from '@/services/system'
import FlexBox from '@/components/common/FlexBox'
import Card from '@/components/common/Card'
import FitFullscreen from '@/components/common/FitFullscreen'
import HideScrollbar from '@/components/common/HideScrollbar'
import Permission from '@/components/common/Permission'

const Interface = () => {
    const theme = useTheme()
    const [form] = AntdForm.useForm<ApiInterfaceUpdateParam>()
    const formValues = AntdForm.useWatch([], form)
    const [interfaceData, setInterfaceData] = useState<ApiGroupVo[]>([])
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
    const [searchCode, setSearchCode] = useState('')
    const [searchName, setSearchName] = useState('')
    const [pluginId, setPluginId] = useState('')
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isSubmittable, setIsSubmittable] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const dataColumns: _ColumnsType<ApiGroupVo> = [
        {
            title: '插件名称',
            dataIndex: 'pluginName'
        },
        {
            title: '插件描述',
            dataIndex: 'pluginDescription'
        }
    ]

    const subDataColumns: _ColumnsType<ApiInterfaceVo> = [
        {
            title: '名称',
            dataIndex: 'name',
            width: '20%',
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
            width: '30%',
            minWidth: 300
        },
        {
            title: '请求路径',
            dataIndex: 'path',
            width: '30%',
            minWidth: 250
        },
        {
            title: '请求方式',
            dataIndex: 'method',
            minWidth: 100,
            align: 'center',
            render: (value) => <AntdTag>{value}</AntdTag>
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
                    <Permission operationCode={['system:interface:interface:status']}>
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
                    <Permission operationCode={['system:interface:interface:modify']}>
                        <a
                            style={{ color: theme.colorPrimary }}
                            onClick={handleOnEditBtnClick(record)}
                        >
                            编辑
                        </a>
                    </Permission>
                </AntdSpace>
            )
        }
    ]

    const handleOnTableChange = (
        pagination: _TablePaginationConfig,
        filters: Record<string, _FilterValue | null>,
        sorter: _SorterResult<ApiGroupVo> | _SorterResult<ApiGroupVo>[]
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
            setInterfaceData([])
        }
    }

    const handleOnChangeStatusBtnClick = (id: string, newStatus: boolean) => {
        return (e: MouseEvent) => {
            e.stopPropagation()

            if (isLoading) {
                return
            }
            setIsLoading(true)

            r_sys_api_interface_status({ id, enable: newStatus })
                .then((res) => {
                    const response = res.data
                    if (response.code === DATABASE_UPDATE_SUCCESS) {
                        void message.success('更新成功')
                        setTimeout(() => {
                            getInterface()
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

    const handleOnEditBtnClick = (value: ApiInterfaceVo) => {
        return (e: MouseEvent) => {
            e.stopPropagation()

            setIsDrawerOpen(true)
            form.setFieldValue('id', value.id)
            form.setFieldValue('price', value.price)
            form.setFieldValue('billingMode', value.billingMode)
            form.setFieldValue('needKey', value.needKey)
            form.setFieldValue('rateLimit', value.rateLimit)
            form.setFieldValue('enable', value.enable)
            form.setFieldValue('accessMode', value.accessMode)
            void form.validateFields()
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

        r_sys_api_interface_update(formValues)
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case DATABASE_UPDATE_SUCCESS:
                        setIsDrawerOpen(false)
                        void message.success('修改成功')
                        getInterface()
                        break
                    default:
                        void message.error('修改失败，请稍后重试')
                }
            })
            .finally(() => {
                setIsSubmitting(false)
            })
    }

    const handleOnSearchCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchCode(e.target.value)
    }

    const handleOnSearchNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchName(e.target.value)
    }

    const handleOnPluginIdChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPluginId(e.target.value)
    }

    const handleOnSearchKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            getInterface()
        }
    }

    const handleOnQueryBtnClick = () => {
        getInterface()
    }

    const expandedRowRender = (record: ApiGroupVo) => (
        <AntdTable
            rowKey={(record) => record.id}
            columns={subDataColumns}
            dataSource={record.interfaces}
            pagination={false}
            onRow={(record) => ({
                style: { cursor: 'pointer' },
                onClick: handleOnShowDetail(record)
            })}
        />
    )

    const handleOnShowDetail = (record: ApiInterfaceVo) => {
        return () => {
            void modal.info({
                centered: true,
                mask: { closable: true },
                width: 'fit-content',
                title: '接口信息',
                content: (
                    <AntdDescriptions
                        items={[
                            {
                                label: '名称',
                                children: record.name,
                                style: { textWrap: 'nowrap' }
                            },
                            {
                                label: '编码',
                                children: record.code,
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
                                label: '版本',
                                children: `v${record.apiVersion}`
                            },
                            {
                                label: '请求路径',
                                children: record.path
                            },
                            {
                                label: '请求方式',
                                children: record.method
                            },
                            {
                                label: '所属插件 ID',
                                children: record.pluginId
                            },
                            {
                                label: '每次调用单价',
                                children: record.price
                                    ? Number(record.price)
                                        ? record.price
                                        : '免费'
                                    : '继承插件'
                            },
                            {
                                label: '每分钟限流次数',
                                children:
                                    record.rateLimit === null
                                        ? '继承插件'
                                        : record.rateLimit || '不限制'
                            },
                            {
                                label: '访问模式',
                                children: record.accessMode
                                    ? record.accessMode === 'DEFAULT'
                                        ? '公开'
                                        : '仅授权'
                                    : '继承插件'
                            },
                            {
                                label: '计费模式',
                                children:
                                    record.billingMode === 'FREE'
                                        ? '免费'
                                        : record.billingMode === 'SUCCESS_ONLY'
                                          ? '仅成功'
                                          : '总是'
                            },
                            {
                                label: '需要 API Key',
                                children: record.needKey ? '是' : '否'
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

    const getInterface = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)

        r_sys_api_interface_get({
            currentPage: tableParams.pagination?.current,
            pageSize: tableParams.pagination?.pageSize,
            sortField:
                tableParams.sortField && tableParams.sortOrder
                    ? (tableParams.sortField as string)
                    : undefined,
            sortOrder:
                tableParams.sortField && tableParams.sortOrder ? tableParams.sortOrder : undefined,
            searchCode: searchCode.trim().length ? searchCode : undefined,
            searchName: searchName.trim().length ? searchName : undefined,
            pluginId: pluginId.trim().length ? pluginId : undefined,
            ...tableParams.filters
        })
            .then((res) => {
                const response = res.data
                if (response.success) {
                    const records = response.data!.records
                    setInterfaceData(records)
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
        getInterface()
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
                    <AntdSpace.Addon>API 编码</AntdSpace.Addon>
                    <AntdInput
                        allowClear
                        value={searchCode}
                        onChange={handleOnSearchCodeChange}
                        onKeyDown={handleOnSearchKeyDown}
                        placeholder={'请输入搜索内容'}
                    />
                </AntdSpace.Compact>
            </Card>
            <Card style={{ overflow: 'inherit' }}>
                <AntdSpace.Compact block>
                    <AntdSpace.Addon>API 名称</AntdSpace.Addon>
                    <AntdInput
                        allowClear
                        value={searchName}
                        onChange={handleOnSearchNameChange}
                        onKeyDown={handleOnSearchKeyDown}
                        placeholder={'请输入搜索内容'}
                    />
                </AntdSpace.Compact>
            </Card>
            <Card style={{ overflow: 'inherit' }}>
                <AntdSpace.Compact block>
                    <AntdSpace.Addon>所属插件 ID</AntdSpace.Addon>
                    <AntdInput
                        allowClear
                        value={pluginId}
                        onChange={handleOnPluginIdChange}
                        onKeyDown={handleOnSearchKeyDown}
                        placeholder={'请输入准确内容'}
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
                dataSource={interfaceData}
                expandable={{ expandedRowRender }}
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

    const editForm = (
        <AntdForm form={form} disabled={isSubmitting} layout={'vertical'}>
            <AntdForm.Item hidden name={'id'} label={'ID'}>
                <AntdInput disabled />
            </AntdForm.Item>
            <AntdForm.Item
                valuePropName={'checked'}
                name={'enable'}
                label={'状态'}
                rules={[{ required: true, type: 'boolean' }]}
            >
                <AntdSwitch checkedChildren={'启用'} unCheckedChildren={'禁用'} />
            </AntdForm.Item>
            <AntdForm.Item name={'price'} label={'每次调用单价'}>
                <AntdInputNumber
                    style={{ width: '100%' }}
                    min={'0'}
                    step={'0.01'}
                    precision={4}
                    stringMode
                    placeholder={'继承插件'}
                />
            </AntdForm.Item>
            <AntdForm.Item name={'billingMode'} label={'计费模式'} rules={[{ required: true }]}>
                <AntdSelect
                    options={[
                        { label: '免费', value: 'FREE' },
                        { label: '仅成功', value: 'SUCCESS_ONLY' },
                        { label: '总是', value: 'ALWAYS' }
                    ]}
                />
            </AntdForm.Item>
            <AntdForm.Item name={'rateLimit'} label={'每分钟限流次数'}>
                <AntdInputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={0}
                    placeholder={'继承插件'}
                />
            </AntdForm.Item>
            <AntdForm.Item name={'accessMode'} label={'访问模式'}>
                <AntdSelect
                    options={[
                        { label: '公开', value: 'DEFAULT' },
                        { label: '仅授权', value: 'RESTRICTED' }
                    ]}
                    allowClear
                    placeholder={'继承插件'}
                />
            </AntdForm.Item>
            <AntdForm.Item
                valuePropName={'checked'}
                name={'needKey'}
                label={'需要 API Key'}
                rules={[{ required: true, type: 'boolean' }]}
            >
                <AntdSwitch checkedChildren={'是'} unCheckedChildren={'否'} />
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
                title={'修改接口'}
                onClose={handleOnDrawerClose}
                open={isDrawerOpen}
                closable={!isSubmitting}
                mask={{ closable: !isSubmitting }}
                extra={drawerToolbar}
            >
                {editForm}
            </AntdDrawer>
        </>
    )
}

export default Interface
