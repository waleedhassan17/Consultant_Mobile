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
  selectFirstName,
  selectLastName,
  selectEmail,
  selectPassword,
  selectConfirmPassword,
  selectCountry,
  selectPreferredCurrency,
  selectGender,
  selectDiscipline,
  selectLanguagesSpoken,
  selectAvailableForIndividual,
  selectAvailableForEnterprise,
  selectAvailableForMembership,
  selectCompanyName,
  selectIndustryType,
  selectCompanySize,
  selectSelectedUserType,
  selectShowPassword,
  selectShowConfirmPassword,
  selectAgreeToPrivacy,
  selectStatus,
  selectError,
  selectIsFormValid,
  setFirstName,
  setLastName,
  setEmail,
  setPassword,
  setConfirmPassword,
  setCountry,
  setPreferredCurrency,
  setGender,
  setDiscipline,
  setLanguagesSpoken,
  toggleAvailableForIndividual,
  toggleAvailableForEnterprise,
  toggleAvailableForMembership,
  setCompanyName,
  setIndustryType,
  setCompanySize,
  setSelectedUserType,
  togglePasswordVisibility,
  toggleConfirmPasswordVisibility,
  togglePrivacyAgreement,
  clearError,
  resetForm,
  submitSignUpAsync,
} from './SignUpSlice';
import CustomInput from '../../custom-components/CustomInput';
import {
  SingleSelectPicker,
  MultiSelectPicker,
  COUNTRIES,
  CURRENCIES,
  LANGUAGES,
  DISCIPLINES,
  INDUSTRIES,
  COMPANY_SIZES
} from '../../custom-components/Pickers';

const SignUp = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);

  // Form state
  const firstName = useAppSelector(selectFirstName);
  const lastName = useAppSelector(selectLastName);
  const email = useAppSelector(selectEmail);
  const password = useAppSelector(selectPassword);
  const confirmPassword = useAppSelector(selectConfirmPassword);
  const country = useAppSelector(selectCountry);
  const preferredCurrency = useAppSelector(selectPreferredCurrency);
  const gender = useAppSelector(selectGender);
  const discipline = useAppSelector(selectDiscipline);
  const languagesSpoken = useAppSelector(selectLanguagesSpoken);
  const availableForIndividual = useAppSelector(selectAvailableForIndividual);
  const availableForEnterprise = useAppSelector(selectAvailableForEnterprise);
  const availableForMembership = useAppSelector(selectAvailableForMembership);
  
  // Corporate fields
  const companyName = useAppSelector(selectCompanyName);
  const industryType = useAppSelector(selectIndustryType);
  const companySize = useAppSelector(selectCompanySize);
  
  const selectedUserType = useAppSelector(selectSelectedUserType);
  const showPassword = useAppSelector(selectShowPassword);
  const showConfirmPassword = useAppSelector(selectShowConfirmPassword);
  const agreeToPrivacy = useAppSelector(selectAgreeToPrivacy);
  const status = useAppSelector(selectStatus);
  const error = useAppSelector(selectError);
  const isFormValid = useAppSelector(selectIsFormValid);

  const isLoading = status === "loading";
  const isConsultant = selectedUserType === 'consultant';
  const isCorporate = selectedUserType === 'corporate';
  const isDefaultUser = !selectedUserType || selectedUserType === 'user';

  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [firstName, lastName, email, password, confirmPassword, country, gender, selectedUserType]);

  const handleRefresh = () => {
    dispatch(resetForm());
    Alert.alert('Form Reset', 'You can now select a new user type');
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    dispatch(resetForm());
    // Simulate a brief delay for better UX
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Form Reset', 'You can now select a new user type');
    }, 500);
  }, [dispatch]);

  const handleGenderSelect = (selectedGender: 'male' | 'female' | 'other' | 'prefer-not-to-say') => {
    dispatch(setGender(selectedGender));
  };

  const handleUserTypeSelect = (userType: 'consultant' | 'corporate') => {
    dispatch(setSelectedUserType(userType));
    if (error) {
      dispatch(clearError());
    }
  };

  const validateForm = () => {
    // If default user registration (no tab selected)
    if (isDefaultUser) {
      if (!firstName.trim()) {
        Alert.alert('Error', 'Please enter your first name');
        return false;
      }
      if (!lastName.trim()) {
        Alert.alert('Error', 'Please enter your last name');
        return false;
      }
      // No additional fields required for default user registration
    }

    // Consultant validation
    if (isConsultant) {
      if (!firstName.trim()) {
        Alert.alert('Error', 'Please enter your first name');
        return false;
      }
      if (!lastName.trim()) {
        Alert.alert('Error', 'Please enter your last name');
        return false;
      }
      if (!discipline.trim()) {
        Alert.alert('Error', 'Please select a discipline');
        return false;
      }
      if (languagesSpoken.length === 0) {
        Alert.alert('Error', 'Please select at least one language');
        return false;
      }
      if (!preferredCurrency.trim()) {
        Alert.alert('Error', 'Please select your preferred currency');
        return false;
      }
      if (!availableForIndividual && !availableForEnterprise && !availableForMembership) {
        Alert.alert('Error', 'Please select at least one availability option');
        return false;
      }
    }
    
    // Corporate validation
    if (isCorporate) {
      if (!companyName.trim()) {
        Alert.alert('Error', 'Please enter your company name');
        return false;
      }
      if (!firstName.trim()) {
        Alert.alert('Error', 'Please enter your first name');
        return false;
      }
      if (!lastName.trim()) {
        Alert.alert('Error', 'Please enter your last name');
        return false;
      }
      if (!industryType.trim()) {
        Alert.alert('Error', 'Please select an industry type');
        return false;
      }
      if (!companySize.trim()) {
        Alert.alert('Error', 'Please select company size');
        return false;
      }
    }

    // Common validation for all types
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

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (!country.trim()) {
      Alert.alert('Error', 'Please select your country');
      return false;
    }

    if (!gender) {
      Alert.alert('Error', 'Please select your gender');
      return false;
    }

    if (!agreeToPrivacy) {
      Alert.alert('Error', 'Please agree to the Terms & Conditions and Privacy Policy');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (error) {
      dispatch(clearError());
    }

    if (!validateForm()) {
      return;
    }

    try {
      const registrationData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        country: country.trim(),
        preferredCurrency: preferredCurrency.trim(),
        gender: gender!,
        userType: selectedUserType, // Can be null for default user registration
        discipline: discipline.trim(),
        languagesSpoken,
        availableForIndividual,
        availableForEnterprise,
        availableForMembership,
        companyName: companyName.trim(),
        industryType: industryType.trim(),
        companySize: companySize.trim(),
        agreeToPrivacy,
      };

      const result = await dispatch(submitSignUpAsync(registrationData)).unwrap();

      Alert.alert(
        'Success',
        'Registration successful! Welcome!',
        [
          {
            text: 'Continue',
            onPress: () => {
              try {
                (navigation as any).navigate('Home');
              } catch (navigationError) {
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
      Alert.alert('Registration Failed', err || 'Registration failed. Please try again.');
    }
  };

  const handleSignIn = () => {
    (navigation as any).reset({
      index: 0,
      routes: [{ name: 'SignIn' }],
    });
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
              <Text style={styles.title}>Create your account</Text>
              <Text style={styles.subtitle}>
                {isDefaultUser ? 'Sign up as User' : 'Register as a'}
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

          {/* Tab Selection - Only Consultant and Corporate */}
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

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Corporate specific field - Company Name */}
            {isCorporate && (
              <>
                <Text style={styles.label}>Company Name *</Text>
                <CustomInput
                  placeholder="Enter company name"
                  value={companyName}
                  onChangeText={(value) => dispatch(setCompanyName(value))}
                  autoCapitalize="words"
                  style={styles.input}
                  editable={!isLoading && !refreshing}
                />
              </>
            )}

            {/* First Name */}
            <Text style={styles.label}>First Name *</Text>
            <CustomInput
              placeholder="Enter your first name"
              value={firstName}
              onChangeText={(value) => dispatch(setFirstName(value))}
              autoCapitalize="words"
              style={styles.input}
              editable={!isLoading && !refreshing}
            />

            {/* Last Name */}
            <Text style={styles.label}>Last Name *</Text>
            <CustomInput
              placeholder="Enter your last name"
              value={lastName}
              onChangeText={(value) => dispatch(setLastName(value))}
              autoCapitalize="words"
              style={styles.input}
              editable={!isLoading && !refreshing}
            />

            {/* Email (Corporate shows "Corporate Email") */}
            <Text style={styles.label}>{isCorporate ? 'Corporate Email *' : 'Email *'}</Text>
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
              autoComplete="new-password"
              style={styles.input}
              editable={!isLoading && !refreshing}
            />

            {/* Confirm Password */}
            <Text style={styles.label}>Password Confirmation *</Text>
            <CustomInput
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={(value) => dispatch(setConfirmPassword(value))}
              secureTextEntry={!showConfirmPassword}
              showPasswordToggle={true}
              showPassword={showConfirmPassword}
              onTogglePassword={() => dispatch(toggleConfirmPasswordVisibility())}
              autoComplete="new-password"
              style={styles.input}
              editable={!isLoading && !refreshing}
            />

            {/* Corporate specific field - Industry Type */}
            {isCorporate && (
              <>
                <Text style={styles.label}>Industry Type *</Text>
                <SingleSelectPicker
                  title="Select Industry"
                  value={industryType}
                  options={INDUSTRIES}
                  onSelect={(value) => dispatch(setIndustryType(value))}
                  placeholder="Select Industry"
                  disabled={isLoading || refreshing}
                />
              </>
            )}

            {/* Corporate specific - Company Size */}
            {isCorporate && (
              <>
                <Text style={styles.label}>Company Size *</Text>
                <SingleSelectPicker
                  title="Select Company Size"
                  value={companySize}
                  options={COMPANY_SIZES}
                  onSelect={(value) => dispatch(setCompanySize(value))}
                  placeholder="Select Company Size"
                  disabled={isLoading || refreshing}
                />
              </>
            )}

            {/* Country */}
            <Text style={styles.label}>Country *</Text>
            <SingleSelectPicker
              title="Select Country"
              value={country}
              options={COUNTRIES}
              onSelect={(value) => dispatch(setCountry(value))}
              placeholder="Select Country"
              disabled={isLoading || refreshing}
            />

            {/* Consultant specific - Preferred Currency */}
            {isConsultant && (
              <>
                <Text style={styles.label}>Preferred Currency *</Text>
                <SingleSelectPicker
                  title="Select Currency"
                  value={preferredCurrency}
                  options={CURRENCIES}
                  onSelect={(value) => dispatch(setPreferredCurrency(value))}
                  placeholder="Select Currency"
                  disabled={isLoading || refreshing}
                />
              </>
            )}

            {/* Consultant specific - Languages Spoken */}
            {isConsultant && (
              <>
                <Text style={styles.label}>Languages Spoken *</Text>
                <MultiSelectPicker
                  title="Select Languages"
                  selectedValues={languagesSpoken}
                  options={LANGUAGES}
                  onSelect={(values) => dispatch(setLanguagesSpoken(values))}
                  placeholder="Select Languages"
                  disabled={isLoading || refreshing}
                />
              </>
            )}

            {/* Gender */}
            <Text style={styles.label}>Gender *</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => handleGenderSelect('male')}
                disabled={isLoading || refreshing}
              >
                <View style={[styles.radio, gender === 'male' && styles.radioSelected]}>
                  {gender === 'male' && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioLabel}>Male</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => handleGenderSelect('female')}
                disabled={isLoading || refreshing}
              >
                <View style={[styles.radio, gender === 'female' && styles.radioSelected]}>
                  {gender === 'female' && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioLabel}>Female</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => handleGenderSelect('other')}
                disabled={isLoading || refreshing}
              >
                <View style={[styles.radio, gender === 'other' && styles.radioSelected]}>
                  {gender === 'other' && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioLabel}>Other</Text>
              </TouchableOpacity>
            </View>

            {/* Consultant specific - Discipline */}
            {isConsultant && (
              <>
                <Text style={styles.label}>Discipline *</Text>
                <SingleSelectPicker
                  title="Select Discipline"
                  value={discipline}
                  options={DISCIPLINES}
                  onSelect={(value) => dispatch(setDiscipline(value))}
                  placeholder="Select Discipline"
                  disabled={isLoading || refreshing}
                />
              </>
            )}

            {/* Consultant specific field - Available For */}
            {isConsultant && (
              <>
                <Text style={styles.label}>Available For *</Text>
                <View style={styles.checkboxGroup}>
                  <TouchableOpacity 
                    style={styles.checkboxItem}
                    onPress={() => dispatch(toggleAvailableForIndividual())}
                    disabled={isLoading || refreshing}
                  >
                    <View style={[styles.checkbox, availableForIndividual && styles.checkboxChecked]}>
                      {availableForIndividual && (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>Individual (B2C)</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.checkboxItem}
                    onPress={() => dispatch(toggleAvailableForEnterprise())}
                    disabled={isLoading || refreshing}
                  >
                    <View style={[styles.checkbox, availableForEnterprise && styles.checkboxChecked]}>
                      {availableForEnterprise && (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>Enterprise (B2B)</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.checkboxItem}
                    onPress={() => dispatch(toggleAvailableForMembership())}
                    disabled={isLoading || refreshing}
                  >
                    <View style={[styles.checkbox, availableForMembership && styles.checkboxChecked]}>
                      {availableForMembership && (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>Membership</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          {/* Terms & Conditions */}
          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => dispatch(togglePrivacyAgreement())}
            disabled={isLoading || refreshing}
          >
            <View style={[styles.checkbox, agreeToPrivacy && styles.checkboxChecked]}>
              {agreeToPrivacy && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={styles.termsText}>
              I agree to{' '}
              <Text style={styles.termsLink}>Terms & Conditions</Text>,{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
              {isConsultant && (
                <> and understand that signing an{' '}
                <Text style={styles.termsLink}>NDA</Text> may be required by some corporate</>
              )}
            </Text>
          </TouchableOpacity>

          {/* Register Button */}
          <TouchableOpacity
            style={[
              styles.registerButton,
              isFormValid && !isLoading && !refreshing && styles.registerButtonActive,
              (isLoading || refreshing) && styles.registerButtonLoading,
            ]}
            onPress={handleRegister}
            disabled={!isFormValid || isLoading || refreshing}
          >
            <Text style={styles.registerButtonText}>
              {isLoading 
                ? 'Signing up...' 
                : isConsultant
                  ? 'Sign Up as Consultant'
                  : isCorporate
                    ? 'Sign Up as Corporate'
                    : 'Sign Up as User'
              }
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Sign In Link */}
          <TouchableOpacity
            style={styles.signInContainer}
            onPress={handleSignIn}
            disabled={isLoading || refreshing}
          >
            <Text style={styles.signInText}>
              Already have an account?{' '}
              <Text style={styles.signInLink}>Sign In to your account</Text>
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
    marginTop: 20,
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
    marginBottom: 24,
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
  genderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 12,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#17A2B8',
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#17A2B8',
  },
  radioLabel: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  checkboxGroup: {
    marginTop: 8,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#17A2B8',
    borderColor: '#17A2B8',
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#1A1A1A',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    marginTop: 8,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: '#666666',
    lineHeight: 18,
    marginLeft: 10,
  },
  termsLink: {
    color: '#17A2B8',
    textDecorationLine: 'underline',
  },
  registerButton: {
    backgroundColor: '#CCCCCC',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  registerButtonActive: {
    backgroundColor: '#17A2B8',
  },
  registerButtonLoading: {
    backgroundColor: '#17A2B8',
    opacity: 0.7,
  },
  registerButtonText: {
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
  signInContainer: {
    alignItems: 'center',
  },
  signInText: {
    fontSize: 13,
    color: '#666666',
  },
  signInLink: {
    color: '#17A2B8',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

export default SignUp;