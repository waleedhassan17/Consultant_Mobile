import axios from "axios";
import { Alert } from "react-native";
import { store }  from "../../store/store";

// API Configuration
export const API_URL =
  "https://staging-marketplace.snookerslam.com/api/v2/storefront/";
export const COUPON_URL = "https://staging-marketplace.snookerslam.com/api/";
const TIMEOUT = 15000;

const AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  responseType: "json",
  timeout: TIMEOUT,
});

AxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === "ERR_NETWORK") {
      // Handle network error - you can add custom logic here
      console.log("Network is down");
    }

    if (error.response && error.response.status === 401) {
      const { logout } = await import(
        "../../components/appContainerSlice"
      );
      const { store } = await import("../../store/store");

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