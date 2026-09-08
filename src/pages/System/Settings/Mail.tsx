import Icon from '@ant-design/icons'
import { message, modal } from '@/utils/common'
import { hasPermission } from '@/utils/auth'
import {
    r_sys_settings_mail_get,
    r_sys_settings_mail_send,
    r_sys_settings_mail_update
} from '@/services/system'
import SettingsCard from '@/components/system/SettingCard'

const Mail = () => {
    const [mailForm] = AntdForm.useForm<MailSettingsParam>()
    const [isLoading, setIsLoading] = useState(false)
    const [mailSendForm] = AntdForm.useForm<MailSendParam>()

    const handleOnTest = () => {
        void modal.confirm({
            centered: true,
            mask: { closable: true },
            title: '发送测试邮件',
            content: (
                <>
                    <AntdForm
                        form={mailSendForm}
                        ref={() => {
                            setTimeout(() => {
                                mailSendForm?.getFieldInstance('to')?.focus()
                            }, 50)
                        }}
                    >
                        <AntdForm.Item
                            name={'to'}
                            label={'接收人'}
                            style={{ marginTop: 10 }}
                            rules={[{ required: true, type: 'email' }]}
                        >
                            <AntdInput placeholder={'请输入接收人'} />
                        </AntdForm.Item>
                    </AntdForm>
                    <AntdTag style={{ whiteSpace: 'normal' }}>
                        将使用服务器已保存的邮件设置进行发送邮件，请保证编辑的内容已保存
                    </AntdTag>
                </>
            ),
            onOk: () =>
                mailSendForm.validateFields().then(
                    () => {
                        return new Promise<void>((resolve) => {
                            r_sys_settings_mail_send({
                                to: mailSendForm.getFieldValue('to') as string
                            }).then((res) => {
                                const response = res.data

                                if (response.success) {
                                    void message.success('发送成功')
                                    resolve()
                                } else {
                                    void message.error('发送失败，请检查配置后重试')
                                    resolve()
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
        })
    }

    const handleOnReset = () => {
        getMailSettings()
    }

    const handleOnSave = () => {
        mailForm.validateFields().then(
            (values) => {
                r_sys_settings_mail_update(values).then((res) => {
                    const response = res.data
                    if (response.success) {
                        void message.success('保存设置成功')
                        getMailSettings()
                    } else {
                        void message.error('保存设置失败，请稍后重试')
                    }
                })
            },
            () => {}
        )
    }

    const getMailSettings = () => {
        if (isLoading) {
            return
        }

        setIsLoading(true)
        r_sys_settings_mail_get().then((res) => {
            const response = res.data
            if (response.success) {
                const data = response.data
                data && mailForm.setFieldsValue(data)
                setIsLoading(false)
            }
        })
    }

    useEffect(() => {
        getMailSettings()
    }, [])

    return (
        <SettingsCard
            icon={IconConsoleEmail}
            title={'邮件'}
            loading={isLoading}
            onReset={handleOnReset}
            onSave={handleOnSave}
            modifyOperationCode={['system:settings:mail:modify']}
            expand={
                <AntdButton onClick={handleOnTest} title={'测试'}>
                    <Icon component={IconConsoleTest} />
                </AntdButton>
            }
        >
            <AntdForm
                form={mailForm}
                disabled={!hasPermission('system:settings:mail:modify')}
                layout={'vertical'}
            >
                <AntdForm.Item
                    label={'SMTP 服务器'}
                    name={'host'}
                    rules={[{ required: true, whitespace: true }]}
                >
                    <AntdInput placeholder={'请输入 SMTP 服务器'} />
                </AntdForm.Item>
                <AntdForm.Item label={'端口号'} name={'port'} rules={[{ required: true }]}>
                    <AntdInputNumber
                        style={{ width: '100%' }}
                        min={0}
                        max={65535}
                        precision={0}
                        placeholder={'请输入端口号'}
                    />
                </AntdForm.Item>
                <AntdForm.Item
                    label={'安全类型'}
                    name={'securityType'}
                    rules={[{ required: true }]}
                >
                    <AntdSelect
                        placeholder={'请选择安全类型'}
                        options={[
                            { label: 'None', value: 'None' },
                            { label: 'SSL/TLS', value: 'SSL/TLS' },
                            { label: 'StartTls', value: 'StartTls' }
                        ]}
                    />
                </AntdForm.Item>
                <AntdForm.Item
                    label={'用户名'}
                    name={'username'}
                    rules={[{ required: true, whitespace: true }]}
                >
                    <AntdInput placeholder={'请输入用户名'} />
                </AntdForm.Item>
                <AntdForm.Item
                    label={'密码'}
                    name={'password'}
                    rules={[{ required: true, whitespace: true }]}
                >
                    <AntdInput.Password placeholder={'请输入密码'} />
                </AntdForm.Item>
                <AntdForm.Item
                    label={'发送者'}
                    name={'from'}
                    rules={[{ required: true, whitespace: true }]}
                >
                    <AntdInput placeholder={'请输入发送者'} />
                </AntdForm.Item>
                <AntdForm.Item
                    label={'发送者名称'}
                    name={'fromName'}
                    rules={[{ required: true, whitespace: true }]}
                >
                    <AntdInput placeholder={'请输入发送者名称'} />
                </AntdForm.Item>
            </AntdForm>
        </SettingsCard>
    )
}

export default Mail
