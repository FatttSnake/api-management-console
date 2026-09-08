import { message } from '@/utils/common'
import { hasPermission } from '@/utils/auth'
import { r_sys_settings_two_factor_get, r_sys_settings_two_factor_update } from '@/services/system'
import SettingsCard from '@/components/system/SettingCard'

const TwoFactor = () => {
    const [twoFactorForm] = AntdForm.useForm<TwoFactorSettingsParam>()
    const [isLoading, setIsLoading] = useState(false)

    const handleOnReset = () => {
        getTwoFactorSettings()
    }

    const handleOnSave = () => {
        twoFactorForm.validateFields().then(
            (values) => {
                r_sys_settings_two_factor_update(values).then((res) => {
                    const response = res.data
                    if (response.success) {
                        void message.success('保存设置成功')
                        getTwoFactorSettings()
                    } else {
                        void message.error('保存设置失败，请稍后重试')
                    }
                })
            },
            () => {}
        )
    }

    const getTwoFactorSettings = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)

        r_sys_settings_two_factor_get().then((res) => {
            const response = res.data
            if (response.success) {
                const data = response.data
                data && twoFactorForm.setFieldsValue(data)
                setIsLoading(false)
            }
        })
    }

    useEffect(() => {
        getTwoFactorSettings()
    }, [])

    return (
        <SettingsCard
            icon={IconConsoleSafe}
            title={'双因素'}
            loading={isLoading}
            onReset={handleOnReset}
            onSave={handleOnSave}
            modifyOperationCode={['system:settings:two-factor:modify']}
        >
            <AntdForm
                form={twoFactorForm}
                disabled={!hasPermission('system:settings:two-factor:modify')}
                layout={'vertical'}
            >
                <AntdForm.Item
                    label={'提供者'}
                    name={'issuer'}
                    rules={[{ required: true, whitespace: true }]}
                >
                    <AntdInput placeholder={'请输入提供者'} />
                </AntdForm.Item>
                <AntdForm.Item
                    label={'密钥长度'}
                    name={'secretKeyLength'}
                    rules={[{ required: true }]}
                >
                    <AntdInputNumber
                        style={{ width: '100%' }}
                        min={3}
                        max={64}
                        precision={0}
                        placeholder={'请输入密钥长度'}
                    />
                </AntdForm.Item>
            </AntdForm>
        </SettingsCard>
    )
}

export default TwoFactor
