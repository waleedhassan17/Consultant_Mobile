// serializers/authSignInSerializer.ts

import { userInfo, signInInfo, GenderValue, UserTypeValue } from "../models/auth";

export const signInPayloadSerializer = (formData: any): signInInfo => {
  return {
    email: formData.email?.trim()?.toLowerCase() || '',
    password: formData.password || '',
    userType: formData.userType || 'visitor',
  };
};

export const signInResponseSerializer = (payload: any): userInfo => {
  const {
    data: {
      user: {
        uid,
        email,
        displayName,
        photoURL,
        phoneNumber,
        emailVerified,
        nickname,
        phone,
        birthYear,
        gender,
        userType,
        collection,
        createdAt,
        updatedAt,
        isVerified,
        specializations,
        experience,
        qualifications,
      }
    }
  } = payload;

  return {
    id: uid || '', 
    email: email || '',
    nickname: nickname || displayName || '',
    phone: phone || phoneNumber || '',
    birthYear: birthYear || '',
    gender: (gender as GenderValue) || 'prefer-not-to-say',
    userType: (userType as UserTypeValue) || 'visitor',
    avatar: photoURL || undefined,
    createdAt: createdAt || '',
    updatedAt: updatedAt || '',
  };
};

// This is the missing function that was being imported
export const validateSignInData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data) {
    errors.push('Sign-in data is required');
    return { isValid: false, errors };
  }

  // Validate email
  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required');
  } else if (data.email.trim() === '') {
    errors.push('Email cannot be empty');
  } else {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.push('Please enter a valid email address');
    }
  }

  // Validate password
  if (!data.password || typeof data.password !== 'string') {
    errors.push('Password is required');
  } else if (data.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  // Validate userType
  if (data.userType) {
    const validTypes: UserTypeValue[] = ['visitor', 'therapist'];
    if (!validTypes.includes(data.userType)) {
      errors.push('Invalid user type');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Additional validation functions specifically for API response data
export const validateApiResponseStructure = (rawResponse: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!rawResponse) {
    errors.push('API response is null or undefined');
    return { isValid: false, errors };
  }

  if (!rawResponse.data) {
    errors.push('API response missing data field');
  }

  if (!rawResponse.data?.user) {
    errors.push('API response missing user data');
  }

  if (!rawResponse.data?.user?.uid) {
    errors.push('API response missing user ID');
  }

  if (!rawResponse.data?.user?.email) {
    errors.push('API response missing user email');
  }

  if (!rawResponse.data?.user?.userType) {
    errors.push('API response missing user type');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const createInitialSignInForm = () => {
  return {
    email: '',
    password: '',
    userType: 'visitor' as const,
    showPassword: false,
  };
};

// Additional utility functions for data transformation
export const sanitizeUserInput = (input: string): string => {
  return input.trim().toLowerCase();
};

export const formatUserType = (userType: string): UserTypeValue => {
  const validTypes: UserTypeValue[] = ['visitor', 'therapist'];
  return validTypes.includes(userType as UserTypeValue) 
    ? (userType as UserTypeValue) 
    : 'visitor';
};

export const formatGender = (gender: string): GenderValue => {
  const validGenders: GenderValue[] = ['male', 'female', 'other', 'prefer-not-to-say'];
  return validGenders.includes(gender as GenderValue) 
    ? (gender as GenderValue) 
    : 'prefer-not-to-say';
};