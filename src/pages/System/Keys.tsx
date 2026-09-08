import { MouseEvent } from 'react'
import dayjs from 'dayjs'
import { Button } from 'antd'
import Icon from '@ant-design/icons'
import useStyles from '@/assets/css/pages/system/keys.style'
import { DATABASE_NO_RECORD_FOUND, DATABASE_SELECT_SUCCESS } from '@/constants/common.constants'
import { message, modal } from '@/utils/common'
import { dayjsToUtc, isPastTime, utcToLocalTime } from '@/utils/datetime'
import { navigateToUsage, navigateToUserManagement } from '@/utils/navigation'
import {
    r_sys_api__key_regenerate,
    r_sys_api_key_add,
    r_sys_api_key_available_apis,
    r_sys_api_key_delete,
    r_sys_api_key_get,
    r_sys_api_key_update,
    r_sys_user_info_get_basic_by_id
} from '@/services/system'
import FitFullscreen from '@/components/common/FitFullscreen'
import HideScrollbar from '@/components/common/HideScrollbar'
import FlexBox from '@/components/common/FlexBox'
import Card from '@/components/common/Card'
import Permission from '@/components/common/Permission'

const Keys = () => {
    const navigate = useNavigate()
    const { userId } = useParams()
    const { styles, theme } = useStyles()
    const [createForm] = AntdForm.useForm<
        ApiKeyAddParam & { permissionCodesSet: string[][]; ipWhitelistSet: string[] }
    >()
    const [editForm] = AntdForm.useForm<
        ApiKeyUpdateParam & { permissionCodesSet: string[][]; ipWhitelistSet: string[] }
    >()
    const isFormSubmittingRef = useRef(false)
    const [powerTreeData, setPowerTreeData] = useState<_OptionType[]>([])
    const [keysData, setKeysData] = useState<ApiKeyVo[]>([])
    const [userData, setUserData] = useState<UserWithInfoVo>()
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
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingAvailableKeys, setIsLoadingAvailableKeys] = useState(false)

    const dataColumns: _ColumnsType<ApiKeyVo> = [
        {
            title: '名称',
            dataIndex: 'name',
            ellipsis: true
        },
        {
            title: 'Access Key',
            dataIndex: 'accessKey',
            ellipsis: true
        },
        {
            title: '状态',
            dataIndex: 'enable',
            align: 'center',
            ellipsis: true,
            render: (value, record) =>
                value ? (
                    isPastTime(record.expireTime) ? (
                        <AntdTag color={'warning'}>过期</AntdTag>
                    ) : (
                        <AntdTag color={'success'}>启用</AntdTag>
                    )
                ) : (
                    <AntdTag>禁用</AntdTag>
                )
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            align: 'center',
            ellipsis: true,
            render: (value: string) => utcToLocalTime(value, 'YYYY-MM-DD HH:mm:ss')
        },
        {
            title: '最后使用时间',
            dataIndex: 'lastUsedTime',
            align: 'center',
            ellipsis: true,
            render: (value: string) =>
                value ? utcToLocalTime(value, 'YYYY-MM-DD HH:mm:ss') : '未使用'
        },
        {
            align: 'center',
            render: (_, record) => (
                <AntdSpace size={0}>
                    <Permission operationCode={['system:api-keys:one:regenerate']}>
                        <Button
                            icon={<Icon component={IconConsoleRefresh} />}
                            type={'text'}
                            onClick={handleOnRegenerateBtnClick(record)}
                        />
                    </Permission>
                    <Permission operationCode={['system:api-keys:one:modify']}>
                        <Button
                            icon={<Icon component={IconConsoleEdit} />}
                            type={'text'}
                            onClick={handleOnEditBtnClick(record)}
                        />
                    </Permission>
                    <Permission operationCode={['system:api-keys:one:remove']}>
                        <Button
                            icon={<Icon component={IconConsoleDelete} />}
                            type={'text'}
                            onClick={handleOnDeleteBtnClick(record)}
                        />
                    </Permission>
                </AntdSpace>
            )
        }
    ]

    const handleOnTableChange = (
        pagination: _TablePaginationConfig,
        filters: Record<string, _FilterValue | null>,
        sorter: _SorterResult<ApiKeyVo> | _SorterResult<ApiKeyVo>[]
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
            setKeysData([])
        }
    }

    const handleOnCreateBtnClick = async () => {
        createForm.resetFields()

        let powerTree = powerTreeData
        if (!powerTree.length) {
            void message.loading({ content: '获取可用 API 中……', key: 'LOADING', duration: 0 })
            powerTree = await getAvailableApis()
            void message.destroy('LOADING')
        }

        void modal.confirm({
            centered: true,
            icon: <></>,
            title: '创建 API key',
            content: (
                <AntdForm
                    form={createForm}
                    layout={'vertical'}
                    requiredMark={'optional'}
                    style={{ marginTop: 16 }}
                >
                    <AntdForm.Item
                        name={'name'}
                        label={'名称'}
                        rules={[{ required: true, whitespace: true }]}
                    >
                        <AntdInput maxLength={50} placeholder={'请输入名称'} />
                    </AntdForm.Item>
                    <AntdForm.Item name={'permissionCodesSet'} label={'权限'}>
                        <AntdCascader
                            options={powerTree}
                            displayRender={(label) => label.join('-')}
                            multiple
                            allowClear
                            showCheckedStrategy={'SHOW_CHILD'}
                            placeholder={'请选择权限'}
                        />
                    </AntdForm.Item>
                    <AntdForm.Item
                        name={'expireTime'}
                        label={'过期时间'}
                        getValueProps={(date: string) => (date ? { value: dayjs(date) } : {})}
                        getValueFromEvent={(date: dayjs.Dayjs | null) =>
                            date ? dayjsToUtc(date) : undefined
                        }
                    >
                        <AntdDatePicker showTime allowClear style={{ width: '100%' }} />
                    </AntdForm.Item>
                    <AntdForm.Item
                        name={'ipWhitelistSet'}
                        label={'IP 白名单（IP/CIDR）'}
                        rules={[
                            {
                                validator: (_, value: string[]) => {
                                    if (!value || !value.length) {
                                        return Promise.resolve()
                                    }
                                    const invalid = value.filter((v) => !validateIpOrCIDR(v))
                                    if (invalid.length) {
                                        return Promise.reject(
                                            new Error(`无效的 IP/CIDR 格式: ${invalid.join(', ')}`)
                                        )
                                    }
                                    return Promise.resolve()
                                }
                            }
                        ]}
                    >
                        <AntdSelect
                            mode={'tags'}
                            styles={{ popup: { root: { display: 'none' } } }}
                            suffixIcon={<></>}
                            placeholder={'不限制'}
                        />
                    </AntdForm.Item>
                    <AntdForm.Item name={'remark'} label={'备注'}>
                        <AntdInput.TextArea maxLength={200} />
                    </AntdForm.Item>
                    <AntdCollapse
                        styles={{
                            header: { padding: 0 },
                            body: { paddingLeft: 0, paddingRight: 0 }
                        }}
                        items={[
                            {
                                label: '高级选项',
                                children: (
                                    <>
                                        <AntdForm.Item
                                            name={'rateLimit'}
                                            label={'每分钟限流次数 (0=用全局默认)'}
                                        >
                                            <AntdInputNumber
                                                style={{ width: '100%' }}
                                                min={0}
                                                precision={0}
                                            />
                                        </AntdForm.Item>
                                        <AntdForm.Item
                                            name={'quota'}
                                            label={'周期额度次数 (0=用全局默认)'}
                                        >
                                            <AntdInputNumber
                                                style={{ width: '100%' }}
                                                min={0}
                                                precision={0}
                                            />
                                        </AntdForm.Item>
                                        <AntdForm.Item name={'quotaPeriod'} label={'额度周期(秒)'}>
                                            <AntdInputNumber
                                                style={{ width: '100%' }}
                                                min={1}
                                                precision={0}
                                            />
                                        </AntdForm.Item>
                                    </>
                                )
                            }
                        ]}
                        ghost
                    />
                </AntdForm>
            ),
            okText: '创建',
            onOk: () =>
                createForm.validateFields().then(
                    () =>
                        new Promise<void>((resolve, reject) => {
                            if (isFormSubmittingRef.current) {
                                reject()
                            }
                            isFormSubmittingRef.current = true

                            r_sys_api_key_add({
                                userId,
                                name: createForm.getFieldValue('name') as string,
                                permissionCodes: (
                                    createForm.getFieldValue('permissionCodesSet') as
                                        string[][] | undefined
                                )?.map((value) => value[value.length - 1]),
                                expireTime: createForm.getFieldValue('expireTime') as string,
                                ipWhitelist: (
                                    createForm.getFieldValue('ipWhitelistSet') as
                                        string[] | undefined
                                )?.join(','),
                                rateLimit: createForm.getFieldValue('rateLimit') as number,
                                quota: createForm.getFieldValue('quota') as number,
                                quotaPeriod: createForm.getFieldValue('quotaPeriod') as number,
                                remark: createForm.getFieldValue('remark') as string
                            })
                                .then((res) => {
                                    const response = res.data
                                    if (response.success) {
                                        const {
                                            apiKey: { accessKey },
                                            secretKey
                                        } = response.data!
                                        showCreateResult(accessKey, secretKey)
                                        resolve()
                                    } else {
                                        void message.error('出错了，请稍后重试')
                                        reject()
                                    }
                                })
                                .finally(() => {
                                    isFormSubmittingRef.current = false
                                })
                        }),
                    () => new Promise((_, reject) => reject('输入有误'))
                ),
            onCancel: () =>
                new Promise<void>((resolve, reject) => {
                    isFormSubmittingRef.current ? reject() : resolve()
                })
        })
    }

    const handleOnShowDetail = (record: ApiKeyVo) => {
        return async () => {
            let powerTree = powerTreeData
            if (!powerTree.length) {
                void message.loading({ content: '获取可用 API 中……', key: 'LOADING', duration: 0 })
                powerTree = await getAvailableApis()
                void message.destroy('LOADING')
            }

            void modal.info({
                centered: true,
                mask: { closable: true },
                width: 'fit-content',
                title: 'API Key 信息',
                content: (
                    <AntdDescriptions
                        items={[
                            {
                                label: '名称',
                                children: record.name,
                                span: 1.5
                            },
                            {
                                label: '状态',
                                children: record.enable ? (
                                    isPastTime(record.expireTime) ? (
                                        <AntdTag color={'warning'}>过期</AntdTag>
                                    ) : (
                                        <AntdTag color={'success'}>启用</AntdTag>
                                    )
                                ) : (
                                    <AntdTag>禁用</AntdTag>
                                ),
                                span: 1.5
                            },
                            {
                                label: '权限',
                                children: (
                                    <AntdTree
                                        treeData={powerTree}
                                        fieldNames={{ key: 'value', title: 'label' }}
                                        checkable
                                        checkedKeys={record.permissions}
                                    />
                                ),
                                span: 1.5
                            },
                            {
                                label: 'IP 白名单',
                                children: (
                                    <AntdSpace wrap>
                                        {record.ipWhitelist?.split(',')?.map((item) => (
                                            <AntdTag>{item}</AntdTag>
                                        ))}
                                    </AntdSpace>
                                ),
                                span: 1.5
                            },
                            {
                                label: '备注',
                                children: record.remark,
                                span: 'filled'
                            },
                            {
                                label: '每分钟限流次数',
                                children: record.rateLimit || '默认'
                            },
                            {
                                label: '周期额度次数',
                                children: record.quota || '默认'
                            },
                            {
                                label: '额度周期(秒)',
                                children: record.quotaPeriod
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
                            },
                            {
                                label: '过期时间',
                                children: record.expireTime && utcToLocalTime(record.expireTime),
                                style: { wordBreak: 'keep-all' },
                                span: 1.5
                            },
                            {
                                label: '最后使用时间',
                                children: record.lastUsedTime
                                    ? utcToLocalTime(record.lastUsedTime)
                                    : '未使用',
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

    const handleOnRegenerateBtnClick = (record: ApiKeyVo) => {
        return (e: MouseEvent) => {
            e.stopPropagation()

            modal
                .confirm({
                    centered: true,
                    mask: { closable: true },
                    title: '重新生成',
                    content: `原 Secret Key 将会立即失效，确定重新生成 ${record.name} 吗？`
                })
                .then(
                    (confirmed) => {
                        if (confirmed) {
                            setIsLoading(true)

                            r_sys_api__key_regenerate(record.id)
                                .then((res) => {
                                    const response = res.data
                                    if (response.success) {
                                        const {
                                            apiKey: { accessKey },
                                            secretKey
                                        } = response.data!
                                        showCreateResult(accessKey, secretKey)
                                    } else {
                                        void message.error('生成失败，请稍后重试')
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

    const handleOnEditBtnClick = (record: ApiKeyVo) => {
        return async (e: MouseEvent) => {
            e.stopPropagation()

            let powerTree = powerTreeData
            if (!powerTree.length) {
                void message.loading({ content: '获取可用 API 中……', key: 'LOADING', duration: 0 })
                powerTree = await getAvailableApis()
                void message.destroy('LOADING')
            }

            const codeToIdsMap: Map<string, string[]> = new Map()

            powerTree.forEach((p) => {
                p.children?.forEach((i) => {
                    codeToIdsMap.set(i.value as string, [p.value as string, i.value as string])
                })
            })

            editForm.setFieldsValue({
                ...record,
                permissionCodesSet: record.permissions
                    ?.map((code) => codeToIdsMap.get(code))
                    ?.filter((v) => !!v),
                ipWhitelistSet: record.ipWhitelist?.length
                    ? record.ipWhitelist.split(',')
                    : undefined
            })

            void modal.confirm({
                centered: true,
                icon: <></>,
                title: '修改 API key',
                content: (
                    <AntdForm
                        form={editForm}
                        layout={'vertical'}
                        requiredMark={'optional'}
                        style={{ marginTop: 16 }}
                    >
                        <AntdForm.Item name={'id'} hidden>
                            <AntdInput disabled />
                        </AntdForm.Item>
                        <AntdForm.Item
                            name={'name'}
                            label={'名称'}
                            rules={[{ required: true, whitespace: true }]}
                        >
                            <AntdInput maxLength={50} placeholder={'请输入名称'} />
                        </AntdForm.Item>
                        <AntdForm.Item name={'permissionCodesSet'} label={'权限'}>
                            <AntdCascader
                                options={powerTree}
                                displayRender={(label) => label.join('-')}
                                multiple
                                allowClear
                                showCheckedStrategy={'SHOW_CHILD'}
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
                        <AntdForm.Item
                            name={'expireTime'}
                            label={'过期时间'}
                            getValueProps={(date: string) => (date ? { value: dayjs(date) } : {})}
                            getValueFromEvent={(date: dayjs.Dayjs | null) =>
                                date ? dayjsToUtc(date) : undefined
                            }
                        >
                            <AntdDatePicker showTime allowClear style={{ width: '100%' }} />
                        </AntdForm.Item>
                        <AntdForm.Item
                            name={'ipWhitelistSet'}
                            label={'IP 白名单（IP/CIDR）'}
                            rules={[
                                {
                                    validator: (_, value: string[]) => {
                                        if (!value || !value.length) {
                                            return Promise.resolve()
                                        }
                                        const invalid = value.filter((v) => !validateIpOrCIDR(v))
                                        if (invalid.length) {
                                            return Promise.reject(
                                                new Error(
                                                    `无效的 IP/CIDR 格式: ${invalid.join(', ')}`
                                                )
                                            )
                                        }
                                        return Promise.resolve()
                                    }
                                }
                            ]}
                        >
                            <AntdSelect
                                mode={'tags'}
                                styles={{ popup: { root: { display: 'none' } } }}
                                suffixIcon={<></>}
                                placeholder={'不限制'}
                            />
                        </AntdForm.Item>
                        <AntdForm.Item name={'remark'} label={'备注'}>
                            <AntdInput.TextArea maxLength={200} />
                        </AntdForm.Item>
                        <AntdCollapse
                            styles={{
                                header: { padding: 0 },
                                body: { paddingLeft: 0, paddingRight: 0 }
                            }}
                            items={[
                                {
                                    label: '高级选项',
                                    children: (
                                        <>
                                            <AntdForm.Item
                                                name={'rateLimit'}
                                                label={'每分钟限流次数 (0=用全局默认)'}
                                                rules={[{ required: true }]}
                                            >
                                                <AntdInputNumber
                                                    style={{ width: '100%' }}
                                                    min={0}
                                                    precision={0}
                                                />
                                            </AntdForm.Item>
                                            <AntdForm.Item
                                                name={'quota'}
                                                label={'周期额度次数 (0=用全局默认)'}
                                                rules={[{ required: true }]}
                                            >
                                                <AntdInputNumber
                                                    style={{ width: '100%' }}
                                                    min={0}
                                                    precision={0}
                                                />
                                            </AntdForm.Item>
                                            <AntdForm.Item
                                                name={'quotaPeriod'}
                                                label={'额度周期(秒)'}
                                                rules={[{ required: true }]}
                                            >
                                                <AntdInputNumber
                                                    style={{ width: '100%' }}
                                                    min={1}
                                                    precision={0}
                                                />
                                            </AntdForm.Item>
                                        </>
                                    )
                                }
                            ]}
                            ghost
                        />
                    </AntdForm>
                ),
                okText: '修改',
                onOk: () =>
                    editForm.validateFields().then(
                        () =>
                            new Promise<void>((resolve, reject) => {
                                if (isFormSubmittingRef.current) {
                                    reject()
                                }
                                isFormSubmittingRef.current = true

                                r_sys_api_key_update({
                                    id: editForm.getFieldValue('id') as string,
                                    name: editForm.getFieldValue('name') as string,
                                    permissionCodes: (
                                        editForm.getFieldValue('permissionCodesSet') as
                                            string[][] | undefined
                                    )?.map((value) => value[value.length - 1]),
                                    enable: editForm.getFieldValue('enable') as boolean,
                                    expireTime: editForm.getFieldValue('expireTime') as string,
                                    ipWhitelist: (
                                        editForm.getFieldValue('ipWhitelistSet') as
                                            string[] | undefined
                                    )?.join(','),
                                    rateLimit: editForm.getFieldValue('rateLimit') as number,
                                    quota: editForm.getFieldValue('quota') as number,
                                    quotaPeriod: editForm.getFieldValue('quotaPeriod') as number,
                                    remark: editForm.getFieldValue('remark') as string
                                })
                                    .then((res) => {
                                        const response = res.data
                                        if (response.success) {
                                            void message.success('修改成功')
                                            setTimeout(() => getKeys())
                                            resolve()
                                        } else {
                                            void message.error('出错了，请稍后重试')
                                            reject()
                                        }
                                    })
                                    .finally(() => {
                                        isFormSubmittingRef.current = false
                                    })
                            }),
                        () => new Promise((_, reject) => reject('输入有误'))
                    ),
                onCancel: () =>
                    new Promise<void>((resolve, reject) => {
                        isFormSubmittingRef.current ? reject() : resolve()
                    })
            })
        }
    }

    const handleOnDeleteBtnClick = (record: ApiKeyVo) => {
        return (e: MouseEvent) => {
            e.stopPropagation()

            modal
                .confirm({
                    centered: true,
                    mask: { closable: true },
                    title: '确定删除',
                    content: `确定删除 ${record.name} 吗？`
                })
                .then(
                    (confirmed) => {
                        if (confirmed) {
                            setIsLoading(true)

                            r_sys_api_key_delete(record.id)
                                .then((res) => {
                                    const response = res.data
                                    if (response.success) {
                                        void message.success('删除成功')
                                        setTimeout(() => {
                                            getKeys()
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

    const getKeys = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)

        r_sys_api_key_get({
            userId,
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
                if (response.success) {
                    const records = response.data!.records
                    setKeysData(records)
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

    const showCreateResult = (accessKey: string, secretKey: string) => {
        modal.info({
            centered: true,
            icon: <></>,
            title: '创建成功',
            content: (
                <FlexBox direction={'vertical'} gap={10}>
                    <AntdAlert
                        title={'请妥善保管 API Key'}
                        description={
                            '出于安全原因，你将无法通过 API keys 管理界面再次查看它。如果你丟失了这个 key，将需要重新创建。'
                        }
                    />
                    <AntdDescriptions
                        items={[
                            {
                                label: 'Access Key',
                                children: (
                                    <AntdSpace.Compact block>
                                        <AntdInput value={accessKey} suffix={<></>} />
                                        <AntdButton
                                            onClick={async () => {
                                                try {
                                                    await navigator.clipboard.writeText(accessKey)
                                                    void message.success('已复制到剪切板')
                                                } catch (_) {
                                                    void message.error('复制失败')
                                                }
                                            }}
                                        >
                                            复制
                                        </AntdButton>
                                    </AntdSpace.Compact>
                                ),
                                span: 'filled'
                            },
                            {
                                label: 'Secret Key',
                                children: (
                                    <AntdSpace.Compact block>
                                        <AntdInput.Password value={secretKey} />
                                        <AntdButton
                                            onClick={async () => {
                                                try {
                                                    await navigator.clipboard.writeText(secretKey)
                                                    void message.success('已复制到剪切板')
                                                } catch (_) {
                                                    void message.error('复制失败')
                                                }
                                            }}
                                        >
                                            复制
                                        </AntdButton>
                                    </AntdSpace.Compact>
                                ),
                                span: 'filled'
                            }
                        ]}
                    />
                </FlexBox>
            ),
            onOk: () => getKeys()
        })
    }

    const availableApisToPowerTree = (apiGroups: ApiGroupVo[]): _OptionType[] =>
        apiGroups.map(({ pluginId, pluginName, interfaces }) => ({
            label: pluginName,
            value: pluginId,
            children: interfaces.map(({ name, code }) => ({
                label: name,
                value: code
            }))
        }))

    const getAvailableApis = async () => {
        if (isLoadingAvailableKeys) {
            return []
        }
        setIsLoadingAvailableKeys(true)

        return await r_sys_api_key_available_apis(userId!)
            .then((res) => {
                const response = res.data
                if (response.code === DATABASE_SELECT_SUCCESS) {
                    const powerTree = availableApisToPowerTree(response.data!)
                    setPowerTreeData(powerTree)
                    return powerTree
                } else {
                    void message.error('获取可用 API 列表失败，请稍后重试')
                    return []
                }
            })
            .catch(() => {
                return []
            })
            .finally(() => setIsLoadingAvailableKeys(false))
    }

    const validateIpOrCIDR = (value: string) => {
        const IP_CIDR_REGEX =
            /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/([1-9]|[1-2][0-9]|3[0-2]))?$/

        return IP_CIDR_REGEX.test(value)
    }

    useEffect(() => {
        getKeys()
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
                            navigateToUserManagement(navigate)
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

                <AntdSpace>
                    <Permission operationCode={['system:operations:usage:query']}>
                        <AntdButton
                            onClick={() => navigateToUsage(navigate, userId!)}
                            size={'small'}
                        >
                            用量信息
                        </AntdButton>
                    </Permission>
                    <Permission operationCode={['system:api-keys:one:add']}>
                        <AntdButton
                            type={'primary'}
                            onClick={handleOnCreateBtnClick}
                            loading={isLoadingAvailableKeys}
                            size={'small'}
                        >
                            创建 API key
                        </AntdButton>
                    </Permission>
                </AntdSpace>
            </FlexBox>
        </Card>
    )

    const table = (
        <Card>
            <AntdTable
                rowKey={(record) => record.id}
                columns={dataColumns}
                dataSource={keysData}
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

export default Keys
