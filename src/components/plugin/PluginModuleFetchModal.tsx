import Icon from '@ant-design/icons'
import FlexBox from '@/components/common/FlexBox'
import PluginModuleFetchSteps from '@/components/plugin/PluginModuleFetchSteps'

interface PluginModuleFetchModalProps {
    open: boolean
    task?: PluginModuleFetchVo
    error?: string
    uploadPercent?: number
    onClose: () => void
}

const PluginModuleFetchModal = ({
    open,
    task,
    error,
    uploadPercent,
    onClose
}: PluginModuleFetchModalProps) => {
    const isRunning = task?.status === 'RUNNING' || (!task && !error)

    const content = () => {
        if (error) {
            return <AntdAlert type={'error'} showIcon title={error} style={{ marginBottom: 16 }} />
        }
        if (!task) {
            return (
                <FlexBox
                    direction={'vertical'}
                    gap={12}
                    style={{ padding: 24, textAlign: 'center' }}
                >
                    <Icon component={IconConsoleLoading} spin style={{ fontSize: '2em' }} />
                    <span>正在上传并解析插件依赖……</span>
                    <AntdProgress percent={uploadPercent ?? 0} />
                </FlexBox>
            )
        }
        if (!task.modules.length) {
            return <AntdEmpty description={'该插件没有依赖模块'} />
        }
        return <PluginModuleFetchSteps task={task} />
    }

    return (
        <AntdModal
            title={error ? '获取依赖失败' : isRunning ? '获取依赖中' : '获取依赖完成'}
            open={open}
            width={680}
            closable={!isRunning}
            mask={{ closable: false }}
            footer={isRunning ? null : <AntdButton onClick={onClose}>关闭</AntdButton>}
        >
            {content()}
        </AntdModal>
    )
}

export default PluginModuleFetchModal
