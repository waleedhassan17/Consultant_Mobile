import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../hooks/useReduxHooks';
import {
  selectEmail,
  selectPassword,
  selectShowPassword,
  selectSelectedUserType,
  selectStatus,
  selectError,
  setEmail,
  setPassword,
  setSelectedUserType,
  togglePasswordVisibility,
  clearError,
  submitSignInAsync,
  logout,
} from './SignInSlice';
// IMPORTANT: Import setCurrentUser to update app state after login
import { setCurrentUser } from '../../components/appContainerSlice';
import CustomInput from '../../custom-components/CustomInput';

const SignIn = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);

  const email = useAppSelector(selectEmail);
  const password = useAppSelector(selectPassword);
  const showPassword = useAppSelector(selectShowPassword);
  const selectedUserType = useAppSelector(selectSelectedUserType);
  const status = useAppSelector(selectStatus);
  const error = useAppSelector(selectError);

  const isLoading = status === "loading";
  const isConsultant = selectedUserType === 'consultant';
  const isCorporate = selectedUserType === 'corporate';

  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [email, password, selectedUserType]);

  const handleRefresh = () => {
    dispatch(logout());
    Alert.alert('Form Reset', 'You can now select a new user type');
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    dispatch(logout());
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Form Reset', 'You can now select a new user type');
    }, 500);
  }, [dispatch]);

  const handleUserTypeSelect = (userType: 'consultant' | 'corporate') => {
    console.log('🔵 Tab clicked:', userType);
    console.log('🔵 Current selectedUserType before:', selectedUserType);
    
    // If same tab clicked again, deselect it (back to 'user')
    if (selectedUserType === userType) {
      dispatch(setSelectedUserType(null));
      console.log('🔵 Tab deselected, will login as user');
    } else {
      dispatch(setSelectedUserType(userType));
      console.log('🔵 Tab selected:', userType);
    }
    
    if (error) {
      dispatch(clearError());
    }
  };
  
  // Debug: Log state changes
  useEffect(() => {
    console.log('🟢 selectedUserType changed to:', selectedUserType);
    console.log('🟢 isConsultant:', isConsultant);
    console.log('🟢 isCorporate:', isCorporate);
  }, [selectedUserType]);

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return false;
    }

    if (password.trim().length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const handleSignIn = async () => {
    if (error) {
      dispatch(clearError());
    }

    if (!validateForm()) {
      return;
    }

    try {
      // Use 'user' as default if no tab selected
      const userTypeToUse = selectedUserType || 'user';
      
      console.log('========================================');
      console.log('🔐 SIGNING IN');
      console.log('🔹 Email:', email.trim());
      console.log('🔹 User Type:', userTypeToUse);
      console.log('========================================');
      
      const result = await dispatch(submitSignInAsync({ 
        email: email.trim(), 
        password,
        userType: userTypeToUse
      })).unwrap();

      console.log('========================================');
      console.log('✅ LOGIN SUCCESSFUL');
      console.log('🔹 User:', result.user?.email);
      console.log('🔹 Type:', result.user?.userType);
      console.log('========================================');

      // CRITICAL: Update appContainerSlice with the logged-in user
      // This triggers AppContainer to switch to the correct navigator
      if (result.user) {
        dispatch(setCurrentUser(result.user));
        console.log('📱 AppContainer updated with user type:', result.user.userType);
      }

      // Determine welcome message based on user type
      const userTypeLabel = result.user?.userType === 'consultant' 
        ? 'Consultant' 
        : result.user?.userType === 'corporate' 
          ? 'Corporate User'
          : 'User';

      Alert.alert(
        '✅ Success',
        `Welcome back, ${userTypeLabel}!`,
        [
          {
            text: 'Continue',
            onPress: () => {
              // Navigation will be handled automatically by AppContainer
              // because we updated currentUser via setCurrentUser
              console.log('📱 Navigation will be handled by AppContainer');
            }
          }
        ]
      );
    } catch (err: any) {
      console.log('❌ Login failed:', err);
      Alert.alert('Login Failed', err || 'Please check your credentials and try again.');
    }
  };

  const handleForgotPassword = () => {
    (navigation as any).navigate('ForgotPassword');
  };

  const handleSignUp = () => {
    (navigation as any).reset({
      index: 0,
      routes: [{ name: 'SignUp' }],
    });
  };

  // Form is complete if email and password are filled
  const isFormComplete = email.trim().length > 0 && password.trim().length >= 6;

  // Determine button text based on selection
  const getButtonText = () => {
    if (isLoading) return 'Signing in...';
    if (isConsultant) return 'Sign In as Consultant';
    if (isCorporate) return 'Sign In as Corporate';
    return 'Sign In as User';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#17A2B8']}
            tintColor="#17A2B8"
            title="Pull to reset form"
            titleColor="#666666"
          />
        }
      >
        <View style={styles.content}>
          {/* Header with Refresh Button */}
          <View style={styles.headerRow}>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>
                {isConsultant 
                  ? 'Sign in as Consultant' 
                  : isCorporate 
                    ? 'Sign in as Corporate'
                    : 'Select your account type or sign in as User'}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={handleRefresh}
              disabled={isLoading || refreshing}
            >
              <Ionicons name="refresh" size={24} color="#17A2B8" />
            </TouchableOpacity>
          </View>

          {/* Tab Selection */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                isConsultant && styles.tabActive,
              ]}
              onPress={() => handleUserTypeSelect('consultant')}
              disabled={isLoading || refreshing}
            >
              <Text
                style={[
                  styles.tabText,
                  isConsultant && styles.tabTextActive,
                ]}
              >
                Consultant
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                isCorporate && styles.tabActive,
              ]}
              onPress={() => handleUserTypeSelect('corporate')}
              disabled={isLoading || refreshing}
            >
              <Text
                style={[
                  styles.tabText,
                  isCorporate && styles.tabTextActive,
                ]}
              >
                Corporate
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* User type indicator */}
          <View style={styles.userTypeIndicator}>
            <Text style={styles.userTypeText}>
              {isConsultant 
                ? '👨‍⚕️ Signing in as Consultant'
                : isCorporate 
                  ? '🏢 Signing in as Corporate'
                  : '👤 Signing in as User (no tab selected)'}
            </Text>
          </View>

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Email */}
            <Text style={styles.label}>Email *</Text>
            <CustomInput
              placeholder="Enter your email address"
              value={email}
              onChangeText={(value) => dispatch(setEmail(value))}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.input}
              editable={!isLoading && !refreshing}
            />

            {/* Password */}
            <Text style={styles.label}>Password *</Text>
            <CustomInput
              placeholder="Enter your password"
              value={password}
              onChangeText={(value) => dispatch(setPassword(value))}
              secureTextEntry={!showPassword}
              showPasswordToggle={true}
              showPassword={showPassword}
              onTogglePassword={() => dispatch(togglePasswordVisibility())}
              autoComplete="password"
              style={styles.input}
              editable={!isLoading && !refreshing}
            />

            {/* Forgot Password */}
            <TouchableOpacity 
              style={styles.forgotPasswordContainer}
              onPress={handleForgotPassword}
              disabled={isLoading || refreshing}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[
              styles.signInButton,
              isFormComplete && !isLoading && !refreshing && styles.signInButtonActive,
              (isLoading || refreshing) && styles.signInButtonLoading,
            ]}
            onPress={handleSignIn}
            disabled={!isFormComplete || isLoading || refreshing}
          >
            <Text style={styles.signInButtonText}>
              {getButtonText()}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Sign Up Link */}
          <TouchableOpacity
            style={styles.signUpContainer}
            onPress={handleSignUp}
            disabled={isLoading || refreshing}
          >
            <Text style={styles.signUpText}>
              Don't have an account?{' '}
              <Text style={styles.signUpLink}>Create your account</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    marginTop: 60,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  refreshButton: {
    padding: 8,
    marginTop: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    padding: 4,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 22,
  },
  tabActive: {
    backgroundColor: '#17A2B8',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  userTypeIndicator: {
    backgroundColor: '#E3F2FD',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  userTypeText: {
    fontSize: 13,
    color: '#1976D2',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
    padding: 12,
    marginBottom: 20,
    borderRadius: 4,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
  },
  formContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    marginBottom: 0,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-start',
    marginTop: 12,
  },
  forgotPasswordText: {
    color: '#17A2B8',
    fontSize: 13,
    fontWeight: '500',
  },
  signInButton: {
    backgroundColor: '#CCCCCC',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  signInButtonActive: {
    backgroundColor: '#17A2B8',
  },
  signInButtonLoading: {
    backgroundColor: '#17A2B8',
    opacity: 0.7,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: '#999999',
  },
  signUpContainer: {
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 13,
    color: '#666666',
  },
  signUpLink: {
    color: '#17A2B8',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

export default SignIn;