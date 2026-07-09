import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserTypeValue, userInfo } from '../../models/user';

export const KeyForStorage = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  userRole: 'userRole',
  userType: 'userType',
  userInfo: 'userInfo',
  userEmail: 'userEmail',
  userId: 'userId',
} as const;

export const saveData = async (key: string, value: any): Promise<void> => {
  try {
    const jsonValue = typeof value === "string" ? value : JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    console.log(`💾 Saved ${key}:`, typeof value === 'string' ? value : '[object]');
  } catch (e) {
    console.error(`Error saving data for key ${key}:`, e);
    throw e;
  }
};

export const removeKey = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
    console.log(`🗑️ Removed key: ${key}`);
  } catch (e) {
    console.error(`Error removing key ${key}:`, e);
    throw e;
  }
};

export const retriveData = async (key: string): Promise<string | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (e) {
    console.error(`Error retrieving data for key ${key}:`, e);
    return null;
  }
};

// ============================================
// User Info Management
// ============================================

/**
 * Save complete user info to storage
 */
export const saveUserInfo = async (user: userInfo | any): Promise<void> => {
  try {
    await saveData(KeyForStorage.userInfo, user);
    
    // Also save commonly accessed fields separately for quick access
    if (user.email) {
      await saveData(KeyForStorage.userEmail, user.email);
    }
    if (user.id) {
      await saveData(KeyForStorage.userId, user.id);
    }
    if (user.userType) {
      await saveData(KeyForStorage.userType, user.userType);
      console.log(`💾 Saved userType from userInfo: ${user.userType}`);
    }
  } catch (e) {
    console.error("Error saving user info:", e);
    throw e;
  }
};

/**
 * Retrieve complete user info from storage
 */
export const retrieveUserInfo = async (): Promise<userInfo | null> => {
  try {
    const value = await retriveData(KeyForStorage.userInfo);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.error("Error retrieving user info:", e);
    return null;
  }
};

// ============================================
// User Type Management
// ============================================

/**
 * Save user type to storage
 */
export const saveUserType = async (userType: UserTypeValue): Promise<void> => {
  try {
    await saveData(KeyForStorage.userType, userType);
    console.log(`💾 User type saved: ${userType}`);
  } catch (e) {
    console.error("Error saving user type:", e);
    throw e;
  }
};

/**
 * Get user type from storage
 */
export const getUserType = async (): Promise<UserTypeValue | null> => {
  try {
    const userType = await retriveData(KeyForStorage.userType);
    console.log(`📋 Retrieved userType from storage: ${userType}`);
    return userType as UserTypeValue | null;
  } catch (e) {
    console.error("Error retrieving user type:", e);
    return null;
  }
};

// ============================================
// User Type Checks
// ============================================

/**
 * Check if user is a regular user
 */
export const isUser = async (): Promise<boolean> => {
  const userType = await getUserType();
  return userType === 'user';
};

/**
 * Check if user is a consultant
 */
export const isConsultant = async (): Promise<boolean> => {
  const userType = await getUserType();
  return userType === 'consultant';
};

/**
 * Check if user is corporate
 */
export const isCorporate = async (): Promise<boolean> => {
  const userType = await getUserType();
  return userType === 'corporate';
};

/**
 * Check if user is an admin
 */
export const isAdmin = async (): Promise<boolean> => {
  const userType = await getUserType();
  return userType === 'admin';
};

/**
 * Check if user is authenticated (has valid token and user info)
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const accessToken = await retriveData(KeyForStorage.accessToken);
    const userInfo = await retrieveUserInfo();
    return !!(accessToken && userInfo);
  } catch (e) {
    console.error("Error checking authentication:", e);
    return false;
  }
};

// ============================================
// Token Management
// ============================================

/**
 * Save access token to storage
 */
export const saveAccessToken = async (token: string): Promise<void> => {
  await saveData(KeyForStorage.accessToken, token);
};

/**
 * Get access token from storage
 */
export const getAccessToken = async (): Promise<string | null> => {
  return await retriveData(KeyForStorage.accessToken);
};

/**
 * Save refresh token to storage
 */
export const saveRefreshToken = async (token: string): Promise<void> => {
  await saveData(KeyForStorage.refreshToken, token);
};

/**
 * Get refresh token from storage
 */
export const getRefreshToken = async (): Promise<string | null> => {
  return await retriveData(KeyForStorage.refreshToken);
};

// ============================================
// Auth Data Management
// ============================================

/**
 * Clear all authentication data on logout
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      KeyForStorage.accessToken,
      KeyForStorage.refreshToken,
      KeyForStorage.userInfo,
      KeyForStorage.userType,
      KeyForStorage.userRole,
      KeyForStorage.userEmail,
      KeyForStorage.userId,
    ]);
    console.log("✅ All auth data cleared successfully");
  } catch (e) {
    console.error("Error clearing auth data:", e);
    throw e;
  }
};

/**
 * Clear all storage (use with caution)
 */
export const clearAllStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
    console.log("✅ All storage cleared successfully");
  } catch (e) {
    console.error("Error clearing all storage:", e);
    throw e;
  }
};

// ============================================
// Utility Functions
// ============================================

/**
 * Get user email from storage
 */
export const getUserEmail = async (): Promise<string | null> => {
  return await retriveData(KeyForStorage.userEmail);
};

/**
 * Get user ID from storage
 */
export const getUserId = async (): Promise<string | null> => {
  return await retriveData(KeyForStorage.userId);
};

/**
 * Check if specific key exists in storage
 */
export const hasKey = async (key: string): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null;
  } catch (e) {
    console.error(`Error checking key ${key}:`, e);
    return false;
  }
};

/**
 * Get all storage keys
 */
export const getAllKeys = async (): Promise<readonly string[]> => {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (e) {
    console.error("Error getting all keys:", e);
    return [];
  }
};

/**
 * Debug function to log all stored data
 */
export const debugStorage = async (): Promise<void> => {
  try {
    const keys = await getAllKeys();
    console.log("📦 Storage Keys:", keys);
    
    for (const key of keys) {
      const value = await retriveData(key);
      console.log(`  ${key}:`, value);
    }
  } catch (e) {
    console.error("Error debugging storage:", e);
  }
};