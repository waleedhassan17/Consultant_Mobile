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
  
  // Track processed auth sessions to prevent duplicates
  private static processedSessions = new Set<string>();

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('Initializing app notifications...');
      
      await NotificationService.clearAllNotifications();
      await NotificationService.initialize();
      
      this.setupAppStateListener();
      this.setupStoreSubscriber();

      this.isInitialized = true;
      console.log('App notifications initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app notifications:', error);
    }
  }

  private static setupAppStateListener(): void {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log('App state changed:', this.appStateRef, '->', nextAppState);
      
      if (this.appStateRef.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App came to foreground');
        NotificationService.clearAllNotifications();
        // Don't clear processedSessions here - let them persist across app states
      }
      
      this.appStateRef = nextAppState;
    };

    this.appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
  }

  private static setupStoreSubscriber(): void {
    this.storeUnsubscribe = store.subscribe(() => {
      const state = store.getState();
      const signInState = state.signIn;
      const signUpState = state.signUp;

      // Handle Sign In Success
      if (signInState.user && 
          signInState.accessToken && 
          signInState.user.userType &&
          signInState.status !== 'loading' && 
          signInState.status !== 'failed') {
        
        const sessionId = `signin_${signInState.user.id || signInState.user.email}_${signInState.accessToken.slice(-10)}`;
        
        if (!this.processedSessions.has(sessionId)) {
          console.log('New sign-in session detected, sending notification');
          this.processedSessions.add(sessionId);
          
          // Send notification immediately
          NotificationService.sendSignInSuccessNotification(signInState.user.userType)
            .catch(error => console.error('Failed to send sign in notification:', error));
        }
      }

      // Handle Sign Up Success  
      if (signUpState.user && 
          signUpState.accessToken && 
          signUpState.user.userType &&
          signUpState.status !== 'loading' && 
          signUpState.status !== 'failed') {
        
        const sessionId = `signup_${signUpState.user.id || signUpState.user.email}_${signUpState.accessToken.slice(-10)}`;
        
        if (!this.processedSessions.has(sessionId)) {
          console.log('New sign-up session detected, sending notification');
          this.processedSessions.add(sessionId);
          
          // Send notification immediately
          NotificationService.sendSignUpSuccessNotification(signUpState.user.userType)
            .catch(error => console.error('Failed to send sign up notification:', error));
        }
      }

      // Clean old sessions (keep only last 10 to prevent memory issues)
      if (this.processedSessions.size > 10) {
        const sessionsArray = Array.from(this.processedSessions);
        const toKeep = sessionsArray.slice(-5); // Keep last 5
        this.processedSessions.clear();
        toKeep.forEach(session => this.processedSessions.add(session));
      }
    });
  }

  static cleanup(): void {
    console.log('NotificationManager cleaning up...');
    
    this.appStateSubscription?.remove();
    this.appStateSubscription = null;
    
    if (this.storeUnsubscribe) {
      this.storeUnsubscribe();
      this.storeUnsubscribe = null;
    }
    
    NotificationService.clearAllNotifications().catch(error => {
      console.error('Error clearing notifications on cleanup:', error);
    });

    this.isInitialized = false;
    this.processedSessions.clear();
  }
}

export const useNotificationManager = (): void => {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;

    NotificationManager.initialize();
    isInitialized.current = true;

    return () => {
      NotificationManager.cleanup();
    };
  }, []);
};