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
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../hooks/useReduxHooks';
import CustomInput from '../../custom-components/CustomInput';
import {
  setEmail,
  setVerificationToken,
  setPassword,
  setConfirmPassword,
  togglePasswordVisibility,
  toggleConfirmPasswordVisibility,
  clearError,
  resetForm,
  submitResetPasswordAsync,
  selectEmail,
  selectPassword,
  selectConfirmPassword,
  selectShowPassword,
  selectShowConfirmPassword,
  selectIsLoading,
  selectError,
  selectIsFormComplete,
  selectPasswordsMatch,
  selectIsPasswordValid,
  selectCanSubmit,
  selectStatus,
} from './resetPasswordSlice';

interface RouteParams {
  email: string;
  verificationToken: string;
}

const ResetPassword = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams;
  const dispatch = useAppDispatch();

  // Redux selectors
  const email = useAppSelector(selectEmail);
  const password = useAppSelector(selectPassword);
  const confirmPassword = useAppSelector(selectConfirmPassword);
  const showPassword = useAppSelector(selectShowPassword);
  const showConfirmPassword = useAppSelector(selectShowConfirmPassword);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const isFormComplete = useAppSelector(selectIsFormComplete);
  const passwordsMatch = useAppSelector(selectPasswordsMatch);
  const isPasswordValid = useAppSelector(selectIsPasswordValid);
  const canSubmit = useAppSelector(selectCanSubmit);
  const status = useAppSelector(selectStatus);

  // Initialize from route params
  useEffect(() => {
    if (params) {
      dispatch(setEmail(params.email));
      dispatch(setVerificationToken(params.verificationToken));
    }
  }, [params]);

  // Show error alert
  useEffect(() => {
    if (error && status === 'failed') {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) }
      ]);
    }
  }, [error, status]);

  // Handle success
  useEffect(() => {
    if (status === 'succeeded') {
      Alert.alert(
        'Success!',
        'Your password has been reset successfully. You can now sign in with your new password.',
        [
          {
            text: 'Sign In Now',
            onPress: () => {
              dispatch(resetForm());
              (navigation as any).reset({
                index: 0,
                routes: [{ name: 'SignIn' }],
              });
            }
          }
        ]
      );
    }
  }, [status]);

  const validateForm = (): boolean => {
    if (!password.trim()) {
      Alert.alert('Required Field', 'Please enter a new password');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters long');
      return false;
    }

    if (!confirmPassword.trim()) {
      Alert.alert('Required Field', 'Please confirm your password');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match. Please try again.');
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    dispatch(submitResetPasswordAsync({
      email: email,
      verificationToken: params.verificationToken,
      newPassword: password,
    }));
  };

  const handlePasswordChange = (text: string) => {
    dispatch(setPassword(text));
  };

  const handleConfirmPasswordChange = (text: string) => {
    dispatch(setConfirmPassword(text));
  };

  const handleTogglePassword = () => {
    dispatch(togglePasswordVisibility());
  };

  const handleToggleConfirmPassword = () => {
    dispatch(toggleConfirmPasswordVisibility());
  };

  const getPasswordStrength = () => {
    if (password.length === 0) return { text: '', color: '#CCCCCC' };
    if (password.length < 6) return { text: 'Too short', color: '#F44336' };
    if (password.length < 8) return { text: 'Fair', color: '#FF9800' };
    if (password.length < 12) return { text: 'Good', color: '#4CAF50' };
    return { text: 'Strong', color: '#2E7D32' };
  };

  const passwordStrength = getPasswordStrength();

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
            {/* Header */}
            <View style={styles.headerContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="lock-closed-outline" size={80} color="#17A2B8" />
              </View>
              <Text style={styles.title}>Create New Password</Text>
              <Text style={styles.subtitle}>
                Your new password must be different from previously used passwords
              </Text>
            </View>

            {/* Email Display */}
            <View style={styles.emailContainer}>
              <Text style={styles.emailLabel}>Resetting password for:</Text>
              <Text style={styles.emailText}>{email}</Text>
            </View>

            {/* Form Fields */}
            <View style={styles.formContainer}>
              {/* New Password */}
              <Text style={styles.label}>New Password *</Text>
              <CustomInput
                placeholder="Enter new password (min 6 characters)"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
                showPasswordToggle={true}
                showPassword={showPassword}
                onTogglePassword={handleTogglePassword}
                autoComplete="new-password"
                autoCorrect={false}
                style={styles.input}
                editable={!isLoading}
                returnKeyType="next"
              />

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBarBackground}>
                    <View 
                      style={[
                        styles.strengthBar, 
                        { 
                          width: `${Math.min((password.length / 12) * 100, 100)}%`,
                          backgroundColor: passwordStrength.color 
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                    {passwordStrength.text}
                  </Text>
                </View>
              )}

              {/* Password Requirements */}
              <View style={styles.requirementsContainer}>
                <View style={styles.requirementItem}>
                  <Ionicons 
                    name={password.length >= 6 ? "checkmark-circle" : "ellipse-outline"} 
                    size={16} 
                    color={password.length >= 6 ? "#4CAF50" : "#CCCCCC"} 
                  />
                  <Text style={[
                    styles.requirementText,
                    password.length >= 6 && styles.requirementMet
                  ]}>
                    At least 6 characters
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <Ionicons 
                    name={password.length >= 8 ? "checkmark-circle" : "ellipse-outline"} 
                    size={16} 
                    color={password.length >= 8 ? "#4CAF50" : "#CCCCCC"} 
                  />
                  <Text style={[
                    styles.requirementText,
                    password.length >= 8 && styles.requirementMet
                  ]}>
                    8+ characters recommended
                  </Text>
                </View>
              </View>

              {/* Confirm Password */}
              <Text style={styles.label}>Confirm New Password *</Text>
              <CustomInput
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                secureTextEntry={!showConfirmPassword}
                showPasswordToggle={true}
                showPassword={showConfirmPassword}
                onTogglePassword={handleToggleConfirmPassword}
                autoComplete="new-password"
                autoCorrect={false}
                style={styles.input}
                editable={!isLoading}
                returnKeyType="done"
                onSubmitEditing={handleResetPassword}
              />

              {/* Password Match Indicator */}
              {confirmPassword.length > 0 && (
                <View style={styles.matchContainer}>
                  <Ionicons 
                    name={passwordsMatch ? "checkmark-circle" : "close-circle"} 
                    size={18} 
                    color={passwordsMatch ? "#4CAF50" : "#F44336"} 
                  />
                  <Text style={[
                    styles.matchText,
                    passwordsMatch ? styles.matchSuccess : styles.matchError
                  ]}>
                    {passwordsMatch ? 'Passwords match ✓' : 'Passwords do not match'}
                  </Text>
                </View>
              )}
            </View>

            {/* Reset Password Button */}
            <TouchableOpacity
              style={[
                styles.resetButton,
                canSubmit && !isLoading && styles.resetButtonActive,
                isLoading && styles.resetButtonLoading,
              ]}
              onPress={handleResetPassword}
              disabled={!canSubmit || isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#FFFFFF" />
                  <Text style={styles.resetButtonText}>Resetting Password...</Text>
                </View>
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.resetButtonText}>Reset Password</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Security Info */}
            <View style={styles.infoBox}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#17A2B8" />
              <Text style={styles.infoText}>
                For your security, you'll need to sign in again after resetting your password.
              </Text>
            </View>

            {/* Back to Sign In */}
            <TouchableOpacity
              style={styles.signInContainer}
              onPress={() => {
                dispatch(resetForm());
                (navigation as any).navigate('SignIn');
              }}
              disabled={isLoading}
            >
              <Ionicons name="arrow-back-circle-outline" size={20} color="#17A2B8" />
              <Text style={styles.signInText}>
                <Text style={styles.signInLink}>Back to Sign In</Text>
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
    paddingTop: 40,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    marginBottom: 24,
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
  emailContainer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  emailLabel: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  formContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    marginBottom: 0,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  strengthBarBackground: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 50,
  },
  requirementsContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 13,
    color: '#666666',
    marginLeft: 8,
  },
  requirementMet: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  matchText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  matchSuccess: {
    color: '#4CAF50',
  },
  matchError: {
    color: '#F44336',
  },
  resetButton: {
    backgroundColor: '#CCCCCC',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    flexDirection: 'row',
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
  buttonIcon: {
    marginRight: 8,
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
  signInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
});

export default ResetPassword;