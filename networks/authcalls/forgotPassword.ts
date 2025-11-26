import { NotificationService } from "../../notifications/notificationHandler";
import { API } from "../network/network";

// ==================== INTERFACES ====================

interface ForgotPasswordParams {
  email: string;
}

interface ResetPasswordParams {
  email: string;
  verificationToken: string;
  newPassword: string;
}

interface ResendVerificationParams {
  email: string;
  type: "email_verification" | "password_reset";
  userType?: "user" | "corporate" | "consultant";
}

interface CheckVerificationParams {
  email: string;
  type: "email_verification" | "password_reset";
  userType?: "user" | "corporate" | "consultant";
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Convert object to URL-encoded form data string
 */
const encodeFormData = (data: any): string => {
  const params = new URLSearchParams();
  
  const flatten = (obj: any, prefix = '') => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const fullKey = prefix ? `${prefix}[${key}]` : key;
        
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          flatten(value, fullKey);
        } else {
          params.append(fullKey, String(value));
        }
      }
    }
  };
  
  flatten(data);
  return params.toString();
};

// ==================== API FUNCTIONS ====================

/**
 * Send forgot password email
 * Endpoint: POST /en/user/password
 */
export const forgotPasswordAPI = async ({ email }: ForgotPasswordParams) => {
  try {
    console.log("📤 Sending forgot password request for:", email);

    const formData = encodeFormData({
      user: {
        email: email.trim().toLowerCase(),
      }
    });

    console.log("📋 Encoded form data:", formData);

    const response = await API.POST({
      URL: "en/user/password",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: formData,
    });

    console.log("✅ Forgot password response:", response.data);

    await NotificationService.sendImmediateNotification({
      title: "📧 Password Reset Email Sent",
      body: `Check your email at ${email}`,
      data: { type: 'password_reset_sent' },
      channelId: 'auth-notifications'
    });

    return {
      success: true,
      message: response.data?.message || "Password reset email sent successfully",
      email: email.trim().toLowerCase(),
    };
  } catch (error: any) {
    console.error("❌ Forgot password error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    let errorMessage = "Failed to send reset email";
    
    // Extract error message from different possible response formats
    if (error.response?.data) {
      const errorData = error.response.data;
      errorMessage = errorData.message || 
                     errorData.error || 
                     errorData.errors?.join(', ') ||
                     errorData.error_description ||
                     errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Check for specific error cases
    if (error.response?.status === 404) {
      errorMessage = "Email address not found. Please check and try again.";
    } else if (error.response?.status === 422) {
      errorMessage = "Invalid email format or email not registered. Please verify your email address.";
    } else if (error.response?.status === 429) {
      errorMessage = "Too many requests. Please try again later.";
    }
    
    await NotificationService.sendImmediateNotification({
      title: "❌ Password Reset Failed",
      body: errorMessage,
      data: { type: 'password_reset_error' },
      channelId: 'auth-notifications'
    });

    throw new Error(errorMessage);
  }
};

/**
 * Reset password with token
 * Endpoint: PUT /en/user/password
 */
export const resetPasswordAPI = async ({ 
  email, 
  verificationToken, 
  newPassword 
}: ResetPasswordParams) => {
  try {
    console.log("📤 Sending reset password request for:", email);

    const formData = encodeFormData({
      user: {
        reset_password_token: verificationToken,
        password: newPassword,
        password_confirmation: newPassword,
      }
    });

    console.log("📋 Encoded form data (password hidden)");

    const response = await API.PUT({
      URL: "en/user/password",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: formData,
    });

    console.log("✅ Reset password response:", response.data);

    await NotificationService.sendImmediateNotification({
      title: "✅ Password Reset Successful",
      body: "You can now sign in with your new password",
      data: { type: 'password_reset_success' },
      channelId: 'auth-notifications'
    });

    return {
      success: true,
      message: response.data?.message || "Password reset successfully",
      email: email.trim().toLowerCase(),
    };
  } catch (error: any) {
    console.error("❌ Reset password error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    let errorMessage = "Failed to reset password";
    
    if (error.response?.data) {
      const errorData = error.response.data;
      errorMessage = errorData.message || 
                     errorData.error || 
                     errorData.errors?.join(', ') ||
                     errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Check for specific error cases
    if (error.response?.status === 422) {
      errorMessage = "Invalid or expired reset token. Please request a new password reset.";
    } else if (error.response?.status === 404) {
      errorMessage = "Reset token not found. Please request a new password reset.";
    }
    
    await NotificationService.sendImmediateNotification({
      title: "❌ Password Reset Failed",
      body: errorMessage,
      data: { type: 'password_reset_error' },
      channelId: 'auth-notifications'
    });

    throw new Error(errorMessage);
  }
};

/**
 * Resend verification email
 * Endpoint: POST /en/user/confirmation (for email verification)
 * Endpoint: POST /en/user/password (for password reset)
 */
export const resendVerificationEmailAPI = async ({ 
  email, 
  type,
  userType 
}: ResendVerificationParams) => {
  try {
    console.log("📤 Resending verification email:", { email, type, userType });

    let response;
    const formData = encodeFormData({
      user: {
        email: email.trim().toLowerCase(),
      }
    });

    if (type === "password_reset") {
      // For password reset, use the forgot password endpoint
      response = await API.POST({
        URL: "en/user/password",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: formData,
      });
    } else {
      // For email verification, use the confirmation endpoint
      response = await API.POST({
        URL: "en/user/confirmation",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: formData,
      });
    }

    console.log("✅ Resend verification response:", response.data);

    await NotificationService.sendImmediateNotification({
      title: "📧 Verification Email Sent",
      body: `Check your email at ${email}`,
      data: { type: 'verification_email_sent' },
      channelId: 'auth-notifications'
    });

    return {
      success: true,
      message: response.data?.message || "Verification email sent successfully",
      email: email.trim().toLowerCase(),
    };
  } catch (error: any) {
    console.error("❌ Resend verification error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    let errorMessage = "Failed to resend verification email";
    
    if (error.response?.data) {
      const errorData = error.response.data;
      errorMessage = errorData.message || 
                     errorData.error || 
                     errorData.errors?.join(', ') ||
                     errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Check for specific error cases
    if (error.response?.status === 422) {
      errorMessage = "Email may already be verified or invalid. Please try signing in.";
    } else if (error.response?.status === 404) {
      errorMessage = "Email address not found.";
    }
    
    await NotificationService.sendImmediateNotification({
      title: "❌ Resend Failed",
      body: errorMessage,
      data: { type: 'verification_resend_error' },
      channelId: 'auth-notifications'
    });

    throw new Error(errorMessage);
  }
};

/**
 * Check verification status
 * Note: This implementation tries multiple approaches since APIs vary
 */
export const checkVerificationStatusAPI = async ({ 
  email, 
  type,
  userType 
}: CheckVerificationParams) => {
  try {
    console.log("📤 Checking verification status:", { email, type, userType });

    // First, try to check verification status via a dedicated endpoint
    try {
      const response = await API.GET({
        URL: "en/user/verification_status",
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          email: email.trim().toLowerCase(),
          type: type,
        },
      });

      console.log("✅ Verification status response:", response.data);

      const isVerified = response.data?.verified || 
                         response.data?.is_verified || 
                         response.data?.email_verified ||
                         false;

      return {
        success: true,
        isVerified: isVerified,
        message: isVerified ? "Email verified successfully" : "Email not yet verified",
        email: email.trim().toLowerCase(),
        verificationToken: response.data?.verification_token || response.data?.token || null,
      };
    } catch (primaryError: any) {
      // If the dedicated endpoint doesn't exist, try alternative method
      console.log("ℹ️ Primary verification check failed, trying alternative...");
      
      // For password reset flow, we can't really check - assume user clicked the link
      if (type === "password_reset") {
        return {
          success: true,
          isVerified: false,
          message: "Please check your email and click the reset link",
          email: email.trim().toLowerCase(),
          verificationToken: null,
        };
      }

      // For email verification, try to check by attempting resend
      try {
        const formData = encodeFormData({
          user: {
            email: email.trim().toLowerCase(),
          }
        });

        await API.POST({
          URL: "en/user/confirmation",
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          data: formData,
        });
        
        // If resend succeeds, email is not yet verified
        return {
          success: true,
          isVerified: false,
          message: "Email not yet verified",
          email: email.trim().toLowerCase(),
          verificationToken: null,
        };
      } catch (resendError: any) {
        // If resend fails with "already confirmed" error, email is verified
        const errorMsg = resendError.response?.data?.error || 
                        resendError.response?.data?.message || '';
        
        if (errorMsg.toLowerCase().includes('already') || 
            errorMsg.toLowerCase().includes('confirmed') ||
            errorMsg.toLowerCase().includes('verified')) {
          return {
            success: true,
            isVerified: true,
            message: "Email already verified",
            email: email.trim().toLowerCase(),
            verificationToken: null,
          };
        }
        
        throw resendError;
      }
    }
  } catch (error: any) {
    console.error("❌ Check verification status error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    // If 404 or 422, email might not be verified yet
    if (error.response?.status === 404 || error.response?.status === 422) {
      return {
        success: false,
        isVerified: false,
        message: "Email not yet verified",
        email: email.trim().toLowerCase(),
        verificationToken: null,
      };
    }

    let errorMessage = "Failed to check verification status";
    
    if (error.response?.data) {
      const errorData = error.response.data;
      errorMessage = errorData.message || 
                     errorData.error || 
                     errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};