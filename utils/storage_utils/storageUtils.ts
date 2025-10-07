import AsyncStorage from '@react-native-async-storage/async-storage';

export const KeyForStorage = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  userRole: 'userRole',
  userType: 'userType',
  userInfo: 'userInfo',
  couponApplied: 'couponApplied'
}

const saveCouponApplied = async (value: {
  applied: boolean;
  id: number | null;
}) => {
  await AsyncStorage.setItem(
    KeyForStorage.couponApplied,
    JSON.stringify(value)
  );
};

const retrieveCouponApplied = async (): Promise<{
  applied: boolean;
  id: number | null;
} | null> => {
  try {
    const value = await AsyncStorage.getItem(KeyForStorage.couponApplied);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.error("Error retrieving coupon applied state:", e);
    return null;
  }
};

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

// Helper function to clear all auth data on logout
const clearAuthData = async () => {
  await removeKey(KeyForStorage.accessToken);
  await removeKey(KeyForStorage.refreshToken);
  await removeKey(KeyForStorage.userInfo);
  await removeKey(KeyForStorage.userType);
  await removeKey(KeyForStorage.userRole);
};

export { 
  removeKey, 
  saveCouponApplied, 
  retrieveCouponApplied,
  saveUserInfo,
  retrieveUserInfo,
  clearAuthData
}