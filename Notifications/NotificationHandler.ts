// services/NotificationService.ts
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  private static isInitialized: boolean = false;
  private static expoPushToken: string | null = null;

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const hasPermissions = await this.setupPermissions();
      if (!hasPermissions) {
        console.error('Notification permissions not granted!');
        return;
      }

      await this.setupAndroidChannels();
      this.expoPushToken = await this.getToken();
      this.isInitialized = true;
      
      console.log('NotificationService initialized');
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  private static async setupPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    if (existingStatus === 'granted') return true;
    
    const { status } = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true },
      android: { allowAlert: true, allowBadge: true, allowSound: true }
    });
    
    return status === 'granted';
  }

  private static async setupAndroidChannels(): Promise<void> {
    if (Platform.OS !== 'android') return;

    await Notifications.setNotificationChannelAsync('auth-notifications', {
      name: 'Authentication',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });
  }

  private static async getToken(): Promise<string | null> {
    if (!Device.isDevice) return 'simulator-mode';

    try {
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) return 'local-only';
      
      const pushToken = await Notifications.getExpoPushTokenAsync({ projectId });
      return pushToken.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return 'local-only';
    }
  }

  // Keep original method names for backward compatibility
  static async sendSignInSuccessNotification(userType: 'visitor' | 'therapist' ): Promise<void> {
    await this.sendAuthNotification('signin', userType);
  }

  static async sendSignUpSuccessNotification(userType: 'visitor' | 'therapist'): Promise<void> {
    await this.sendAuthNotification('signup', userType);
  }

  static async sendAuthNotification(type: 'signin' | 'signup', userType: 'visitor' | 'therapist'): Promise<void> {
    try {
      const title = type === 'signin' ? '🎉 Welcome Back!' : '✅ Account Created!';
      const body = `Successfully ${type === 'signin' ? 'signed in' : 'signed up'} as ${userType}`;

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: `${type}_success`, userType },
          sound: 'default',
          badge: 1,
          priority: Notifications.AndroidNotificationPriority.MAX,
          ...(Platform.OS === 'android' && {
            channelId: 'auth-notifications',
          }),
        },
        trigger: null,
      });

      console.log(`✅ ${type} notification sent for ${userType}`);
    } catch (error) {
      console.error(`❌ Failed to send ${type} notification:`, error);
    }
  }

  static async sendImmediateNotification({
  title,
  body,
  data,
  channelId = 'auth-notifications'
}: {
  title: string;
  body: string;
  data?: any;
  channelId?: string;
}): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
        badge: 1,
        priority: Notifications.AndroidNotificationPriority.MAX,
        ...(Platform.OS === 'android' && {
          channelId,
        }),
      },
      trigger: null,
    });

    console.log(`✅ Notification sent: ${title}`);
  } catch (error) {
    console.error(`❌ Failed to send notification:`, error);
  }
}
  static async clearAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  static getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  // Keep original methods for compatibility
  static async handleAuthenticationSuccess(type: 'signin' | 'signup', userType: 'visitor' | 'therapist'): Promise<void> {
    await this.sendAuthNotification(type, userType);
  }

  static setupNotificationListeners() {
    return null; // No longer needed
  }

  static cleanupListeners(): void {
    // No longer needed
  }

  static reset(): void {
    this.isInitialized = false;
    this.expoPushToken = null;
  }
}