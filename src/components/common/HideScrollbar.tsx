import {
    TouchEvent,
    MouseEvent,
    KeyboardEvent,
    DetailedHTMLProps,
    HTMLAttributes,
    UIEvent
} from 'react'
import useStyles from '@/assets/css/components/common/hide-scrollbar.style'

interface HideScrollbarProps extends DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
> {
    isPreventScroll?: boolean
    isPreventVerticalScroll?: boolean
    isPreventHorizontalScroll?: boolean
    isShowVerticalScrollbar?: boolean
    isHiddenVerticalScrollbarWhenFull?: boolean
    isShowHorizontalScrollbar?: boolean
    isHiddenHorizontalScrollbarWhenFull?: boolean
    minWidth?: string | number
    minHeight?: string | number
    scrollbarWidth?: string | number
    autoHideWaitingTime?: number
    scrollbarAsidePadding?: number
    scrollbarEdgePadding?: number
}

export interface HideScrollbarElement {
    scrollTo(x: number, y: number, smooth?: boolean): void
    scrollX(x: number, smooth?: boolean): void
    scrollY(y: number, smooth?: boolean): void
    scrollLeft(length: number, smooth?: boolean): void
    scrollRight(length: number, smooth?: boolean): void
    scrollUp(length: number, smooth?: boolean): void
    scrollDown(length: number, smooth?: boolean): void
    getX(): number
    getY(): number
    addEventListenerWithType<K extends keyof HTMLElementEventMap>(
        type: K,
        listener: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => never,
        options?: boolean | AddEventListenerOptions
    ): void
    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions
    ): void
    removeEventListenerWithType<K extends keyof HTMLElementEventMap>(
        type: K,
        listener: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => never,
        options?: boolean | EventListenerOptions
    ): void
    removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions
    ): void
    refreshLayout(): void
}

const HideScrollbar = forwardRef<HideScrollbarElement, HideScrollbarProps>(
    (
        {
            isPreventScroll = false,
            isPreventVerticalScroll = false,
            isPreventHorizontalScroll = false,
            isShowVerticalScrollbar = true,
            isHiddenVerticalScrollbarWhenFull = true,
            isShowHorizontalScrollbar = true,
            isHiddenHorizontalScrollbarWhenFull = true,
            minWidth,
            minHeight,
            scrollbarWidth,
            autoHideWaitingTime,
            onScroll,
            children,
            style,
            className,
            scrollbarAsidePadding = 12,
            scrollbarEdgePadding = 4,
            ...props
        },
        ref
    ) => {
        const { styles, cx } = useStyles()

        useImperativeHandle<HideScrollbarElement, HideScrollbarElement>(ref, () => {
            return {
                scrollTo(x, y, smooth?: boolean) {
                    rootRef.current?.scrollTo({
                        left: x,
                        top: y,
                        behavior: smooth === false ? 'instant' : 'smooth'
                    })
                },
                scrollX(x, smooth?: boolean) {
                    rootRef.current?.scrollTo({
                        left: x,
                        behavior: smooth === false ? 'instant' : 'smooth'
                    })
                },
                scrollY(y, smooth?: boolean) {
                    rootRef.current?.scrollTo({
                        top: y,
                        behavior: smooth === false ? 'instant' : 'smooth'
                    })
                },
                scrollLeft(length, smooth?: boolean) {
                    rootRef.current?.scrollTo({
                        left: rootRef.current?.scrollLeft - length,
                        behavior: smooth === false ? 'instant' : 'smooth'
                    })
                },
                scrollRight(length, smooth?: boolean) {
                    rootRef.current?.scrollTo({
                        left: rootRef.current?.scrollLeft + length,
                        behavior: smooth === false ? 'instant' : 'smooth'
                    })
                },
                scrollUp(length, smooth?: boolean) {
                    rootRef.current?.scrollTo({
                        top: rootRef.current?.scrollTop - length,
                        behavior: smooth === false ? 'instant' : 'smooth'
                    })
                },
                scrollDown(length, smooth?: boolean) {
                    rootRef.current?.scrollTo({
                        top: rootRef.current?.scrollTop + length,
                        behavior: smooth === false ? 'instant' : 'smooth'
                    })
                },
                getX() {
                    return rootRef.current?.scrollLeft ?? 0
                },
                getY() {
                    return rootRef.current?.scrollTop ?? 0
                },
                addEventListenerWithType<K extends keyof HTMLElementEventMap>(
                    type: K,
                    listener: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => never,
                    options?: boolean | AddEventListenerOptions
                ): void {
                    rootRef.current?.addEventListener<K>(type, listener, options)
                },
                addEventListener(
                    type: string,
                    listener: EventListenerOrEventListenerObject,
                    options?: boolean | AddEventListenerOptions
                ): void {
                    rootRef.current?.addEventListener(type, listener, options)
                },
                removeEventListenerWithType<K extends keyof HTMLElementEventMap>(
                    type: K,
                    listener: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => never,
                    options?: boolean | EventListenerOptions
                ): void {
                    rootRef.current?.removeEventListener<K>(type, listener, options)
                },
                removeEventListener(
                    type: string,
                    listener: EventListenerOrEventListenerObject,
                    options?: boolean | EventListenerOptions
                ): void {
                    rootRef.current?.removeEventListener(type, listener, options)
                },
                refreshLayout(): void {
                    refreshLayout()
                }
            }
        }, [])

        const maskRef = useRef<HTMLDivElement>(null)
        const rootRef = useRef<HTMLDivElement>(null)
        const contentRef = useRef<HTMLDivElement>(null)
        const wheelListenerRef = useRef<(event: WheelEvent) => void>(() => undefined)
        const lastScrollbarClickPositionRef = useRef({ x: -1, y: -1 })
        const lastScrollbarTouchPositionRef = useRef({ x: -1, y: -1 })
        const lastTouchPositionRef = useRef({ x: -1, y: -1 })
        const [refreshTime, setRefreshTime] = useState(0)

        const [verticalScrollbarWidth, setVerticalScrollbarWidth] = useState(0)
        const [verticalScrollbarLength, setVerticalScrollbarLength] = useState(100)
        const [verticalScrollbarPosition, setVerticalScrollbarPosition] = useState(0)
        const [isVerticalScrollbarOnClick, setIsVerticalScrollbarOnClick] = useState(false)
        const [isVerticalScrollbarOnTouch, setIsVerticalScrollbarOnTouch] = useState(false)
        const [isVerticalScrollbarAutoHide, setIsVerticalScrollbarAutoHide] = useState(false)

        const [horizontalScrollbarWidth, setHorizontalScrollbarWidth] = useState(0)
        const [horizontalScrollbarLength, setHorizontalScrollbarLength] = useState(100)
        const [horizontalScrollbarPosition, setHorizontalScrollbarPosition] = useState(0)
        const [isHorizontalScrollbarOnClick, setIsHorizontalScrollbarOnClick] = useState(false)
        const [isHorizontalScrollbarOnTouch, setIsHorizontalScrollbarOnTouch] = useState(false)
        const [isHorizontalScrollbarAutoHide, setIsHorizontalScrollbarAutoHide] = useState(false)

        const isPreventAnyScroll =
            isPreventScroll || isPreventVerticalScroll || isPreventHorizontalScroll

        useEffect(() => {
            if (autoHideWaitingTime === undefined) {
                return
            }
            setIsVerticalScrollbarAutoHide(false)
            if (autoHideWaitingTime > 0) {
                setTimeout(() => {
                    setIsVerticalScrollbarAutoHide(true)
                }, autoHideWaitingTime)
            }
        }, [autoHideWaitingTime, verticalScrollbarPosition])

        useEffect(() => {
            if (autoHideWaitingTime === undefined) {
                return
            }
            setIsHorizontalScrollbarAutoHide(false)
            if (autoHideWaitingTime > 0) {
                setTimeout(() => {
                    setIsHorizontalScrollbarAutoHide(true)
                }, autoHideWaitingTime)
            }
        }, [autoHideWaitingTime, horizontalScrollbarPosition])

        const handleDefaultTouchStart = useCallback(
            (event: TouchEvent) => {
                if (event.touches.length !== 1 || isPreventScroll) {
                    lastTouchPositionRef.current = { x: -1, y: -1 }
                    return
                }

                const { clientX, clientY } = event.touches[0]
                lastTouchPositionRef.current = { x: clientX, y: clientY }
            },
            [isPreventScroll]
        )

        const handleDefaultTouchmove = useCallback(
            (event: TouchEvent) => {
                if (event.touches.length !== 1 || isPreventScroll) {
                    lastTouchPositionRef.current = { x: -1, y: -1 }
                    return
                }
                const { clientX, clientY } = event.touches[0]

                if (!isPreventVerticalScroll) {
                    rootRef.current?.scrollTo({
                        top:
                            rootRef.current?.scrollTop + (lastTouchPositionRef.current.y - clientY),
                        behavior: 'instant'
                    })
                }

                if (!isPreventHorizontalScroll) {
                    rootRef.current?.scrollTo({
                        left:
                            rootRef.current?.scrollLeft +
                            (lastTouchPositionRef.current.x - clientX),
                        behavior: 'instant'
                    })
                }

                lastTouchPositionRef.current = { x: clientX, y: clientY }
            },
            [isPreventHorizontalScroll, isPreventScroll, isPreventVerticalScroll]
        )

        const handleDefaultMouseDown = (event: MouseEvent) => {
            if (isPreventAnyScroll)
                if (event.button === 1) {
                    event.preventDefault()
                }
        }

        const handleDefaultKeyDown = useCallback(
            (event: KeyboardEvent) => {
                if (
                    isPreventScroll &&
                    [
                        'ArrowUp',
                        'ArrowDown',
                        'ArrowLeft',
                        'ArrowRight',
                        ' ',
                        '',
                        'PageUp',
                        'PageDown',
                        'Home',
                        'End'
                    ].find((value) => value === event.key)
                ) {
                    event.preventDefault()
                }
                if (
                    isPreventVerticalScroll &&
                    ['ArrowUp', 'ArrowDown', ' ', '', 'PageUp', 'PageDown', 'Home', 'End'].find(
                        (value) => value === event.key
                    )
                ) {
                    event.preventDefault()
                }
                if (
                    isPreventHorizontalScroll &&
                    ['ArrowLeft', 'ArrowRight'].find((value) => value === event.key)
                ) {
                    event.preventDefault()
                }
            },
            [isPreventHorizontalScroll, isPreventScroll, isPreventVerticalScroll]
        )

        const handleScrollbarMouseEvent = (eventFlag: string, scrollbarFlag: string) => {
            return (event: MouseEvent) => {
                switch (eventFlag) {
                    case 'down':
                        lastScrollbarClickPositionRef.current = {
                            x: event.clientX,
                            y: event.clientY
                        }
                        switch (scrollbarFlag) {
                            case 'vertical':
                                setIsVerticalScrollbarOnClick(true)
                                break
                            case 'horizontal':
                                setIsHorizontalScrollbarOnClick(true)
                                break
                        }
                        break
                    case 'up':
                    case 'leave':
                        setIsVerticalScrollbarOnClick(false)
                        setIsHorizontalScrollbarOnClick(false)
                        break
                    case 'move':
                        if (isVerticalScrollbarOnClick) {
                            rootRef.current?.scrollTo({
                                top:
                                    rootRef.current?.scrollTop +
                                    ((event.clientY - lastScrollbarClickPositionRef.current.y) /
                                        (rootRef.current?.clientHeight ?? 1)) *
                                        (contentRef.current?.clientHeight ?? 0),
                                behavior: 'instant'
                            })
                        }
                        if (isHorizontalScrollbarOnClick) {
                            rootRef.current?.scrollTo({
                                left:
                                    rootRef.current?.scrollLeft +
                                    ((event.clientX - lastScrollbarClickPositionRef.current.x) /
                                        (rootRef.current?.clientWidth ?? 1)) *
                                        (contentRef.current?.clientWidth ?? 0),
                                behavior: 'instant'
                            })
                        }
                        lastScrollbarClickPositionRef.current = {
                            x: event.clientX,
                            y: event.clientY
                        }
                }
            }
        }

        const handleScrollbarTouchEvent = (eventFlag: string, scrollbarFlag: string) => {
            return (event: TouchEvent) => {
                switch (eventFlag) {
                    case 'start':
                        if (event.touches.length !== 1) {
                            return
                        }
                        lastScrollbarTouchPositionRef.current = {
                            x: event.touches[0].clientX,
                            y: event.touches[0].clientY
                        }
                        switch (scrollbarFlag) {
                            case 'vertical':
                                setIsVerticalScrollbarOnTouch(true)
                                break
                            case 'horizontal':
                                setIsHorizontalScrollbarOnTouch(true)
                                break
                        }
                        break
                    case 'end':
                    case 'cancel':
                        setIsVerticalScrollbarOnTouch(false)
                        setIsHorizontalScrollbarOnTouch(false)
                        break
                    case 'move':
                        if (event.touches.length !== 1) {
                            return
                        }
                        if (isVerticalScrollbarOnTouch) {
                            rootRef.current?.scrollTo({
                                top:
                                    rootRef.current?.scrollTop +
                                    ((event.touches[0].clientY -
                                        lastScrollbarClickPositionRef.current.y) /
                                        (rootRef.current?.clientHeight ?? 1)) *
                                        (contentRef.current?.clientHeight ?? 0),
                                behavior: 'instant'
                            })
                        }
                        if (isHorizontalScrollbarOnTouch) {
                            rootRef.current?.scrollTo({
                                left:
                                    rootRef.current?.scrollLeft +
                                    ((event.touches[0].clientX -
                                        lastScrollbarClickPositionRef.current.x) /
                                        (rootRef.current?.clientWidth ?? 1)) *
                                        (contentRef.current?.clientWidth ?? 0),
                                behavior: 'instant'
                            })
                        }
                        lastScrollbarClickPositionRef.current = {
                            x: event.touches[0].clientX,
                            y: event.touches[0].clientY
                        }
                }
            }
        }

        const handleDefaultScroll = (event: UIEvent<HTMLDivElement>) => {
            onScroll?.(event)
            setVerticalScrollbarPosition(
                ((rootRef.current?.scrollTop ?? 0) / (contentRef.current?.clientHeight ?? 1)) * 100
            )
            setHorizontalScrollbarPosition(
                ((rootRef.current?.scrollLeft ?? 0) / (contentRef.current?.clientWidth ?? 1)) * 100
            )
        }

        const refreshLayout = () => {
            setRefreshTime(Date.now())
        }

        const reloadScrollbar = () => {
            setVerticalScrollbarWidth(
                (rootRef.current?.offsetWidth ?? 0) - (rootRef.current?.clientWidth ?? 0)
            )
            setHorizontalScrollbarWidth(
                (rootRef.current?.offsetHeight ?? 0) - (rootRef.current?.clientHeight ?? 0)
            )

            rootRef.current &&
                setVerticalScrollbarLength(
                    (rootRef.current.clientHeight / (contentRef.current?.clientHeight ?? 0)) * 100
                )

            rootRef.current &&
                setHorizontalScrollbarLength(
                    (rootRef.current.clientWidth / (contentRef.current?.clientWidth ?? 0)) * 100
                )

            refreshLayout()
        }

        useEffect(() => {
            setTimeout(() => {
                reloadScrollbar()
            }, 500)
            const resizeObserver = new ResizeObserver(() => {
                reloadScrollbar()
            })
            maskRef.current && resizeObserver.observe(maskRef.current)
            contentRef.current && resizeObserver.observe(contentRef.current)

            return () => {
                maskRef.current && resizeObserver.unobserve(maskRef.current)
                contentRef.current && resizeObserver.unobserve(contentRef.current)
            }
        }, [])

        useEffect(() => {
            rootRef.current?.removeEventListener('wheel', wheelListenerRef.current)
            const handleDefaultWheel = (event: WheelEvent) => {
                if (!event.altKey && !event.ctrlKey) {
                    if (isPreventScroll) {
                        event.preventDefault()
                        return
                    }
                    if (
                        isPreventVerticalScroll &&
                        verticalScrollbarLength < 100 &&
                        !event.shiftKey &&
                        !event.deltaX
                    ) {
                        event.preventDefault()
                        return
                    }
                    if (isPreventHorizontalScroll && (event.shiftKey || !event.deltaY)) {
                        event.preventDefault()
                        return
                    }
                    setVerticalScrollbarLength((prevState) => {
                        if (
                            !isPreventHorizontalScroll &&
                            prevState >= 100 &&
                            !event.shiftKey &&
                            !event.deltaX
                        ) {
                            event.preventDefault()
                            rootRef.current?.scrollTo({
                                left: rootRef.current?.scrollLeft + event.deltaY,
                                behavior: 'smooth'
                            })
                        }
                        return prevState
                    })
                }
            }
            wheelListenerRef.current = handleDefaultWheel
            rootRef.current?.addEventListener('wheel', handleDefaultWheel, { passive: false })
        }, [
            isPreventAnyScroll,
            isPreventHorizontalScroll,
            isPreventScroll,
            isPreventVerticalScroll
        ])

        return (
            <div
                className={styles.hideScrollbarMask}
                ref={maskRef}
                onMouseMove={
                    !isPreventScroll ? handleScrollbarMouseEvent('move', 'all') : undefined
                }
                onTouchMove={
                    !isPreventScroll ? handleScrollbarTouchEvent('move', 'all') : undefined
                }
                onMouseUp={!isPreventScroll ? handleScrollbarMouseEvent('up', 'all') : undefined}
                onTouchEnd={!isPreventScroll ? handleScrollbarTouchEvent('end', 'all') : undefined}
                onMouseLeave={
                    !isPreventScroll ? handleScrollbarMouseEvent('leave', 'all') : undefined
                }
                onTouchCancel={
                    !isPreventScroll ? handleScrollbarTouchEvent('cancel', 'all') : undefined
                }
            >
                <div
                    ref={rootRef}
                    className={`${styles.hideScrollbarSelection}${className ? ` ${className}` : ''}`}
                    style={{
                        width: `calc(${maskRef.current?.clientWidth}px + ${verticalScrollbarWidth}px)`,
                        height: `calc(${maskRef.current?.clientHeight}px + ${horizontalScrollbarWidth}px)`,
                        touchAction: isPreventAnyScroll ? 'none' : '',
                        msTouchAction: isPreventAnyScroll ? 'none' : '',
                        ...style
                    }}
                    {...props}
                    onMouseDown={isPreventAnyScroll ? handleDefaultMouseDown : undefined}
                    onKeyDown={isPreventAnyScroll ? handleDefaultKeyDown : undefined}
                    onTouchStart={isPreventAnyScroll ? handleDefaultTouchStart : undefined}
                    onTouchMove={isPreventAnyScroll ? handleDefaultTouchmove : undefined}
                    onScroll={handleDefaultScroll}
                >
                    <div
                        className={styles.hideScrollbarContent}
                        ref={contentRef}
                        style={{ minWidth, minHeight }}
                        data-refresh={refreshTime}
                    >
                        {children}
                    </div>
                </div>
                {isShowVerticalScrollbar &&
                    (!isHiddenVerticalScrollbarWhenFull || verticalScrollbarLength < 100) && (
                        <div
                            className={cx(
                                styles.scrollbar,
                                styles.verticalScrollbar,
                                isVerticalScrollbarAutoHide ? styles.hide : ''
                            )}
                            style={{
                                height: maskRef.current
                                    ? maskRef.current?.clientHeight - 1
                                    : undefined,
                                top: maskRef.current?.clientTop,
                                left: maskRef.current
                                    ? maskRef.current?.clientLeft + maskRef.current?.clientWidth - 1
                                    : undefined,
                                padding: `${scrollbarAsidePadding}px ${scrollbarEdgePadding}px`
                            }}
                        >
                            <div className={styles.scrollbarBox} style={{ width: scrollbarWidth }}>
                                <div
                                    className={styles.scrollbarBoxBlock}
                                    style={{
                                        height: `${verticalScrollbarLength}%`,
                                        top: `clamp(0px, ${verticalScrollbarPosition}%, ${
                                            100 - verticalScrollbarLength
                                        }%)`
                                    }}
                                    onMouseDown={
                                        !isPreventScroll && !isPreventVerticalScroll
                                            ? handleScrollbarMouseEvent('down', 'vertical')
                                            : undefined
                                    }
                                    onTouchStart={
                                        !isPreventScroll && !isPreventVerticalScroll
                                            ? handleScrollbarTouchEvent('start', 'vertical')
                                            : undefined
                                    }
                                />
                            </div>
                        </div>
                    )}
                {isShowHorizontalScrollbar &&
                    (!isHiddenHorizontalScrollbarWhenFull || horizontalScrollbarLength < 100) && (
                        <div
                            className={cx(
                                styles.scrollbar,
                                styles.horizontalScrollbar,
                                isHorizontalScrollbarAutoHide ? styles.hide : ''
                            )}
                            style={{
                                width: maskRef.current
                                    ? maskRef.current?.clientWidth - 1
                                    : undefined,
                                left: maskRef.current?.clientLeft,
                                top: maskRef.current
                                    ? maskRef.current?.clientTop + maskRef.current?.clientHeight - 1
                                    : undefined,
                                padding: `${scrollbarEdgePadding}px ${scrollbarAsidePadding}px`
                            }}
                        >
                            <div className={styles.scrollbarBox} style={{ height: scrollbarWidth }}>
                                <div
                                    className={styles.scrollbarBoxBlock}
                                    style={{
                                        width: `${horizontalScrollbarLength}%`,
                                        left: `clamp(0px, ${horizontalScrollbarPosition}%, ${
                                            100 - horizontalScrollbarLength
                                        }%)`
                                    }}
                                    onMouseDown={
                                        !isPreventScroll && !isPreventHorizontalScroll
                                            ? handleScrollbarMouseEvent('down', 'horizontal')
                                            : undefined
                                    }
                                    onTouchStart={
                                        !isPreventScroll && !isPreventHorizontalScroll
                                            ? handleScrollbarTouchEvent('start', 'horizontal')
                                            : undefined
                                    }
                                />
                            </div>
                        </div>
                    )}
            </div>
        )
    }
)

export default HideScrollbar
