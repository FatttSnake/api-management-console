export const kebabCase = (key: string) => {
    const result: string = key.replace(/([A-Z])/g, ' $1').trim()
    return result.split(' ').join('-').toLowerCase()
}

export type Awaitable<T> = T | PromiseLike<T>

export interface ImportInfo {
    as?: string
    name?: string
    from: string
}

export type SideEffectsInfo = (ImportInfo | string)[] | ImportInfo | string | undefined

export interface ComponentInfo extends ImportInfo {
    sideEffects?: SideEffectsInfo
}

export type ComponentResolveResult = Awaitable<string | ComponentInfo | null | undefined | void>

export type ComponentResolverFunction = (name: string) => ComponentResolveResult

export interface ComponentResolverObject {
    type: 'component' | 'directive'
    resolve: ComponentResolverFunction
}

export type ComponentResolver = ComponentResolverFunction | ComponentResolverObject

interface IMatcher {
    pattern: RegExp
    styleDir: string
}

const matchComponents: IMatcher[] = [
    {
        pattern: /^Anchor/,
        styleDir: 'anchor'
    },
    {
        pattern: /^AutoComplete/,
        styleDir: 'auto-complete'
    },
    {
        pattern: /^Avatar/,
        styleDir: 'avatar'
    },
    {
        pattern: /^Badge/,
        styleDir: 'badge'
    },
    {
        pattern: /^Breadcrumb/,
        styleDir: 'breadcrumb'
    },
    {
        pattern: /^Button/,
        styleDir: 'button'
    },
    {
        pattern: /^Card/,
        styleDir: 'card'
    },
    {
        pattern: /^CheckableTag/,
        styleDir: 'tag'
    },
    {
        pattern: /^Checkbox/,
        styleDir: 'checkbox'
    },
    {
        pattern: /^Collapse/,
        styleDir: 'collapse'
    },
    {
        pattern: /^Descriptions/,
        styleDir: 'descriptions'
    },
    {
        pattern: /^Dropdown/,
        styleDir: 'dropdown'
    },
    {
        pattern: /^Form/,
        styleDir: 'form'
    },
    {
        pattern: /^Image/,
        styleDir: 'image'
    },
    {
        pattern: /^InputNumber/,
        styleDir: 'input-number'
    },
    {
        pattern: /^Layout/,
        styleDir: 'layout'
    },
    {
        pattern: /^List/,
        styleDir: 'list'
    },
    {
        pattern: /^Mentions/,
        styleDir: 'mentions'
    },
    {
        pattern: /^QRCode/,
        styleDir: 'qr-code'
    },
    {
        pattern: /^Radio/,
        styleDir: 'radio'
    },
    {
        pattern: /^Select/,
        styleDir: 'select'
    },
    {
        pattern: /^Skeleton/,
        styleDir: 'skeleton'
    },
    {
        pattern: /^Statistic/,
        styleDir: 'statistic'
    },
    {
        pattern: /^Step/,
        styleDir: 'steps'
    },
    {
        pattern: /^Tab/,
        styleDir: 'tabs'
    },
    {
        pattern: /^Table/,
        styleDir: 'table'
    },
    {
        pattern: /^Timeline/,
        styleDir: 'timeline'
    },
    {
        pattern: /^TimeRangePicker/,
        styleDir: 'time-picker'
    },
    {
        pattern: /^Typography/,
        styleDir: 'typography'
    },
    {
        pattern: /^TreeSelect/,
        styleDir: 'tree-select'
    },
    {
        pattern: /^Upload/,
        styleDir: 'upload'
    },
    {
        pattern: /^Input|^Textarea/,
        styleDir: 'input'
    },
    {
        pattern: /^Menu|^SubMenu/,
        styleDir: 'menu'
    },
    {
        pattern: /^Tree|^DirectoryTree/,
        styleDir: 'tree'
    },
    {
        pattern: /^MonthPicker|^RangePicker|^WeekPicker/,
        styleDir: 'date-picker'
    },
    {
        pattern: /^TimePicker|^TimeRangePicker/,
        styleDir: 'time-picker'
    }
]

export interface AntDesignResolverOptions {
    /**
     * exclude components that do not require automatic import
     *
     * @default []
     */
    exclude?: string[]
    /**
     * import style along with components
     *
     * @default 'css'
     */
    importStyle?: boolean | 'css' | 'less'
    /**
     * resolve `antd' icons
     *
     * requires package `@ant-design/icons-vue`
     *
     * @default false
     */
    resolveIcons?: boolean

    /**
     * @deprecated use `importStyle: 'css'` instead
     */
    importCss?: boolean
    /**
     * @deprecated use `importStyle: 'less'` instead
     */
    importLess?: boolean

    /**
     * use commonjs build default false
     */
    cjs?: boolean

    /**
     * rename package
     *
     * @default 'antd'
     */
    packageName?: string
}

const getStyleDir = (compName: string): string => {
    for (const matchComponent of matchComponents) {
        if (compName.match(matchComponent.pattern)) {
            return matchComponent.styleDir
        }
    }
    return kebabCase(compName)
}

const getSideEffects = (compName: string, options: AntDesignResolverOptions): SideEffectsInfo => {
    const { importStyle = true } = options

    if (!importStyle) {
        return
    }

    const lib = options.cjs ? 'lib' : 'es'
    const packageName = options?.packageName || 'antd'

    const styleDir = getStyleDir(compName)
    return `${packageName}/${lib}/${styleDir}/style`
}

const primitiveNames = [
    'Affix',
    'Alert',
    'Anchor',
    'AnchorLink',
    'AutoComplete',
    'AutoCompleteOptGroup',
    'AutoCompleteOption',
    'Avatar',
    'AvatarGroup',
    'BackTop',
    'Badge',
    'BadgeRibbon',
    'Breadcrumb',
    'BreadcrumbItem',
    'BreadcrumbSeparator',
    'Button',
    'ButtonGroup',
    'Calendar',
    'Card',
    'CardGrid',
    'CardMeta',
    'Carousel',
    'Cascader',
    'CheckableTag',
    'Checkbox',
    'CheckboxGroup',
    'Col',
    'Collapse',
    'CollapsePanel',
    'Comment',
    'ConfigProvider',
    'DatePicker',
    'Descriptions',
    'DescriptionsItem',
    'DirectoryTree',
    'Divider',
    'Drawer',
    'Dropdown',
    'DropdownButton',
    'Empty',
    'FloatButton',
    'Form',
    'FormItem',
    'FormItemRest',
    'Grid',
    'Image',
    'ImagePreviewGroup',
    'Input',
    'InputGroup',
    'InputNumber',
    'InputPassword',
    'InputSearch',
    'Layout',
    'LayoutContent',
    'LayoutFooter',
    'LayoutHeader',
    'LayoutSider',
    'List',
    'ListItem',
    'ListItemMeta',
    'LocaleProvider',
    'Mentions',
    'MentionsOption',
    'Menu',
    'MenuDivider',
    'MenuItem',
    'MenuItemGroup',
    'Modal',
    'MonthPicker',
    'PageHeader',
    'Pagination',
    'Popconfirm',
    'Popover',
    'Progress',
    'QRCode',
    'QuarterPicker',
    'Radio',
    'RadioButton',
    'RadioGroup',
    'RangePicker',
    'Rate',
    'Result',
    'Row',
    'Segmented',
    'Select',
    'SelectOptGroup',
    'SelectOption',
    'Skeleton',
    'SkeletonAvatar',
    'SkeletonButton',
    'SkeletonImage',
    'SkeletonInput',
    'Slider',
    'Space',
    'Spin',
    'Splitter',
    'Statistic',
    'StatisticCountdown',
    'Step',
    'Steps',
    'SubMenu',
    'Switch',
    'Table',
    'TableColumn',
    'TableColumnGroup',
    'TableSummary',
    'TableSummaryCell',
    'TableSummaryRow',
    'TabPane',
    'Tabs',
    'Tag',
    'Textarea',
    'Timeline',
    'TimelineItem',
    'TimePicker',
    'TimeRangePicker',
    'Tooltip',
    'Transfer',
    'Tree',
    'TreeNode',
    'TreeSelect',
    'TreeSelectNode',
    'Typography',
    'TypographyLink',
    'TypographyParagraph',
    'TypographyText',
    'TypographyTitle',
    'Upload',
    'UploadDragger',
    'WeekPicker'
]

const prefix = 'Antd'

let antdNames: Set<string>

const genAntdNames = (primitiveNames: string[]): void => {
    antdNames = new Set(primitiveNames.map((name) => `${prefix}${name}`))
}

genAntdNames(primitiveNames)

const isAntd = (compName: string): boolean => {
    return antdNames.has(compName)
}

export const AntDesignResolver = (options: AntDesignResolverOptions = {}): ComponentResolver => {
    return {
        type: 'component',
        resolve: (name: string) => {
            if (options.resolveIcons && name.match(/(Outlined|Filled|TwoTone)$/)) {
                return {
                    name,
                    from: '@ant-design/icons'
                }
            }

            if (isAntd(name) && !options?.exclude?.includes(name)) {
                const importName = name.slice(prefix.length)
                const { cjs = false, packageName = 'antd' } = options
                const path = `${packageName}/${cjs ? 'lib' : 'es'}`
                return {
                    name: importName,
                    from: path,
                    sideEffects: getSideEffects(importName, options)
                }
            }
            return undefined
        }
    }
}
