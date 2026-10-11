import FlexBox from '@/components/common/FlexBox'

const MAX_SCHEMA_DEPTH = 6
const OCTET_STREAM = 'application/octet-stream'

interface OpenApiDocProps {
    doc?: OpenApiDoc | null
    path?: string
    method?: string
}

interface SchemaRow {
    key: string
    name: string
    type: string
    required: boolean
    description?: string
    example?: string
    children?: SchemaRow[]
}

interface SchemaTableProps {
    doc?: OpenApiDoc | null
    schema?: OpenApiSchema
    name?: string
}

interface ResolvedSchema {
    schema?: OpenApiSchema
    chain: string[]
    cyclicRef?: string
}

const resolveRef = (doc: OpenApiDoc | null | undefined, ref: string): OpenApiSchema | undefined => {
    if (!ref.startsWith('#/')) {
        return undefined
    }

    let node: unknown = doc
    for (const rawKey of ref.slice(2).split('/')) {
        if (node === null || typeof node !== 'object') {
            return undefined
        }
        node = (node as Record<string, unknown>)[rawKey.replace(/~1/g, '/').replace(/~0/g, '~')]
    }

    return node as OpenApiSchema | undefined
}

const resolveSchema = (
    doc: OpenApiDoc | null | undefined,
    schema: OpenApiSchema | undefined,
    seen: string[]
): ResolvedSchema => {
    const chain = [...seen]
    let current = schema

    while (current?.$ref) {
        const ref = current.$ref
        if (chain.includes(ref)) {
            return { chain, cyclicRef: ref }
        }
        chain.push(ref)

        // OpenAPI 3.1+ evaluates keywords sitting next to a $ref, and the siblings win.
        const siblings = { ...current }
        delete siblings.$ref
        const target = resolveRef(doc, ref)
        current = target
            ? { ...target, ...siblings }
            : Object.keys(siblings).length
              ? siblings
              : undefined
    }

    return { schema: current, chain }
}

const typeLabel = (schema: OpenApiSchema | undefined): string => {
    if (!schema) {
        return 'any'
    }
    if (schema.$ref) {
        return schema.$ref.split('/').pop() ?? 'object'
    }

    const types = Array.isArray(schema.type) ? schema.type : schema.type ? [schema.type] : []
    const nullable = types.includes('null') ? ' | null' : ''
    const nonNull = types.filter((type) => type !== 'null')

    if (schema.contentMediaType === OCTET_STREAM) {
        return `binary${nullable}`
    }

    const detail = schema.format ?? schema.contentEncoding ?? schema.contentMediaType
    const format = detail ? `(${detail})` : ''
    const values = schema.enum?.length
        ? `: ${schema.enum.map((value) => String(value)).join(' | ')}`
        : ''
    const base = nonNull.length
        ? nonNull.join(' | ')
        : schema.properties
          ? 'object'
          : schema.items
            ? 'array'
            : 'any'

    const isArray = nonNull.length ? nonNull.includes('array') : !!schema.items
    if (isArray && schema.items) {
        return `array<${typeLabel(schema.items)}>${nullable}`
    }

    return `${base}${format}${nullable}${values}`
}

const isNullBranch = (schema: OpenApiSchema): boolean => {
    const types = Array.isArray(schema.type) ? schema.type : schema.type ? [schema.type] : []

    return types.length > 0 && types.every((type) => type === 'null')
}

const formatExample = (value: unknown): string =>
    typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)

const buildRow = (
    doc: OpenApiDoc | null | undefined,
    schema: OpenApiSchema | undefined,
    name: string,
    required: boolean,
    keyPath: string,
    seen: string[],
    depth: number
): SchemaRow => {
    const { schema: current, chain, cyclicRef } = resolveSchema(doc, schema, seen)

    if (cyclicRef) {
        return {
            key: keyPath,
            name,
            type: `${cyclicRef.split('/').pop() ?? 'object'}（递归引用）`,
            required
        }
    }
    if (!current) {
        return { key: keyPath, name, type: 'any', required }
    }

    const row: SchemaRow = {
        key: keyPath,
        name,
        type: typeLabel(current),
        required,
        description: current.description,
        example: current.examples?.length ? formatExample(current.examples[0]) : undefined
    }
    if (depth >= MAX_SCHEMA_DEPTH) {
        return row
    }

    if (current.properties) {
        const requiredNames = new Set(current.required ?? [])
        const children = Object.entries(current.properties).map(([propertyName, propertySchema]) =>
            buildRow(
                doc,
                propertySchema,
                propertyName,
                requiredNames.has(propertyName),
                `${keyPath}.${propertyName}`,
                chain,
                depth + 1
            )
        )
        if (children.length) {
            row.children = children
        }
    } else if (current.items) {
        row.children = [buildRow(doc, current.items, '[]', false, `${keyPath}[]`, chain, depth + 1)]
    } else {
        const branches = current.allOf ?? current.oneOf ?? current.anyOf
        if (branches?.length) {
            const shapes = branches.filter((branch) => !isNullBranch(branch))
            if (shapes.length === 1 && shapes.length < branches.length) {
                const shape = buildRow(doc, shapes[0], name, required, keyPath, chain, depth)
                row.type = shape.type.endsWith(' | null') ? shape.type : `${shape.type} | null`
                row.description = current.description ?? shape.description
                row.example = shape.example ?? row.example
                row.children = shape.children
            } else {
                row.children = branches.map((branch, index) =>
                    buildRow(
                        doc,
                        branch,
                        branch.title ?? `分支 ${index + 1}`,
                        false,
                        `${keyPath}#${index}`,
                        chain,
                        depth + 1
                    )
                )
            }
        }
    }

    return row
}

const isBinaryContent = (contentType: string, schema?: OpenApiSchema): boolean =>
    contentType === OCTET_STREAM || schema?.contentMediaType === OCTET_STREAM

const SchemaTable = ({ doc, schema, name = 'value' }: SchemaTableProps) => {
    if (!schema) {
        return null
    }

    const { schema: current, chain } = resolveSchema(doc, schema, [])
    const rows = current?.properties
        ? Object.entries(current.properties).map(([propertyName, propertySchema]) => {
              const required = new Set(current.required ?? []).has(propertyName)
              return buildRow(doc, propertySchema, propertyName, required, propertyName, chain, 1)
          })
        : [buildRow(doc, schema, name, false, name, [], 0)]

    const columns: _ColumnsType<SchemaRow> = [
        ...(rows.some(({ children }) => children?.length) ? [{}] : []),
        {
            title: '字段',
            dataIndex: 'name',
            ellipsis: true
        },
        {
            title: '类型',
            dataIndex: 'type',
            ellipsis: true
        },
        {
            title: '必填',
            dataIndex: 'required',
            align: 'center',
            render: (value: boolean) =>
                value ? <AntdTag color={'error'}>是</AntdTag> : <AntdTag>否</AntdTag>
        },
        {
            title: '说明',
            dataIndex: 'description',
            ellipsis: true
        },
        {
            title: '示例',
            dataIndex: 'example',
            ellipsis: true
        }
    ]

    return (
        <AntdTable
            rowKey={(row) => row.key}
            columns={columns}
            dataSource={rows}
            pagination={false}
            size={'small'}
            scroll={{ x: true }}
            expandable={{ defaultExpandAllRows: true }}
        />
    )
}

const OpenApiDoc = ({ doc, path, method }: OpenApiDocProps) => {
    if (!doc) {
        return <AntdEmpty description={'该插件暂未声明文档'} />
    }

    const operation = path && method ? doc.paths?.[path]?.[method.toLowerCase()] : undefined
    if (!operation) {
        return <AntdEmpty description={'该接口暂未声明文档'} />
    }

    const parameters = operation.parameters ?? []
    const parameterColumns: _ColumnsType<OpenApiParameter> = [
        {
            title: '参数名',
            dataIndex: 'name',
            ellipsis: true
        },
        {
            title: '位置',
            dataIndex: 'in',
            align: 'center',
            render: (value: string) => <AntdTag>{value}</AntdTag>
        },
        {
            title: '类型',
            dataIndex: 'schema',
            ellipsis: true,
            render: (value: OpenApiSchema) => typeLabel(value)
        },
        {
            title: '必填',
            dataIndex: 'required',
            align: 'center',
            render: (value: boolean) =>
                value ? <AntdTag color={'error'}>是</AntdTag> : <AntdTag>否</AntdTag>
        },
        {
            title: '说明',
            dataIndex: 'description',
            ellipsis: true
        }
    ]

    const requestBodyItems = Object.entries(operation.requestBody?.content ?? {}).map(
        ([contentType, mediaType]) => ({
            key: contentType,
            label: contentType,
            children: <SchemaTable doc={doc} schema={mediaType.schema} name={'body'} />
        })
    )

    const responseItems = Object.entries(operation.responses ?? {}).map(([code, response]) => ({
        key: code,
        label: code,
        extra: response.description,
        children: Object.entries(response.content ?? {}).map(([contentType, mediaType]) =>
            isBinaryContent(contentType, mediaType.schema) ? (
                <AntdTypography.Text key={contentType}>二进制内容</AntdTypography.Text>
            ) : (
                <SchemaTable
                    key={contentType}
                    doc={doc}
                    schema={mediaType.schema}
                    name={'response'}
                />
            )
        )
    }))

    return (
        <FlexBox gap={16}>
            {parameters.length > 0 && (
                <FlexBox>
                    <AntdTypography.Title level={5}>请求参数</AntdTypography.Title>
                    <AntdTable
                        rowKey={(parameter) => `${parameter.in}:${parameter.name}`}
                        columns={parameterColumns}
                        dataSource={parameters}
                        pagination={false}
                        size={'small'}
                        scroll={{ x: true }}
                    />
                </FlexBox>
            )}

            {requestBodyItems.length > 0 && (
                <FlexBox>
                    <AntdTypography.Title level={5}>请求体</AntdTypography.Title>
                    <AntdCollapse
                        items={requestBodyItems}
                        defaultActiveKey={requestBodyItems.map(({ key }) => key)}
                    />
                </FlexBox>
            )}

            {responseItems.length > 0 && (
                <FlexBox>
                    <AntdTypography.Title level={5}>响应</AntdTypography.Title>
                    <AntdCollapse
                        items={responseItems}
                        defaultActiveKey={responseItems.map(({ key }) => key)}
                    />
                </FlexBox>
            )}
        </FlexBox>
    )
}

export default OpenApiDoc
