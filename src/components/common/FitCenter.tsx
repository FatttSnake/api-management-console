import { DetailedHTMLProps, HTMLAttributes } from 'react'
import useStyles from '@/assets/css/components/common/fit-center.style'

interface FitCenterProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    vertical?: boolean
}

const FitCenter = ({ className, vertical, ...props }: FitCenterProps) => {
    const { styles } = useStyles()

    return (
        <div
            className={`${styles.fitCenter}${vertical ? ' flex-vertical' : ' flex-horizontal'}${className ? ` ${className}` : ''}`}
            {...props}
        />
    )
}

export default FitCenter
