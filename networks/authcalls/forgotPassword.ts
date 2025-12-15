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
 * Uses spree_user wrapper as required by Spree/Devise
 */
const encodeSpreeFormData = (data: Record<string, any>): string => {
  const params = new URLSearchParams();
  
  const flatten = (obj: Record<string, any>, prefix = '') => {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        const fullKey = prefix ? `${prefix}[${key}]` : key;
        
        if (value === null || value === undefined) {
          continue;
        } else if (typeof value === 'object' && !Array.isArray(value)) {
          flatten(value, fullKey);
        } else if (typeof value === 'boolean') {
          params.append(fullKey, value ? '1' : '0');
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
 * Backend Endpoint: POST /user/password
 * 
 * Spree/Devise expects:
 * - Content-Type: application/x-www-form-urlencoded
 * - Data wrapped in spree_user[email]=...
 */
export const forgotPasswordAPI = async ({ email }: ForgotPasswordParams) => {
  try {
    console.log("📤 Sending forgot password request for:", email);

    // Spree/Devise expects spree_user wrapper
    const formData = encodeSpreeFormData({
      spree_user: {
        email: email.trim().toLowerCase(),
      }
    });

    console.log("📋 Encoded form data:", formData);

    const response = await API.POST({
      URL: "user/password",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
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
    
    // Extract error message from different possible Spree response formats
    if (error.response?.data) {
      const errorData = error.response.data;
      
      if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.errors) {
        if (Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.join(', ');
        } else if (typeof errorData.errors === 'object') {
          // Spree returns errors like { email: ["not found"] }
          const errorMessages: string[] = [];
          for (const field in errorData.errors) {
            const fieldErrors = errorData.errors[field];
            if (Array.isArray(fieldErrors)) {
              errorMessages.push(`${field}: ${fieldErrors.join(', ')}`);
            }
          }
          errorMessage = errorMessages.join('; ') || errorMessage;
        }
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error_description) {
        errorMessage = errorData.error_description;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Check for specific error cases
    if (error.response?.status === 404) {
      errorMessage = "Email address not found. Please check and try again.";
    } else if (error.response?.status === 422) {
      // 422 from Spree usually means validation errors
      if (errorMessage === "Failed to send reset email") {
        errorMessage = "Email not found or invalid. Please verify your email address.";
      }
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
 * Backend Endpoint: PUT /user/password
 * 
 * Spree/Devise expects:
 * - Content-Type: application/x-www-form-urlencoded  
 * - Data: spree_user[reset_password_token]=...&spree_user[password]=...&spree_user[password_confirmation]=...
 */
export const resetPasswordAPI = async ({ 
  email, 
  verificationToken, 
  newPassword 
}: ResetPasswordParams) => {
  try {
    console.log("📤 Sending reset password request for:", email);

    // Spree/Devise expects spree_user wrapper with specific field names
    const formData = encodeSpreeFormData({
      spree_user: {
        reset_password_token: verificationToken,
        password: newPassword,
        password_confirmation: newPassword,
      }
    });

    console.log("📋 Encoded form data (password hidden)");

    const response = await API.PUT({
      URL: "user/password",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
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
      
      if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.errors) {
        if (Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.join(', ');
        } else if (typeof errorData.errors === 'object') {
          const errorMessages: string[] = [];
          for (const field in errorData.errors) {
            const fieldErrors = errorData.errors[field];
            if (Array.isArray(fieldErrors)) {
              // Make error messages more user-friendly
              const friendlyField = field === 'reset_password_token' ? 'Reset token' : field;
              errorMessages.push(`${friendlyField}: ${fieldErrors.join(', ')}`);
            }
          }
          errorMessage = errorMessages.join('; ') || errorMessage;
        }
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Check for specific error cases
    if (error.response?.status === 422) {
      // Usually means invalid or expired token
      if (errorMessage.toLowerCase().includes('token') || errorMessage === "Failed to reset password") {
        errorMessage = "Invalid or expired reset token. Please request a new password reset.";
      }
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
 * Backend Endpoint for email verification: POST /user/confirmation
 * Backend Endpoint for password reset: POST /user/password
 */
export const resendVerificationEmailAPI = async ({ 
  email, 
  type,
  userType 
}: ResendVerificationParams) => {
  try {
    console.log("📤 Resending verification email:", { email, type, userType });

    let response;
    
    // Spree/Devise expects spree_user wrapper
    const formData = encodeSpreeFormData({
      spree_user: {
        email: email.trim().toLowerCase(),
      }
    });

    if (type === "password_reset") {
      // For password reset, use the password endpoint
      response = await API.POST({
        URL: "user/password",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        data: formData,
      });
    } else {
      // For email verification, use the confirmation endpoint
      response = await API.POST({
        URL: "user/confirmation",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
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
      
      if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.errors) {
        if (Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.join(', ');
        } else if (typeof errorData.errors === 'object') {
          const errorMessages: string[] = [];
          for (const field in errorData.errors) {
            const fieldErrors = errorData.errors[field];
            if (Array.isArray(fieldErrors)) {
              errorMessages.push(`${field}: ${fieldErrors.join(', ')}`);
            }
          }
          errorMessage = errorMessages.join('; ') || errorMessage;
        }
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Check for specific error cases
    if (error.response?.status === 422) {
      // Check if already confirmed
      if (errorMessage.toLowerCase().includes('already') || 
          errorMessage.toLowerCase().includes('confirmed')) {
        errorMessage = "Email is already verified. Please try signing in.";
      } else {
        errorMessage = "Unable to send verification email. Please check your email address.";
      }
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
 * Note: Spree doesn't have a dedicated endpoint for this, so we try alternative approaches
 */
export const checkVerificationStatusAPI = async ({ 
  email, 
  type,
  userType 
}: CheckVerificationParams) => {
  try {
    console.log("📤 Checking verification status:", { email, type, userType });

    // First, try to check verification status via a dedicated endpoint if available
    try {
      const response = await API.GET({
        URL: "api/v2/storefront/account",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log("✅ Account status response:", response.data);

      const userData = response.data?.data || response.data;
      const isVerified = userData?.attributes?.confirmed_at != null || 
                         userData?.confirmed_at != null ||
                         userData?.account_verified === true;

      return {
        success: true,
        isVerified: isVerified,
        message: isVerified ? "Email verified successfully" : "Email not yet verified",
        email: email.trim().toLowerCase(),
        verificationToken: null,
      };
    } catch (primaryError: any) {
      console.log("ℹ️ Primary verification check failed, trying alternative...");
      
      // For password reset flow, we can't really check status without token
      if (type === "password_reset") {
        return {
          success: true,
          isVerified: false,
          message: "Please check your email and click the reset link",
          email: email.trim().toLowerCase(),
          verificationToken: null,
        };
      }

      // For email verification, try to resend and check the response
      try {
        const formData = encodeSpreeFormData({
          spree_user: {
            email: email.trim().toLowerCase(),
          }
        });

        await API.POST({
          URL: "user/confirmation",
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
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
        const errorResponse = resendError.response?.data;
        let errorMsg = '';
        
        if (errorResponse?.error) {
          errorMsg = errorResponse.error;
        } else if (errorResponse?.errors?.email) {
          errorMsg = Array.isArray(errorResponse.errors.email) 
            ? errorResponse.errors.email.join(' ') 
            : errorResponse.errors.email;
        } else if (errorResponse?.message) {
          errorMsg = errorResponse.message;
        }
        
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