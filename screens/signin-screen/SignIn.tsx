import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
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
} from './SignInSlice';
import CustomButton from '../../custom-components/CustomButton';
import CustomInput from '../../custom-components/CustomInput';
import AppLogo from '../../custom-components/AppLogo';

const SignIn = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const email = useAppSelector(selectEmail);
  const password = useAppSelector(selectPassword);
  const showPassword = useAppSelector(selectShowPassword);
  const selectedUserType = useAppSelector(selectSelectedUserType);
  const status = useAppSelector(selectStatus);
  const error = useAppSelector(selectError);

  const isLoading = status === "loading";

  const userTypeOptions = [
    { value: 'visitor', label: 'Visitor', icon: 'person' as keyof typeof Ionicons.glyphMap },
    { value: 'therapist', label: 'Therapist', icon: 'medical' as keyof typeof Ionicons.glyphMap }
  ];

  // Clear error when component mounts or when form values change
  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [email, password, selectedUserType]);

  const validateForm = () => {
    // Check if user type is selected
    if (!selectedUserType) {
      Alert.alert('Error', 'Please select whether you are a Visitor or Therapist');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return false;
    }

    // Optional: Add minimum password length validation
    if (password.trim().length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const handleSignIn = async () => {
    console.log('Login attempt started');

    // Clear any previous errors
    if (error) {
      dispatch(clearError());
    }

    if (!validateForm()) {
      return;
    }

    try {
      console.log('Attempting to sign in with:', { 
        email: email.trim(), 
        userType: selectedUserType 
      });

      // Dispatch the sign-in thunk
      const result = await dispatch(submitSignInAsync({ 
        email: email.trim(), 
        password,
        userType: selectedUserType!
      })).unwrap();

      console.log('Login successful:', result);

      // On success, navigate to home
      try {
        (navigation as any).navigate('Home');
      } catch (navigationError) {
        console.error('Navigation error:', navigationError);
        // Fallback navigation - use reset instead of replace
        (navigation as any).reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      // Error is automatically handled by the thunk and stored in state
      // Show error alert
      Alert.alert('Login Failed', err || 'Please check your credentials and try again.');
    }
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password screen or show alert
    Alert.alert(
      'Forgot Password',
      'Please contact support or use the password reset feature.',
      [{ text: 'OK' }]
    );
  };

  const handleEmailChange = (text: string) => {
    dispatch(setEmail(text));
    // Clear error when user starts typing
    if (error) {
      dispatch(clearError());
    }
  };

  const handlePasswordChange = (text: string) => {
    dispatch(setPassword(text));
    // Clear error when user starts typing
    if (error) {
      dispatch(clearError());
    }
  };

  const handleUserTypeChange = (userType: 'visitor' | 'therapist') => {
    dispatch(setSelectedUserType(userType));
    // Clear error when user selects a user type
    if (error) {
      dispatch(clearError());
    }
  };

  // Helper function to check if form is complete
  const isFormComplete = () => {
    return selectedUserType && email.trim() && password.trim();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo and Header */}
        <AppLogo size="large" />

        {/* Sign in as */}
        <Text style={styles.signInText}>Sign in as</Text>

        {/* User Type Selection */}
        <View style={styles.userTypeContainer}>
          {userTypeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.userTypeButton,
                selectedUserType === option.value && styles.selectedUserType,
              ]}
              onPress={() => handleUserTypeChange(option.value as 'visitor' | 'therapist')}
              disabled={isLoading}
            >
              <View
                style={[
                  styles.userTypeIcon,
                  selectedUserType === option.value && styles.selectedUserTypeIcon,
                ]}
              >
                <Ionicons
                  name={option.icon}
                  size={32}
                  color={selectedUserType === option.value ? '#4A90E2' : '#999'}
                />
              </View>
              <Text
                style={[
                  styles.userTypeText,
                  selectedUserType === option.value && styles.selectedUserTypeText,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Selection indicator */}
        {!selectedUserType && (
          <View style={styles.selectionHint}>
            <Text style={styles.selectionHintText}>
              Please select your account type above
            </Text>
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <CustomInput
            placeholder="Email"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!isLoading}
          />

          <CustomInput
            placeholder="Password"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry={!showPassword}
            showPasswordToggle
            showPassword={showPassword}
            onTogglePassword={() => dispatch(togglePasswordVisibility())}
            autoComplete="password"
            editable={!isLoading}
          />

          <TouchableOpacity 
            style={styles.forgotPasswordContainer}
            onPress={handleForgotPassword}
            disabled={isLoading}
          >
            <Text style={styles.forgotPasswordText}>Forget password?</Text>
          </TouchableOpacity>
        </View>

        {/* Sign In Button */}
        <CustomButton
          title={isLoading ? "Signing in..." : "Sign in"}
          onPress={handleSignIn}
          style={StyleSheet.flatten([
            styles.signInButton,
            isLoading && styles.signInButtonDisabled,
            !isFormComplete() && styles.signInButtonDisabled
          ])}
          disabled={isLoading || !isFormComplete()}
        />

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>If you have not an account </Text>
          <TouchableOpacity 
            onPress={() => (navigation as any).navigate('SignUp')}
            disabled={isLoading}
          >
            <Text style={[
              styles.signUpLink,
              isLoading && styles.signUpLinkDisabled
            ]}>
              Sign up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  content: {
    flex: 1,
    paddingHorizontal: 20, 
    paddingTop: 40
  },
  signInText: { 
    fontSize: 18,
    color: '#333', 
    textAlign: 'center', 
    marginBottom: 30 
  },
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 60,
  },
  userTypeButton: {
    alignItems: 'center' 
  },
  userTypeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  selectedUserType: {
    // Add styles for selected user type button if needed
  },
  selectedUserTypeIcon: { 
    backgroundColor: '#E3F2FD'
  },
  userTypeText: { 
    fontSize: 16,
    color: '#999',
    fontWeight: '500'
  },
  selectedUserTypeText: {
    color: '#4A90E2', 
    fontWeight: '600'
  },
  selectionHint: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    padding: 12,
    marginBottom: 20,
    borderRadius: 4,
  },
  selectionHintText: {
    color: '#F57C00',
    fontSize: 14,
    textAlign: 'center',
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
    fontWeight: '500',
  },
  formContainer: {
    marginBottom: 30 
  },
  forgotPasswordContainer: {
    alignItems: 'flex-start', 
    marginTop: -8 
  },
  forgotPasswordText: {
    color: '#4A90E2',
    fontSize: 14 
  },
  signInButton: {
    marginBottom: 30 
  },
  signInButtonDisabled: {
    opacity: 0.6 
  },
  signUpContainer: { 
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  signUpText: {
    color: '#999', 
    fontSize: 14 
  },
  signUpLink: { 
    color: '#4A90E2', 
    fontSize: 14, 
    fontWeight: '500' 
  },
  signUpLinkDisabled: { 
    opacity: 0.6
  },
});

export default SignIn;