import { 
  RegisterUserRequest, 
  RegisterConsultantRequest, 
  RegisterCorporateRequest,
  UserTypeValue,
  userInfo
} from "../../models/user";
import { NotificationService } from "../../notifications/notificationHandler";
import { API } from "../network/network";
import { saveUserType, saveUserInfo } from "../../utils/storage_utils/storageUtils";

/**
 * Map frontend gender values to backend expected values
 */
const mapGender = (gender: string): string => {
  const genderMap: Record<string, string> = {
    'male': 'male',
    'female': 'female',
    'other': 'other',
    'prefer-not-to-say': 'prefer_not_to_say',
  };
  return genderMap[gender] || gender;
};

/**
 * Convert value to integer if possible, otherwise return original
 */
const toIntegerOrOriginal = (value: string | number | undefined): number | string | null => {
  if (value === undefined || value === null || value === '') return null;
  const numValue = parseInt(String(value), 10);
  return !isNaN(numValue) ? numValue : value;
};

/**
 * Determine role from user data structure
 */
const determineRole = (userData: RegisterUserRequest | RegisterConsultantRequest | RegisterCorporateRequest): UserTypeValue => {
  if ('discipline' in userData && 'languagesSpoken' in userData) {
    return 'consultant';
  } else if ('companyName' in userData && 'industryType' in userData) {
    return 'corporate';
  }
  return 'user';
};

/**
 * Map role name to Spree role ID
 * NOTE: Verify these IDs match your backend database (spree_roles table)
 * Run this SQL to check: SELECT id, name FROM spree_roles;
 */
const ROLE_IDS: Record<string, number> = {
  'user': 1,        // Default customer role
  'consultant': 2,  // Consultant role
  'corporate': 3,   // Corporate role
};

/**
 * Get role ID for a given role name
 */
const getRoleId = (roleName: UserTypeValue): number | undefined => {
  return ROLE_IDS[roleName];
};

/**
 * Unified user registration function
 * Handles User, Consultant, and Corporate registration
 * 
 * IMPORTANT: The role assignment happens in multiple ways:
 * 1. role_ids array in user object
 * 2. role_name in user object
 * 3. Separate role fields outside user object
 * 4. Post-registration role assignment (fallback)
 * 
 * If your backend doesn't support role assignment during registration,
 * the role is stored locally and used for navigation/UI purposes.
 */
export const registerUser = async ({ 
  userData 
}: { 
  userData: RegisterUserRequest | RegisterConsultantRequest | RegisterCorporateRequest 
}) => {
  try {
    // Determine role based on the data structure
    const role = determineRole(userData);
    const roleId = getRoleId(role);
    
    console.log('========================================');
    console.log('📤 REGISTRATION REQUEST');
    console.log('========================================');
    console.log('🔹 Determined role:', role);
    console.log('🔹 Role ID:', roleId);
    console.log('🔹 Email:', userData.email);

    // Build request data matching spree_users schema
    const spreeUserData: Record<string, any> = {
      // Required fields
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
      password_confirmation: userData.confirmPassword,
      first_name: userData.firstName.trim(),
      last_name: userData.lastName.trim(),
      full_name: `${userData.firstName.trim()} ${userData.lastName.trim()}`,
      gender: mapGender(userData.gender),
      terms_of_service: userData.agreeToPrivacy === true,
    };

    // Country ID handling
    const countryId = toIntegerOrOriginal(userData.country);
    if (countryId !== null) {
      spreeUserData.country_id = countryId;
    }

    // Consultant-specific fields
    if (role === 'consultant') {
      const consultantData = userData as RegisterConsultantRequest;
      
      console.log('🔹 Adding Consultant-specific fields...');
      
      if (consultantData.preferredCurrency) {
        spreeUserData.currency = consultantData.preferredCurrency.trim();
      }
      
      // Discipline ID
      const disciplineId = toIntegerOrOriginal(consultantData.discipline);
      if (disciplineId !== null) {
        spreeUserData.discipline_id = disciplineId;
      }
      
      // Languages array
      if (consultantData.languagesSpoken && consultantData.languagesSpoken.length > 0) {
        spreeUserData.spoken_languages = consultantData.languagesSpoken;
      }
      
      // Availability booleans
      spreeUserData.available_b2c = consultantData.availableForIndividual === true;
      spreeUserData.available_b2b = consultantData.availableForEnterprise === true;
      spreeUserData.available_mentorship = consultantData.availableForMembership === true;
    }
    
    // Corporate-specific fields
    if (role === 'corporate') {
      const corporateData = userData as RegisterCorporateRequest;
      
      console.log('🔹 Adding Corporate-specific fields...');
      
      if (corporateData.companyName) {
        spreeUserData.company_name = corporateData.companyName.trim();
      }
      if (corporateData.industryType) {
        spreeUserData.industry_type = corporateData.industryType.trim();
      }
      if (corporateData.companySize) {
        spreeUserData.company_size = corporateData.companySize.trim();
      }
    }

    // =======================================================================
    // ROLE ASSIGNMENT - Multiple approaches for maximum compatibility
    // =======================================================================
    
    const requestData: Record<string, any> = { 
      user: spreeUserData,
    };

    // Method A: role_ids array (most common Spree pattern)
    if (roleId) {
      requestData.user.role_ids = [roleId];
    }

    // Method B: role_name inside user object
    requestData.user.role_name = role;
    requestData.user.user_type = role;
    
    // Method C: Separate fields outside user object (some backends expect this)
    requestData.role = role;
    requestData.role_id = roleId;
    requestData.role_name = role;
    requestData.user_type = role;
    
    console.log('🔹 Request structure:', Object.keys(requestData));
    console.log('🔹 User fields:', Object.keys(requestData.user));
    console.log('========================================');

    const response = await API.POST({
      URL: 'api/v2/storefront/account',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      data: requestData,
    });

    console.log('========================================');
    console.log('✅ REGISTRATION RESPONSE');
    console.log('========================================');

    // Parse response - handle Spree v2 JSON:API format
    const responseData = response.data?.data?.attributes || response.data?.user || response.data?.data || response.data;
    const userId = response.data?.data?.id || responseData?.id || '';

    // Check if role was properly assigned
    const assignedRoles = responseData?.roles || responseData?.role_names || responseData?.spree_roles || [];
    console.log('🔹 Assigned roles from response:', assignedRoles);
    
    // Get access token if returned
    const accessToken = response.data.access_token || response.data.accessToken || response.data.token || '';
    
    // CRITICAL: Save the user type to storage IMMEDIATELY
    // This is essential because the backend may not store/return the role
    await saveUserType(role);
    console.log('💾 User type saved to AsyncStorage:', role);

    // If role wasn't assigned during registration and we have a token, try to assign it
    if (accessToken && role !== 'user' && assignedRoles.length === 0) {
      console.log('⚠️ Role not assigned during registration, attempting separate assignment...');
      const roleAssigned = await assignRoleToUser(accessToken, userId, role, roleId);
      if (!roleAssigned) {
        console.log('⚠️ Backend role assignment failed - using local storage for role');
      }
    }

    await NotificationService.sendImmediateNotification({
      title: "✅ Registration Successful",
      body: `Welcome! Registered as ${role === 'consultant' ? 'Consultant' : role === 'corporate' ? 'Corporate' : 'User'}. Please check your email to verify your account.`,
      data: { type: 'registration_success', userType: role },
      channelId: 'auth-notifications'
    });

    // Build user info object
    const user: userInfo = {
      id: userId,
      uid: userId,
      email: responseData?.email || spreeUserData.email,
      firstName: responseData?.first_name || spreeUserData.first_name,
      lastName: responseData?.last_name || spreeUserData.last_name,
      displayName: responseData?.full_name || spreeUserData.full_name,
      nickname: responseData?.first_name || spreeUserData.first_name,
      phone: responseData?.phone || '',
      phoneNumber: responseData?.phone || '',
      country: responseData?.country_id?.toString() || spreeUserData.country_id?.toString() || '',
      gender: responseData?.gender || userData.gender,
      userType: role, // Use our determined role (not from response)
      emailVerified: responseData?.confirmed_at != null,
      isVerified: responseData?.account_verified || false,
      createdAt: responseData?.created_at || new Date().toISOString(),
      updatedAt: responseData?.updated_at || new Date().toISOString(),
    };

    // Add consultant-specific fields
    if (role === 'consultant') {
      user.preferredCurrency = responseData?.currency || spreeUserData.currency;
      user.discipline = responseData?.discipline_id?.toString() || spreeUserData.discipline_id?.toString();
      user.languagesSpoken = responseData?.spoken_languages || spreeUserData.spoken_languages;
      user.availableForIndividual = responseData?.available_b2c ?? spreeUserData.available_b2c;
      user.availableForEnterprise = responseData?.available_b2b ?? spreeUserData.available_b2b;
      user.availableForMembership = responseData?.available_mentorship ?? spreeUserData.available_mentorship;
    }

    // Add corporate-specific fields
    if (role === 'corporate') {
      user.companyName = responseData?.company_name || spreeUserData.company_name;
      user.industryType = responseData?.industry_type || spreeUserData.industry_type;
      user.companySize = responseData?.company_size || spreeUserData.company_size;
    }

    // Also save user info to storage
    await saveUserInfo(user);
    console.log('💾 User info saved to AsyncStorage');
    
    console.log('========================================');
    console.log('✅ REGISTRATION COMPLETE');
    console.log('🔹 User ID:', userId);
    console.log('🔹 User Type:', role);
    console.log('🔹 Has Access Token:', !!accessToken);
    console.log('========================================');

    return {
      accessToken: accessToken,
      refreshToken: response.data.refresh_token || response.data.refreshToken || '',
      user: user,
    };
  } catch (e: any) {
    console.error("========================================");
    console.error("❌ REGISTRATION ERROR");
    console.error("========================================");
    console.error("Message:", e.message);
    console.error("Status:", e.response?.status);
    console.error("Data:", JSON.stringify(e.response?.data, null, 2));
    console.error("========================================");
    
    // Parse error message from Spree response
    let errorMessage = "Registration failed. Please try again.";
    let detailedErrors: Record<string, string[]> = {};
    
    if (e.response?.data) {
      const errorData = e.response.data;
      
      // Extract detailed field errors
      if (errorData.errors && typeof errorData.errors === 'object' && !Array.isArray(errorData.errors)) {
        detailedErrors = errorData.errors;
      }
      
      // Check for main error message
      if (errorData.error && typeof errorData.error === 'string') {
        if (errorData.error !== 'Unprocessable Content' && 
            errorData.error !== 'Unprocessable Entity') {
          errorMessage = errorData.error;
        }
      }
      
      // Format field-level errors
      if (errorData.errors) {
        if (Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.join('. ');
        } else if (typeof errorData.errors === 'object') {
          const errorMessages: string[] = [];
          for (const field in errorData.errors) {
            const fieldErrors = errorData.errors[field];
            if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
              const fieldName = field
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase());
              errorMessages.push(`${fieldName}: ${fieldErrors.join(', ')}`);
            }
          }
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join('\n');
          }
        }
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    }
    
    // Handle specific HTTP status codes
    if (e.response?.status === 409) {
      errorMessage = "This account already exists. Please sign in instead.";
    } else if (e.response?.status === 500) {
      errorMessage = "Server error. Please try again later.";
    } else if (e.response?.status === 404) {
      errorMessage = "Registration service unavailable. Please try again later.";
    }
    
    await NotificationService.sendImmediateNotification({
      title: "❌ Registration Failed",
      body: errorMessage.replace(/\n/g, '. ').substring(0, 100),
      data: { type: 'registration_error', errors: detailedErrors },
      channelId: 'auth-notifications'
    });
    
    throw new Error(errorMessage);
  }
};

/**
 * Assign role to user after registration
 * This is a fallback if role wasn't assigned during registration
 * 
 * NOTE: This requires backend support for role assignment endpoints
 * If your backend doesn't support this, the role is stored locally
 */
const assignRoleToUser = async (
  accessToken: string, 
  userId: string, 
  roleName: UserTypeValue,
  roleId?: number
): Promise<boolean> => {
  console.log('========================================');
  console.log('🔄 ATTEMPTING ROLE ASSIGNMENT');
  console.log('========================================');
  console.log('🔹 User ID:', userId);
  console.log('🔹 Role:', roleName);
  console.log('🔹 Role ID:', roleId);

  // Try Method 1: Update user account with role
  try {
    console.log('🔹 Method 1: PATCH /api/v2/storefront/account');
    const updateResponse = await API.PATCH({
      URL: 'api/v2/storefront/account',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      data: {
        user: {
          role_ids: roleId ? [roleId] : undefined,
          role_name: roleName,
          user_type: roleName,
        },
        role: roleName,
        role_id: roleId,
      },
    });
    
    console.log('✅ Method 1 succeeded');
    return true;
  } catch (updateError: any) {
    console.log('⚠️ Method 1 failed:', updateError.response?.status || updateError.message);
  }

  // Try Method 2: Custom role assignment endpoint
  try {
    console.log('🔹 Method 2: POST /user/assign_role');
    const roleResponse = await API.POST({
      URL: 'user/assign_role',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      data: {
        role: roleName,
        role_id: roleId,
        user_id: userId,
      },
    });
    
    console.log('✅ Method 2 succeeded');
    return true;
  } catch (roleError: any) {
    console.log('⚠️ Method 2 failed:', roleError.response?.status || roleError.message);
  }

  // Try Method 3: Spree roles endpoint
  try {
    console.log('🔹 Method 3: POST /api/v2/storefront/account/roles');
    const spreeRoleResponse = await API.POST({
      URL: 'api/v2/storefront/account/roles',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      data: {
        role_id: roleId,
        role_name: roleName,
      },
    });
    
    console.log('✅ Method 3 succeeded');
    return true;
  } catch (spreeError: any) {
    console.log('⚠️ Method 3 failed:', spreeError.response?.status || spreeError.message);
  }

  console.log('========================================');
  console.log('⚠️ ALL ROLE ASSIGNMENT METHODS FAILED');
  console.log('📝 Role stored locally for app navigation');
  console.log('========================================');
  return false;
};

// Export legacy function names for backward compatibility
export const registerAsUser = registerUser;
export const registerAsConsultant = registerUser;
export const registerAsCorporate = registerUser;