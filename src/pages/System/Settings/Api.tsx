import { message } from '@/utils/common'
import { hasPermission } from '@/utils/auth'
import { r_sys_settings_api_get, r_sys_settings_api_update } from '@/services/system'
import SettingsCard from '@/components/system/SettingCard'

const Api = () => {
    const [apiForm] = AntdForm.useForm<ApiSettingsParam>()
    const [isLoading, setIsLoading] = useState(false)

    const handleOnReset = () => {
        getApiSettings()
    }

    const handleOnSave = () => {
        apiForm.validateFields().then(
            (values) => {
                r_sys_settings_api_update(values).then((res) => {
                    const response = res.data
                    if (response.success) {
                        void message.success('保存设置成功')
                        getApiSettings()
                    } else {
                        void message.error('保存设置失败，请稍后重试')
                    }
                })
            },
            () => {}
        )
    }

    const getApiSettings = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)

        r_sys_settings_api_get().then((res) => {
            const response = res.data
            if (response.success) {
                const data = response.data
                apiForm.setFieldsValue(data!)
                setIsLoading(false)
            }
        })
    }

    useEffect(() => {
        getApiSettings()
    }, [])

    return (
        <SettingsCard
            icon={IconConsoleApi}
            title={'API'}
            loading={isLoading}
            onReset={handleOnReset}
            onSave={handleOnSave}
            modifyOperationCode={['system:settings:api:modify']}
        >
            <AntdForm
                form={apiForm}
                disabled={!hasPermission('system:settings:api:modify')}
                layout={'vertical'}
            >
                <AntdForm.Item
                    label={'每用户每分钟默认限流次数（所有 Key 与登录态合计，0=不限）'}
                    name={'defaultUserRateLimitPerMin'}
                >
                    <AntdInputNumber style={{ width: '100%' }} min={0} precision={0} />
                </AntdForm.Item>
                <AntdForm.Item
                    label={'匿名调用每 IP 每分钟默认限流次数（0=不限）'}
                    name={'defaultAnonymousRateLimitPerMin'}
                >
                    <AntdInputNumber style={{ width: '100%' }} min={0} precision={0} />
                </AntdForm.Item>
                <AntdForm.Item
                    label={'每 IP 每分钟鉴权失败上限（0=关闭，默认 30）'}
                    name={'authFailureLimitPerMin'}
                >
                    <AntdInputNumber style={{ width: '100%' }} min={0} precision={0} />
                </AntdForm.Item>
                <AntdForm.Item
                    label={'每用户每个周期默认额度次数（所有 Key 与登录态合计，0=不限）'}
                    name={'defaultQuota'}
                >
                    <AntdInputNumber style={{ width: '100%' }} min={0} precision={0} />
                </AntdForm.Item>
                <AntdForm.Item label={'每用户额度周期(秒)'} name={'defaultQuotaPeriodSeconds'}>
                    <AntdInputNumber style={{ width: '100%' }} min={1} precision={0} />
                </AntdForm.Item>
                <AntdForm.Item label={'生成的 AccessKey 长度'} name={'accessKeyLength'}>
                    <AntdInputNumber style={{ width: '100%' }} min={8} precision={0} />
                </AntdForm.Item>
                <AntdForm.Item label={'生成的 SecretKey 长度'} name={'secretKeyLength'}>
                    <AntdInputNumber style={{ width: '100%' }} min={16} precision={0} />
                </AntdForm.Item>
                <AntdForm.Item label={'计费前是否校验余额'} name={'balanceCheckEnabled'}>
                    <AntdSwitch />
                </AntdForm.Item>
                <AntdForm.Item label={'ApiKey 缓存 TTL(秒)'} name={'cacheTtlSeconds'}>
                    <AntdInputNumber style={{ width: '100%' }} min={1} precision={0} />
                </AntdForm.Item>
            </AntdForm>
        </SettingsCard>
    )
}

export default Api
