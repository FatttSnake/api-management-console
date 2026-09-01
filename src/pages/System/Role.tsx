import { ChangeEvent, Key, KeyboardEvent } from 'react'
import Icon from '@ant-design/icons'
import { useTheme } from 'antd-style'
import {
    DATABASE_DELETE_SUCCESS,
    DATABASE_DUPLICATE_KEY,
    DATABASE_INSERT_SUCCESS,
    DATABASE_SELECT_SUCCESS,
    DATABASE_UPDATE_SUCCESS
} from '@/constants/common.constants'
import { message, modal } from '@/utils/common'
import { utcToLocalTime } from '@/utils/datetime'
import { hasPermission, powerListToPowerTree } from '@/utils/auth'
import {
    r_sys_role_add,
    r_sys_role_change_status,
    r_sys_power_get_list,
    r_sys_role_get,
    r_sys_role_update,
    r_sys_role_delete,
    r_sys_role_delete_list
} from '@/services/system'
import Permission from '@/components/common/Permission'
import FitFullscreen from '@/components/common/FitFullscreen'
import HideScrollbar from '@/components/common/HideScrollbar'
import FlexBox from '@/components/common/FlexBox'
import Card from '@/components/common/Card'

const Role = () => {
    const theme = useTheme()
    const [form] = AntdForm.useForm<RoleAddEditParam>()
    const formValues = AntdForm.useWatch([], form)
    const [newFormValues, setNewFormValues] = useState<RoleAddEditParam>()
    const [roleData, setRoleData] = useState<RoleWithPowerGetVo[]>([])
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
    const [isUseRegex, setIsUseRegex] = useState(false)
    const [isRegexLegal, setIsRegexLegal] = useState(true)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isDrawerEdit, setIsDrawerEdit] = useState(false)
    const [isSubmittable, setIsSubmittable] = useState(false)
    const [powerTreeData, setPowerTreeData] = useState<_DataNode[]>([])
    const [isLoadingPower, setIsLoadingPower] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [tableSelectedItem, setTableSelectedItem] = useState<Key[]>([])

    const dataColumns: _ColumnsType<RoleWithPowerGetVo> = [
        {
            title: '名称',
            dataIndex: 'name',
            width: '15%'
        },
        {
            title: '权限',
            dataIndex: 'tree',
            render: (value: _DataNode[]) =>
                value.length ? <AntdTree treeData={value} /> : <AntdTag>无</AntdTag>
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
                <AntdSpace size={'middle'}>
                    <Permission operationCode={['system:role:one:status']}>
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
                    <Permission operationCode={['system:role:one:modify']}>
                        <a
                            style={{ color: theme.colorPrimary }}
                            onClick={handleOnEditBtnClick(record)}
                        >
                            编辑
                        </a>
                    </Permission>
                    <Permission operationCode={['system:role:one:remove']}>
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
        sorter: _SorterResult<RoleWithPowerGetVo> | _SorterResult<RoleWithPowerGetVo>[]
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
            setRoleData([])
        }
    }

    const handleOnTableSelectChange = (selectedRowKeys: Key[]) => {
        setTableSelectedItem(selectedRowKeys)
    }

    const handleOnAddBtnClick = () => {
        setIsDrawerEdit(false)
        setIsDrawerOpen(true)
        form.setFieldValue('id', undefined)
        form.setFieldValue('name', newFormValues?.name)
        form.setFieldValue('powerIds', newFormValues?.powerIds)
        form.setFieldValue('enable', newFormValues?.enable ?? true)
        if (!powerTreeData || !powerTreeData.length) {
            getPowerTreeData()
        }
    }

    const handleOnListDeleteBtnClick = () => {
        modal
            .confirm({
                centered: true,
                mask: { closable: true },
                title: '确定删除',
                content: `确定删除选中的 ${tableSelectedItem.length} 个角色吗？`
            })
            .then(
                (confirmed) => {
                    if (confirmed) {
                        setIsLoading(true)

                        r_sys_role_delete_list(tableSelectedItem)
                            .then((res) => {
                                const response = res.data

                                if (response.code === DATABASE_DELETE_SUCCESS) {
                                    void message.success('删除成功')
                                    setTimeout(() => {
                                        getRole()
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

    const handleOnEditBtnClick = (value: RoleWithPowerGetVo) => {
        return () => {
            setIsDrawerEdit(true)
            setIsDrawerOpen(true)
            form.setFieldValue('id', value.id)
            form.setFieldValue('name', value.name)
            form.setFieldValue(
                'powerIds',
                value.operations.map((operation) => operation.id)
            )
            form.setFieldValue('enable', value.enable)
            if (!powerTreeData || !powerTreeData.length) {
                getPowerTreeData()
            }
            void form.validateFields()
        }
    }

    const handleOnDeleteBtnClick = (value: RoleWithPowerGetVo) => {
        return () => {
            modal
                .confirm({
                    centered: true,
                    mask: { closable: true },
                    title: '确定删除',
                    content: `确定删除角色 ${value.name} 吗？`
                })
                .then(
                    (confirmed) => {
                        if (confirmed) {
                            setIsLoading(true)

                            r_sys_role_delete(value.id)
                                .then((res) => {
                                    const response = res.data
                                    if (response.code === DATABASE_DELETE_SUCCESS) {
                                        void message.success('删除成功')
                                        setTimeout(() => {
                                            getRole()
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

        if (isDrawerEdit) {
            r_sys_role_update(formValues)
                .then((res) => {
                    const response = res.data
                    switch (response.code) {
                        case DATABASE_UPDATE_SUCCESS:
                            setIsDrawerOpen(false)
                            void message.success('更新成功')
                            getRole()
                            break
                        case DATABASE_DUPLICATE_KEY:
                            void message.error('已存在相同名称的角色')
                            break
                        default:
                            void message.error('更新失败，请稍后重试')
                    }
                })
                .finally(() => {
                    setIsSubmitting(false)
                })
        } else {
            r_sys_role_add(formValues)
                .then((res) => {
                    const response = res.data
                    switch (response.code) {
                        case DATABASE_INSERT_SUCCESS:
                            setIsDrawerOpen(false)
                            void message.success('添加成功')
                            setNewFormValues(undefined)
                            getRole()
                            break
                        case DATABASE_DUPLICATE_KEY:
                            void message.error('已存在相同名称的角色')
                            break
                        default:
                            void message.error('添加失败，请稍后重试')
                    }
                })
                .finally(() => {
                    setIsSubmitting(false)
                })
        }
    }

    const handleOnSearchNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchName(e.target.value)

        if (isUseRegex) {
            try {
                RegExp(e.target.value)
                setIsRegexLegal(!(e.target.value.includes('{}') || e.target.value.includes('[]')))
            } catch (e) {
                setIsRegexLegal(false)
            }
        } else {
            setIsRegexLegal(true)
        }
    }

    const handleOnSearchNameKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            getRole()
        }
    }

    const handleOnUseRegexChange = (e: _CheckboxChangeEvent) => {
        setIsUseRegex(e.target.checked)
        if (e.target.checked) {
            try {
                RegExp(searchName)
                setIsRegexLegal(!(searchName.includes('{}') || searchName.includes('[]')))
            } catch (e) {
                setIsRegexLegal(false)
            }
        } else {
            setIsRegexLegal(true)
        }
    }

    const handleOnQueryBtnClick = () => {
        getRole()
    }

    const handleOnChangeStatusBtnClick = (id: string, newStatus: boolean) => {
        return () => {
            if (isLoading) {
                return
            }

            setIsLoading(true)
            r_sys_role_change_status({ id, enable: newStatus })
                .then((res) => {
                    const response = res.data
                    if (response.code === DATABASE_UPDATE_SUCCESS) {
                        void message.success('更新成功')
                        setTimeout(() => {
                            getRole()
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

    const getRole = () => {
        if (isLoading) {
            return
        }

        if (!isRegexLegal) {
            void message.error('非法正则表达式')
            return
        }

        setIsLoading(true)

        r_sys_role_get({
            currentPage: tableParams.pagination?.current,
            pageSize: tableParams.pagination?.pageSize,
            sortField:
                tableParams.sortField && tableParams.sortOrder
                    ? (tableParams.sortField as string)
                    : undefined,
            sortOrder:
                tableParams.sortField && tableParams.sortOrder ? tableParams.sortOrder : undefined,
            searchName: searchName.trim().length ? searchName : undefined,
            searchRegex: isUseRegex ? isUseRegex : undefined,
            ...tableParams.filters
        })
            .then((res) => {
                const response = res.data
                if (response.code === DATABASE_SELECT_SUCCESS) {
                    const records = response.data?.records

                    records?.map((value) => {
                        value.tree = powerListToPowerTree(
                            value.modules,
                            value.menus,
                            value.scopes,
                            value.operations
                        )

                        return value
                    })

                    records && setRoleData(records)
                    response.data &&
                        setTableParams({
                            ...tableParams,
                            pagination: {
                                ...tableParams.pagination,
                                total: response.data.total
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

    const getPowerTreeData = () => {
        if (isLoadingPower) {
            return
        }

        setIsLoadingPower(true)

        r_sys_power_get_list()
            .then((res) => {
                const response = res.data

                if (response.code === DATABASE_SELECT_SUCCESS) {
                    const powerSet = response.data
                    powerSet &&
                        setPowerTreeData(
                            powerListToPowerTree(
                                powerSet.moduleList,
                                powerSet.menuList,
                                powerSet.scopeList,
                                powerSet.operationList
                            )
                        )
                } else {
                    void message.error('获取权限列表失败，请稍后重试')
                }
            })
            .finally(() => {
                setIsLoadingPower(false)
            })
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

        if (!isDrawerEdit && formValues) {
            setNewFormValues({
                name: formValues.name,
                powerIds: formValues.powerIds,
                enable: formValues.enable
            })
        }
    }, [formValues])

    useEffect(() => {
        getRole()
    }, [
        JSON.stringify(tableParams.filters),
        JSON.stringify(tableParams.sortField),
        JSON.stringify(tableParams.sortOrder),
        JSON.stringify(tableParams.pagination?.pageSize),
        JSON.stringify(tableParams.pagination?.current)
    ])

    const toolbar = (
        <FlexBox direction={'horizontal'} gap={10}>
            <Permission operationCode={['system:role:one:add']}>
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
            <Card
                hidden={tableSelectedItem.length === 0}
                style={{ overflow: 'inherit', flex: '0 0 auto' }}
            >
                <AntdButton style={{ padding: '4px 8px' }} onClick={handleOnListDeleteBtnClick}>
                    <Icon component={IconConsoleDelete} style={{ fontSize: '1.2em' }} />
                </AntdButton>
            </Card>
            <Card style={{ overflow: 'inherit' }}>
                <AntdSpace.Compact style={{ width: '100%' }}>
                    <AntdSpace.Addon>名称</AntdSpace.Addon>
                    <AntdInput
                        suffix={
                            <>
                                {!isRegexLegal && (
                                    <span style={{ color: theme.colorErrorText }}>非法表达式</span>
                                )}
                                <AntdCheckbox
                                    checked={isUseRegex}
                                    onChange={handleOnUseRegexChange}
                                >
                                    <AntdTooltip title={'正则表达式'}>.*</AntdTooltip>
                                </AntdCheckbox>
                            </>
                        }
                        allowClear
                        value={searchName}
                        onChange={handleOnSearchNameChange}
                        onKeyDown={handleOnSearchNameKeyDown}
                        status={isRegexLegal ? undefined : 'error'}
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
                rowKey={(record) => record.id}
                columns={dataColumns}
                dataSource={roleData}
                pagination={tableParams.pagination}
                loading={isLoading}
                scroll={{ x: true }}
                onChange={handleOnTableChange}
                rowSelection={
                    hasPermission('system:role:all:remove')
                        ? {
                              type: 'checkbox',
                              onChange: handleOnTableSelectChange
                          }
                        : undefined
                }
            />
        </Card>
    )

    const drawerToolbar = (
        <AntdSpace>
            <AntdTooltip title={'刷新权限列表'}>
                <AntdButton onClick={getPowerTreeData} disabled={isSubmitting}>
                    <Icon component={IconConsoleRefresh} />
                </AntdButton>
            </AntdTooltip>
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

    const addAndEditForm = (
        <AntdForm form={form} disabled={isSubmitting} layout={'vertical'}>
            <AntdForm.Item hidden name={'id'} label={'ID'}>
                <AntdInput disabled />
            </AntdForm.Item>
            <AntdForm.Item
                name={'name'}
                label={'名称'}
                rules={[{ required: true, whitespace: true }]}
            >
                <AntdInput allowClear placeholder={'请输入名称'} />
            </AntdForm.Item>
            <AntdForm.Item name={'powerIds'} label={'权限'}>
                <AntdTreeSelect
                    treeData={powerTreeData}
                    treeCheckable
                    treeNodeLabelProp={'fullTitle'}
                    allowClear
                    showSearch={{ treeNodeFilterProp: 'fullTitle' }}
                    loading={isLoadingPower}
                    placeholder={'请选择权限'}
                />
            </AntdForm.Item>
            <AntdForm.Item
                valuePropName={'checked'}
                name={'enable'}
                label={'状态'}
                rules={[{ required: true, type: 'boolean' }]}
            >
                <AntdSwitch checkedChildren={'启用'} unCheckedChildren={'禁用'} />
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
                title={isDrawerEdit ? '编辑角色' : '添加角色'}
                onClose={handleOnDrawerClose}
                open={isDrawerOpen}
                closable={!isSubmitting}
                mask={{ closable: !isSubmitting }}
                extra={drawerToolbar}
            >
                {addAndEditForm}
            </AntdDrawer>
        </>
    )
}

export default Role
