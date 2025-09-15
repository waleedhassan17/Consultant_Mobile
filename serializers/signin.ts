// serializers/authSignInSerializer.ts

import { userInfo, signInInfo } from "../models/auth";

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
    id: uid || '', // Note: using uid as id to match userInfo interface
    email: email || '',
    nickname: nickname || '',
    phone: phone || '',
    birthYear: birthYear || '',
    gender: gender || 'prefer-not-to-say',
    userType: userType || 'visitor',
    avatar: photoURL || undefined,
    createdAt: createdAt || '',
    updatedAt: updatedAt || '',
  };
};

export const validateSignInData = (formData: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Email validation
  if (!formData.email || typeof formData.email !== 'string' || formData.email.trim().length === 0) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      errors.push('Please enter a valid email address');
    }
  }

  // Password validation
  if (!formData.password || typeof formData.password !== 'string' || formData.password.length === 0) {
    errors.push('Password is required');
  } else if (formData.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  // User type validation
  const validUserTypes = ['visitor', 'therapist'];
  if (!formData.userType || !validUserTypes.includes(formData.userType)) {
    errors.push('Please select a valid user type');
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