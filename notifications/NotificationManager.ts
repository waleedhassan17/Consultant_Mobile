// NotificationManager.ts
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { store } from '../store/store';
import { NotificationService } from '../notifications/notificationHandler';

export class NotificationManager {
  private static isInitialized = false;
  private static appStateRef = AppState.currentState;
  private static appStateSubscription: any = null;
  private static storeUnsubscribe: any = null;
  
  // Track the last processed states to prevent duplicate notifications
  private static lastProcessedState = {
    signIn: {
      userId: null as string | null,
      timestamp: 0,
      status: null as string | null,
    },
    signUp: {
      userId: null as string | null,
      timestamp: 0,
      status: null as string | null,
    }
  };

  static async initialize(): Promise<void> {
    // Only initialize once per app lifecycle
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('Initializing app notifications...');
      
      // Clear any stale notifications first
      await NotificationService.clearAllNotifications();
      
      // Initialize push notifications
      await NotificationService.initialize();
      
      // Set up notification listeners
      const listeners = NotificationService.setupNotificationListeners();
      
      if (listeners) {
        console.log('Notification listeners set up successfully');
      }

      // Set up app state listener
      this.setupAppStateListener();
      
      // Set up Redux store subscriber
      this.setupStoreSubscriber();

      this.isInitialized = true;
      console.log('App notifications initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app notifications:', error);
    }
  }

  private static setupAppStateListener(): void {
    // Handle app state changes
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log('App state changed:', this.appStateRef, '->', nextAppState);
      
      if (this.appStateRef.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App came to foreground');
        // Clear any accumulated notifications when app becomes active
        NotificationService.clearAllNotifications();
        
        // Reset processed state tracking when app comes to foreground
        this.lastProcessedState = {
          signIn: { userId: null, timestamp: 0, status: null },
          signUp: { userId: null, timestamp: 0, status: null }
        };
      }
      
      this.appStateRef = nextAppState;
    };

    // Set up app state listener
    this.appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
  }

  private static setupStoreSubscriber(): void {
    // Subscribe to Redux store changes
    this.storeUnsubscribe = store.subscribe(() => {
      const state = store.getState();
      const signInState = state.signIn;
      const signUpState = state.signUp;
      const currentTime = Date.now();

      // Handle Sign In Success - Check for successful auth with user data
      if (signInState.user && 
          signInState.accessToken && 
          signInState.status !== 'loading' && // Not currently loading
          signInState.status !== 'failed' &&  // Not in failed state
          signInState.user.userType) {
        
        const currentUserId = signInState.user.id || signInState.user.email || 'unknown';
        const lastSignIn = this.lastProcessedState.signIn;
        
        // Check if this is a new sign-in success (not already processed)
        const isNewSignIn = (
          lastSignIn.userId !== currentUserId ||
          lastSignIn.status !== 'success' ||
          (currentTime - lastSignIn.timestamp) > 30000 // 30 second minimum gap
        );
        
        if (isNewSignIn) {
          console.log('New sign-in success detected, sending notification');
          
          // Update tracking immediately to prevent duplicates
          this.lastProcessedState.signIn = {
            userId: currentUserId,
            timestamp: currentTime,
            status: 'success'
          };
          
          // Send notification with a small delay to ensure state is stable
          setTimeout(() => {
            if (signInState.user?.userType) {
              NotificationService.sendSignInSuccessNotification(signInState.user.userType)
                .catch(error => {
                  console.error('Failed to send sign in notification:', error);
                });
            }
          }, 100); // Reduced delay
        } else {
          console.log('Sign-in success already processed, skipping notification');
        }
      }

      // Handle Sign Up Success - Check for successful auth with user data
      if (signUpState.user && 
          signUpState.accessToken && 
          signUpState.status !== 'loading' && // Not currently loading
          signUpState.status !== 'failed' &&  // Not in failed state
          signUpState.user.userType) {
        
        const currentUserId = signUpState.user.id || signUpState.user.email || 'unknown';
        const lastSignUp = this.lastProcessedState.signUp;
        
        // Check if this is a new sign-up success (not already processed)
        const isNewSignUp = (
          lastSignUp.userId !== currentUserId ||
          lastSignUp.status !== 'success' ||
          (currentTime - lastSignUp.timestamp) > 30000 // 30 second minimum gap
        );
        
        if (isNewSignUp) {
          console.log('New sign-up success detected, sending notification');
          
          // Update tracking immediately to prevent duplicates
          this.lastProcessedState.signUp = {
            userId: currentUserId,
            timestamp: currentTime,
            status: 'success'
          };
          
          // Send notification with a small delay to ensure state is stable
          setTimeout(() => {
            if (signUpState.user?.userType) {
              NotificationService.sendSignUpSuccessNotification(signUpState.user.userType)
                .catch(error => {
                  console.error('Failed to send sign up notification:', error);
                });
            }
          }, 100); // Reduced delay
        } else {
          console.log('Sign-up success already processed, skipping notification');
        }
      }
    });
  }

  static cleanup(): void {
    console.log('NotificationManager cleaning up...');
    
    // Remove app state listener
    this.appStateSubscription?.remove();
    this.appStateSubscription = null;
    
    // Unsubscribe from store
    if (this.storeUnsubscribe) {
      this.storeUnsubscribe();
      this.storeUnsubscribe = null;
    }
    
    // Clean up notification listeners
    NotificationService.cleanupListeners();
    
    // Clear all notifications on cleanup
    NotificationService.clearAllNotifications().catch(error => {
      console.error('Error clearing notifications on cleanup:', error);
    });

    // Reset initialization flag
    this.isInitialized = false;
  }
}

// Custom hook for using NotificationManager in React components
export const useNotificationManager = (): void => {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) {
      return;
    }

    // Initialize the notification manager
    NotificationManager.initialize();
    isInitialized.current = true;

    // Cleanup function
    return () => {
      NotificationManager.cleanup();
    };
  }, []); // Empty dependency array ensures this only runs once
};