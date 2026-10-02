import { FormRule } from 'antd'
import Icon from '@ant-design/icons'
import { useTheme } from 'antd-style'
import {
    API_PLATFORM_PLUGIN_DATASOURCE_INVALID,
    DATABASE_SELECT_SUCCESS
} from '@/constants/common.constants'
import { r_sys_api_plugin_config_update, r_sys_api_plugin_datasource_test } from '@/services/system'
import { message } from '@/utils/common'
import FlexBox from '@/components/common/FlexBox'
import Permission from '@/components/common/Permission'
import SettingsCard from '@/components/system/SettingCard'

interface ConfigCardProps {
    pluginId: string
    group: ApiPluginConfigGroupVo
    datasource?: ApiPluginConfigDatasourceVo
    disabled?: boolean
    onEdited?: () => void
    onSaved?: () => void
    onReset?: () => void
}

const ConfigCard = ({
    pluginId,
    group,
    datasource,
    disabled,
    onEdited,
    onSaved,
    onReset
}: ConfigCardProps) => {
    const theme = useTheme()
    const [form] = AntdForm.useForm()
    const [changedFields, setChangedFields] = useState<Record<string, unknown>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isTesting, setIsTesting] = useState(false)

    const handleOnFieldChange = (changedValues: Partial<unknown>) => {
        onEdited?.()
        setChangedFields((prevState) => ({ ...prevState, ...changedValues }))
    }

    const handleOnTest = () => {
        if (!datasource || isTesting) {
            return
        }
        setIsTesting(true)

        const values = datasource.keys.flatMap((key) => {
            if (!(key in changedFields)) {
                return []
            }

            const field = group.fields.find((item) => item.key === key)
            if (!field) {
                return []
            }

            const value = form.getFieldValue(key)

            return [{ key, value: String(value ?? '') }]
        })

        r_sys_api_plugin_datasource_test(pluginId, { name: datasource.name, values })
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case DATABASE_SELECT_SUCCESS:
                        void message.success(`数据源 ${datasource.name} 连接成功`)
                        break
                    case API_PLATFORM_PLUGIN_DATASOURCE_INVALID:
                        void message.error(`数据源 ${datasource.name} 连接失败：${response.msg}`)
                        break
                    default:
                        void message.error('测试连接失败，请稍后重试')
                }
            })
            .finally(() => {
                setIsTesting(false)
            })
    }

    const handleOnSave = () => {
        if (isSubmitting) {
            return
        }
        setIsSubmitting(true)

        form.validateFields(Object.keys(changedFields)).then(
            () => {
                r_sys_api_plugin_config_update({
                    pluginId,
                    groups: [
                        {
                            key: group.key,
                            values: Object.entries(changedFields).map(([key, value]) => ({
                                key,
                                value: String(value)
                            }))
                        }
                    ]
                })
                    .then((res) => {
                        const response = res.data
                        if (response.success) {
                            void message.success('保存成功')
                            onSaved?.()
                        } else {
                            void message.error(`保存失败，请稍后重试：${response.msg}`)
                        }
                    })
                    .finally(() => {
                        setIsSubmitting(false)
                    })
            },
            () => {
                setIsSubmitting(false)
            }
        )
    }

    useEffect(() => {
        setChangedFields({})
        form.setFieldsValue(Object.fromEntries(group.fields.map(({ key, value }) => [key, value])))
    }, [group])

    const renderConfigField = (field: ApiPluginConfigFieldVo) => {
        return (
            <AntdForm.Item
                key={field.key}
                name={field.key}
                label={
                    <AntdBadge
                        dot={Object.keys(changedFields).includes(field.key)}
                        styles={{ indicator: { backgroundColor: theme.colorPrimary } }}
                    >
                        {field.title ?? field.key}
                    </AntdBadge>
                }
                tooltip={tooltipOf(field)}
                valuePropName={field.type === 'BOOLEAN' ? 'checked' : undefined}
                rules={rulesOf(field)}
            >
                {controlOf(field)}
            </AntdForm.Item>
        )
    }

    const tooltipOf = (field: ApiPluginConfigFieldVo): ReactNode => {
        return (
            (field.description || field.default) && (
                <p>
                    {field.description ? `${field.description} ` : ''}
                    {(field.type === 'STRING' || field.type === 'TEXT') && field.default && (
                        <a
                            style={{ color: theme.colorPrimary, textDecoration: 'underline' }}
                            onClick={handleOnRestoreDefault(field)}
                        >
                            恢复默认
                        </a>
                    )}
                </p>
            )
        )
    }

    const handleOnRestoreDefault = (field: ApiPluginConfigFieldVo) => {
        return () => {
            form.setFieldValue(field.key, field.default)
            handleOnFieldChange({ [field.key]: field.default })
        }
    }

    const rulesOf = (field: ApiPluginConfigFieldVo): FormRule[] => {
        switch (field.type) {
            case 'NUMBER':
                return [
                    ...(field.required ? [{ type: 'number' as const, required: true }] : []),
                    ...(field.minimum !== null || field.maximum !== null
                        ? [
                              {
                                  type: 'number' as const,
                                  min: field.minimum ?? undefined,
                                  max: field.maximum ?? undefined
                              }
                          ]
                        : [])
                ]
            case 'BOOLEAN':
                return field.required ? [{ type: 'boolean' as const, required: true }] : []
            default:
                return [
                    ...(field.required ? [{ required: true, whitespace: true }] : []),
                    ...(field.minLength ? [{ min: field.minLength }] : []),
                    ...(field.maxLength ? [{ max: field.maxLength }] : []),
                    ...(field.pattern ? [{ pattern: new RegExp(field.pattern) }] : [])
                ]
        }
    }

    const controlOf = (field: ApiPluginConfigFieldVo) => {
        const placeholder = placeholderOf(field)

        switch (field.type) {
            case 'TEXT':
                return (
                    <AntdInput.TextArea
                        autoSize={{ minRows: 3, maxRows: 8 }}
                        maxLength={field.maxLength ?? undefined}
                        placeholder={placeholder}
                        allowClear
                    />
                )
            case 'NUMBER':
                return (
                    <AntdInputNumber
                        style={{ width: '100%' }}
                        min={field.minimum ?? undefined}
                        max={field.maximum ?? undefined}
                        precision={field.integer ? 0 : undefined}
                        placeholder={placeholder}
                    />
                )
            case 'BOOLEAN':
                return <AntdSwitch />
            case 'ENUM':
                return (
                    <AntdSelect
                        options={field.options.map((option) => ({
                            label: option.label ?? option.value,
                            value: option.value
                        }))}
                        placeholder={placeholder}
                    />
                )
            case 'SECRET':
                return (
                    <AntdInput.Password
                        maxLength={field.maxLength ?? undefined}
                        placeholder={placeholder}
                        allowClear
                    />
                )
            default:
                return (
                    <AntdInput
                        maxLength={field.maxLength ?? undefined}
                        placeholder={placeholder}
                        showCount
                        allowClear
                    />
                )
        }
    }

    const placeholderOf = (field: ApiPluginConfigFieldVo): string => {
        if (
            field.type === 'SECRET' &&
            field.hasValue &&
            !Object.keys(changedFields).includes(field.key)
        ) {
            return '********'
        }
        if (field.placeholder) {
            return field.placeholder
        }
        if (field.type !== 'STRING' && field.type !== 'TEXT' && field.default !== null) {
            return field.default
        }

        if (field.type === 'ENUM') {
            return '请选择'
        }

        return '请输入'
    }

    return (
        <SettingsCard
            key={group.key}
            icon={IconConsoleOption}
            title={
                <AntdSpace>
                    {group.title ?? group.key}
                    {group.description && <AntdTag>{group.description}</AntdTag>}
                </AntdSpace>
            }
            expand={
                datasource && (
                    <Permission operationCode={['system:plugin:config:modify']}>
                        <AntdButton
                            title={`测试连接：${datasource.name}`}
                            loading={isTesting}
                            disabled={disabled || isSubmitting}
                            onClick={handleOnTest}
                        >
                            <Icon component={IconConsoleTest} />
                        </AntdButton>
                    </Permission>
                )
            }
            modifyOperationCode={['system:plugin:config:modify']}
            disableResetBtn={disabled}
            disableSaveBtn={disabled || !Object.keys(changedFields).length}
            saving={isSubmitting}
            onReset={onReset}
            onSave={handleOnSave}
        >
            <AntdForm
                form={form}
                layout={'vertical'}
                disabled={disabled || isSubmitting}
                onValuesChange={handleOnFieldChange}
            >
                <FlexBox direction={'vertical'}>{group.fields.map(renderConfigField)}</FlexBox>
            </AntdForm>
        </SettingsCard>
    )
}

export default ConfigCard
