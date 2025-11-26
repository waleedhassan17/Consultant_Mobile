import React, { useState, useEffect } from 'react';
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
import {
  setEmail,
  setVerificationType,
  setUserType,
  decrementResendTimer,
  clearError,
  resetForm,
  resendVerificationEmailAsync,
  checkVerificationStatusAsync,
  selectEmail,
  selectVerificationType,
  selectUserType,
  selectVerificationStatus,
  selectResendTimer,
  selectIsLoading,
  selectError,
  selectVerificationToken,
  selectIsVerified,
  selectCanResend,
  selectIsPasswordReset,
} from './emailVerificationSlice';

type UserType = 'user' | 'corporate' | 'consultant';
type VerificationType = 'email_verification' | 'password_reset';

interface RouteParams {
  email: string;
  verificationType: VerificationType;
  userType?: UserType;
}

const EmailVerification = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams;
  const dispatch = useAppDispatch();

  // Redux selectors
  const email = useAppSelector(selectEmail);
  const verificationType = useAppSelector(selectVerificationType);
  const verificationStatus = useAppSelector(selectVerificationStatus);
  const resendTimer = useAppSelector(selectResendTimer);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const verificationToken = useAppSelector(selectVerificationToken);
  const isVerified = useAppSelector(selectIsVerified);
  const canResend = useAppSelector(selectCanResend);
  const isPasswordReset = useAppSelector(selectIsPasswordReset);

  // Initialize from route params
  useEffect(() => {
    if (params) {
      dispatch(setEmail(params.email));
      dispatch(setVerificationType(params.verificationType));
      if (params.userType) {
        dispatch(setUserType(params.userType));
      }
    }
  }, [params]);

  // Timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        dispatch(decrementResendTimer());
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Show error alert
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) }
      ]);
    }
  }, [error]);

  // Handle verification success
  useEffect(() => {
    if (isVerified) {
      if (isPasswordReset) {
        // Navigate to reset password screen with a success message
        Alert.alert(
          'Email Verified',
          'Your email has been verified. You can now set a new password.',
          [
            {
              text: 'Continue',
              onPress: () => {
                (navigation as any).navigate('ResetPassword', {
                  email: email,
                  verificationToken: verificationToken || 'verified_token',
                });
              }
            }
          ]
        );
      } else {
        // Navigate to sign in for email verification
        Alert.alert(
          'Success',
          'Email verified successfully! You can now sign in to your account.',
          [
            {
              text: 'Sign In',
              onPress: () => {
                dispatch(resetForm());
                (navigation as any).navigate('SignIn');
              }
            }
          ]
        );
      }
    }
  }, [isVerified]);

  const handleResendEmail = async () => {
    if (!canResend) {
      return;
    }

    const result = await dispatch(resendVerificationEmailAsync({ 
      email: email,
      verificationType: verificationType,
      userType: params.userType,
    }));

    if (resendVerificationEmailAsync.fulfilled.match(result)) {
      Alert.alert(
        'Email Sent',
        `A ${isPasswordReset ? 'password reset' : 'verification'} link has been sent to ${email}. Please check your inbox.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleVerifyEmail = async () => {
    const actionText = isPasswordReset ? 'reset your password' : 'verify your email';
    const linkType = isPasswordReset ? 'reset link' : 'verification link';
    
    Alert.alert(
      'Check Your Email',
      `Please check your email at ${email} and click the ${linkType} to ${actionText}.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'I Clicked the Link',
          onPress: handleCheckVerification,
        },
      ]
    );
  };

  const handleCheckVerification = async () => {
    const result = await dispatch(checkVerificationStatusAsync({ 
      email: email,
      verificationType: verificationType,
      userType: params.userType,
    }));

    if (checkVerificationStatusAsync.rejected.match(result)) {
      const actionText = isPasswordReset 
        ? 'Please check your email and click the password reset link.' 
        : 'Please check your email and click the verification link.';
      
      Alert.alert(
        'Not Verified Yet',
        actionText,
        [{ text: 'OK' }]
      );
    }
  };

  const getTitle = () => {
    if (isPasswordReset) {
      return 'Check Your Email';
    }
    return 'Verify Your Email';
  };

  const getSubtitle = () => {
    if (isPasswordReset) {
      return `We've sent a password reset link to your email address. Click the link to continue.`;
    }
    return `We've sent a verification link to your email address. Please verify to continue.`;
  };

  const getEmailLabel = () => {
    if (isPasswordReset) {
      return 'Password reset link sent to:';
    }
    return 'Verification link sent to:';
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
                <Ionicons 
                  name={isVerified ? "checkmark-circle" : "mail-outline"} 
                  size={80} 
                  color={isVerified ? '#4CAF50' : '#17A2B8'} 
                />
              </View>
              <Text style={styles.title}>{getTitle()}</Text>
              <Text style={styles.subtitle}>{getSubtitle()}</Text>
            </View>

            {/* Email Display */}
            <View style={styles.emailContainer}>
              <Text style={styles.emailLabel}>{getEmailLabel()}</Text>
              <Text style={styles.emailText}>{email}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {/* Verify Email Button */}
              <TouchableOpacity
                style={[styles.primaryButton, isVerified && styles.buttonDisabled]}
                onPress={handleVerifyEmail}
                disabled={isVerified || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : isVerified ? (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.primaryButtonText}>Verified ✓</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="mail-open-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.primaryButtonText}>
                      {isPasswordReset ? 'Open Email' : 'Open Email to Verify'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Resend Email Button */}
              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  (!canResend || isVerified) && styles.secondaryButtonDisabled
                ]}
                onPress={handleResendEmail}
                disabled={!canResend || isLoading || isVerified}
              >
                {isLoading ? (
                  <ActivityIndicator color="#17A2B8" />
                ) : (
                  <>
                    <Ionicons 
                      name="refresh-outline" 
                      size={20} 
                      color={(!canResend || isVerified) ? '#CCCCCC' : '#17A2B8'} 
                      style={styles.buttonIcon} 
                    />
                    <Text style={[
                      styles.secondaryButtonText,
                      (!canResend || isVerified) && styles.secondaryButtonTextDisabled
                    ]}>
                      {resendTimer > 0 
                        ? `Resend in ${resendTimer}s` 
                        : 'Resend Email'
                      }
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color="#17A2B8" />
              <Text style={styles.infoText}>
                {isPasswordReset 
                  ? 'The reset link is valid for 24 hours. Click the link in your email to proceed.'
                  : 'Click the verification link in your email to activate your account.'}
              </Text>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>Didn't receive the email?</Text>
              <View style={styles.instructionItem}>
                <Ionicons name="mail-outline" size={18} color="#666666" />
                <Text style={styles.instructionText}>Check your spam/junk folder</Text>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="at-outline" size={18} color="#666666" />
                <Text style={styles.instructionText}>Verify the email address is correct</Text>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="time-outline" size={18} color="#666666" />
                <Text style={styles.instructionText}>Wait a few minutes and try again</Text>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="refresh-outline" size={18} color="#666666" />
                <Text style={styles.instructionText}>Use the "Resend Email" button above</Text>
              </View>
            </View>

            {/* Back to Sign In */}
            <TouchableOpacity
              style={styles.backToSignInContainer}
              onPress={() => {
                dispatch(resetForm());
                (navigation as any).navigate('SignIn');
              }}
              disabled={isLoading}
            >
              <Ionicons name="arrow-back-circle-outline" size={20} color="#17A2B8" />
              <Text style={styles.backToSignInText}>
                <Text style={styles.backToSignInLink}>Back to Sign In</Text>
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
    paddingHorizontal: 16,
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
  buttonContainer: {
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#17A2B8',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
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
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#17A2B8',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  secondaryButtonDisabled: {
    borderColor: '#CCCCCC',
    opacity: 0.6,
  },
  secondaryButtonText: {
    color: '#17A2B8',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonTextDisabled: {
    color: '#CCCCCC',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
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
  instructionsContainer: {
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 12,
    flex: 1,
  },
  backToSignInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  backToSignInText: {
    fontSize: 14,
    color: '#666666',
  },
  backToSignInLink: {
    color: '#17A2B8',
    fontWeight: '600',
  },
});

export default EmailVerification;