import { ComponentType, ForwardRefExoticComponent, SVGProps } from 'react'
import { CustomIconComponentProps } from '@ant-design/icons/es/components/Icon'
import { GetProp, StepProps, TablePaginationConfig, TreeDataNode, UploadProps } from 'antd/lib'
import { ColumnsType, FilterValue, SafeKey, SorterResult, SortOrder } from 'antd/es/table/interface'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import type { DataNode } from 'antd/es/tree'

declare global {
    type IconComponent =
        | ComponentType<CustomIconComponentProps | SVGProps<SVGSVGElement>>
        | ForwardRefExoticComponent<CustomIconComponentProps>

    type _TablePaginationConfig = TablePaginationConfig

    type _ColumnsType<T> = ColumnsType<T>
    type _FilterValue = FilterValue
    type _SorterResult<T> = SorterResult<T>
    type _SortOrder = SortOrder
    type _CheckboxChangeEvent = CheckboxChangeEvent
    interface _DataNode extends DataNode {
        value: SafeKey
        fullTitle?: string
        parentId?: number
        children?: _DataNode[]
    }

    type _UploadProps = UploadProps
    type _GetProp<T, PropName> = GetProp<T, PropName>
    type _TreeDataNode = TreeDataNode
    type _StepProps = StepProps
}
