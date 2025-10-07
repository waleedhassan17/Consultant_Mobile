// App.tsx
import React, { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { AppState, AppStateStatus } from 'react-native';
import { store } from './store/store';
import AppContainer from './Components/AppContainer';
import { NotificationService } from './notifications/notificationHandler';

const App: React.FC = () => {
  const isInitialized = useRef(false);
  const appStateRef = useRef(AppState.currentState);
  
  // Track the last processed states to prevent duplicate notifications
  const lastProcessedState = useRef({
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
  });

  useEffect(() => {
    // Only initialize once per app lifecycle
    if (isInitialized.current) {
      return;
    }

    const initializeApp = async () => {
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

        isInitialized.current = true;
        console.log('App notifications initialized successfully');
      } catch (error) {
        console.error('Failed to initialize app notifications:', error);
      }
    };

    // Handle app state changes
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log('App state changed:', appStateRef.current, '->', nextAppState);
      
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App came to foreground');
        // Clear any accumulated notifications when app becomes active
        NotificationService.clearAllNotifications();
        
        // Reset processed state tracking when app comes to foreground
        lastProcessedState.current = {
          signIn: { userId: null, timestamp: 0, status: null },
          signUp: { userId: null, timestamp: 0, status: null }
        };
      }
      
      appStateRef.current = nextAppState;
    };

    // Set up app state listener
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // Initialize the app
    initializeApp();

    // Cleanup function
    return () => {
      console.log('App component unmounting, cleaning up...');
      
      // Remove app state listener
      appStateSubscription?.remove();
      
      // Clean up notification listeners
      NotificationService.cleanupListeners();
      
      // Clear all notifications on app unmount
      NotificationService.clearAllNotifications().catch(error => {
        console.error('Error clearing notifications on unmount:', error);
      });
    };
  }, []); // Empty dependency array ensures this only runs once

  // Subscribe to Redux store changes - FIXED VERSION
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
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
        const lastSignIn = lastProcessedState.current.signIn;
        
        // Check if this is a new sign-in success (not already processed)
        const isNewSignIn = (
          lastSignIn.userId !== currentUserId ||
          lastSignIn.status !== 'success' ||
          (currentTime - lastSignIn.timestamp) > 30000 // 30 second minimum gap
        );
        
        if (isNewSignIn) {
          console.log('New sign-in success detected, sending notification');
          
          // Update tracking immediately to prevent duplicates
          lastProcessedState.current.signIn = {
            userId: currentUserId,
            timestamp: currentTime,
            status: 'success'
          };
          
          // Send notification with a small delay to ensure state is stable
          // Sign In notification
setTimeout(() => {
  const type = signInState.user?.userType;
  if (type === 'therapist' || type === 'visitor') {
    NotificationService.sendSignInSuccessNotification(type)
      .catch(error => console.error('Failed to send sign in notification:', error));
  } else {
    console.log('User type not eligible for sign-in notification:', type);
  }
}, 100);
// Reduced delay
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
        const lastSignUp = lastProcessedState.current.signUp;
        
        // Check if this is a new sign-up success (not already processed)
        const isNewSignUp = (
          lastSignUp.userId !== currentUserId ||
          lastSignUp.status !== 'success' ||
          (currentTime - lastSignUp.timestamp) > 30000 // 30 second minimum gap
        );
        
        if (isNewSignUp) {
          console.log('New sign-up success detected, sending notification');
          
          // Update tracking immediately to prevent duplicates
          lastProcessedState.current.signUp = {
            userId: currentUserId,
            timestamp: currentTime,
            status: 'success'
          };
          
          // Send notification with a small delay to ensure state is stable
         // Sign Up notification
setTimeout(() => {
  const type = signUpState.user?.userType;
  if (type === 'therapist' || type === 'visitor') {
    NotificationService.sendSignUpSuccessNotification(type)
      .catch(error => console.error('Failed to send sign up notification:', error));
  } else {
    console.log('User type not eligible for sign-up notification:', type);
  }
}, 100);
 // Reduced delay
        } else {
          console.log('Sign-up success already processed, skipping notification');
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Provider store={store}>
      <AppContainer />
    </Provider>
  );
};

export default App;