// networks/authcalls/logout.ts
import { NotificationService } from "../../notifications/notificationHandler";
import { API } from "../network/network";
import { clearAuthData, retriveData, KeyForStorage } from "../../utils/storage_utils/storageUtils";

interface LogoutPayload {
  accessToken?: string;
  userId?: string;
}

interface LogoutResponse {
  success: boolean;
  message: string;
}

/**
 * Logout user and revoke token
 * 
 * Flow:
 * 1. Get current access token from storage
 * 2. Call backend to revoke the token (optional, may fail)
 * 3. Clear all local auth data
 * 4. Return success
 * 
 * Note: Even if token revocation fails, we still clear local data
 * to ensure the user is logged out from the app.
 */
export const logoutUser = async (logoutData?: LogoutPayload): Promise<LogoutResponse> => {
  try {
    console.log("========================================");
    console.log("🚪 LOGOUT REQUEST");
    console.log("========================================");
    
    // Get the access token (from param or storage)
    const accessToken = logoutData?.accessToken || await retriveData(KeyForStorage.accessToken);
    
    if (accessToken) {
      console.log("🔹 Revoking token with backend...");
      
      // Try to revoke the token on the backend
      try {
        const formData = new URLSearchParams();
        formData.append('token', accessToken);

        await API.POST({
          URL: "spree_oauth/revoke",
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
          data: formData.toString(),
        });
        
        console.log("✅ Token revoked on backend");
      } catch (revokeError: any) {
        // Token revocation failed, but we'll still clear local data
        console.log("⚠️ Token revocation failed:", revokeError.message);
        console.log("📝 Continuing with local logout...");
      }
    } else {
      console.log("⚠️ No access token found");
    }
    
    // Clear all local auth data
    console.log("🔹 Clearing local auth data...");
    await clearAuthData();
    
    const logoutResponse: LogoutResponse = {
      success: true,
      message: "Successfully logged out"
    };

    console.log("========================================");
    console.log("✅ LOGOUT COMPLETE");
    console.log("========================================");
    
    await NotificationService.sendImmediateNotification({
      title: "👋 Logged Out",
      body: "You have been logged out successfully",
      data: { type: 'logout_success' },
      channelId: 'auth-notifications'
    });
    
    return logoutResponse;

  } catch (e: any) {
    console.error("========================================");
    console.error("❌ LOGOUT ERROR");
    console.error("Message:", e.message);
    console.error("========================================");
    
    // Even on error, try to clear local data
    try {
      await clearAuthData();
      console.log("📝 Local auth data cleared despite error");
    } catch (clearError) {
      console.error("❌ Failed to clear auth data:", clearError);
    }
    
    await NotificationService.sendImmediateNotification({
      title: "⚠️ Logout Issue",
      body: "Logged out locally, but server sync may have failed",
      data: { type: 'logout_warning' },
      channelId: 'auth-notifications'
    });
    
    // Return success anyway since we cleared local data
    return {
      success: true,
      message: "Logged out locally (server sync may have failed)"
    };
  }
};

/**
 * Force logout - clears all data without server communication
 * Use when server is unreachable or for emergency logout
 */
export const forceLogout = async (): Promise<LogoutResponse> => {
  try {
    console.log("🚨 FORCE LOGOUT - Clearing all local data");
    await clearAuthData();
    
    return {
      success: true,
      message: "Force logout complete"
    };
  } catch (e: any) {
    console.error("❌ Force logout error:", e.message);
    throw new Error("Failed to clear authentication data");
  }
};