// navigations-map/Drawer.ts
import HomeScreen from "../screens/HomeScreen/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen/Settings";
import LogoutScreen from "../screens/LogoutScreen/logout";

export const DrawerRouteNames = {
  Home: "Home",
  Profile: "Profile",
  Settings: "Settings",
  LogoutScreen: "Logout", // Make sure this matches the route name in your CustomDrawer menuItems
} as const;

export type DrawerRouteNamesType = typeof DrawerRouteNames[keyof typeof DrawerRouteNames];

interface RouteOptions {
  headerShown?: boolean;
  headerTitle?: string;
  drawerItemStyle?: { display: string };
}

interface IRoute {
  component: React.ComponentType<any>;
  title: DrawerRouteNamesType;
  options: RouteOptions;
}

export interface IRoutes extends Array<IRoute> {}

/**
 * Drawer routes configuration
 */
export const DrawerRoutes: IRoutes = [
  {
    component: HomeScreen,
    title: DrawerRouteNames.Home,
    options: {
      headerShown: false, // Using custom header
      headerTitle: 'Home',
    },
  },
  {
    component: ProfileScreen,
    title: DrawerRouteNames.Profile,
    options: {
      headerShown: false, // You can create similar custom headers for other screens
      headerTitle: 'Profile',
    },
  },
  {
    component: SettingsScreen,
    title: DrawerRouteNames.Settings,
    options: {
      headerShown: false,
      headerTitle: 'Settings',
    },
  },
  {
    component: LogoutScreen,
    title: DrawerRouteNames.LogoutScreen,
    options: {
      headerShown: false,
      headerTitle: 'Logout',
    },
  },
];