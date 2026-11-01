import { Steps as AntdSteps } from 'antd'
import Icon from '@ant-design/icons'
import { formatBytes } from '@/utils/common'

interface PluginModuleFetchStepsProps {
    task: PluginModuleFetchVo
}

const PluginModuleFetchSteps = ({ task }: PluginModuleFetchStepsProps) => {
    const isRunning = task.status === 'RUNNING'
    const current = task.modules.findIndex(
        (module) => module.status !== 'INSTALLED' && module.status !== 'EXISTING'
    )

    const items: _StepProps[] = task.modules.map((module) => ({
        title: (
            <span style={{ fontFamily: 'monospace' }}>
                {module.groupId}:{module.artifactId}:{module.moduleVersion}
            </span>
        ),
        description: describe(module, isRunning),
        status: stepStatus(module)
    }))

    return (
        <AntdSteps
            orientation={'vertical'}
            size={'small'}
            items={items}
            current={current < 0 ? task.modules.length : current}
            status={task.status === 'FAILED' ? 'error' : isRunning ? 'process' : 'finish'}
            progressDot={(dot: ReactNode, { index }: { index: number }) => {
                const module = task.modules[index]
                if (module?.status === 'DOWNLOADING') {
                    return <AntdProgress percent={module.percent} size={12} type={'circle'} />
                }
                if (module?.status === 'PENDING' && isRunning) {
                    return <Icon component={IconConsoleLoading} spin />
                }
                return dot
            }}
        />
    )
}

const stepStatus = (module: PluginModuleFetchModuleVo): _StepProps['status'] => {
    switch (module.status) {
        case 'INSTALLED':
        case 'EXISTING':
            return 'finish'
        case 'DOWNLOADING':
            return 'process'
        case 'FAILED':
            return 'error'
        default:
            return 'wait'
    }
}

const describe = (module: PluginModuleFetchModuleVo, isRunning: boolean) => {
    switch (module.status) {
        case 'EXISTING':
            return '已存在'
        case 'INSTALLED':
            return `已下载 ${formatBytes(module.size)}`
        case 'DOWNLOADING':
            return `${formatBytes(module.downloadedBytes)} / ${formatBytes(module.size)}`
        case 'FAILED':
            return module.message ?? '下载失败'
        default:
            return isRunning ? '等待中' : '未开始'
    }
}

export default PluginModuleFetchSteps
