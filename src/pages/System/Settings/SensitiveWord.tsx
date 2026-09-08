import { ChangeEvent } from 'react'
import Icon from '@ant-design/icons'
import { DATABASE_DUPLICATE_KEY, DATABASE_INSERT_SUCCESS } from '@/constants/common.constants'
import { message } from '@/utils/common'
import {
    r_sys_settings_sensitive_add,
    r_sys_settings_sensitive_delete,
    r_sys_settings_sensitive_get,
    r_sys_settings_sensitive_update
} from '@/services/system'
import SettingsCard from '@/components/system/SettingCard'

const SensitiveWord = () => {
    const [dataSource, setDataSource] = useState<SensitiveWordVo[]>([])
    const [targetKeys, setTargetKeys] = useState<string[]>([])
    const [selectedKeys, setSelectedKeys] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isAdding, setIsAdding] = useState(false)
    const [newWord, setNewWord] = useState('')

    const handleOnReset = () => {
        getSensitiveWordSettings()
    }

    const handleOnSave = () => {
        targetKeys &&
            r_sys_settings_sensitive_update({ ids: targetKeys }).then((res) => {
                const response = res.data
                if (response.success) {
                    void message.success('保存成功')
                    getSensitiveWordSettings()
                } else {
                    void message.error('保存失败，请稍后重试')
                }
            })
    }

    const handleOnDelete = () => {
        r_sys_settings_sensitive_delete(selectedKeys[0]).then((res) => {
            const response = res.data
            if (response.success) {
                void message.success('删除成功')
                getSensitiveWordSettings()
            } else {
                void message.error('删除失败，请稍后重试')
            }
        })
    }

    const getSensitiveWordSettings = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)

        r_sys_settings_sensitive_get().then((res) => {
            const response = res.data
            if (response.success) {
                const data = response.data
                data && setDataSource(data)
                data && setTargetKeys(data.filter((value) => value.enable).map((value) => value.id))
                setIsLoading(false)
            }
        })
    }

    const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
        setNewWord(e.target.value)
    }

    const handleOnAdd = () => {
        if (isAdding) {
            return
        }
        setIsAdding(true)

        r_sys_settings_sensitive_add({ word: newWord, enable: false })
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case DATABASE_INSERT_SUCCESS:
                        void message.success('添加成功')
                        setNewWord('')
                        getSensitiveWordSettings()
                        break
                    case DATABASE_DUPLICATE_KEY:
                        void message.error('该词已存在')
                        break
                    default:
                        void message.error('出错了，请稍后重试')
                }
            })
            .finally(() => {
                setIsAdding(false)
            })
    }

    useEffect(() => {
        getSensitiveWordSettings()
    }, [])

    return (
        <SettingsCard
            icon={IconConsoleSensitive}
            title={'敏感词'}
            loading={isLoading}
            onReset={handleOnReset}
            onSave={handleOnSave}
            modifyOperationCode={['system:settings:sensitive:modify']}
        >
            <AntdTransfer
                styles={{ section: { width: '100%', height: 400 } }}
                oneWay
                showSearch
                pagination
                disabled={isAdding}
                titles={[
                    <span
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end'
                        }}
                    >
                        {selectedKeys?.length === 1 && (
                            <AntdTooltip title={'删除选中项'}>
                                <Icon
                                    style={{ fontSize: '1.2em' }}
                                    component={IconConsoleDelete}
                                    onClick={handleOnDelete}
                                />
                            </AntdTooltip>
                        )}
                        备选
                    </span>,
                    '拦截'
                ]}
                dataSource={dataSource}
                targetKeys={targetKeys}
                selectedKeys={selectedKeys}
                onChange={(value) => {
                    setTargetKeys(value as string[])
                }}
                onSelectChange={(value) => {
                    setSelectedKeys(value as string[])
                }}
                rowKey={(item) => item.id}
                render={(item) => item.word}
            />
            <AntdInput
                value={newWord}
                onChange={handleOnChange}
                onPressEnter={handleOnAdd}
                disabled={isAdding}
                suffix={
                    <AntdButton type={'primary'} onClick={handleOnAdd} disabled={isAdding}>
                        <Icon component={IconConsolePlus} />
                    </AntdButton>
                }
                placeholder={'请输入敏感词'}
            />
        </SettingsCard>
    )
}

export default SensitiveWord
