import { DetailedHTMLProps, HTMLAttributes } from 'react'
import useStyles from '@/assets/css/components/common/flex-box.style'

interface FlexBoxProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    direction?: 'horizontal' | 'vertical'
    gap?: number
}

const FlexBox = forwardRef<HTMLDivElement, FlexBoxProps>(
    ({ className, direction, gap, style, ...props }, ref) => {
        const { styles } = useStyles()

        return (
            <div
                className={`${styles.flexBox}${direction === 'horizontal' ? ' flex-horizontal' : ' flex-vertical'}${className ? ` ${className}` : ''}`}
                style={{ gap, ...style }}
                {...props}
                ref={ref}
            />
        )
    }
)

export default FlexBox
