const IPV4_REGEX = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/

const IPV6_GROUP_REGEX = /^[0-9a-fA-F]{1,4}$/

const isIpv4 = (value: string) => IPV4_REGEX.test(value)

const parseIpv6Groups = (text: string, ipv4Allowed: boolean): number | null => {
    if (!text) {
        return 0
    }
    const groups = text.split(':')
    let count = 0
    for (let i = 0; i < groups.length; i++) {
        const group = groups[i]
        if (ipv4Allowed && i === groups.length - 1 && isIpv4(group)) {
            count += 2
            continue
        }
        if (!IPV6_GROUP_REGEX.test(group)) {
            return null
        }
        count += 1
    }
    return count
}

const isIpv6 = (value: string) => {
    if (!value.includes(':')) {
        return false
    }
    const sections = value.split('::')
    if (sections.length > 2) {
        return false
    }
    if (sections.length === 1) {
        return parseIpv6Groups(sections[0], true) === 8
    }
    const head = parseIpv6Groups(sections[0], false)
    const tail = parseIpv6Groups(sections[1], true)
    return head !== null && tail !== null && head + tail < 8
}

export const isIpOrCidr = (value: string) => {
    const [address, prefix, ...rest] = value.split('/')
    if (rest.length) {
        return false
    }
    const ipv4 = isIpv4(address)
    if (!ipv4 && !isIpv6(address)) {
        return false
    }
    if (prefix === undefined) {
        return true
    }
    if (!/^\d{1,3}$/.test(prefix)) {
        return false
    }
    return Number(prefix) <= (ipv4 ? 32 : 128)
}
