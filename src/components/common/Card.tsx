import { DetailedHTMLProps, HTMLAttributes } from 'react'
import useStyles from '@/assets/css/components/common/card.style'

type CardProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>

const Card = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
    const { styles } = useStyles()

    return (
        <div
            className={`${styles.cardBox}${className ? ` ${className}` : ''}`}
            {...props}
            ref={ref}
        />
    )
})

export default Card
