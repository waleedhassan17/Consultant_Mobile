// Base user types
export const UserType = {
  visitor: 'visitor',
  therapist: 'therapist',
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
  nickname?: string;
  email: string;
  phone?: string;
  birthYear?: string;
  gender?: GenderValue;
  userType: UserTypeValue;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
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

// SignUp Model
export interface signUpInfo {
  nickname: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  birthYear: string;
  gender: GenderValue;
  userType: UserTypeValue;
  agreeToPrivacy: boolean;
}

export interface signUpPayload {
  nickname: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  birthYear: string;
  gender: GenderValue;
  userType: UserTypeValue;
  agreeToPrivacy: boolean;
}

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

// Form validation interfaces
export interface SignInFormValidation {
  isEmailValid: boolean;
  isPasswordValid: boolean;
  isUserTypeSelected: boolean;
  isFormValid: boolean;
}

export interface SignUpFormValidation {
  isNicknameValid: boolean;
  isEmailValid: boolean;
  isPasswordValid: boolean;
  isPasswordMatch: boolean;
  isPhoneValid: boolean;
  isBirthYearValid: boolean;
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

// API request/response types
export interface LoginRequest {
  email: string;
  password: string;
  userType: UserTypeValue;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  nickname: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  birthYear: string;
  gender: GenderValue;
  userType: UserTypeValue;
  agreeToPrivacy: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
  userType: UserTypeValue;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// Combined auth state (if needed for global auth state)
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