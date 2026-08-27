import { createStyles } from 'antd-style'

export default createStyles(({ cx, css, token }) => {
    const cover = cx(css`
        position: absolute;
        height: 100%;
        width: 50%;
        background-color: ${token.colorBgLayout};
        transition: all 0.8s ease;
    `)

    const ball = cx(css`
        position: absolute;
        width: ${token.sizeXL * 4}px;
        height: ${token.sizeXL * 4}px;
        background-color: ${token.colorPrimary};
        border-radius: 50%;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%) translateY(50%);
    `)

    return {
        root: {
            backgroundColor: token.colorBorderSecondary,
            userSelect: 'none',

            a: {
                fontWeight: 'bold'
            }
        },

        signBox: {
            position: 'relative',
            backgroundColor: token.colorBgContainer,
            width: 900,
            height: 600,
            overflow: 'hidden',
            borderRadius: token.borderRadiusLG
        },

        switch: css`
            .${cover} {
                transform: translateX(100%);
                transition: all 0.8s ease;
            }
        `,

        side: {
            opacity: 1,
            transition: 'all 1s ease',

            '> *': {
                width: '100%',
                height: '100%'
            }
        },

        hidden: {
            opacity: 0
        },

        cover,

        ballBox: {
            position: 'relative',
            overflow: 'hidden'
        },

        ball,

        mask: css`
            transform: rotateZ(180deg);
            filter: blur(${token.sizeSM}px);

            .${ball} {
                width: 140px;
                height: 140px;
            }
        `
    }
})
