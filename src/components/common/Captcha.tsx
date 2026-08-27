import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile'

export interface CaptchaElement {
    refresh(): void
}

interface CaptchaProps {
    turnstileSiteKey: string
    isDarkMode?: boolean
    action?: string
    cData?: string
    onSuccess?: (token: string) => void
}

const Captcha = forwardRef<CaptchaElement, CaptchaProps>(
    ({ turnstileSiteKey, isDarkMode, action, cData, onSuccess }, ref) => {
        useImperativeHandle(
            ref,
            () => ({
                refresh() {
                    turnstileRef.current?.reset()
                }
            }),
            []
        )

        const turnstileRef = useRef<TurnstileInstance>()

        return (
            <Turnstile
                id={action}
                ref={turnstileRef}
                siteKey={turnstileSiteKey}
                options={{
                    theme: isDarkMode ? 'dark' : 'light',
                    action,
                    cData
                }}
                onSuccess={onSuccess}
            />
        )
    }
)

export default Captcha
