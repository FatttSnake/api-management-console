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
import { hasPermission } from '@/utils/auth'
import { utcToLocalTime } from '@/utils/datetime'
import {
    r_sys_group_add,
    r_sys_group_change_status,
    r_sys_group_delete,
    r_sys_group_delete_list,
    r_sys_group_get,
    r_sys_group_update,
    r_sys_role_get_list
} from '@/services/system'
import Permission from '@/components/common/Permission'
import FitFullscreen from '@/components/common/FitFullscreen'
import HideScrollbar from '@/components/common/HideScrollbar'
import FlexBox from '@/components/common/FlexBox'
import Card from '@/components/common/Card'

const Group = () => {
    const theme = useTheme()
    const [form] = AntdForm.useForm<GroupAddEditParam>()
    const formValues = AntdForm.useWatch([], form)
    const [newFormValues, setNewFormValues] = useState<GroupAddEditParam>()
    const [groupData, setGroupData] = useState<GroupWithRoleGetVo[]>([])
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
    const [roleData, setRoleData] = useState<RoleVo[]>([])
    const [isLoadingRole, setIsLoadingRole] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [tableSelectedItem, setTableSelectedItem] = useState<Key[]>([])

    const dataColumns: _ColumnsType<GroupWithRoleGetVo> = [
        {
            title: '名称',
            dataIndex: 'name',
            width: '15%'
        },
        {
            title: '角色',
            dataIndex: 'roles',
            render: (value: RoleVo[]) =>
                value.length ? (
                    value.map((role) => (
                        <AntdTag key={role.id} color={role.enable ? 'purple' : 'orange'}>
                            {role.name}
                        </AntdTag>
                    ))
                ) : (
                    <AntdTag>无</AntdTag>
                )
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
                    <Permission operationCode={['system:group:modify:status']}>
                        {value ? (
                            <a
                                style={{ color: theme.colorPrimary }}
                                onClick={handleOnChangStatusBtnClick(record.id, false)}
                            >
                                禁用
                            </a>
                        ) : (
                            <a
                                style={{ color: theme.colorPrimary }}
                                onClick={handleOnChangStatusBtnClick(record.id, true)}
                            >
                                启用
                            </a>
                        )}
                    </Permission>
                    <Permission operationCode={['system:group:modify:one']}>
                        <a
                            style={{ color: theme.colorPrimary }}
                            onClick={handleOnEditBtnClick(record)}
                        >
                            编辑
                        </a>
                    </Permission>
                    <Permission operationCode={['system:group:delete:one']}>
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
        sorter: _SorterResult<GroupWithRoleGetVo> | _SorterResult<GroupWithRoleGetVo>[]
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
            setGroupData([])
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
        form.setFieldValue('roleIds', newFormValues?.roleIds)
        form.setFieldValue('enable', newFormValues?.enable ?? true)
        if (!roleData || !roleData.length) {
            getRoleData()
        }
    }

    const handleOnListDeleteBtnClick = () => {
        modal
            .confirm({
                centered: true,
                maskClosable: true,
                title: '确定删除',
                content: `确定删除选中的 ${tableSelectedItem.length} 个用户组吗？`
            })
            .then(
                (confirmed) => {
                    if (confirmed) {
                        setIsLoading(true)

                        r_sys_group_delete_list(tableSelectedItem)
                            .then((res) => {
                                const response = res.data

                                if (response.code === DATABASE_DELETE_SUCCESS) {
                                    void message.success('删除成功')
                                    setTimeout(() => {
                                        getGroup()
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

    const handleOnEditBtnClick = (value: GroupWithRoleGetVo) => {
        return () => {
            setIsDrawerEdit(true)
            setIsDrawerOpen(true)
            form.setFieldValue('id', value.id)
            form.setFieldValue('name', value.name)
            form.setFieldValue(
                'roleIds',
                value.roles.map((role) => role.id)
            )
            form.setFieldValue('enable', value.enable)
            if (!roleData || !roleData.length) {
                getRoleData()
            }
            void form.validateFields()
        }
    }

    const handleOnDeleteBtnClick = (value: GroupWithRoleGetVo) => {
        return () => {
            modal
                .confirm({
                    centered: true,
                    maskClosable: true,
                    title: '确定删除',
                    content: `确定删除用户组 ${value.name} 吗？`
                })
                .then(
                    (confirmed) => {
                        if (confirmed) {
                            setIsLoading(true)

                            r_sys_group_delete(value.id)
                                .then((res) => {
                                    const response = res.data
                                    if (response.code === DATABASE_DELETE_SUCCESS) {
                                        void message.success('删除成功')
                                        setTimeout(() => {
                                            getGroup()
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

    const filterOption = (input: string, option?: { label: string; value: string }) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())

    const handleOnSubmit = () => {
        if (isSubmitting) {
            return
        }

        setIsSubmitting(true)

        if (isDrawerEdit) {
            r_sys_group_update(formValues)
                .then((res) => {
                    const response = res.data
                    switch (response.code) {
                        case DATABASE_UPDATE_SUCCESS:
                            setIsDrawerOpen(false)
                            void message.success('更新成功')
                            getGroup()
                            break
                        case DATABASE_DUPLICATE_KEY:
                            void message.error('已存在相同名称的用户组')
                            break
                        default:
                            void message.error('更新失败，请稍后重试')
                    }
                })
                .finally(() => {
                    setIsSubmitting(false)
                })
        } else {
            r_sys_group_add(formValues)
                .then((res) => {
                    const response = res.data
                    switch (response.code) {
                        case DATABASE_INSERT_SUCCESS:
                            setIsDrawerOpen(false)
                            void message.success('添加成功')
                            setNewFormValues(undefined)
                            getGroup()
                            break
                        case DATABASE_DUPLICATE_KEY:
                            void message.error('已存在相同名称的用户组')
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
            getGroup()
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
        getGroup()
    }

    const handleOnChangStatusBtnClick = (id: string, newStatus: boolean) => {
        return () => {
            if (isLoading) {
                return
            }

            setIsLoading(true)
            r_sys_group_change_status({ id, enable: newStatus })
                .then((res) => {
                    const response = res.data
                    if (response.code === DATABASE_UPDATE_SUCCESS) {
                        void message.success('更新成功')
                        setTimeout(() => {
                            getGroup()
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

    const getGroup = () => {
        if (isLoading) {
            return
        }

        if (!isRegexLegal) {
            void message.error('非法正则表达式')
            return
        }

        setIsLoading(true)

        r_sys_group_get({
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

                    records && setGroupData(records)
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

    const getRoleData = () => {
        if (isLoadingRole) {
            return
        }

        setIsLoadingRole(true)

        r_sys_role_get_list()
            .then((res) => {
                const response = res.data

                if (response.code === DATABASE_SELECT_SUCCESS) {
                    response.data && setRoleData(response.data)
                } else {
                    void message.error('获取角色列表失败，请稍后重试')
                }
            })
            .finally(() => {
                setIsLoadingRole(false)
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
                roleIds: formValues.roleIds,
                enable: formValues.enable
            })
        }
    }, [formValues])

    useEffect(() => {
        getGroup()
    }, [
        JSON.stringify(tableParams.filters),
        JSON.stringify(tableParams.sortField),
        JSON.stringify(tableParams.sortOrder),
        JSON.stringify(tableParams.pagination?.pageSize),
        JSON.stringify(tableParams.pagination?.current)
    ])

    const toolbar = (
        <FlexBox direction={'horizontal'} gap={10}>
            <Permission operationCode={['system:group:add:one']}>
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
                <AntdInput
                    addonBefore={
                        <span
                            style={{
                                fontSize: '0.9em',
                                color: theme.colorTextSecondary
                            }}
                        >
                            名称
                        </span>
                    }
                    suffix={
                        <>
                            {!isRegexLegal && (
                                <span style={{ color: theme.colorErrorText }}>非法表达式</span>
                            )}
                            <AntdCheckbox checked={isUseRegex} onChange={handleOnUseRegexChange}>
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
                dataSource={groupData}
                pagination={tableParams.pagination}
                loading={isLoading}
                scroll={{ x: true }}
                onChange={handleOnTableChange}
                rowSelection={
                    hasPermission('system:group:delete:multiple')
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
            <AntdTooltip title={'刷新角色列表'}>
                <AntdButton onClick={getRoleData} disabled={isSubmitting}>
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
            <AntdForm.Item name={'roleIds'} label={'角色'}>
                <AntdSelect
                    mode={'multiple'}
                    allowClear
                    showSearch
                    filterOption={filterOption}
                    options={roleData.map((value) => ({
                        value: value.id,
                        label: `${value.name}${!value.enable ? '(已禁用)' : ''}`
                    }))}
                    placeholder={'请选择角色'}
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
                title={isDrawerEdit ? '编辑用户组' : '添加用户组'}
                onClose={handleOnDrawerClose}
                open={isDrawerOpen}
                closable={!isSubmitting}
                maskClosable={!isSubmitting}
                extra={drawerToolbar}
            >
                {addAndEditForm}
            </AntdDrawer>
        </>
    )
}

export default Group
