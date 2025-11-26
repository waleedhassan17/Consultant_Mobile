import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../hooks/useReduxHooks';
import CustomInput from '../../custom-components/CustomInput';
import {
  setEmail,
  clearError,
  resetForm,
  submitForgotPasswordAsync,
  selectEmail,
  selectIsLoading,
  selectError,
  selectIsFormComplete,
  selectStatus,
} from './forgotPasswordSlice';

const ForgotPassword = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  // Redux selectors
  const email = useAppSelector(selectEmail);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const isFormComplete = useAppSelector(selectIsFormComplete);
  const status = useAppSelector(selectStatus);

  // Show error alert when error changes
  useEffect(() => {
    if (error && status === 'failed') {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) }
      ]);
    }
  }, [error, status]);

  // Navigate on success
  useEffect(() => {
    if (status === 'succeeded') {
      Alert.alert(
        'Success',
        'A password reset link has been sent to your email address. Please check your inbox.',
        [
          {
            text: 'OK',
            onPress: () => {
              (navigation as any).navigate('EmailVerification', {
                email: email.trim(),
                verificationType: 'password_reset',
              });
              // Reset form after navigation
              dispatch(resetForm());
            }
          }
        ]
      );
    }
  }, [status]);

  const validateEmail = (emailToValidate: string): boolean => {
    if (!emailToValidate.trim()) {
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailToValidate.trim());
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    dispatch(submitForgotPasswordAsync({ email: email.trim() }));
  };

  const handleBackToSignIn = () => {
    dispatch(resetForm());
    (navigation as any).navigate('SignIn');
  };

  const handleEmailChange = (text: string) => {
    dispatch(setEmail(text));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Back Button */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBackToSignIn}
              disabled={isLoading}
            >
              <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.headerContainer}>
              <Ionicons name="lock-closed-outline" size={60} color="#17A2B8" style={styles.lockIcon} />
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>
                Don't worry! Enter your email address below and we'll send you a link to reset your password.
              </Text>
            </View>

            {/* Email Input */}
            <View style={styles.formContainer}>
              <Text style={styles.label}>Email Address *</Text>
              <CustomInput
                placeholder="Enter your email"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                style={styles.input}
                editable={!isLoading}
                returnKeyType="done"
                onSubmitEditing={handleResetPassword}
              />
              {email.trim().length > 0 && !validateEmail(email) && (
                <Text style={styles.validationText}>
                  Please enter a valid email address
                </Text>
              )}
            </View>

            {/* Reset Password Button */}
            <TouchableOpacity
              style={[
                styles.resetButton,
                isFormComplete && !isLoading && styles.resetButtonActive,
                isLoading && styles.resetButtonLoading,
              ]}
              onPress={handleResetPassword}
              disabled={!isFormComplete || isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#FFFFFF" />
                  <Text style={styles.resetButtonText}>Sending...</Text>
                </View>
              ) : (
                <Text style={styles.resetButtonText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color="#17A2B8" />
              <Text style={styles.infoText}>
                The reset link will be valid for 24 hours. Make sure to check your spam folder if you don't see the email.
              </Text>
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Back to Sign In Link */}
            <TouchableOpacity
              style={styles.signInContainer}
              onPress={handleBackToSignIn}
              disabled={isLoading}
            >
              <Ionicons name="arrow-back-circle-outline" size={20} color="#17A2B8" />
              <Text style={styles.signInText}>
                Remember your password?{' '}
                <Text style={styles.signInLink}>Sign In</Text>
              </Text>
            </TouchableOpacity>

            {/* Create Account Link */}
            <TouchableOpacity
              style={styles.createAccountContainer}
              onPress={() => (navigation as any).navigate('SignUp')}
              disabled={isLoading}
            >
              <Text style={styles.createAccountText}>
                Don't have an account?{' '}
                <Text style={styles.createAccountLink}>Create Account</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  lockIcon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  formContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    marginBottom: 0,
  },
  validationText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 6,
    marginLeft: 4,
  },
  resetButton: {
    backgroundColor: '#CCCCCC',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  resetButtonActive: {
    backgroundColor: '#17A2B8',
  },
  resetButtonLoading: {
    backgroundColor: '#17A2B8',
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E8F8FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#0D7C8C',
    marginLeft: 8,
    lineHeight: 18,
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
    fontWeight: '500',
  },
  signInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  signInText: {
    fontSize: 14,
    color: '#666666',
  },
  signInLink: {
    color: '#17A2B8',
    fontWeight: '600',
  },
  createAccountContainer: {
    alignItems: 'center',
  },
  createAccountText: {
    fontSize: 14,
    color: '#666666',
  },
  createAccountLink: {
    color: '#17A2B8',
    fontWeight: '600',
  },
});

export default ForgotPassword;