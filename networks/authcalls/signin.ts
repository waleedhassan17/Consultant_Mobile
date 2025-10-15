import { signInPayload } from "../../models/user";
import { NotificationService } from "../../notifications/notificationHandler";
import { API } from "../network/network";

export const authLogin = async ({ signInInfo }: { signInInfo: signInPayload }) => {
  try {
    // Extract userType but don't send it to API
    const { email, password, userType } = signInInfo;

    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('username', email.trim().toLowerCase());
    formData.append('password', password);

    const response = await API.POST({
      URL: "spree_oauth/token",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: formData.toString(),
    });


    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      userType,
      email: email.trim().toLowerCase(),
      user: {
        id: response.data.resource_owner_id || '',
        uid: response.data.resource_owner_id || '',
        email: email.trim().toLowerCase(),
        userType: userType,
        nickname: response.data.nickname || response.data.name || '',
        // Add other user fields from your userInfo type as needed
      }
    };
  } catch (e: any) {
    console.error("Login error:", e);
    
    const errorMessage = e.response?.data?.message || 
                        e.response?.data?.error || 
                        e.message || 
                        "Invalid email or password";
    
    await NotificationService.sendImmediateNotification({
      title: "❌ Sign In Failed",
      body: errorMessage,
      data: { type: 'sign_in_error' },
      channelId: 'auth-notifications'
    });
    
    throw new Error(errorMessage);
  }
};