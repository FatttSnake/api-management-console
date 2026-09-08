import { message } from '@/utils/common'
import { hasPermission } from '@/utils/auth'
import { r_sys_settings_base_get, r_sys_settings_base_update } from '@/services/system'
import SettingsCard from '@/components/system/SettingCard'

const Base = () => {
    const [baseForm] = AntdForm.useForm<BaseSettingsParam>()
    const [isLoading, setIsLoading] = useState(false)
    const [requireCaptcha, setRequireCaptcha] = useState<boolean>(false)

    const handleOnReset = () => {
        getBaseSettings()
    }

    const handleOnSave = () => {
        baseForm.validateFields().then(
            (values) => {
                r_sys_settings_base_update(values).then((res) => {
                    const response = res.data
                    if (response.success) {
                        void message.success('保存设置成功')
                        getBaseSettings()
                    } else {
                        void message.error('保存设置失败，请稍后重试')
                    }
                })
            },
            () => {}
        )
    }

    const handleOnFormChange = () => {
        const turnstileSiteKey = baseForm.getFieldValue('turnstileSiteKey')
        const turnstileSecretKey = baseForm.getFieldValue('turnstileSecretKey')
        setRequireCaptcha(turnstileSiteKey || turnstileSecretKey)
    }

    const getBaseSettings = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)

        r_sys_settings_base_get().then((res) => {
            const response = res.data
            if (response.success) {
                const data = response.data
                data && baseForm.setFieldsValue(data)
                handleOnFormChange()
                setIsLoading(false)
            }
        })
    }

    useEffect(() => {
        getBaseSettings()
    }, [])

    return (
        <SettingsCard
            icon={IconConsoleBase}
            title={'基础'}
            loading={isLoading}
            onReset={handleOnReset}
            onSave={handleOnSave}
            modifyOperationCode={['system:settings:base:modify']}
        >
            <AntdForm
                form={baseForm}
                disabled={!hasPermission('system:settings:base:modify')}
                layout={'vertical'}
                onChange={handleOnFormChange}
            >
                <AntdForm.Item
                    label={'系统名称'}
                    name={'systemName'}
                    rules={[{ required: true, whitespace: true }]}
                >
                    <AntdInput placeholder={'请输入系统名称'} />
                </AntdForm.Item>
                <AntdForm.Item
                    label={'Token 缓冲时间'}
                    name={'tokenExpiryBufferMs'}
                    rules={[{ required: true }]}
                >
                    <AntdInputNumber
                        style={{ width: '100%' }}
                        min={0}
                        precision={0}
                        placeholder={'请输入 Token 缓冲时间（毫秒）'}
                    />
                </AntdForm.Item>
                <AntdForm.Item
                    label={'Token 检查周期'}
                    name={'tokenExpiryCheckIntervalMs'}
                    rules={[{ required: true }]}
                >
                    <AntdInputNumber
                        style={{ width: '100%' }}
                        min={0}
                        precision={0}
                        placeholder={'请输入 Token 检查周期（毫秒）'}
                    />
                </AntdForm.Item>
                <AntdForm.Item
                    label={'Turnstile 站点标识'}
                    name={'turnstileSiteKey'}
                    rules={[{ required: requireCaptcha }]}
                >
                    <AntdInput placeholder={'留空禁用'} />
                </AntdForm.Item>
                <AntdForm.Item
                    label={'Turnstile 密钥'}
                    name={'turnstileSecretKey'}
                    rules={[{ required: requireCaptcha }]}
                >
                    <AntdInput.Password placeholder={'留空禁用'} />
                </AntdForm.Item>
                <AntdForm.Item
                    label={'主页 URL'}
                    name={'homeUrl'}
                    rules={[{ required: true, type: 'url' }]}
                >
                    <AntdInput placeholder={'请输入主页 URL'} />
                </AntdForm.Item>
            </AntdForm>
        </SettingsCard>
    )
}

export default Base
