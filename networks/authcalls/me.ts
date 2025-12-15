import { API } from "../network/network";
import {
  retriveData,
  KeyForStorage,
  getUserType,
  saveUserType,
} from "../../utils/storage_utils/storageUtils";
import { UserTypeValue, userInfo } from "../../models/user";

/**
 * Parse user type from backend response
 * The backend uses spree_roles and spree_role_users tables
 * Roles are returned as an array or nested relationship
 * 
 * FIXED: Added hasRoleData flag and improved detection logic
 */
const parseUserTypeFromResponse = (data: any): { userType: UserTypeValue; source: string; hasRoleData: boolean } => {
  console.log('🔍 ME API - Parsing user type...');
  
  // Priority 1: Check roles array (from spree_role_users relationship)
  // This is the most reliable method if backend includes it
  const possibleRoleSources = [
    data?.roles,           // Direct roles array
    data?.role_names,      // Role names array
    data?.spree_roles,     // Spree roles array
    data?.attributes?.roles,  // Nested in attributes
    data?.relationships?.roles?.data, // JSON:API relationships
  ];
  
  for (const rolesSource of possibleRoleSources) {
    if (Array.isArray(rolesSource) && rolesSource.length > 0) {
      const roleNames = rolesSource.map((r: any) => {
        if (typeof r === 'string') return r.toLowerCase();
        if (r?.name) return r.name.toLowerCase();
        if (r?.attributes?.name) return r.attributes.name.toLowerCase();
        return null;
      }).filter(Boolean);
      
      console.log('🔍 ME API - Roles from array:', roleNames);
      
      if (roleNames.includes('consultant') || roleNames.includes('therapist')) {
        return { userType: 'consultant', source: 'roles_array', hasRoleData: true };
      } else if (roleNames.includes('corporate') || roleNames.includes('company') || roleNames.includes('enterprise')) {
        return { userType: 'corporate', source: 'roles_array', hasRoleData: true };
      } else if (roleNames.includes('user') || roleNames.includes('customer') || roleNames.includes('client')) {
        return { userType: 'user', source: 'roles_array', hasRoleData: true };
      }
    }
  }
  
  // Priority 2: Check single role field
  const possibleRoleFields = [
    data?.role,
    data?.role_name,
    data?.user_role,
    data?.user_type,
    data?.attributes?.role,
    data?.attributes?.role_name,
    data?.attributes?.user_type,
  ];
  
  for (const roleField of possibleRoleFields) {
    if (typeof roleField === 'string' && roleField.trim() !== '') {
      const roleName = roleField.toLowerCase().trim();
      console.log('🔍 ME API - Role from field:', roleName);
      
      if (roleName === 'consultant' || roleName === 'therapist') {
        return { userType: 'consultant', source: 'role_field', hasRoleData: true };
      } else if (roleName === 'corporate' || roleName === 'company' || roleName === 'enterprise') {
        return { userType: 'corporate', source: 'role_field', hasRoleData: true };
      } else if (roleName === 'user' || roleName === 'customer' || roleName === 'client') {
        return { userType: 'user', source: 'role_field', hasRoleData: true };
      }
    }
  }
  
  // Priority 3: Check role_ids (if backend returns numeric IDs)
  const roleIds = data?.role_ids || data?.attributes?.role_ids || [];
  if (Array.isArray(roleIds) && roleIds.length > 0) {
    console.log('🔍 ME API - Role IDs:', roleIds);
    // Map role IDs - adjust based on your backend's role IDs
    const ROLE_ID_MAP: Record<number, UserTypeValue> = {
      1: 'user',
      2: 'consultant',
      3: 'corporate',
    };
    
    for (const roleId of roleIds) {
      const mappedRole = ROLE_ID_MAP[roleId];
      if (mappedRole) {
        return { userType: mappedRole, source: 'role_ids', hasRoleData: true };
      }
    }
  }
  
  // Priority 4: Check specific profile fields as fallback (least reliable)
  // FIXED: Only detect if fields have meaningful non-empty values
  const hasConsultantFields = !!(
    (data?.discipline_id && data.discipline_id > 0) || 
    (Array.isArray(data?.spoken_languages) && data.spoken_languages.length > 0) ||
    data?.available_b2c === true ||
    data?.available_b2b === true ||
    data?.available_mentorship === true
  );
  
  // FIXED: More strict check for corporate fields
  const hasCorporateFields = !!(
    (data?.company_name && typeof data.company_name === 'string' && data.company_name.trim() !== '' && data.company_name.toLowerCase() !== 'null') ||
    (data?.industry_type && typeof data.industry_type === 'string' && data.industry_type.trim() !== '' && data.industry_type.toLowerCase() !== 'null') ||
    (data?.company_size && typeof data.company_size === 'string' && data.company_size.trim() !== '' && data.company_size.toLowerCase() !== 'null')
  );
  
  console.log('🔍 ME API - Field detection:', { hasConsultantFields, hasCorporateFields });
  
  if (hasConsultantFields && !hasCorporateFields) {
    return { userType: 'consultant', source: 'consultant_fields', hasRoleData: false };
  } else if (hasCorporateFields && !hasConsultantFields) {
    return { userType: 'corporate', source: 'corporate_fields', hasRoleData: false };
  } else if (hasConsultantFields && hasCorporateFields) {
    // Both fields present - ambiguous, return user and let storage decide
    console.log('⚠️ ME API - Both consultant and corporate fields detected, checking storage');
    return { userType: 'user', source: 'ambiguous_fields', hasRoleData: false };
  }
  
  // No role data found - not an error, we'll use stored type
  console.log('⚠️ ME API - No role data found in response');
  return { userType: 'user', source: 'no_role_data', hasRoleData: false };
};

export const me = async (): Promise<userInfo> => {
  try {
    const token = await retriveData(KeyForStorage.accessToken);

    if (!token) {
      throw new Error("No access token found");
    }

    // Try the Spree Storefront API first (more reliable for role data)
    let response;
    let userData: any;
    
    try {
      response = await API.GET({
        URL: "api/v2/storefront/account",
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      
      console.log('📋 ME API - Response received');
      
      // Parse Spree v2 JSON:API format
      userData = response.data?.data?.attributes || response.data?.data || response.data;
      const userId = response.data?.data?.id || userData?.id || '';
      
      // Also check for included roles in JSON:API format
      const includedRoles = response.data?.included?.filter((item: any) => item.type === 'role') || [];
      if (includedRoles.length > 0) {
        userData.roles = includedRoles.map((r: any) => r.attributes?.name || r.name);
        console.log('📋 ME API - Found included roles:', userData.roles);
      }
      
      // Get userType from response
      const { userType: detectedType, source, hasRoleData } = parseUserTypeFromResponse(userData);
      
      console.log('🔍 ME API - Detection result:', { detectedType, source, hasRoleData });
      
      // FIXED: Determine final user type with proper priority
      let finalUserType: UserTypeValue = detectedType;
      
      if (hasRoleData) {
        // Backend has explicit role data - use it and save it
        finalUserType = detectedType;
        await saveUserType(finalUserType);
        console.log('🔍 ME API - Using backend role:', finalUserType);
      } else {
        // No explicit role data from backend - check stored type
        const storedUserType = await getUserType();
        
        if (storedUserType) {
          // We have a stored type (from registration or previous login)
          finalUserType = storedUserType;
          console.log('🔍 ME API - Using stored userType:', storedUserType);
        } else {
          // No stored type either - use detected (field-based) or default
          finalUserType = detectedType;
          // Save it for future reference
          await saveUserType(finalUserType);
          console.log('🔍 ME API - Using detected/default userType:', finalUserType);
        }
      }
      
      console.log('🔍 ME API - Final userType:', finalUserType);
      
      return {
        id: userId,
        uid: userId,
        email: userData?.email || '',
        userType: finalUserType,
        nickname: userData?.first_name || userData?.full_name || '',
        firstName: userData?.first_name || '',
        lastName: userData?.last_name || '',
        displayName: userData?.full_name || `${userData?.first_name || ''} ${userData?.last_name || ''}`.trim(),
        phone: userData?.phone || '',
        phoneNumber: userData?.phone || '',
        gender: userData?.gender || undefined,
        country: userData?.country_id?.toString() || '',
        emailVerified: userData?.confirmed_at != null,
        isVerified: userData?.account_verified || false,
        // Consultant fields
        preferredCurrency: userData?.currency || '',
        discipline: userData?.discipline_id?.toString() || '',
        languagesSpoken: userData?.spoken_languages || [],
        availableForIndividual: userData?.available_b2c || false,
        availableForEnterprise: userData?.available_b2b || false,
        availableForMembership: userData?.available_mentorship || false,
        // Corporate fields
        companyName: userData?.company_name || '',
        industryType: userData?.industry_type || '',
        companySize: userData?.company_size || '',
        // Timestamps
        createdAt: userData?.created_at || '',
        updatedAt: userData?.updated_at || '',
      };
      
    } catch (storefrontError: any) {
      console.log('ℹ️ Storefront API failed, trying /users/me endpoint');
      console.log('Error:', storefrontError.message);
      
      // Fallback to /users/me endpoint
      response = await API.GET({
        URL: "users/me",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('📋 ME API (users/me) - Response received');
      
      userData = response.data?.data?.attributes || response.data?.data || response.data;
      
      // Get userType from response or fallback to stored value
      const { userType: detectedType, source, hasRoleData } = parseUserTypeFromResponse(userData);
      
      // FIXED: Same logic as above
      let finalUserType: UserTypeValue = detectedType;
      
      if (!hasRoleData) {
        const storedUserType = await getUserType();
        if (storedUserType) {
          finalUserType = storedUserType;
          console.log('🔍 ME API (users/me) - Using stored userType:', storedUserType);
        }
      } else {
        await saveUserType(finalUserType);
      }
      
      console.log('🔍 ME API (users/me) - Final userType:', finalUserType);
      
      return {
        id: userData?.id || '',
        uid: userData?.id || '',
        email: userData?.email || '',
        userType: finalUserType,
        nickname: userData?.first_name || userData?.nickname || userData?.full_name || '',
        firstName: userData?.first_name || '',
        lastName: userData?.last_name || '',
        displayName: userData?.full_name || userData?.display_name || `${userData?.first_name || ''} ${userData?.last_name || ''}`.trim(),
        phone: userData?.phone || '',
        phoneNumber: userData?.phone || '',
        gender: userData?.gender || undefined,
        country: userData?.country_id?.toString() || userData?.country || '',
        emailVerified: userData?.confirmed_at != null || userData?.email_verified || false,
        isVerified: userData?.account_verified || userData?.is_verified || false,
        // Consultant fields
        preferredCurrency: userData?.currency || userData?.preferred_currency || '',
        discipline: userData?.discipline_id?.toString() || userData?.discipline || '',
        languagesSpoken: userData?.spoken_languages || userData?.languages_spoken || [],
        availableForIndividual: userData?.available_b2c || userData?.available_for_individual || false,
        availableForEnterprise: userData?.available_b2b || userData?.available_for_enterprise || false,
        availableForMembership: userData?.available_mentorship || userData?.available_for_membership || false,
        // Corporate fields
        companyName: userData?.company_name || '',
        industryType: userData?.industry_type || '',
        companySize: userData?.company_size || '',
        // Timestamps
        createdAt: userData?.created_at || '',
        updatedAt: userData?.updated_at || '',
      };
    }
  } catch (e: any) {
    console.error("❌ ME API Error:", {
      message: e.message,
      status: e.response?.status,
      data: e.response?.data,
    });
    throw e;
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
    throw e;
  }
};

/**
 * Fetch roles for current user
 * Call this separately if roles aren't included in the main account response
 */
export const fetchUserRoles = async (): Promise<string[]> => {
  try {
    const token = await retriveData(KeyForStorage.accessToken);
    if (!token) {
      throw new Error("No access token found");
    }

    // Try to fetch roles from a dedicated endpoint
    const response = await API.GET({
      URL: "api/v2/storefront/account/roles",
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    const roles = response.data?.roles || response.data?.data?.map((r: any) => r.attributes?.name || r.name) || [];
    console.log('📋 Fetched user roles:', roles);
    return roles;
  } catch (e: any) {
    console.log('⚠️ Could not fetch roles separately:', e.message);
    return [];
  }
};