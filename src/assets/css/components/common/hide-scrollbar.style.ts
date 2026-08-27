import { createStyles, keyframes } from 'antd-style'

const fadeOut = keyframes`
    0% {
        opacity: 0.5;
    }
    100% {
        opacity: 0;
    }
`

export default createStyles(({ css, cx, token }) => {
    const scrollbarBox = cx(css`
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: ${token.borderRadiusLG};
        overflow: hidden;
    `)

    return {
        hideScrollbarMask: {
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            '::-webkit-scrollbar': {
                display: 'none'
            }
        },
        hideScrollbarSelection: {
            position: 'relative',
            overflow: 'scroll',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
        },
        hideScrollbarContent: {
            minWidth: '100%'
        },
        scrollbar: {
            position: 'absolute',
            zIndex: 1000,
            opacity: 0.5,
            touchAction: 'none'
        },
        scrollbarBox,
        scrollbarBoxBlock: {
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: token.borderRadiusLG,
            backgroundColor: token.colorTextSecondary,
            transition: 'background-color 0.2s',
            ':hover': {
                backgroundColor: token.colorTextLabel
            }
        },
        verticalScrollbar: css`
            height: 100%;
            left: 100%;
            top: 0;
            transform: translateX(-100%);

            .${scrollbarBox} {
                width: ${token.sizeXXS}px;
            }
        `,
        horizontalScrollbar: css`
            width: 100%;
            left: 0;
            top: 100%;
            transform: translateY(-100%);

            .${scrollbarBox} {
                height: ${token.sizeXXS}px;
            }
        `,
        hide: {
            display: 'block',
            opacity: 0,
            animation: `${fadeOut} 0.4s linear`
        }
    }
})
