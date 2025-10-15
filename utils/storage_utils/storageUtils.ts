import AsyncStorage from '@react-native-async-storage/async-storage';

// Define user type options - ADD 'admin'
export type UserTypeValue = 'visitor' | 'user' | 'therapist' | 'admin';

export const KeyForStorage = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  userRole: 'userRole',
  userType: 'userType',
  userInfo: 'userInfo',
  userEmail: 'userEmail',
}

export const saveData = async (key: string, value: any) => {
  const jsonValue = typeof value === "string" ? value : JSON.stringify(value);
  await AsyncStorage.setItem(key, jsonValue);
};

const removeKey = async (key: string) => {
  await AsyncStorage.removeItem(key);
};

export const retriveData = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value
  } catch (e) {
    console.log(e);
  }
};

// Helper function to save user info
const saveUserInfo = async (user: any) => {
  await saveData(KeyForStorage.userInfo, user);
};

// Helper function to retrieve user info
const retrieveUserInfo = async () => {
  try {
    const value = await retriveData(KeyForStorage.userInfo);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.error("Error retrieving user info:", e);
    return null;
  }
};

// Helper function to save user type
export const saveUserType = async (userType: UserTypeValue) => {
  await saveData(KeyForStorage.userType, userType);
};

// Helper function to get user type
export const getUserType = async (): Promise<UserTypeValue | null> => {
  try {
    const userType = await retriveData(KeyForStorage.userType);
    return userType as UserTypeValue | null;
  } catch (e) {
    console.error("Error retrieving user type:", e);
    return null;
  }
};

// Helper function to check if user is a visitor
export const isVisitor = async (): Promise<boolean> => {
  const userType = await getUserType();
  return userType === 'visitor';
};

// Helper function to check if user is registered
export const isRegisteredUser = async (): Promise<boolean> => {
  const userType = await getUserType();
  return userType === 'user';
};

// Helper function to check if user is a therapist
export const isTherapist = async (): Promise<boolean> => {
  const userType = await getUserType();
  return userType === 'therapist';
};

// Helper function to check if user is an admin - ADDED
export const isAdmin = async (): Promise<boolean> => {
  const userType = await getUserType();
  return userType === 'admin';
};

// Helper function to clear all auth data on logout
const clearAuthData = async () => {
  await AsyncStorage.multiRemove([
    KeyForStorage.accessToken,
    KeyForStorage.refreshToken,
    KeyForStorage.userInfo,
    KeyForStorage.userType,
    KeyForStorage.userRole,
    KeyForStorage.userEmail,
  ]);
};

export { 
  removeKey, 
  saveUserInfo,
  retrieveUserInfo,
  clearAuthData
}