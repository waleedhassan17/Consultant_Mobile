// screens/LogoutScreen/LogoutScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../hooks/useReduxHooks';
import {
  selectLogoutStatus,
  selectLogoutError,
  selectIsLoggingOut,
  clearError,
  resetLogoutState,
  logoutUserAsync,
} from './LogoutSlice';
import { 
  selectUser, 
  selectAccessToken,
  resetForm as resetSignUpForm 
} from '../signup-screen/SignUpSlice';
import { 
  logout as resetSignInForm 
} from '../signin-screen/SignInSlice';

const LogoutScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  // Logout slice selectors
  const logoutStatus = useAppSelector(selectLogoutStatus);
  const logoutError = useAppSelector(selectLogoutError);
  const isLoggingOut = useAppSelector(selectIsLoggingOut);

  // User data selectors
  const currentUser = useAppSelector(selectUser);
  const accessToken = useAppSelector(selectAccessToken);

  useEffect(() => {
    // Clear any previous logout errors when component mounts
    if (logoutError) {
      dispatch(clearError());
    }
  }, []);

  useEffect(() => {
    // Handle successful logout
    if (logoutStatus === 'succeeded') {
      console.log('Logout completed successfully');
      
      // Clear all user data from Redux store
      dispatch(resetSignUpForm());
      dispatch(resetSignInForm());
      dispatch(resetLogoutState());
      
      Alert.alert(
        'Logged Out',
        'You have been successfully logged out.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to the root navigator and reset to SignUp
              const parentNavigator = navigation.getParent();
              if (parentNavigator) {
                parentNavigator.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'SignUp' }],
                  })
                );
              } else {
                // Fallback if no parent navigator
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'SignUp' }],
                  })
                );
              }
            }
          }
        ]
      );
    }
  }, [logoutStatus, navigation, dispatch]);

  useEffect(() => {
    // Handle logout error
    if (logoutStatus === 'failed' && logoutError) {
      Alert.alert(
        'Logout Failed',
        logoutError,
        [
          {
            text: 'Try Again',
            onPress: () => dispatch(clearError()),
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          }
        ]
      );
    }
  }, [logoutStatus, logoutError, navigation, dispatch]);

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      `Are you sure you want to logout?${currentUser?.nickname ? `\n\nLogged in as: ${currentUser.nickname}` : ''}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Prepare logout data
              const logoutData = {
                accessToken: accessToken || undefined,
                userId: currentUser?.id || undefined,
              };

              console.log('Initiating logout for user:', currentUser?.nickname || 'Unknown');
              
              // Dispatch logout action
              await dispatch(logoutUserAsync(logoutData)).unwrap();
              
            } catch (error: any) {
              console.error('Logout process failed:', error);
              // Error handling is done in useEffect above
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    // Clear any errors and go back
    if (logoutError) {
      dispatch(clearError());
    }
    
    // Simply go back to the previous screen in the drawer
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name="log-out-outline" 
            size={80} 
            color={isLoggingOut ? "#ff9800" : "#ff5252"} 
          />
        </View>

        <Text style={styles.title}>
          {isLoggingOut ? 'Logging Out...' : 'Logout'}
        </Text>
        
        {currentUser && (
          <View style={styles.userInfoContainer}>
            <Text style={styles.userInfoLabel}>Currently logged in as:</Text>
            <Text style={styles.userInfoValue}>{currentUser.nickname}</Text>
            <Text style={styles.userTypeValue}>({currentUser.userType})</Text>
          </View>
        )}

        <Text style={styles.subtitle}>
          {isLoggingOut 
            ? 'Please wait while we log you out...' 
            : 'You are about to logout from your account. All session data will be cleared.'
          }
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.button, 
              styles.logoutButton,
              isLoggingOut && styles.buttonDisabled
            ]} 
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <Ionicons name="refresh" size={20} color="#fff" />
            ) : (
              <Ionicons name="log-out" size={20} color="#fff" />
            )}
            <Text style={[styles.buttonText, styles.logoutButtonText]}>
              {isLoggingOut ? 'Logging Out...' : 'Confirm Logout'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.button, 
              styles.cancelButton,
              isLoggingOut && styles.buttonDisabled
            ]} 
            onPress={handleCancel}
            disabled={isLoggingOut}
          >
            <Ionicons name="arrow-back" size={20} color="#1976d2" />
            <Text style={[styles.buttonText, styles.cancelButtonText]}>
              {isLoggingOut ? 'Please Wait...' : 'Cancel'}
            </Text>
          </TouchableOpacity>
        </View>

        {logoutError && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#f44336" />
            <Text style={styles.errorText}>{logoutError}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  userInfoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userInfoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  userInfoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userTypeValue: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  logoutButton: {
    backgroundColor: '#ff5252',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#1976d2',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  logoutButtonText: {
    color: '#fff',
  },
  cancelButtonText: {
    color: '#1976d2',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    padding: 12,
    borderRadius: 4,
    marginTop: 20,
    maxWidth: '100%',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
});

export default LogoutScreen;