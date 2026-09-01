import { ChangeEvent, Key, KeyboardEvent } from 'react'
import Icon from '@ant-design/icons'
import { useTheme } from 'antd-style'
import dayjs from 'dayjs'
import {
    DATABASE_DELETE_SUCCESS,
    DATABASE_DUPLICATE_KEY,
    DATABASE_INSERT_SUCCESS,
    DATABASE_SELECT_SUCCESS,
    DATABASE_UPDATE_SUCCESS
} from '@/constants/common.constants'
import { message, modal } from '@/utils/common'
import { hasPermission } from '@/utils/auth'
import { utcToLocalTime, isPastTime, localTimeToUtc, dayjsToUtc, getNowUtc } from '@/utils/datetime'
import {
    r_sys_avatar_generate,
    r_sys_group_get_list,
    r_sys_role_get_list,
    r_sys_user_add,
    r_sys_user_change_password,
    r_sys_user_delete,
    r_sys_user_delete_list,
    r_sys_user_get,
    r_sys_user_update
} from '@/services/system'
import Permission from '@/components/common/Permission'
import FitFullscreen from '@/components/common/FitFullscreen'
import HideScrollbar from '@/components/common/HideScrollbar'
import FlexBox from '@/components/common/FlexBox'
import Card from '@/components/common/Card'

interface ChangePasswordFields extends UserUpdatePasswordParam {
    passwordConfirm: string
    needChangePassword: boolean
}

const User = () => {
    const theme = useTheme()

    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isDrawerEdit, setIsDrawerEdit] = useState(false)
    const [isDrawerSubmittable, setIsDrawerSubmittable] = useState(false)
    const [isDrawerSubmitting, setIsDrawerSubmitting] = useState(false)
    const [roleData, setRoleData] = useState<RoleVo[]>([])
    const [groupData, setGroupData] = useState<GroupVo[]>([])
    const [isLoadingRole, setIsLoadingRole] = useState(false)
    const [isLoadingGroup, setIsLoadingGroup] = useState(false)
    const [avatar, setAvatar] = useState('')

    const [form] = AntdForm.useForm<UserAddEditParam>()
    const formValues = AntdForm.useWatch([], form)
    const [newFormValues, setNewFormValues] = useState<UserAddEditParam>()

    const [changePasswordForm] = AntdForm.useForm<ChangePasswordFields>()

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
    const [tableSelectedItem, setTableSelectedItem] = useState<Key[]>([])
    const [userData, setUserData] = useState<UserWithRoleInfoVo[]>([])
    const [isLoadingUserData, setIsLoadingUserData] = useState(false)

    const [searchType, setSearchType] = useState('ALL')
    const [searchValue, setSearchValue] = useState('')
    const [isUseRegex, setIsUseRegex] = useState(false)
    const [isRegexLegal, setIsRegexLegal] = useState(true)

    const dataColumns: _ColumnsType<UserWithRoleInfoVo> = [
        {
            dataIndex: 'username',
            title: '用户名',
            render: (value, record) => <AntdTooltip title={record.id}>{value}</AntdTooltip>,
            width: '0'
        },
        {
            dataIndex: ['userInfo', 'avatar'],
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
            dataIndex: ['userInfo', 'nickname'],
            title: '昵称'
        },
        {
            dataIndex: ['userInfo', 'email'],
            title: '邮箱'
        },
        {
            dataIndex: ['roles'],
            title: '角色',
            render: (value: RoleVo[], record) =>
                record.id === '0' ? (
                    <AntdTag color={'blue'}>管理员</AntdTag>
                ) : value.length ? (
                    value.map((role) => (
                        <AntdTag key={role.id} color={role.enable ? 'purple' : 'orange'}>
                            {role.name}
                        </AntdTag>
                    ))
                ) : (
                    <AntdTag>无</AntdTag>
                ),
            align: 'center'
        },
        {
            dataIndex: ['groups'],
            title: '用户组',
            render: (value: GroupVo[], record) =>
                record.id === '0' ? (
                    <AntdTag color={'blue'}>管理员</AntdTag>
                ) : value.length ? (
                    value.map((role) => (
                        <AntdTag key={role.id} color={role.enable ? 'purple' : 'orange'}>
                            {role.name}
                        </AntdTag>
                    ))
                ) : (
                    <AntdTag>无</AntdTag>
                ),
            align: 'center'
        },
        {
            title: '最近登录',
            render: (_, record) =>
                record.currentLoginTime
                    ? `${utcToLocalTime(record.currentLoginTime)}【${record.currentLoginIp}】`
                    : '无',
            align: 'center'
        },
        {
            title: '状态',
            render: (_, record) => (
                <AntdTooltip
                    title={
                        <>
                            <p>创建：{utcToLocalTime(record.createTime)}</p>
                            <p>修改：{utcToLocalTime(record.updateTime)}</p>
                        </>
                    }
                >
                    {!record.verify &&
                    !record.locking &&
                    (!record.expiration || !isPastTime(record.expiration)) &&
                    (!record.credentialsExpiration || !isPastTime(record.credentialsExpiration)) &&
                    record.enable ? (
                        <AntdTag color={'green'}>正常</AntdTag>
                    ) : (
                        <>
                            {record.verify && (
                                <AntdPopover content={record.verify} trigger={'click'}>
                                    <AntdTag style={{ cursor: 'pointer' }}>未验证</AntdTag>
                                </AntdPopover>
                            )}
                            {record.locking && <AntdTag>锁定</AntdTag>}
                            {record.expiration && isPastTime(record.expiration) && (
                                <AntdTag>过期</AntdTag>
                            )}
                            {record.credentialsExpiration &&
                                isPastTime(record.credentialsExpiration) && <AntdTag>改密</AntdTag>}
                            {!record.enable && <AntdTag>禁用</AntdTag>}
                        </>
                    )}
                </AntdTooltip>
            ),
            align: 'center'
        },
        {
            title: '操作',
            width: '14em',
            align: 'center',
            render: (_, record) => (
                <AntdSpace size={'middle'}>
                    <Permission operationCode={['system:user:one:password']}>
                        <a
                            style={{ color: theme.colorPrimary }}
                            onClick={handleOnChangePasswordBtnClick(record)}
                        >
                            更改密码
                        </a>
                    </Permission>
                    <Permission operationCode={['system:user:one:modify']}>
                        <a
                            style={{ color: theme.colorPrimary }}
                            onClick={handleOnEditBtnClick(record)}
                        >
                            编辑
                        </a>
                    </Permission>
                    <Permission operationCode={['system:user:one:remove']}>
                        {record.id !== '0' && (
                            <a
                                style={{ color: theme.colorPrimary }}
                                onClick={handleOnDeleteBtnClick(record)}
                            >
                                删除
                            </a>
                        )}
                    </Permission>
                </AntdSpace>
            )
        }
    ]

    const handleOnTableChange = (
        pagination: _TablePaginationConfig,
        filters: Record<string, _FilterValue | null>,
        sorter: _SorterResult<UserWithRoleInfoVo> | _SorterResult<UserWithRoleInfoVo>[]
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
            setUserData([])
        }
    }

    const handleOnTableSelectChange = (selectedRowKeys: Key[]) => {
        setTableSelectedItem(selectedRowKeys)
    }

    const handleOnAddBtnClick = () => {
        setIsDrawerEdit(false)
        setIsDrawerOpen(true)
        form.setFieldValue('id', undefined)
        form.setFieldValue('username', newFormValues?.username)
        form.setFieldValue('password', undefined)
        form.setFieldValue('locking', newFormValues?.locking ?? false)
        form.setFieldValue('expiration', newFormValues?.expiration)
        form.setFieldValue('credentialsExpiration', newFormValues?.credentialsExpiration)
        form.setFieldValue('enable', newFormValues?.enable ?? true)
        form.setFieldValue('nickname', newFormValues?.nickname)
        form.setFieldValue('avatar', newFormValues?.avatar)
        form.setFieldValue('email', newFormValues?.email)
        form.setFieldValue('roleIds', newFormValues?.roleIds)
        form.setFieldValue('groupIds', newFormValues?.groupIds)

        if (!roleData || !roleData.length) {
            getRoleData()
        }
        if (!groupData || !groupData.length) {
            getGroupData()
        }
        getAvatar()
    }

    const handleOnListDeleteBtnClick = () => {
        modal
            .confirm({
                centered: true,
                mask: { closable: true },
                title: '确定删除',
                content: `确定删除选中的 ${tableSelectedItem.length} 个用户吗？`
            })
            .then(
                (confirmed) => {
                    if (confirmed) {
                        setIsLoadingUserData(true)

                        r_sys_user_delete_list(tableSelectedItem)
                            .then((res) => {
                                const response = res.data

                                if (response.code === DATABASE_DELETE_SUCCESS) {
                                    void message.success('删除成功')
                                    setTimeout(() => {
                                        getUser()
                                    })
                                } else {
                                    void message.error('删除失败，请稍后重试')
                                }
                            })
                            .finally(() => {
                                setIsLoadingUserData(false)
                            })
                    }
                },
                () => {}
            )
    }

    const handleOnChangePasswordBtnClick = (value: UserWithRoleInfoVo) => {
        return () => {
            changePasswordForm.setFieldValue('id', value.id)
            changePasswordForm.setFieldValue('password', undefined)
            changePasswordForm.setFieldValue('passwordConfirm', undefined)
            changePasswordForm.setFieldValue(
                'needChangePassword',
                value.credentialsExpiration && isPastTime(value.credentialsExpiration)
            )
            void modal.confirm({
                centered: true,
                mask: { closable: true },
                icon: (
                    <Icon style={{ color: theme.colorPrimary }} component={IconConsolePassword} />
                ),
                title: `修改用户 ${value.username} 的密码`,
                content: (
                    <AntdForm
                        form={changePasswordForm}
                        style={{ marginTop: 20 }}
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        ref={() => {
                            setTimeout(() => {
                                changePasswordForm?.getFieldInstance('password')?.focus()
                            }, 50)
                        }}
                    >
                        <AntdForm.Item
                            name={'password'}
                            label={'密码'}
                            rules={[{ required: true, whitespace: true }]}
                        >
                            <AntdInput.Password placeholder={'请输入密码'} />
                        </AntdForm.Item>
                        <AntdForm.Item
                            name={'passwordConfirm'}
                            label={'确认密码'}
                            rules={[
                                {
                                    required: true
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve()
                                        }
                                        return Promise.reject(Error('两次密码输入不一致'))
                                    }
                                })
                            ]}
                        >
                            <AntdInput.Password placeholder={'请确认密码'} />
                        </AntdForm.Item>
                        {value.id !== '0' && (
                            <AntdForm.Item
                                name={'needChangePassword'}
                                label={'需改密'}
                                valuePropName={'checked'}
                                rules={[{ type: 'boolean' }]}
                            >
                                <AntdSwitch />
                            </AntdForm.Item>
                        )}
                    </AntdForm>
                ),
                onOk: () =>
                    changePasswordForm
                        .validateFields()
                        .then(
                            () => {
                                return new Promise<void>((resolve, reject) => {
                                    r_sys_user_change_password({
                                        id: changePasswordForm.getFieldValue('id') as string,
                                        password: changePasswordForm.getFieldValue(
                                            'password'
                                        ) as string,
                                        credentialsExpiration: (changePasswordForm.getFieldValue(
                                            'needChangePassword'
                                        ) as boolean)
                                            ? getNowUtc()
                                            : undefined
                                    }).then((res) => {
                                        const response = res.data
                                        if (response.success) {
                                            void message.success('修改密码成功')
                                            resolve()
                                        } else {
                                            reject(response.msg)
                                        }
                                    })
                                })
                            },
                            () => {
                                return new Promise((_, reject) => {
                                    reject('输入有误')
                                })
                            }
                        )
                        .then(() => {
                            getUser()
                        })
            })
        }
    }

    const handleOnEditBtnClick = (value: UserWithRoleInfoVo) => {
        return () => {
            setIsDrawerEdit(true)
            setIsDrawerOpen(true)

            form.setFieldValue('id', value.id)
            form.setFieldValue('username', value.username)
            form.setFieldValue('password', undefined)
            form.setFieldValue('verified', !value.verify?.length)
            form.setFieldValue('locking', value.locking)
            form.setFieldValue('expiration', value.expiration)
            form.setFieldValue('credentialsExpiration', value.credentialsExpiration)
            form.setFieldValue('enable', value.enable)
            form.setFieldValue('nickname', value.userInfo.nickname)
            form.setFieldValue('avatar', value.userInfo.avatar)
            form.setFieldValue('email', value.userInfo.email)
            form.setFieldValue(
                'roleIds',
                value.roles.map((role) => role.id)
            )
            form.setFieldValue(
                'groupIds',
                value.groups.map((group) => group.id)
            )
            if (!roleData || !roleData.length) {
                getRoleData()
            }
            if (!groupData || !groupData.length) {
                getGroupData()
            }
            void form.validateFields()
        }
    }

    const handleOnDeleteBtnClick = (value: UserWithRoleInfoVo) => {
        return () => {
            modal
                .confirm({
                    centered: true,
                    mask: { closable: true },
                    title: '确定删除',
                    content: `确定删除用户 ${value.username} 吗？`
                })
                .then(
                    (confirmed) => {
                        if (confirmed) {
                            setIsLoadingUserData(true)

                            r_sys_user_delete(value.id)
                                .then((res) => {
                                    const response = res.data
                                    if (response.code === DATABASE_DELETE_SUCCESS) {
                                        void message.success('删除成功')
                                        setTimeout(() => {
                                            getUser()
                                        })
                                    } else {
                                        void message.error('删除失败，请稍后重试')
                                    }
                                })
                                .finally(() => {
                                    setIsLoadingUserData(false)
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
        if (isDrawerSubmitting) {
            return
        }

        setIsDrawerSubmitting(true)

        if (isDrawerEdit) {
            r_sys_user_update({
                ...formValues,
                expiration: formValues.expiration
                    ? localTimeToUtc(formValues.expiration)
                    : undefined,
                credentialsExpiration: formValues.credentialsExpiration
                    ? localTimeToUtc(formValues.credentialsExpiration)
                    : undefined
            })
                .then((res) => {
                    const response = res.data
                    switch (response.code) {
                        case DATABASE_UPDATE_SUCCESS:
                            setIsDrawerOpen(false)
                            void message.success('更新成功')
                            getUser()
                            break
                        case DATABASE_DUPLICATE_KEY:
                            void message.error('已存在相同用户名或邮箱')
                            break
                        default:
                            void message.error('更新失败，请稍后重试')
                    }
                })
                .finally(() => {
                    setIsDrawerSubmitting(false)
                })
        } else {
            r_sys_user_add({
                ...formValues,
                expiration: formValues.expiration
                    ? localTimeToUtc(formValues.expiration)
                    : undefined,
                credentialsExpiration: formValues.credentialsExpiration
                    ? localTimeToUtc(formValues.credentialsExpiration)
                    : undefined
            })
                .then((res) => {
                    const response = res.data
                    switch (response.code) {
                        case DATABASE_INSERT_SUCCESS:
                            setIsDrawerOpen(false)
                            void message.success('添加成功')
                            setNewFormValues(undefined)
                            getUser()
                            break
                        case DATABASE_DUPLICATE_KEY:
                            void message.error('已存在相同用户名或邮箱')
                            break
                        default:
                            void message.error('添加失败，请稍后重试')
                    }
                })
                .finally(() => {
                    setIsDrawerSubmitting(false)
                })
        }
    }

    const handleOnSearchValueChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value)

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

    const handleOnSearchValueKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            getUser()
        }
    }

    const handleOnSearchTypeChange = (value: string) => {
        setSearchType(value)
    }

    const handleOnUseRegexChange = (e: _CheckboxChangeEvent) => {
        setIsUseRegex(e.target.checked)
        if (e.target.checked) {
            try {
                RegExp(searchValue)
                setIsRegexLegal(!(searchValue.includes('{}') || searchValue.includes('[]')))
            } catch (e) {
                setIsRegexLegal(false)
            }
        } else {
            setIsRegexLegal(true)
        }
    }

    const handleOnQueryBtnClick = () => {
        getUser()
    }

    const getUser = () => {
        if (isLoadingUserData) {
            return
        }

        if (!isRegexLegal) {
            void message.error('非法正则表达式')
            return
        }

        setIsLoadingUserData(true)

        r_sys_user_get({
            currentPage: tableParams.pagination?.current,
            pageSize: tableParams.pagination?.pageSize,
            sortField:
                tableParams.sortField && tableParams.sortOrder
                    ? (tableParams.sortField as string)
                    : undefined,
            sortOrder:
                tableParams.sortField && tableParams.sortOrder ? tableParams.sortOrder : undefined,
            searchType,
            searchValue: searchValue.trim().length ? searchValue : undefined,
            searchRegex: isUseRegex ? isUseRegex : undefined,
            ...tableParams.filters
        })
            .then((res) => {
                const response = res.data
                if (response.code === DATABASE_SELECT_SUCCESS) {
                    const records = response.data?.records

                    records && setUserData(records)
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
                setIsLoadingUserData(false)
            })
    }

    const handleOnDrawerRefresh = () => {
        getRoleData()
        getGroupData()
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

    const getGroupData = () => {
        if (isLoadingGroup) {
            return
        }

        setIsLoadingGroup(true)

        r_sys_group_get_list()
            .then((res) => {
                const response = res.data

                if (response.code === DATABASE_SELECT_SUCCESS) {
                    response.data && setGroupData(response.data)
                } else {
                    void message.error('获取用户组列表失败，请稍后重试')
                }
            })
            .finally(() => {
                setIsLoadingGroup(false)
            })
    }

    const getAvatar = () => {
        r_sys_avatar_generate().then((res) => {
            const response = res.data
            if (response.success) {
                response.data && setAvatar(response.data)
                response.data && form.setFieldValue('avatar', response.data)
            }
        })
    }

    useEffect(() => {
        form.validateFields({ validateOnly: true }).then(
            () => {
                setIsDrawerSubmittable(true)
            },
            () => {
                setIsDrawerSubmittable(false)
            }
        )

        if (!isDrawerEdit && formValues) {
            setNewFormValues({
                username: formValues.username,
                verified: formValues.verified,
                locking: formValues.locking,
                expiration: formValues.expiration,
                credentialsExpiration: formValues.credentialsExpiration,
                enable: formValues.enable,
                nickname: formValues.nickname,
                avatar: formValues.avatar,
                email: formValues.email,
                roleIds: formValues.roleIds,
                groupIds: formValues.groupIds
            })
        }
    }, [formValues])

    useEffect(() => {
        getUser()
    }, [
        JSON.stringify(tableParams.filters),
        JSON.stringify(tableParams.sortField),
        JSON.stringify(tableParams.sortOrder),
        JSON.stringify(tableParams.pagination?.pageSize),
        JSON.stringify(tableParams.pagination?.current)
    ])

    const addAndEditForm = (
        <AntdForm form={form} disabled={isDrawerSubmitting} layout={'vertical'}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: 20
                }}
            >
                <AntdTooltip title={'点击获取新头像'}>
                    <AntdAvatar
                        src={
                            <img
                                src={`data:image/png;base64,${
                                    isDrawerEdit ? formValues?.avatar : avatar
                                }`}
                                alt={''}
                            />
                        }
                        size={100}
                        style={{ background: theme.colorBgLayout, cursor: 'pointer' }}
                        onClick={getAvatar}
                    />
                </AntdTooltip>
            </div>
            <AntdForm.Item hidden name={'avatar'}>
                <AntdInput />
            </AntdForm.Item>
            <AntdForm.Item hidden name={'id'} label={'ID'}>
                <AntdInput disabled />
            </AntdForm.Item>
            <AntdForm.Item
                name={'username'}
                label={'用户名'}
                rules={[{ required: true, whitespace: true }]}
            >
                <AntdInput allowClear placeholder={'请输入用户名'} />
            </AntdForm.Item>
            {!isDrawerEdit && (
                <AntdForm.Item
                    name={'password'}
                    label={'密码'}
                    rules={[{ required: true, whitespace: true }]}
                >
                    <AntdInput.Password allowClear placeholder={'请输入密码'} />
                </AntdForm.Item>
            )}
            <AntdForm.Item
                name={'nickname'}
                label={'昵称'}
                rules={[{ required: true, whitespace: true }]}
            >
                <AntdInput allowClear placeholder={'请输入昵称'} />
            </AntdForm.Item>
            <AntdForm.Item
                name={'email'}
                label={'邮箱'}
                rules={[{ required: true, type: 'email' }]}
            >
                <AntdInput type={'email'} allowClear placeholder={'请输入邮箱'} />
            </AntdForm.Item>
            {formValues?.id !== '0' && (
                <>
                    <AntdForm.Item name={'roleIds'} label={'角色'}>
                        <AntdSelect
                            mode={'multiple'}
                            allowClear
                            showSearch={{ filterOption }}
                            options={roleData.map((value) => ({
                                value: value.id,
                                label: `${value.name}${!value.enable ? '(已禁用)' : ''}`
                            }))}
                            placeholder={'请选择角色'}
                        />
                    </AntdForm.Item>
                    <AntdForm.Item name={'groupIds'} label={'用户组'}>
                        <AntdSelect
                            mode={'multiple'}
                            allowClear
                            showSearch={{ filterOption }}
                            options={groupData.map((value) => ({
                                value: value.id,
                                label: `${value.name}${!value.enable ? '(已禁用)' : ''}`
                            }))}
                            placeholder={'请选择用户组'}
                        />
                    </AntdForm.Item>
                    <AntdForm.Item name={'verified'} label={'验证'}>
                        <AntdSwitch checkedChildren={'已验证'} unCheckedChildren={'未验证'} />
                    </AntdForm.Item>
                    <AntdForm.Item name={'locking'} label={'锁定'}>
                        <AntdSwitch checkedChildren={'已锁定'} unCheckedChildren={'未锁定'} />
                    </AntdForm.Item>
                    <AntdForm.Item
                        name={'expiration'}
                        label={'过期时间'}
                        getValueProps={(date: string) => (date ? { value: dayjs(date) } : {})}
                        getValueFromEvent={(date: dayjs.Dayjs | null) =>
                            date ? dayjsToUtc(date) : undefined
                        }
                    >
                        <AntdDatePicker showTime allowClear style={{ width: '100%' }} />
                    </AntdForm.Item>
                    <AntdForm.Item
                        name={'credentialsExpiration'}
                        label={'认证过期时间'}
                        getValueProps={(date: string) => (date ? { value: dayjs(date) } : {})}
                        getValueFromEvent={(date: dayjs.Dayjs | null) =>
                            date ? dayjsToUtc(date) : undefined
                        }
                    >
                        <AntdDatePicker showTime allowClear style={{ width: '100%' }} />
                    </AntdForm.Item>
                    <AntdForm.Item name={'enable'} label={'启用'}>
                        <AntdSwitch checkedChildren={'启用'} unCheckedChildren={'禁用'} />
                    </AntdForm.Item>
                </>
            )}
        </AntdForm>
    )

    const toolbar = (
        <FlexBox direction={'horizontal'} gap={10}>
            <Permission operationCode={['system:user:one:add']}>
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
                    <AntdSelect
                        value={searchType}
                        onChange={handleOnSearchTypeChange}
                        style={{ width: '6em' }}
                        styles={{ popup: { listItem: { textAlign: 'center' } } }}
                        options={[
                            { label: '全部', value: 'ALL' },
                            { label: 'ID', value: 'ID' },
                            { label: '用户名', value: 'USERNAME' },
                            { label: '昵称', value: 'NICKNAME' },
                            { label: '邮箱', value: 'EMAIL' }
                        ]}
                    />
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
                        value={searchValue}
                        onChange={handleOnSearchValueChange}
                        onKeyDown={handleOnSearchValueKeyDown}
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
                dataSource={userData}
                pagination={tableParams.pagination}
                loading={isLoadingUserData}
                scroll={{ x: true }}
                onChange={handleOnTableChange}
                rowSelection={
                    hasPermission('system:user:all:remove')
                        ? {
                              type: 'checkbox',
                              onChange: handleOnTableSelectChange,
                              getCheckboxProps: (record) => ({ disabled: record.id === '0' })
                          }
                        : undefined
                }
            />
        </Card>
    )

    const drawerToolbar = (
        <AntdSpace>
            <AntdTooltip title={'刷新角色和用户组列表'}>
                <AntdButton onClick={handleOnDrawerRefresh} disabled={isDrawerSubmitting}>
                    <Icon component={IconConsoleRefresh} />
                </AntdButton>
            </AntdTooltip>
            <AntdButton onClick={handleOnDrawerClose} disabled={isDrawerSubmitting}>
                取消
            </AntdButton>
            <AntdButton
                type={'primary'}
                disabled={!isDrawerSubmittable}
                loading={isDrawerSubmitting}
                onClick={handleOnSubmit}
            >
                提交
            </AntdButton>
        </AntdSpace>
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
                title={isDrawerEdit ? '编辑用户' : '新增用户'}
                onClose={handleOnDrawerClose}
                open={isDrawerOpen}
                closable={!isDrawerSubmitting}
                mask={{ closable: !isDrawerSubmitting }}
                extra={drawerToolbar}
            >
                {addAndEditForm}
            </AntdDrawer>
        </>
    )
}

export default User
