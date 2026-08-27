import { createStyles, keyframes } from 'antd-style'

export default createStyles(({ token }) => {
    const slideIn = keyframes`
        0% {
            transform: translateX(-${token.sizeSM}px);
            opacity: 0;
        }
        100% {
            transform: translateX(0);
            opacity: 1;
        }
    `

    const slideOut = keyframes`
         0% {
           transform: translateX(0);
           opacity: 1;
         }
         100% {
           transform: translateX(-${token.sizeSM}px);
           opacity: 0;
         }
    `

    return {
        root: {
            visibility: 'hidden',
            position: 'fixed',
            paddingLeft: token.paddingXS,
            zIndex: 10000,
            animation: `${slideOut} 0.1s ease forwards`,
            boxShadow: token.boxShadow
        },

        hoveredSubmenu: {
            visibility: 'visible',
            animation: `${slideIn} 0.3s ease`
        },

        content: {
            display: 'flex',
            flexDirection: 'column',
            gap: token.sizeXXS,
            padding: token.paddingSM,
            backgroundColor: token.colorBgContainer,
            borderRadius: token.borderRadiusLG,
            boxShadow: token.boxShadow
        }
    }
})
