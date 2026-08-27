import { DetailedHTMLProps, HTMLAttributes } from 'react'
import useStyles from '@/assets/css/components/common/sidebar/separate'

const Separate = ({
    className,
    ...props
}: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => {
    const { styles, cx } = useStyles()

    return <div className={cx(styles.root, className)} {...props} />
}

export default Separate
