// models/user.ts

// Base user types
export const UserType = {
  user: 'user',
  consultant: 'consultant',
  corporate: 'corporate',
  admin: 'admin',
} as const;

export type UserTypeValue = typeof UserType[keyof typeof UserType];

export const Gender = {
  male: 'male',
  female: 'female',
  other: 'other',
  preferNotToSay: 'prefer-not-to-say',
} as const;

export type GenderValue = typeof Gender[keyof typeof Gender];

export const AuthStatus = {
  idle: 'idle',
  loading: 'loading',
  failed: 'failed',
} as const;

export type AuthStatusValue = typeof AuthStatus[keyof typeof AuthStatus];

// User info interface
export interface userInfo {
  id: string;
  uid: string;
  nickname?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  birthYear?: string;
  country?: string;
  gender?: GenderValue;
  userType: UserTypeValue;
  avatar?: string;
  photoURL?: string;
  createdAt?: string;
  updatedAt?: string;
  emailVerified?: boolean;
  isVerified?: boolean;
  
  // Consultant specific fields
  preferredCurrency?: string;
  discipline?: string;
  languagesSpoken?: string[];
  availableForIndividual?: boolean;
  availableForEnterprise?: boolean;
  availableForMembership?: boolean;
  
  // Corporate specific fields
  companyName?: string;
  industryType?: string;
  companySize?: string;
}

// Base SignUp payload
export interface signUpPayload {
  nickname: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  birthYear: string;
  country: string;
  gender: GenderValue;
  userType: UserTypeValue;
  agreeToPrivacy: boolean;
}

// User Registration (Basic - Default)
export interface UserRegistrationPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  gender: GenderValue;
  userType: 'user';
  agreeToPrivacy: boolean;
}

// Consultant Registration
export interface ConsultantRegistrationPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  preferredCurrency: string;
  discipline: string;
  languagesSpoken: string[];
  availableForIndividual: boolean;
  availableForEnterprise: boolean;
  availableForMembership: boolean;
  gender: GenderValue;
  userType: 'consultant';
  agreeToPrivacy: boolean;
}

// Corporate Registration
export interface CorporateRegistrationPayload {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  industryType: string;
  companySize: string;
  country: string;
  gender: GenderValue;
  userType: 'corporate';
  agreeToPrivacy: boolean;
}

// Extended SignUp payload with all fields
export interface ExtendedSignUpPayload extends signUpPayload {
  // Consultant specific
  preferredCurrency?: string;
  discipline?: string;
  languagesSpoken?: string[];
  availableForIndividual?: boolean;
  availableForEnterprise?: boolean;
  availableForMembership?: boolean;
  
  // Corporate specific
  companyName?: string;
  industryType?: string;
  companySize?: string;
}

// SignUp slice state
export interface signUpSliceState {
  nickname: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  birthYear: string;
  gender: GenderValue | null;
  selectedUserType: UserTypeValue | null;
  showPassword: boolean;
  showConfirmPassword: boolean;
  agreeToPrivacy: boolean;
  error: string;
  accessToken: string;
  user: userInfo | null;
  status: AuthStatusValue;
}

// Auth Response interfaces
export interface AuthResponse {
  user: userInfo;
  accessToken: string;
  refreshToken?: string;
  message?: string;
}

export interface AuthError {
  message: string;
  code?: string;
  field?: string;
}

// SignIn Model
export interface signInInfo {
  email: string;
  password: string;
  userType: UserTypeValue;
}

export interface signInPayload {
  email: string;
  password: string;
  userType: UserTypeValue;
}

export interface signInSliceState {
  email: string;
  password: string;
  showPassword: boolean;
  selectedUserType: UserTypeValue | null;
  error: string;
  accessToken: string;
  user: userInfo | null;
  status: AuthStatusValue;
}

// Form validation interfaces
export interface SignUpFormValidation {
  isFirstNameValid: boolean;
  isLastNameValid: boolean;
  isEmailValid: boolean;
  isPasswordValid: boolean;
  isPasswordMatch: boolean;
  isCountryValid: boolean;
  isGenderSelected: boolean;
  isUserTypeSelected: boolean;
  isPrivacyAgreed: boolean;
  isFormValid: boolean;
}

// User type option interface (for UI components)
export interface UserTypeOption {
  value: UserTypeValue;
  label: string;
  icon: string;
  description?: string;
}

// Gender option interface (for UI components)
export interface GenderOption {
  value: GenderValue;
  label: string;
  description?: string;
}

// API request types
export interface RegisterUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  gender: GenderValue;
  agreeToPrivacy: boolean;
}

export interface RegisterConsultantRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  preferredCurrency: string;
  discipline: string;
  languagesSpoken: string[];
  availableForIndividual: boolean;
  availableForEnterprise: boolean;
  availableForMembership: boolean;
  gender: GenderValue;
  agreeToPrivacy: boolean;
}

export interface RegisterCorporateRequest {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  industryType: string;
  companySize: string;
  country: string;
  gender: GenderValue;
  agreeToPrivacy: boolean;
}

// Combined auth state
export interface IAuthSliceState {
  isAuthenticated: boolean;
  userType: UserTypeValue | null;
  userInfo: userInfo | null;
  accessToken: string;
  refreshToken?: string;
  loading: boolean;
  error: string;
  lastLoginDate?: string;
}