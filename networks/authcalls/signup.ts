import { 
  RegisterUserRequest, 
  RegisterConsultantRequest, 
  RegisterCorporateRequest 
} from "../../models/user";
import { NotificationService } from "../../notifications/notificationHandler";
import { API } from "../network/network";

// Single unified signup function
export const registerUser = async ({ 
  userData 
}: { 
  userData: RegisterUserRequest | RegisterConsultantRequest | RegisterCorporateRequest 
}) => {
  try {
    // Determine role based on the data structure
    let role = 'user'; // default role
    let requestData: any = {};

    // Check if it's a consultant registration
    if ('discipline' in userData && 'languagesSpoken' in userData) {
      role = 'consultant';
      const consultantData = userData as RegisterConsultantRequest;
      requestData = {
        firstName: consultantData.firstName.trim(),
        lastName: consultantData.lastName.trim(),
        email: consultantData.email.trim().toLowerCase(),
        password: consultantData.password,
        confirmPassword: consultantData.confirmPassword,
        country: consultantData.country.trim(),
        preferredCurrency: consultantData.preferredCurrency.trim(),
        discipline: consultantData.discipline.trim(),
        languagesSpoken: consultantData.languagesSpoken,
        availableForIndividual: consultantData.availableForIndividual,
        availableForEnterprise: consultantData.availableForEnterprise,
        availableForMembership: consultantData.availableForMembership,
        gender: consultantData.gender,
        agreeToPrivacy: consultantData.agreeToPrivacy,
        role: 'consultant',
      };
    } 
    // Check if it's a corporate registration
    else if ('companyName' in userData && 'industryType' in userData) {
      role = 'corporate';
      const corporateData = userData as RegisterCorporateRequest;
      requestData = {
        companyName: corporateData.companyName.trim(),
        firstName: corporateData.firstName.trim(),
        lastName: corporateData.lastName.trim(),
        email: corporateData.email.trim().toLowerCase(),
        password: corporateData.password,
        confirmPassword: corporateData.confirmPassword,
        industryType: corporateData.industryType.trim(),
        companySize: corporateData.companySize.trim(),
        country: corporateData.country.trim(),
        gender: corporateData.gender,
        agreeToPrivacy: corporateData.agreeToPrivacy,
        role: 'corporate',
      };
    } 
    // Default user registration
    else {
      const defaultUserData = userData as RegisterUserRequest;
      requestData = {
        firstName: defaultUserData.firstName.trim(),
        lastName: defaultUserData.lastName.trim(),
        email: defaultUserData.email.trim().toLowerCase(),
        password: defaultUserData.password,
        confirmPassword: defaultUserData.confirmPassword,
        country: defaultUserData.country.trim(),
        gender: defaultUserData.gender,
        agreeToPrivacy: defaultUserData.agreeToPrivacy,
        role: 'user',
      };
    }

    console.log('📤 Sending registration request:', {
      url: 'user',
      role,
      email: requestData.email,
      hasPassword: !!requestData.password,
      hasConfirmPassword: !!requestData.confirmPassword,
    });

    const response = await API.POST({
      URL: "user",
      headers: {
        'Content-Type': 'application/json',
      },
      data: requestData,
    });

    console.log('✅ Registration successful:', response.data);

    return {
      accessToken: response.data.access_token || response.data.accessToken,
      refreshToken: response.data.refresh_token || response.data.refreshToken,
      user: {
        id: response.data.user?.id || response.data.id || '',
        uid: response.data.user?.uid || response.data.uid || '',
        email: requestData.email,
        firstName: requestData.firstName,
        lastName: requestData.lastName,
        displayName: `${requestData.firstName} ${requestData.lastName}`,
        nickname: requestData.firstName,
        country: requestData.country,
        gender: requestData.gender,
        userType: role,
        // Include role-specific fields in response
        ...(role === 'consultant' && {
          preferredCurrency: requestData.preferredCurrency,
          discipline: requestData.discipline,
          languagesSpoken: requestData.languagesSpoken,
          availableForIndividual: requestData.availableForIndividual,
          availableForEnterprise: requestData.availableForEnterprise,
          availableForMembership: requestData.availableForMembership,
        }),
        ...(role === 'corporate' && {
          companyName: requestData.companyName,
          industryType: requestData.industryType,
          companySize: requestData.companySize,
        }),
        emailVerified: response.data.user?.emailVerified || false,
        isVerified: response.data.user?.isVerified || false,
        createdAt: response.data.user?.createdAt || new Date().toISOString(),
        updatedAt: response.data.user?.updatedAt || new Date().toISOString(),
      }
    };
  } catch (e: any) {
    console.error("❌ User registration error:", {
      message: e.message,
      status: e.response?.status,
      statusText: e.response?.statusText,
      data: e.response?.data,
      url: e.config?.url,
    });
    
    const errorMessage = e.response?.data?.message || 
                        e.response?.data?.error || 
                        e.message || 
                        "Registration failed. Please try again.";
    
    await NotificationService.sendImmediateNotification({
      title: "❌ Registration Failed",
      body: errorMessage,
      data: { type: 'registration_error' },
      channelId: 'auth-notifications'
    });
    
    throw new Error(errorMessage);
  }
};

// Export legacy function names for backward compatibility
export const registerAsUser = registerUser;
export const registerAsConsultant = registerUser;
export const registerAsCorporate = registerUser;