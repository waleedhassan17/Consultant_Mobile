import axios, { AxiosInstance as AxiosInstanceType } from "axios";
import { Alert, Platform } from "react-native";
import { store } from "../../store/store";
import { KeyForStorage, retriveData, clearAuthData } from "../../utils/storage_utils/storageUtils";

// API Configuration
export const API_URL = Platform.select({
  android: "https://marketplace.consulto-plus.com/",
  ios: "https://marketplace.consulto-plus.com/",
  default: "https://marketplace.consulto-plus.com/"
});

export const THERAPIST_URL = Platform.select({
  android: "https://marketplace.consulto-plus.com/",
  ios: "https://marketplace.consulto-plus.com/",
  default: "https://marketplace.consulto-plus.com/"
});

const TIMEOUT = 30000; // 30 seconds timeout

// Create Main API instance (for authentication and other services)
const MainAxiosInstance = axios.create({
  baseURL: API_URL,
  responseType: "json",
  timeout: TIMEOUT,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

// Create Therapist API instance (for therapist services)
const TherapistAxiosInstance = axios.create({
  baseURL: THERAPIST_URL,
  responseType: "json",
  timeout: TIMEOUT,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

// Request interceptor for Main API
MainAxiosInstance.interceptors.request.use(
  async (config) => {
    if (config.url) {
      console.log('🔍 Main API Request URL:', config.baseURL + config.url);
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
    console.error('❌ Main API Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Request interceptor for Therapist API
TherapistAxiosInstance.interceptors.request.use(
  async (config) => {
    if (config.url) {
      console.log('🔍 Therapist API Request URL:', config.baseURL + config.url);
    }
    console.log('🔍 Request Method:', config.method);
    console.log('🔍 Request Headers:', config.headers);
    
    // Add token for therapist API requests
    const token = await retriveData(KeyForStorage.accessToken);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Therapist API Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for Main API
MainAxiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ Main API Response status:', response.status);
    return response;
  },
  async (error) => {
    console.error('❌ Main API Response error:', {
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
      
      if (Platform.OS === 'android') {
        console.error('⚠️ Android Network Security: Make sure your android/app/src/main/AndroidManifest.xml allows cleartext traffic or has proper network security config');
      }
    }

    if (error.response && error.response.status === 401) {
      const { logout } = await import(
        "../../components/appContainerSlice"
      );
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

// Main API (for authentication and other services)
export const API = {
  GET: async ({ params, URL, headers }: INetworkRequest) => {
    return await MainAxiosInstance.get(URL, {
      ...defaultConfig,
      headers: headers,
      params,
    });
  },

  POST: async ({ headers, data, URL, ...rest }: INetworkRequest) => {
    console.log('📤 POST Request:', { URL, data, headers });
    return await MainAxiosInstance.post(URL, data, {
      ...defaultConfig,
      headers: headers,
      ...rest,
    });
  },

  PUT: async ({ data, URL, headers, params }: INetworkRequest) => {
    return await MainAxiosInstance.put(URL, data, {
      ...defaultConfig,
      headers: headers,
      params: params || {},
    });
  },

  DELETE: async ({ headers, params, URL }: INetworkRequest) => {
    return await MainAxiosInstance.delete(URL, {
      ...defaultConfig,
      headers: headers,
      params,
    });
  },

  PATCH: async ({ headers, data, URL, ...rest }: INetworkRequest) => {
    return await MainAxiosInstance.patch(URL, data, {
      ...defaultConfig,
      headers: headers,
      ...rest,
    });
  },
};

// Therapist API (for therapist services from marketplace)
export const TherapistAPI = {
  GET: async ({ params, URL, headers }: INetworkRequest) => {
    return await TherapistAxiosInstance.get(URL, {
      ...defaultConfig,
      headers: headers,
      params,
    });
  },

  POST: async ({ headers, data, URL, ...rest }: INetworkRequest) => {
    console.log('📤 Therapist API POST Request:', { URL, data, headers });
    return await TherapistAxiosInstance.post(URL, data, {
      ...defaultConfig,
      headers: headers,
      ...rest,
    });
  },

  PUT: async ({ data, URL, headers, params }: INetworkRequest) => {
    return await TherapistAxiosInstance.put(URL, data, {
      ...defaultConfig,
      headers: headers,
      params: params || {},
    });
  },

  DELETE: async ({ headers, params, URL }: INetworkRequest) => {
    return await TherapistAxiosInstance.delete(URL, {
      ...defaultConfig,
      headers: headers,
      params,
    });
  },

  PATCH: async ({ headers, data, URL, ...rest }: INetworkRequest) => {
    return await TherapistAxiosInstance.patch(URL, data, {
      ...defaultConfig,
      headers: headers,
      ...rest,
    });
  },
};