import useStyles from '@/assets/css/pages/sign/index.style'
import FitFullscreen from '@/components/common/FitFullscreen'
import FitCenter from '@/components/common/FitCenter'
import FlexBox from '@/components/common/FlexBox'
import SignUp from '@/pages/Sign/SignUp'
import Verify from '@/pages/Sign/Verify'
import Forget from '@/pages/Sign/Forget'
import SignIn from '@/pages/Sign/SignIn'

const Sign = () => {
    const { styles, cx } = useStyles()
    const lastPage = useRef('none')
    const currentPage = useRef('none')
    const match = useMatches().reduce((_, second) => second)
    const [isSwitch, setIsSwitch] = useState(false)

    const leftPage = ['register', 'verify', 'forget']

    useEffect(() => {
        lastPage.current = currentPage.current
        currentPage.current = match.id

        setIsSwitch(leftPage.includes(currentPage.current))
    }, [match.id])

    const leftComponent = () => {
        switch (leftPage.includes(currentPage.current) ? currentPage.current : lastPage.current) {
            case 'forget':
                return <Forget />
            case 'verify':
                return <Verify />
            default:
                return <SignUp />
        }
    }

    const rightComponent = () => {
        switch (leftPage.includes(currentPage.current) ? lastPage.current : currentPage.current) {
            default:
                return <SignIn />
        }
    }

    return (
        <FitFullscreen className={styles.root}>
            <FitCenter>
                <FlexBox
                    direction={'horizontal'}
                    className={cx(styles.signBox, isSwitch ? styles.switch : '')}
                >
                    <div className={cx(styles.side, !isSwitch ? styles.hidden : '')}>
                        {leftComponent()}
                    </div>
                    <div className={cx(styles.side, isSwitch ? styles.hidden : '')}>
                        {rightComponent()}
                    </div>
                    <FlexBox className={styles.cover}>
                        <div className={styles.ballBox}>
                            <div className={styles.ball} />
                        </div>
                        <div className={styles.ballBox}>
                            <div className={styles.mask}>
                                <div className={styles.ball} />
                            </div>
                        </div>
                    </FlexBox>
                </FlexBox>
            </FitCenter>
        </FitFullscreen>
    )
}

export default Sign
