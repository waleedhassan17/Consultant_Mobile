// services/NotificationService.ts - FIXED VERSION with scheduleNotificationAsync
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// CRITICAL FIX: Configure notification handler to show notifications properly
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    console.log('Handling notification:', notification.request.content.title);
    
    return {
      shouldPlaySound: true, // CHANGED: Enable sound for better visibility
      shouldSetBadge: true,  // CHANGED: Enable badge
      shouldShowAlert: true, // CRITICAL: This must be true to show notifications
      shouldShowBanner: true, // Keep this true
      shouldShowList: true, // Keep this true
    };
  },
});

export class NotificationService {
  private static expoPushToken: string | null = null;
  private static isInitialized: boolean = false;
  private static sentNotifications: Set<string> = new Set();
  private static listeners: {
    notificationListener: Notifications.Subscription;
    responseListener: Notifications.Subscription;
  } | null = null;

  // Initialize push notifications
  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('Notifications already initialized, skipping...');
      return;
    }

    try {
      // Check permissions first
      const permissions = await this.checkAndRequestPermissions();
      if (!permissions) {
        console.error('Notification permissions not granted!');
        return;
      }

      // Clear any existing notifications
      await this.clearAllNotifications();
      
      const token = await this.registerForPushNotifications();
      this.expoPushToken = token;
      this.isInitialized = true;
      
      console.log('Push notification token:', token);
      console.log('NotificationService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  }

  // ENHANCED: Better permission checking and requesting
  private static async checkAndRequestPermissions(): Promise<boolean> {
    try {
      // Check current permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log('Current permission status:', existingStatus);
      
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        console.log('Requesting notification permissions...');
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true, // CRITICAL: Must be true
            allowBadge: true, // Enable badge
            allowSound: true, // Enable sound for better visibility
            allowDisplayInCarPlay: false,
            allowCriticalAlerts: false,
            provideAppNotificationSettings: true,
            allowProvisional: false,
          },
          android: {
            allowAlert: true, // CRITICAL: Must be true
            allowBadge: true,
            allowSound: true,
          }
        });
        finalStatus = status;
      }
      
      console.log('Final permission status:', finalStatus);
      
      if (finalStatus !== 'granted') {
        console.error('Push notification permissions denied');
        console.log('Please enable notifications in device settings:');
        console.log('Settings > Apps > Your App > Notifications');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }

  // FIXED: Better Android channel configuration
  private static async registerForPushNotifications(): Promise<string | null> {
    let token: string | null = null;

    if (Platform.OS === 'android') {
      // Delete existing channels first
      try {
        await Notifications.deleteNotificationChannelAsync('auth-notifications');
        await Notifications.deleteNotificationChannelAsync('general-notifications');
      } catch (error) {
        // Ignore errors if channels don't exist
      }

      // Create auth notifications channel with MAXIMUM visibility
      await Notifications.setNotificationChannelAsync('auth-notifications', {
        name: 'Authentication Notifications',
        importance: Notifications.AndroidImportance.MAX, // CHANGED: Maximum importance
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default', // CHANGED: Enable sound for visibility
        enableLights: true,
        enableVibrate: true,
        showBadge: true, // CHANGED: Enable badge
        lightColor: '#4A90E2',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC, // ADDED: Show on lockscreen
        bypassDnd: false, // Don't bypass do not disturb
      });

      // Create general notifications channel
      await Notifications.setNotificationChannelAsync('general-notifications', {
        name: 'General Notifications',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4A90E2',
        sound: 'default',
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });

      console.log('Android notification channels created');
    }

    if (Device.isDevice) {
      try {
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
          console.warn('Project ID not found, using local notifications only');
          return 'local-only';
        }
        
        const pushToken = await Notifications.getExpoPushTokenAsync({ projectId });
        token = pushToken.data;
      } catch (error) {
        console.error('Error getting push token:', error);
        return 'local-only'; // Still allow local notifications
      }
    } else {
      console.warn('Push notifications require a physical device');
      return 'simulator-mode';
    }

    return token;
  }

  // FIXED: Sign-in notification using scheduleNotificationAsync
  static async sendSignInSuccessNotification(userType: 'visitor' | 'therapist'): Promise<void> {
    const notificationKey = `signin_${userType}`;
    
    // Check if this notification was recently sent
    if (this.sentNotifications.has(notificationKey)) {
      console.log('Sign-in notification already sent recently, skipping...');
      return;
    }

    const title = '🎉 Welcome Back!';
    const body = userType === 'therapist' 
      ? 'Successfully signed in as Therapist' 
      : 'Successfully signed in as Visitor';

    try {
      console.log(`Sending sign-in notification for ${userType}...`);

      // FIXED: Use scheduleNotificationAsync instead of presentNotificationAsync
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { 
            type: 'sign_in_success', 
            userType,
            timestamp: Date.now(),
            id: `signin_${userType}_${Date.now()}`
          },
          sound: 'default',
          badge: 1,
          priority: Notifications.AndroidNotificationPriority.MAX,
          sticky: false,
          autoDismiss: false,
          ...(Platform.OS === 'android' && {
            channelId: 'auth-notifications',
            color: '#4A90E2',
          }),
        },
        trigger: null, // Show immediately
      });

      // Mark as sent
      this.sentNotifications.add(notificationKey);
      console.log(`✅ Sign-in notification sent for ${userType}, ID: ${notificationId}`);

      // Clear the marker after 30 seconds
      setTimeout(() => {
        this.sentNotifications.delete(notificationKey);
        console.log(`Cleared sign-in notification marker for ${userType}`);
      }, 30000);

    } catch (error) {
      console.error('❌ Failed to send sign-in notification:', error);
    }
  }

  // FIXED: Sign-up notification using scheduleNotificationAsync
  static async sendSignUpSuccessNotification(userType: 'visitor' | 'therapist'): Promise<void> {
    const notificationKey = `signup_${userType}`;
    
    // Check if this notification was recently sent
    if (this.sentNotifications.has(notificationKey)) {
      console.log('Sign-up notification already sent recently, skipping...');
      return;
    }

    const title = '✅ Account Created!';
    const body = userType === 'therapist'
      ? 'Successfully signed up as Therapist'
      : 'Successfully signed up as Visitor';

    try {
      console.log(`Sending sign-up notification for ${userType}...`);

      // FIXED: Use scheduleNotificationAsync instead of presentNotificationAsync
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { 
            type: 'sign_up_success', 
            userType,
            timestamp: Date.now(),
            id: `signup_${userType}_${Date.now()}`
          },
          sound: 'default',
          badge: 1,
          priority: Notifications.AndroidNotificationPriority.MAX,
          sticky: false,
          autoDismiss: false,
          ...(Platform.OS === 'android' && {
            channelId: 'auth-notifications',
            color: '#4A90E2',
          }),
        },
        trigger: null, // Show immediately
      });

      // Mark as sent
      this.sentNotifications.add(notificationKey);
      console.log(`✅ Sign-up notification sent for ${userType}, ID: ${notificationId}`);

      // Clear the marker after 30 seconds
      setTimeout(() => {
        this.sentNotifications.delete(notificationKey);
        console.log(`Cleared sign-up notification marker for ${userType}`);
      }, 30000);

    } catch (error) {
      console.error('❌ Failed to send sign-up notification:', error);
    }
  }

  // FIXED: Better immediate notification using scheduleNotificationAsync
  static async sendImmediateNotification({
    title,
    body,
    data,
    channelId = 'general-notifications'
  }: {
    title: string;
    body: string;
    data?: any;
    channelId?: string;
  }): Promise<void> {
    try {
      // FIXED: Use scheduleNotificationAsync instead of presentNotificationAsync
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            ...data,
            presentedAt: Date.now()
          },
          sound: 'default',
          badge: 1,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          sticky: false,
          autoDismiss: false,
          ...(Platform.OS === 'android' && {
            channelId,
            color: '#4A90E2',
          }),
        },
        trigger: null, // Show immediately
      });
      
      console.log('✅ Immediate notification scheduled:', title, 'ID:', notificationId);
    } catch (error) {
      console.error('❌ Failed to schedule immediate notification:', error);
    }
  }

  // Get the current push token
  static getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  // Clear all notifications
  static async clearAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cleared');
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }

  // ENHANCED: Better notification listeners
  static setupNotificationListeners(): {
    notificationListener: Notifications.Subscription;
    responseListener: Notifications.Subscription;
  } | null {
    if (this.listeners) {
      console.log('Notification listeners already set up');
      return this.listeners;
    }

    try {
      const notificationListener = Notifications.addNotificationReceivedListener(notification => {
        console.log('📱 Notification received:', notification.request.content.title);
        console.log('📱 Notification body:', notification.request.content.body);
        
        const data = notification.request.content.data as { type?: string } | undefined;
        console.log('📱 Notification data:', data);
        
        // The notification will be shown automatically based on the handler configuration
        console.log('📱 Notification should be visible to user');
      });

      const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('👆 Notification tapped:', response.notification.request.content.title);
        
        const data = response.notification.request.content.data;
        if (data?.type) {
          console.log('👆 Notification type:', data.type);
          // Add your navigation logic here
        }

        // Notification will be automatically dismissed when tapped
      });

      this.listeners = { notificationListener, responseListener };
      console.log('✅ Notification listeners set up successfully');
      return this.listeners;
    } catch (error) {
      console.error('❌ Failed to setup notification listeners:', error);
      return null;
    }
  }

  // Clean up listeners
  static cleanupListeners(): void {
    try {
      if (this.listeners) {
        this.listeners.notificationListener.remove();
        this.listeners.responseListener.remove();
        this.listeners = null;
        console.log('Notification listeners cleaned up');
      }
    } catch (error) {
      console.error('Error cleaning up listeners:', error);
    }
  }

  // Reset service
  static reset(): void {
    this.isInitialized = false;
    this.expoPushToken = null;
    this.sentNotifications.clear();
    this.cleanupListeners();
    console.log('NotificationService reset');
  }

  // Clear notification history
  static clearNotificationHistory(notificationType?: string): void {
    if (notificationType) {
      const keysToDelete = Array.from(this.sentNotifications).filter(key => 
        key.includes(notificationType)
      );
      keysToDelete.forEach(key => this.sentNotifications.delete(key));
      console.log(`Cleared notification history for: ${notificationType}`);
    } else {
      this.sentNotifications.clear();
      console.log('Cleared all notification history');
    }
  }

  // FIXED: Enhanced test notification using scheduleNotificationAsync
  static async testNotification(): Promise<void> {
    console.log('🧪 Testing notification...');
    
    try {
      // Force check permissions first
      const hasPermissions = await this.checkAndRequestPermissions();
      if (!hasPermissions) {
        console.error('❌ Cannot test notification - permissions denied');
        return;
      }

      // FIXED: Use scheduleNotificationAsync instead of presentNotificationAsync
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 Test Notification',
          body: 'This is a test notification. If you see this, notifications are working!',
          data: { 
            type: 'test',
            timestamp: Date.now()
          },
          sound: 'default',
          badge: 1,
          priority: Notifications.AndroidNotificationPriority.MAX,
          sticky: false,
          autoDismiss: false,
          ...(Platform.OS === 'android' && {
            channelId: 'general-notifications',
            color: '#FF0000', // Red color for visibility
          }),
        },
        trigger: null, // Show immediately
      });

      console.log('✅ Test notification scheduled with ID:', notificationId);
      
      // Auto-clear after 10 seconds for test
      setTimeout(async () => {
        try {
          await Notifications.dismissNotificationAsync(notificationId);
          console.log('🧪 Test notification auto-dismissed');
        } catch (error) {
          console.log('Test notification may have been manually dismissed');
        }
      }, 10000);
      
    } catch (error) {
      console.error('❌ Failed to send test notification:', error);
    }
  }

  // Debug method
  static debugSentNotifications(): void {
    console.log('📊 Currently sent notifications:', Array.from(this.sentNotifications));
  }

  // Check permissions status
  static async checkPermissions(): Promise<void> {
    try {
      const permissions = await Notifications.getPermissionsAsync();
      console.log('📋 Current notification permissions:', permissions);
      
      if (permissions.status !== 'granted') {
        console.warn('⚠️  Notifications are not enabled. Status:', permissions.status);
        console.log('💡 To enable notifications:');
        if (Platform.OS === 'android') {
          console.log('   1. Go to Settings > Apps > [Your App] > Notifications');
          console.log('   2. Enable "Show notifications"');
          console.log('   3. Make sure the notification category is enabled');
        } else {
          console.log('   1. Go to Settings > Notifications > [Your App]');
          console.log('   2. Enable "Allow Notifications"');
          console.log('   3. Enable "Banners" or "Alerts"');
        }
      } else {
        console.log('✅ Notifications are properly enabled');
      }
    } catch (error) {
      console.error('❌ Error checking permissions:', error);
    }
  }

  // Force request permissions again
  static async requestPermissionsAgain(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowDisplayInCarPlay: false,
          allowCriticalAlerts: false,
          provideAppNotificationSettings: true,
          allowProvisional: false,
        },
        android: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        }
      });
      
      console.log('Permission request result:', status);
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  // ADDED: Method to handle authentication success with better error handling
  static async handleAuthenticationSuccess(
    type: 'signin' | 'signup', 
    userType: 'visitor' | 'therapist'
  ): Promise<void> {
    try {
      console.log(`🔐 Handling ${type} success for ${userType}`);
      
      // Check permissions first
      const hasPermissions = await this.checkAndRequestPermissions();
      if (!hasPermissions) {
        console.error('❌ Cannot send notification - permissions denied');
        return;
      }
      
      // Small delay to ensure state is stable
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Send the appropriate notification
      if (type === 'signin') {
        await this.sendSignInSuccessNotification(userType);
      } else {
        await this.sendSignUpSuccessNotification(userType);
      }
    } catch (error) {
      console.error('❌ Error handling authentication success:', error);
    }
  }
}