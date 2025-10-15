import axios from "axios";
import { Alert, Platform } from "react-native";
import { store } from "../../store/store";
import { KeyForStorage, retriveData, clearAuthData } from "../../utils/storage_utils/storageUtils";

// API Configuration
export const API_URL = Platform.select({
  android: "https://wajihashahjehan.com/",
  ios: "https://wajihashahjehan.com/",
  default: "https://wajihashahjehan.com/"
});

const TIMEOUT = 30000; // Increased timeout to 30 seconds

const AxiosInstance = axios.create({
  baseURL: API_URL,
  responseType: "json",
  timeout: TIMEOUT,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add Authorization header
AxiosInstance.interceptors.request.use(
  async (config) => {
    if (config.url) {
      console.log('🔍 Request URL:', config.baseURL + config.url);
    }
    console.log('🔍 Request Method:', config.method);
    console.log('🔍 Request Headers:', config.headers);
    
    // Skip token for auth endpoints
    if (config.url && !config.url.includes('spree_oauth/token')) {
      const token = await retriveData(KeyForStorage.accessToken);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

AxiosInstance.interceptors.response.use(
  (response) => {
    console.log(' Response status:', response.status);
    return response;
  },
  async (error) => {
    console.error('❌ Response error:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      config: error.config ? {
        url: error.config.url || 'unknown',
        method: error.config.method || 'unknown',
        headers: error.config.headers,
      } : 'No config available'
    });

    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      console.error("Network is down or unreachable");
      
      // Check if it's an SSL/certificate issue
      if (Platform.OS === 'android') {
        console.error('⚠️ Android Network Security: Make sure your android/app/src/main/AndroidManifest.xml allows cleartext traffic or has proper network security config');
      }
    }

    if (error.response && error.response.status === 401) {
      const { logout } = await import("../../components/appContainerSlice");
      const { store } = await import("../../store/store");

      await clearAuthData();
      store.dispatch(logout());
    }

    return Promise.reject(error);
  }
);

const defaultConfig = {
  ...axios.defaults.headers,
};

interface INetworkRequest {
  URL: string;
  headers?: any;
  params?: any;
  data?: any;
  [key: string]: any;
}

export const API = {
  GET: async ({ params, URL, headers }: INetworkRequest) => {
    return await AxiosInstance.get(URL, {
      ...defaultConfig,
      headers: headers,
      params,
    });
  },

  POST: async ({ headers, data, URL, ...rest }: INetworkRequest) => {
    console.log('📤 POST Request:', { URL, data, headers });
    return await AxiosInstance.post(URL, data, {
      ...defaultConfig,
      headers: headers,
      ...rest,
    });
  },

  PUT: async ({ data, URL, headers, params }: INetworkRequest) => {
    return await AxiosInstance.put(URL, data, {
      ...defaultConfig,
      headers: headers,
      params: params || {},
    });
  },

  DELETE: async ({ headers, params, URL }: INetworkRequest) => {
    return await AxiosInstance.delete(URL, {
      ...defaultConfig,
      headers: headers,
      params,
    });
  },

  PATCH: async ({ headers, data, URL, ...rest }: INetworkRequest) => {
    return await AxiosInstance.patch(URL, data, {
      ...defaultConfig,
      headers: headers,
      ...rest,
    });
  },
};