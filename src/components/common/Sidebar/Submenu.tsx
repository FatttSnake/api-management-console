import { PropsWithChildren } from 'react'
import useStyles from '@/assets/css/components/common/sidebar/submenu.style'
import { ItemContext } from '@/components/common/Sidebar/Item'

export const SubmenuContext = createContext({ isInSubmenu: false })

interface SidebarSubmenuProps {
    submenuTop: number
    submenuLeft: number
}

const Submenu = (props: PropsWithChildren<SidebarSubmenuProps>) => {
    const { styles, cx } = useStyles()
    const { isHover } = useContext(ItemContext)

    return (
        <SubmenuContext.Provider value={{ isInSubmenu: true }}>
            <ul
                className={cx(styles.root, isHover ? styles.hoveredSubmenu : '')}
                style={{
                    top: props.submenuTop,
                    left: props.submenuLeft - 1
                }}
            >
                <div className={styles.content}>{props.children}</div>
            </ul>
        </SubmenuContext.Provider>
    )
}

export default Submenu
