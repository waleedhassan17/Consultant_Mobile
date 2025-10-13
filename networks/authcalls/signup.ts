import { signUpPayload } from "../../models/user";
import { NotificationService } from "../../notifications/notificationHandler";
import { API } from "../network/network"; // Import the API object with axios

// Configuration flag to switch between real and dummy API
const USE_DUMMY_API = true; // Set to false when you want to use real API

export const registerUser = async ({ signUpInfo }: { signUpInfo: signUpPayload }) => {
  // Use dummy API if flag is true
  if (USE_DUMMY_API) {
    return registerUserDummy({ signUpInfo });
  }

  // Real API implementation
  try {
    const response = await API.POST({
      URL: "auth/register",
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        email: signUpInfo.email.trim().toLowerCase(),
        password: signUpInfo.password,
        nickname: signUpInfo.nickname.trim(),
        phone: signUpInfo.phone.trim(),
        birthYear: signUpInfo.birthYear?.trim() || '',
        gender: signUpInfo.gender,
        userType: signUpInfo.userType
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Signup error:", error);
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        "Registration failed";
    
    await NotificationService.sendImmediateNotification({
      title: "❌ Sign Up Failed",
      body: errorMessage,
      data: { type: 'sign_up_error' },
      channelId: 'auth-notifications'
    });
    
    throw new Error(errorMessage);
  }
};

// Dummy API for testing/development
const registerUserDummy = async ({ signUpInfo }: { signUpInfo: signUpPayload }) => {
  console.log("🔄 Using DUMMY API for registration");
  
  // Mock network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock existing emails/phones to simulate conflicts
  const existingEmails = ["existing@test.com", "taken@test.com", "user@test.com", "therapist@test.com", "admin@test.com"];
  const existingPhones = ["+1234567999"];

  const email = signUpInfo.email.trim().toLowerCase();
  const phone = signUpInfo.phone.trim();

  // Check for existing email
  if (existingEmails.includes(email)) {
    await NotificationService.sendImmediateNotification({
      title: "❌ Sign Up Failed",
      body: "Email already registered",
      data: { type: 'sign_up_error' },
      channelId: 'auth-notifications'
    });
    throw new Error("Email already registered");
  }

  // Check for existing phone
  if (existingPhones.includes(phone)) {
    await NotificationService.sendImmediateNotification({
      title: "❌ Sign Up Failed",
      body: "Phone number already registered",
      data: { type: 'sign_up_error' },
      channelId: 'auth-notifications'
    });
    throw new Error("Phone number already registered");
  }

  // Validate password length
  if (signUpInfo.password.length < 6) {
    await NotificationService.sendImmediateNotification({
      title: "❌ Sign Up Failed",
      body: "Password must be at least 6 characters",
      data: { type: 'sign_up_error' },
      channelId: 'auth-notifications'
    });
    throw new Error("Password must be at least 6 characters");
  }

  // Generate user ID
  const userId = `user_${Date.now()}`;

  // Generate tokens
  const accessToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ 
    email: email, 
    userType: signUpInfo.userType,
    exp: Date.now() + 3600000 
  }))}.${Date.now()}`;
  
  const refreshToken = `refresh_${btoa(email)}_${Date.now()}`;

  // Return response in the format expected by slice
  return {
    user: {
      id: userId,
      uid: userId,
      email: email,
      displayName: signUpInfo.nickname.trim(),
      nickname: signUpInfo.nickname.trim(),
      phoneNumber: phone,
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(signUpInfo.nickname.trim())}&background=random`,
      birthYear: signUpInfo.birthYear?.trim() || '',
      gender: signUpInfo.gender,
      userType: signUpInfo.userType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      emailVerified: false,
      isVerified: false,
      // Therapist-specific fields
      ...(signUpInfo.userType === 'therapist' && {
        specializations: [],
        experience: '',
        qualifications: []
      })
    },
    accessToken,
    refreshToken
  };
};