import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../hooks/useReduxHooks';
import { selectMessage, setMessage } from '../screens/home-screen/homeScreenSlice';

interface MenuItem {
  name: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}

interface QuickAction {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  action: () => void;
}

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const { navigation, state } = props;
  const dispatch = useAppDispatch();
  const message = useAppSelector(selectMessage);

  const menuItems: MenuItem[] = [
    { 
      name: 'Home', 
      route: 'Home',
      icon: 'home-outline',
      activeIcon: 'home'
    },
    { 
      name: 'Profile', 
      route: 'Profile',
      icon: 'person-outline',
      activeIcon: 'person'
    },
    { 
      name: 'Settings', 
      route: 'Settings',
      icon: 'settings-outline',
      activeIcon: 'settings'
    },
    { 
      name: 'Logout', 
      route: 'LogoutScreen', // Note: This should match your actual route name
      icon: 'log-out-outline',
      activeIcon: 'log-out'
    },
  ];

  const quickActions: QuickAction[] = [
    {
      name: 'Update Message',
      icon: 'refresh',
      action: (): void => {
        dispatch(setMessage('Message updated from Menu! 🇵🇰'));
        Alert.alert('Success', 'Message updated!');
        navigation.closeDrawer();
      }
    },
    {
      name: 'Reset Message',
      icon: 'refresh-circle',
      action: (): void => {
        dispatch(setMessage('Hello Pakistan'));
        Alert.alert('Success', 'Message reset!');
        navigation.closeDrawer();
      }
    },
    {
      name: 'Notifications',
      icon: 'notifications-outline',
      action: (): void => {
        Alert.alert('Notifications', 'No new notifications');
        navigation.closeDrawer();
      }
    }
  ];

  const closeDrawer = (): void => {
    navigation.closeDrawer();
  };

  // Fixed: Get current active route name correctly
  const getCurrentRouteName = () => {
    const route = state.routes[state.index];
    return route.name;
  };

  const currentRoute = getCurrentRouteName();

  return (
    <DrawerContentScrollView {...props} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={closeDrawer} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>

        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={30} color="#1976d2" />
          </View>
          <Text style={styles.userName}>Waleed Hassan</Text>
          <Text style={styles.userEmail}>waleed@gmail.com</Text>
        </View>
      </View>

      {/* Current Status */}
      <View style={styles.statusSection}>
        <Text style={styles.statusLabel}>Current Status:</Text>
        <Text style={styles.statusMessage}>{message}</Text>
      </View>

      {/* Main Menu */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>MENU</Text>
        {menuItems.map((item: MenuItem) => {
          // Fixed: Compare with current route correctly
          const isActive = currentRoute === item.route;

          return (
            <TouchableOpacity
              key={item.route}
              style={[styles.menuItem, isActive && styles.activeMenuItem]}
              onPress={() => {
                try {
                  navigation.navigate(item.route as any);
                  closeDrawer();
                } catch (error) {
                  console.error('Navigation error:', error);
                  Alert.alert('Error', 'Could not navigate to ' + item.name);
                }
              }}
            >
              <Ionicons 
                name={isActive ? item.activeIcon : item.icon} 
                size={22} 
                color={isActive ? '#1976d2' : '#666'} 
              />
              <Text style={[styles.menuText, isActive && styles.activeMenuText]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
        {quickActions.map((action: QuickAction, index: number) => (
          <TouchableOpacity
            key={index}
            style={styles.actionItem}
            onPress={action.action}
          >
            <Ionicons name={action.icon} size={20} color="#1976d2" />
            <Text style={styles.actionText}>{action.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerItem}>
          <Ionicons name="help-circle-outline" size={20} color="#666" />
          <Text style={styles.footerText}>Help</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.footerItem}
          onPress={() => {
            Alert.alert('Contact', 'For support, email: support@example.com', [
              { text: 'OK' }
            ]);
          }}
        >
          <Ionicons name="mail-outline" size={20} color="#1976d2" />
          <Text style={styles.footerText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 5,
    marginBottom: 15,
  },
  userInfo: {
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  statusSection: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statusMessage: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  menuSection: {
    paddingTop: 20,
  },
  actionsSection: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 2,
  },
  activeMenuItem: {
    backgroundColor: '#e3f2fd',
  },
  menuText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 15,
    fontWeight: '500',
  },
  activeMenuText: {
    color: '#1976d2',
    fontWeight: 'bold',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  actionText: {
    fontSize: 14,
    color: '#1976d2',
    marginLeft: 12,
    fontWeight: '500',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 20,
    marginTop: 20,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
});

export default CustomDrawerContent;