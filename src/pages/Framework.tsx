import useStyles from '@/assets/css/pages/framework.style'
import { getUserZoneRouteJson } from '@/routers/user'
import { getSystemZoneRouteJson } from '@/routers/system'
import FitFullscreen from '@/components/common/FitFullscreen'
import Sidebar from '@/components/common/Sidebar'
import FullscreenLoadingMask from '@/components/common/FullscreenLoadingMask'

const SystemFramework = () => {
    const { styles, cx } = useStyles()
    const location = useLocation()
    const navigate = useNavigate()
    const userZone = getUserZoneRouteJson()
    const systemZone = getSystemZoneRouteJson()

    const mapToMenu = (routeJsonList: RouteJsonObject[]): ReactNode[] =>
        routeJsonList.map(
            (route) =>
                route.menu &&
                route.name && (
                    <Sidebar.Item
                        icon={route.icon}
                        text={route.name}
                        key={route.id}
                        active={
                            location.pathname === route.absolutePath &&
                            !route.children?.some((item) => location.pathname === item.absolutePath)
                        }
                        onClick={() => navigate(route.absolutePath)}
                    >
                        {route.children?.map(
                            (subRoute) =>
                                subRoute.menu &&
                                subRoute.name && (
                                    <Sidebar.Item
                                        text={subRoute.name}
                                        key={subRoute.id}
                                        active={location.pathname === subRoute.absolutePath}
                                        onClick={() => navigate(subRoute.absolutePath)}
                                    />
                                )
                        )}
                    </Sidebar.Item>
                )
        )

    return (
        <FitFullscreen className={cx(styles.root, 'flex-horizontal')}>
            <div className={styles.leftPanel}>
                <Sidebar title={'API Management'}>
                    <Sidebar.Scroll>
                        <Sidebar.ItemList>
                            {mapToMenu(userZone)}
                            {systemZone.length ? (
                                <>
                                    <Sidebar.Separate />
                                    {mapToMenu(systemZone)}
                                </>
                            ) : undefined}
                        </Sidebar.ItemList>
                    </Sidebar.Scroll>
                </Sidebar>
            </div>
            <div className={styles.rightPanel}>
                <Suspense fallback={<FullscreenLoadingMask />}>
                    <Outlet />
                </Suspense>
            </div>
        </FitFullscreen>
    )
}

export default SystemFramework
