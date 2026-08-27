import { createStyles } from 'antd-style'

export default createStyles(({ cx, css, token }) => {
    const active = cx(css`
        color: ${token.colorTextLightSolid};
        background-color: ${token.colorPrimary} !important;
    `)

    return {
        root: css`
            position: relative;
            font-size: ${token.fontSizeHeading5}px;
            padding: ${token.paddingXXS}px ${token.paddingSM}px;

            &:hover > div:not(.${active}) {
                background-color: ${token.colorBgLayout};
            }
        `,

        submenuItem: {
            borderRadius: token.borderRadiusLG,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            padding: '0 !important',

            '> div': {
                display: 'block !important',
                padding: `${token.paddingXS}px ${token.paddingMD}px !important`
            }
        },

        menuBt: {
            display: 'flex',
            alignItems: 'center',
            borderRadius: token.borderRadiusLG,
            overflow: 'hidden',
            height: 40,
            transition: 'all 0.2s',
            cursor: 'pointer'
        },

        active,

        icon: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: `0 ${token.paddingXS}px`,
            width: 40,
            height: 40,
            flex: '0 0 auto',
            fontSize: token.sizeMD,
            cursor: 'pointer',

            img: {
                width: '100%'
            }
        },

        text: {
            flex: 1,
            paddingLeft: token.paddingXS,
            width: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },

        collapsedText: {
            display: 'none'
        },

        collapsedExtend: {
            display: 'none'
        }
    }
})
