import { API } from "../network/network";
import {
  retriveData,
  KeyForStorage,
} from "../../utils/storage_utils/storageUtils";

export const me = async () => {
  try {
    const token = await retriveData(KeyForStorage.accessToken);

    const response = await API.GET({
      URL: "users/me",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (e: any) {
    throw e
  }
};


export const persistFcmToken = async (fcmToken: string, deviceType: string) => {
  try {
    const token = await retriveData(KeyForStorage.accessToken);

    const response = await API.POST({
      URL: "device_infos",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        token: fcmToken,
        device_type: deviceType
      }
    
    });

    return response.data;
  } catch (e: any) {
    throw e
  }
};