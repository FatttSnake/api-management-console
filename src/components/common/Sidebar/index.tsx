import { PropsWithChildren } from 'react'
import Icon from '@ant-design/icons'
import useStyles from '@/assets/css/components/common/sidebar/index.style'
import { getSidebarCollapse, setSidebarCollapse } from '@/utils/common'
import Item from '@/components/common/Sidebar/Item'
import ItemList from '@/components/common/Sidebar/ItemList'
import Scroll from '@/components/common/Sidebar/Scroll'
import Separate from '@/components/common/Sidebar/Separate'
import Submenu from '@/components/common/Sidebar/Submenu'
import Footer from '@/components/common/Sidebar/Footer'

export const SidebarContext = createContext({ isCollapse: false })

interface SidebarProps {
    title: string
    width?: string
    onSidebarSwitch?: (hidden: boolean) => void
    bottomFixed?: ReactNode
}

const Sidebar = (props: PropsWithChildren<SidebarProps>) => {
    const { styles, cx } = useStyles()
    const [isCollapse, setIsCollapse] = useState(getSidebarCollapse())

    const switchSidebar = () => {
        setSidebarCollapse(!isCollapse)
        setIsCollapse(!isCollapse)
        props.onSidebarSwitch?.(isCollapse)
    }

    return (
        <SidebarContext.Provider value={{ isCollapse }}>
            <div
                className={cx(styles.root, isCollapse ? styles.collapse : '')}
                style={{ width: props.width ?? 'clamp(180px, 20vw, 240px)' }}
            >
                <div className={styles.title}>
                    <span className={styles.titleIcon} onClick={switchSidebar}>
                        <Icon component={IconConsoleExpand} />
                    </span>
                    <span className={styles.titleText}>{props.title}</span>
                </div>
                <Separate style={{ marginTop: 0 }} />
                <div className={styles.content}>{props.children}</div>
                <div className={styles.content} style={{ flex: 'none' }}>
                    {props.bottomFixed}
                </div>
                <Separate style={{ marginTop: 0, marginBottom: 0 }} />
                <Footer />
            </div>
        </SidebarContext.Provider>
    )
}

Sidebar.Item = Item
Sidebar.ItemList = ItemList
Sidebar.Scroll = Scroll
Sidebar.Separate = Separate
Sidebar.Submenu = Submenu
Sidebar.Footer = Footer

export default Sidebar
