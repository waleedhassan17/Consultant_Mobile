// serializers/authSignUpSerializer.ts

import { userInfo } from "../models/auth";

export const signUpPayloadSerializer = (formData: any): userInfo => {
  return {
    id: '', // Will be set by the backend
    email: formData.email?.trim()?.toLowerCase() || '',
    nickname: formData.nickname?.trim() || '',
    phone: formData.phone?.trim() || '',
    birthYear: formData.birthYear?.trim() || '',
    gender: formData.gender || 'prefer-not-to-say',
    userType: formData.userType || 'visitor',
  };
};

export const signUpResponseSerializer = (payload: any): userInfo => {
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

export const validateSignUpData = (formData: any): { isValid: boolean; errors: string[] } => {
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

  // Confirm password validation
  if (formData.password !== formData.confirmPassword) {
    errors.push('Passwords do not match');
  }

  // Nickname validation
  if (!formData.nickname || typeof formData.nickname !== 'string' || formData.nickname.trim().length === 0) {
    errors.push('Nickname is required');
  } else if (formData.nickname.trim().length < 2) {
    errors.push('Nickname must be at least 2 characters');
  }

  // Phone validation
  if (!formData.phone || typeof formData.phone !== 'string' || formData.phone.trim().length === 0) {
    errors.push('Phone number is required');
  } else {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      errors.push('Please enter a valid phone number');
    }
  }

  // Birth year validation
  if (!formData.birthYear || typeof formData.birthYear !== 'string' || formData.birthYear.trim().length === 0) {
    errors.push('Birth year is required');
  } else {
    const birthYear = formData.birthYear.trim();
    if (!/^\d{4}$/.test(birthYear)) {
      errors.push('Please enter a valid 4-digit birth year');
    } else {
      const year = parseInt(birthYear, 10);
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear) {
        errors.push('Please enter a valid birth year');
      } else if (currentYear - year < 13) {
        errors.push('You must be at least 13 years old');
      }
    }
  }

  // Gender validation
  const validGenders = ['male', 'female', 'other', 'prefer-not-to-say'];
  if (!formData.gender || !validGenders.includes(formData.gender)) {
    errors.push('Please select a valid gender option');
  }

  // User type validation
  const validUserTypes = ['visitor', 'therapist'];
  if (!formData.userType || !validUserTypes.includes(formData.userType)) {
    errors.push('Please select a valid user type');
  }

  // Privacy agreement validation
  if (!formData.agreeToPrivacy) {
    errors.push('Please accept the privacy policy and terms of service');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const createInitialSignUpForm = () => {
  return {
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    birthYear: '',
    gender: 'prefer-not-to-say' as const,
    userType: 'visitor' as const,
    showPassword: false,
    showConfirmPassword: false,
    agreeToPrivacy: false,
  };
};