import React from 'react';
import { createDrawerNavigator, DrawerNavigationOptions } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { DrawerRoutes, DrawerRouteNames } from '../navigations-maps/Drawer';
import CustomDrawer from '../Components/CustomDrawerContent';

// Define the drawer param list
export type DrawerParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  LogoutScreen: undefined; // Make sure this matches your route name in menuItems
};

const Drawer = createDrawerNavigator<DrawerParamList>();

interface DrawerIconProps {
  focused: boolean;
  color: string;
  size: number;
}

// Icon mapping for each route
const getDrawerIcon = (routeName: string, { focused, color }: DrawerIconProps) => {
  let iconName: keyof typeof Ionicons.glyphMap;
   
  switch (routeName) {
    case DrawerRouteNames.Home:
      iconName = focused ? 'home' : 'home-outline';
      break;
    case DrawerRouteNames.Profile:
      iconName = focused ? 'person' : 'person-outline';
      break;
    case DrawerRouteNames.Settings:
      iconName = focused ? 'settings' : 'settings-outline';
      break;
    case DrawerRouteNames.LogoutScreen:
      iconName = focused ? 'log-out' : 'log-out-outline';
      break;
    default:
      iconName = 'home-outline';
  }
   
  return <Ionicons name={iconName} size={22} color={color} />;
};

const DrawerNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        // Hide default header since we're using custom headers in screens
        headerShown: false,
        
        // Drawer configuration
        drawerStyle: {
          backgroundColor: '#fff',
          width: 280,
        },
        drawerType: 'front',
        
        // Gesture configuration
        swipeEnabled: true,
        swipeEdgeWidth: 50,
        
        // Animation
        drawerHideStatusBarOnOpen: false,
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        
        // Default drawer item styling (won't show since we use custom drawer)
        drawerActiveTintColor: '#1976d2',
        drawerInactiveTintColor: '#666',
        drawerActiveBackgroundColor: '#e3f2fd',
      }}
    >
      {DrawerRoutes.map((route) => (
        <Drawer.Screen
          key={route.title}
          name={route.title as keyof DrawerParamList}
          component={route.component}
          options={{
            title: route.options.headerTitle || route.title,
            headerShown: route.options.headerShown,
            drawerItemStyle: route.options.drawerItemStyle || { display: 'none' }, // Hide default items since we use custom drawer
            drawerIcon: (props: DrawerIconProps) => getDrawerIcon(route.title, props),
          } as DrawerNavigationOptions}
        />
      ))}
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;