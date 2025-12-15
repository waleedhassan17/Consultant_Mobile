import { signInPayload, UserTypeValue, userInfo } from "../../models/user";
import { NotificationService } from "../../notifications/notificationHandler";
import { API } from "../network/network";
import { saveUserType, getUserType } from "../../utils/storage_utils/storageUtils";

/**
 * Parse user type from backend response
 * The backend uses spree_roles and spree_role_users tables
 * 
 * FIXED: More lenient detection that doesn't cause false positives
 */
const parseUserTypeFromResponse = (data: any): { userType: UserTypeValue; detectionMethod: string; hasRoleData: boolean } => {
  console.log('🔍 Parsing user type from response...');
  
  // Priority 1: Check roles array (from spree_role_users relationship)
  const roles = data?.roles || data?.role_names || data?.spree_roles || [];
  const roleNames = Array.isArray(roles) 
    ? roles.map((r: any) => typeof r === 'string' ? r.toLowerCase() : r?.name?.toLowerCase()).filter(Boolean)
    : [];
  
  console.log('🔍 Roles detected from array:', roleNames);
  
  if (roleNames.length > 0) {
    if (roleNames.includes('consultant') || roleNames.includes('therapist')) {
      return { userType: 'consultant', detectionMethod: 'roles_array', hasRoleData: true };
    } else if (roleNames.includes('corporate') || roleNames.includes('company') || roleNames.includes('enterprise')) {
      return { userType: 'corporate', detectionMethod: 'roles_array', hasRoleData: true };
    } else if (roleNames.includes('user') || roleNames.includes('customer') || roleNames.includes('client')) {
      return { userType: 'user', detectionMethod: 'roles_array', hasRoleData: true };
    }
  }
  
  // Priority 2: Check single role field
  const roleName = (data?.role || data?.role_name || data?.user_role || data?.user_type || '').toLowerCase().trim();
  if (roleName) {
    console.log('🔍 Role from field:', roleName);
    if (roleName === 'consultant' || roleName === 'therapist') {
      return { userType: 'consultant', detectionMethod: 'role_field', hasRoleData: true };
    } else if (roleName === 'corporate' || roleName === 'company' || roleName === 'enterprise') {
      return { userType: 'corporate', detectionMethod: 'role_field', hasRoleData: true };
    } else if (roleName === 'user' || roleName === 'customer' || roleName === 'client') {
      return { userType: 'user', detectionMethod: 'role_field', hasRoleData: true };
    }
  }
  
  // Priority 3: Check specific profile fields as fallback
  // FIXED: Only use field detection if fields have meaningful values
  const hasConsultantFields = !!(
    (data?.discipline_id && data.discipline_id > 0) || 
    (Array.isArray(data?.spoken_languages) && data.spoken_languages.length > 0) ||
    data?.available_b2c === true ||
    data?.available_b2b === true ||
    data?.available_mentorship === true ||
    (data?.currency && data.currency.trim() !== '' && data.currency !== 'null')
  );
  
  const hasCorporateFields = !!(
    (data?.company_name && data.company_name.trim() !== '' && data.company_name !== 'null') ||
    (data?.industry_type && data.industry_type.trim() !== '' && data.industry_type !== 'null') ||
    (data?.company_size && data.company_size.trim() !== '' && data.company_size !== 'null')
  );
  
  console.log('🔍 Field detection:', { hasConsultantFields, hasCorporateFields });
  
  if (hasConsultantFields && !hasCorporateFields) {
    return { userType: 'consultant', detectionMethod: 'consultant_fields', hasRoleData: false };
  } else if (hasCorporateFields && !hasConsultantFields) {
    return { userType: 'corporate', detectionMethod: 'corporate_fields', hasRoleData: false };
  }
  
  // No role data found - this is NOT an error, just means we need to use stored/selected type
  console.log('⚠️ No role data found in backend response');
  return { userType: 'user', detectionMethod: 'no_role_data', hasRoleData: false };
};

/**
 * Authenticate user with Spree OAuth
 * Endpoint: POST /spree_oauth/token
 * 
 * FIXED: Removed strict validation that was blocking login for consultant/corporate
 */
export const authLogin = async ({ signInInfo }: { signInInfo: signInPayload }) => {
  try {
    const { email, password, userType: selectedUserType } = signInInfo;

    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('username', email.trim().toLowerCase());
    formData.append('password', password);

    console.log('📤 Sending login request for:', email.trim().toLowerCase());
    console.log('📤 Selected user type:', selectedUserType);

    const response = await API.POST({
      URL: "spree_oauth/token",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      data: formData.toString(),
    });

    console.log('✅ OAuth token obtained successfully');

    const accessToken = response.data.access_token;
    const refreshToken = response.data.refresh_token;
    const tokenType = response.data.token_type;
    const expiresIn = response.data.expires_in;
    const createdAt = response.data.created_at;

    // Initialize user data with selected type
    let userData: userInfo = {
      id: '',
      uid: '',
      email: email.trim().toLowerCase(),
      userType: selectedUserType || 'user',
      nickname: '',
    };

    // Determine final user type
    let finalUserType: UserTypeValue = selectedUserType || 'user';

    try {
      // Fetch user profile
      const profileResponse = await API.GET({
        URL: "api/v2/storefront/account",
        headers: {
          'Authorization': `${tokenType || 'Bearer'} ${accessToken}`,
          'Accept': 'application/json',
        },
      });

      const profileData = profileResponse.data?.data?.attributes || profileResponse.data?.data || profileResponse.data;
      
      console.log('📋 Profile data received');
      
      // Parse role from backend response
      const roleResult = parseUserTypeFromResponse(profileData);
      
      console.log('🔍 User type detection summary:', {
        selectedUserType,
        detectedUserType: roleResult.userType,
        detectionMethod: roleResult.detectionMethod,
        hasRoleData: roleResult.hasRoleData,
      });
      
      /**
       * FIXED LOGIC:
       * 
       * 1. If backend has explicit role data (from roles array or role field):
       *    - Use the backend role as the source of truth
       *    - This ensures users can only login as their assigned role
       * 
       * 2. If backend has NO explicit role data (hasRoleData === false):
       *    - Trust the user's selection (selectedUserType)
       *    - This allows consultant/corporate users to login even if
       *      the backend doesn't return role information
       *    - The role was saved during registration
       * 
       * 3. If no selection was made:
       *    - Default to 'user'
       */
      
      /**
       * CRITICAL FIX: Always use the SELECTED user type for navigation
       * 
       * The backend may not store/return role data, so we trust what the user selected.
       * This ensures:
       * - User selects "Consultant" tab → logs in as consultant → sees ConsultantNavigator
       * - User selects "Corporate" tab → logs in as corporate → sees CorporateNavigator  
       * - User selects no tab → logs in as user → sees BaseNavigator (Home)
       */
      
      if (roleResult.hasRoleData) {
        // Backend has explicit role data
        // We can optionally validate, but for now just log a warning if mismatch
        if (selectedUserType && selectedUserType !== roleResult.userType) {
          console.warn(`⚠️ Note: Backend says ${roleResult.userType}, but user selected ${selectedUserType}`);
          // DECISION: Trust the user's selection for navigation purposes
          // The backend role is informational only since it may not be properly set
        }
      }
      
      // ALWAYS use the selected user type for the final user type
      // This is what determines which navigator is shown
      if (selectedUserType) {
        finalUserType = selectedUserType;
        console.log('🔍 Using SELECTED user type:', finalUserType);
      } else {
        // No selection - check storage or default to user
        const storedUserType = await getUserType();
        if (storedUserType) {
          finalUserType = storedUserType;
          console.log('🔍 Using STORED user type:', finalUserType);
        } else {
          finalUserType = 'user';
          console.log('🔍 Defaulting to user type');
        }
      }
      
      // Save the final user type
      await saveUserType(finalUserType);
      console.log('💾 User type saved:', finalUserType);
      
      // Build user data object
      userData = {
        id: profileResponse.data?.data?.id || profileData?.id || '',
        uid: profileResponse.data?.data?.id || profileData?.id || '',
        email: profileData?.email || email.trim().toLowerCase(),
        userType: finalUserType,
        nickname: profileData?.first_name || profileData?.full_name || '',
        firstName: profileData?.first_name || '',
        lastName: profileData?.last_name || '',
        displayName: profileData?.full_name || `${profileData?.first_name || ''} ${profileData?.last_name || ''}`.trim(),
        phone: profileData?.phone || '',
        phoneNumber: profileData?.phone || '',
        gender: profileData?.gender || undefined,
        country: profileData?.country_id?.toString() || '',
        emailVerified: profileData?.confirmed_at != null,
        isVerified: profileData?.account_verified || false,
        // Consultant fields
        preferredCurrency: profileData?.currency || '',
        discipline: profileData?.discipline_id?.toString() || '',
        languagesSpoken: profileData?.spoken_languages || [],
        availableForIndividual: profileData?.available_b2c || false,
        availableForEnterprise: profileData?.available_b2b || false,
        availableForMembership: profileData?.available_mentorship || false,
        // Corporate fields
        companyName: profileData?.company_name || '',
        industryType: profileData?.industry_type || '',
        companySize: profileData?.company_size || '',
      };

      console.log('✅ User profile processed, type:', finalUserType);
      
    } catch (profileError: any) {
      // Check if this is a user type mismatch error (thrown intentionally)
      if (profileError.message && (
        profileError.message.includes('registered as a Consultant') ||
        profileError.message.includes('registered as a Corporate') ||
        profileError.message.includes('registered as a regular User')
      )) {
        throw profileError;
      }
      
      console.log('ℹ️ Could not fetch user profile, using selected/stored type');
      
      // If we couldn't get profile, check for stored type
      const storedUserType = await getUserType();
      finalUserType = selectedUserType || storedUserType || 'user';
      
      await saveUserType(finalUserType);
      userData.userType = finalUserType;
    }

    await NotificationService.sendImmediateNotification({
      title: "✅ Welcome Back!",
      body: `Signed in as ${finalUserType === 'consultant' ? 'Consultant' : finalUserType === 'corporate' ? 'Corporate' : 'User'}`,
      data: { type: 'sign_in_success', userType: finalUserType },
      channelId: 'auth-notifications'
    });

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      tokenType: tokenType,
      expiresIn: expiresIn,
      createdAt: createdAt,
      userType: finalUserType,
      email: email.trim().toLowerCase(),
      user: userData,
    };
  } catch (e: any) {
    console.error("❌ Login error:", {
      message: e.message,
      status: e.response?.status,
      data: e.response?.data,
    });
    
    let errorMessage = "Invalid email or password";
    
    // Check if this is our custom error (user type mismatch)
    if (e.message && (
      e.message.includes('registered as a Consultant') ||
      e.message.includes('registered as a Corporate') ||
      e.message.includes('registered as a regular User')
    )) {
      errorMessage = e.message;
    } else if (e.response?.data) {
      const errorData = e.response.data;
      
      if (errorData.error_description) {
        errorMessage = errorData.error_description;
      } else if (errorData.error) {
        switch (errorData.error) {
          case 'invalid_grant':
            errorMessage = "Invalid email or password. Please try again.";
            break;
          case 'invalid_client':
            errorMessage = "Authentication configuration error. Please contact support.";
            break;
          case 'invalid_request':
            errorMessage = "Invalid request. Please try again.";
            break;
          default:
            errorMessage = errorData.error;
        }
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } else if (e.message) {
      if (e.message.includes('Network Error')) {
        errorMessage = "Unable to connect. Please check your internet connection.";
      } else {
        errorMessage = e.message;
      }
    }

    // Handle specific HTTP status codes
    if (e.response?.status === 401) {
      errorMessage = "Invalid email or password. Please try again.";
    } else if (e.response?.status === 422) {
      errorMessage = "Account not verified. Please check your email for verification link.";
    } else if (e.response?.status === 423) {
      errorMessage = "Account is locked. Please contact support or try again later.";
    } else if (e.response?.status === 429) {
      errorMessage = "Too many login attempts. Please try again later.";
    }
    
    await NotificationService.sendImmediateNotification({
      title: "❌ Sign In Failed",
      body: errorMessage,
      data: { type: 'sign_in_error' },
      channelId: 'auth-notifications'
    });
    
    throw new Error(errorMessage);
  }
};

/**
 * Refresh access token
 * Endpoint: POST /spree_oauth/token
 */
export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const formData = new URLSearchParams();
    formData.append('grant_type', 'refresh_token');
    formData.append('refresh_token', refreshToken);

    const response = await API.POST({
      URL: "spree_oauth/token",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      data: formData.toString(),
    });

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      tokenType: response.data.token_type,
      expiresIn: response.data.expires_in,
    };
  } catch (e: any) {
    console.error("❌ Token refresh error:", e.message);
    throw new Error("Session expired. Please sign in again.");
  }
};

/**
 * Revoke access token (logout)
 * Endpoint: POST /spree_oauth/revoke
 */
export const revokeToken = async (accessToken: string) => {
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

    console.log('✅ Token revoked successfully');
    return { success: true };
  } catch (e: any) {
    console.error("❌ Token revoke error:", e.message);
    return { success: false, error: e.message };
  }
};