import { createStyles, keyframes } from 'antd-style'

const slideIn = keyframes`
    0% {
        transform: translateX(-10px);
        opacity: 0;
    }
    100% {
        transform: translateX(0);
        opacity: 1;
    }
`

export default createStyles(({ cx, css, token }) => {
    const collapsedExit = cx(css`
        opacity: 0;
        position: absolute;
        padding-left: ${token.paddingXS}px;
        left: 100%;
        z-index: 1000;
        transform: translateX(-100%);
    `)

    return {
        root: css`
            display: flex;
            position: relative;
            align-items: center;
            font-weight: bold;
            padding: ${token.paddingXS}px ${token.paddingSM}px;
            color: ${token.colorPrimary};

            &:hover .${collapsedExit} {
                opacity: 1;
                animation: ${slideIn} 0.3s ease;
                transform: unset;
            }
        `,

        icon: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flex: '0 0 auto',
            marginLeft: token.marginXXS,
            width: token.sizeXL,
            height: token.sizeXL,
            fontSize: token.sizeMS,
            border: `2px ${token.colorBorder} solid`,
            color: token.colorBorder,
            borderRadius: '50%',
            overflow: 'hidden',
            cursor: 'pointer',

            img: {
                width: '100%',
                height: '100%'
            }
        },

        text: {
            flex: 1,
            paddingLeft: token.paddingXS,
            fontSize: token.fontSizeLG,
            color: token.colorTextLabel,
            userSelect: 'text',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            a: {
                color: token.colorPrimary,
                textDecoration: 'underline'
            }
        },

        collapsedText: {
            display: 'none'
        },

        collapsedExit,

        hide: {
            display: 'none !important'
        },

        exitContent: {
            display: 'flex',
            backgroundColor: token.colorBgContainer
        },

        collapsedExitContent: {
            padding: token.paddingXS,
            borderRadius: token.borderRadiusLG,
            boxShadow: token.boxShadow
        },

        exitIcon: {
            fontSize: token.sizeMS,
            color: token.colorError,
            padding: `${token.paddingXXS}px ${token.paddingXS}px`,
            cursor: 'pointer',

            '&:hover': {
                borderRadius: token.borderRadiusLG,
                backgroundColor: token.colorBgLayout
            }
        },

        collapsedExitIcon: {
            padding: `${token.paddingXXS}px ${token.paddingXS}px`
        }
    }
})
