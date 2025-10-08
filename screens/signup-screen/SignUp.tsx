import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../hooks/useReduxHooks';
import {
  selectNickname,
  selectEmail,
  selectPassword,
  selectConfirmPassword,
  selectPhone,
  selectBirthYear,
  selectGender,
  selectSelectedUserType,
  selectShowPassword,
  selectShowConfirmPassword,
  selectAgreeToPrivacy,
  selectStatus,
  selectError,
  selectIsFormValid,
  setNickname,
  setEmail,
  setPassword,
  setConfirmPassword,
  setPhone,
  setBirthYear,
  setGender,
  setSelectedUserType,
  togglePasswordVisibility,
  toggleConfirmPasswordVisibility,
  togglePrivacyAgreement,
  clearError,
  submitSignUpAsync,
} from './SignUpSlice';
import CustomInput from '../../Custom-Components/CustomInput';
import AppLogo from '../../Custom-Components/AppLogo';

const SignUp = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const nickname = useAppSelector(selectNickname);
  const email = useAppSelector(selectEmail);
  const password = useAppSelector(selectPassword);
  const confirmPassword = useAppSelector(selectConfirmPassword);
  const phone = useAppSelector(selectPhone);
  const birthYear = useAppSelector(selectBirthYear);
  const gender = useAppSelector(selectGender);
  const selectedUserType = useAppSelector(selectSelectedUserType);
  const showPassword = useAppSelector(selectShowPassword);
  const showConfirmPassword = useAppSelector(selectShowConfirmPassword);
  const agreeToPrivacy = useAppSelector(selectAgreeToPrivacy);
  const status = useAppSelector(selectStatus);
  const error = useAppSelector(selectError);
  const isFormValid = useAppSelector(selectIsFormValid);

  const isLoading = status === "loading";

  const userTypeOptions = [
    { value: 'visitor', label: 'Visitor', icon: 'person' as keyof typeof Ionicons.glyphMap },
    { value: 'therapist', label: 'Therapist', icon: 'medical' as keyof typeof Ionicons.glyphMap }
  ];

  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [nickname, email, password, confirmPassword, phone, birthYear, gender, selectedUserType]);

  const handleFieldChange = (field: string, value: string) => {
    switch (field) {
      case 'nickname':
        dispatch(setNickname(value));
        break;
      case 'email':
        dispatch(setEmail(value));
        break;
      case 'password':
        dispatch(setPassword(value));
        break;
      case 'confirmPassword':
        dispatch(setConfirmPassword(value));
        break;
      case 'phone':
        dispatch(setPhone(value));
        break;
      case 'birthYear':
        dispatch(setBirthYear(value));
        break;
    }
    if (error) {
      dispatch(clearError());
    }
  };

  const handleGenderSelect = (selectedGender: 'male' | 'female' | 'other' | 'prefer-not-to-say') => {
    dispatch(setGender(selectedGender));
  };

  const handleUserTypeSelect = (userType: 'visitor' | 'therapist') => {
    dispatch(setSelectedUserType(userType));
    if (error) {
      dispatch(clearError());
    }
  };

  const validateForm = () => {
    console.log('Validating form...');

    if (!selectedUserType) {
      Alert.alert('Error', 'Please select whether you are a visitor or therapist');
      return false;
    }

    if (!nickname.trim()) {
      Alert.alert('Error', 'Please enter a nickname');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return false;
    }

    // Password strength validation
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return false;
    }

    if (!birthYear.trim()) {
      Alert.alert('Error', 'Please enter your birth year');
      return false;
    }

    // Birth year validation
    const currentYear = new Date().getFullYear();
    const year = parseInt(birthYear);
    if (isNaN(year) || year < 1900 || year > currentYear - 13) {
      Alert.alert('Error', 'Please enter a valid birth year (must be at least 13 years old)');
      return false;
    }

    if (!gender) {
      Alert.alert('Error', 'Please select your gender');
      return false;
    }

    if (!agreeToPrivacy) {
      Alert.alert('Error', 'Please agree to the Privacy Policy');
      return false;
    }

    console.log('Form validation passed');
    return true;
  };

  const handleRegister = async () => {
    console.log('Registration attempt started');

    // Clear any previous errors
    if (error) {
      dispatch(clearError());
    }

    if (!validateForm()) {
      return;
    }

    try {
      const registrationData = {
        nickname: nickname.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        phone: phone.trim(),
        birthYear: birthYear.trim(),
        gender: gender!,
        userType: selectedUserType!,
        agreeToPrivacy,
      };

      console.log('Attempting to register with:', { 
        ...registrationData, 
        password: '[HIDDEN]', 
        confirmPassword: '[HIDDEN]' 
      });

      const result = await dispatch(submitSignUpAsync(registrationData)).unwrap();

      console.log('Registration successful:', result);

      Alert.alert(
        'Success',
        'Registration successful! Welcome to the app!',
        [
          {
            text: 'Continue',
            onPress: () => {
              try {
                (navigation as any).navigate('Home');
              } catch (navigationError) {
                console.error('Navigation error:', navigationError);
                (navigation as any).reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                });
              }
            }
          }
        ]
      );
    } catch (err: any) {
      console.error('Registration failed:', err);
      Alert.alert('Registration Failed', err || 'Registration failed. Please try again.');
    }
  };

  const handleBack = () => {
     (navigation as any).reset({
                  index: 0,
                  routes: [{ name: 'SignIn' }],
                });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header - Using AppLogo Component */}
          <AppLogo size="large" style={styles.logoHeader} />

          {/* Sign up as */}
          <Text style={styles.signUpAsText}>Sign up as</Text>

          {/* User Type Selection */}
          <View style={styles.userTypeContainer}>
            {userTypeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.userTypeButton,
                  selectedUserType === option.value && styles.selectedUserType,
                ]}
                onPress={() => handleUserTypeSelect(option.value as 'visitor' | 'therapist')}
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

          {/* Required Fields Notice */}
          <Text style={styles.requiredNotice}>
            All fields marked with * are required
          </Text>

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Nickname */}
            <CustomInput
              placeholder="Enter Nickname *"
              value={nickname}
              onChangeText={(value) => handleFieldChange('nickname', value)}
              autoCapitalize="none"
              style={styles.customInputStyle}
              editable={!isLoading}
            />
            <Text style={styles.helperText}>
              You can use letters a-z, numbers and periods (. , -)
            </Text>

            {/* Email */}
            <CustomInput
              placeholder="Enter Email *"
              value={email}
              onChangeText={(value) => handleFieldChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.customInputStyle}
              editable={!isLoading}
            />

            {/* Password */}
            <CustomInput
              placeholder="Password *"
              value={password}
              onChangeText={(value) => handleFieldChange('password', value)}
              secureTextEntry={!showPassword}
              showPasswordToggle={true}
              showPassword={showPassword}
              onTogglePassword={() => dispatch(togglePasswordVisibility())}
              autoComplete="new-password"
              style={styles.customInputStyle}
              editable={!isLoading}
            />
            <Text style={styles.helperText}>
              Use 6 or more characters with a mix of letters and numbers
            </Text>

            {/* Confirm Password */}
            <CustomInput
              placeholder="Confirm Password *"
              value={confirmPassword}
              onChangeText={(value) => handleFieldChange('confirmPassword', value)}
              secureTextEntry={!showConfirmPassword}
              showPasswordToggle={true}
              showPassword={showConfirmPassword}
              onTogglePassword={() => dispatch(toggleConfirmPasswordVisibility())}
              autoComplete="new-password"
              style={styles.customInputStyle}
              editable={!isLoading}
            />

            {/* Password Match Indicator */}
            {password.length > 0 && confirmPassword.length > 0 && (
              <Text style={[
                styles.helperText,
                password === confirmPassword ? styles.successText : styles.errorHelperText
              ]}>
                {password === confirmPassword ? 'Passwords match ✓' : 'Passwords do not match'}
              </Text>
            )}

            {/* Phone */}
            <CustomInput
              placeholder="Phone Number *"
              value={phone}
              onChangeText={(value) => handleFieldChange('phone', value)}
              keyboardType="phone-pad"
              autoComplete="tel"
              style={styles.customInputStyle}
              editable={!isLoading}
            />
            <Text style={styles.helperText}>
              * Please make sure you enter a valid phone number
            </Text>

            {/* Birth Year */}
            <CustomInput
              placeholder="Birth Year *"
              value={birthYear}
              onChangeText={(value) => handleFieldChange('birthYear', value)}
              keyboardType="numeric"
              maxLength={4}
              rightIcon={'calendar-outline' as keyof typeof Ionicons.glyphMap}
              style={styles.customInputStyle}
              editable={!isLoading}
            />

            {/* Gender */}
            <Text style={styles.genderLabel}>Gender *</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={styles.radioContainer}
                onPress={() => handleGenderSelect('male')}
                disabled={isLoading}
              >
                <View style={[styles.radio, gender === 'male' && styles.radioSelected]}>
                  {gender === 'male' && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioText}>Male</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioContainer}
                onPress={() => handleGenderSelect('female')}
                disabled={isLoading}
              >
                <View style={[styles.radio, gender === 'female' && styles.radioSelected]}>
                  {gender === 'female' && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioText}>Female</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioContainer}
                onPress={() => handleGenderSelect('other')}
                disabled={isLoading}
              >
                <View style={[styles.radio, gender === 'other' && styles.radioSelected]}>
                  {gender === 'other' && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioText}>Other</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioContainer}
                onPress={() => handleGenderSelect('prefer-not-to-say')}
                disabled={isLoading}
              >
                <View style={[styles.radio, gender === 'prefer-not-to-say' && styles.radioSelected]}>
                  {gender === 'prefer-not-to-say' && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioText}>Prefer Not To Say</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Privacy Policy Agreement */}
          <View style={styles.privacyContainer}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => dispatch(togglePrivacyAgreement())}
              disabled={isLoading}
            >
              <View style={[styles.checkbox, agreeToPrivacy && styles.checkboxChecked]}>
                {agreeToPrivacy && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
              <Text style={styles.privacyText}>
                I agree with the <Text style={styles.privacyLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Register Button */}
          <TouchableOpacity 
            style={[
              styles.registerButton, 
              isFormValid && !isLoading && styles.registerButtonActive,
              isLoading && styles.registerButtonLoading
            ]} 
            onPress={handleRegister}
            disabled={!isFormValid || isLoading}
          >
            <Ionicons name="lock-closed" size={16} color="white" style={styles.registerIcon} />
            <Text style={styles.registerButtonText}>
              {isLoading ? 'Registering...' : 'Register'}
            </Text>
          </TouchableOpacity>

          {/* Back Link */}
          <TouchableOpacity 
            style={styles.backContainer} 
            onPress={handleBack}
            disabled={isLoading}
          >
            <Text style={[styles.backText, isLoading && styles.backTextDisabled]}>
              Back
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
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  logoHeader: {
    marginBottom: 20,
  },
  signUpAsText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 60,
  },
  userTypeButton: {
    alignItems: 'center',
  },
  selectedUserType: {
    // Add styles for selected user type button if needed
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
  selectedUserTypeIcon: {
    backgroundColor: '#E3F2FD',
  },
  userTypeText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  selectedUserTypeText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  requiredNotice: {
    fontSize: 13,
    color: '#666',
    marginBottom: 20,
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
    marginBottom: 25,
  },
  customInputStyle: {
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
    marginLeft: 2,
  },
  successText: {
    color: '#4CAF50',
  },
  errorHelperText: {
    color: '#F44336',
  },
  genderLabel: {
    fontSize: 15,
    color: '#333',
    marginBottom: 12,
    fontWeight: '500',
  },
  genderContainer: {
    marginBottom: 6,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#DDD',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#4A90E2',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A90E2',
  },
  radioText: {
    fontSize: 15,
    color: '#333',
  },
  privacyContainer: {
    marginBottom: 25,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: '#DDD',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  privacyText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  privacyLink: {
    color: '#4A90E2',
    textDecorationLine: 'underline',
  },
  registerButton: {
    backgroundColor: '#999',
    height: 48,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    opacity: 0.6,
  },
  registerButtonActive: {
    backgroundColor: '#4A90E2',
    opacity: 1,
  },
  registerButtonLoading: {
    backgroundColor: '#4A90E2',
    opacity: 0.7,
  },
  registerIcon: {
    marginRight: 8,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  backContainer: {
    alignItems: 'center',
  },
  backText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
  },
  backTextDisabled: {
    opacity: 0.6,
  },
});

export default SignUp;