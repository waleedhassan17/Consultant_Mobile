import { signInPayload } from "../../models/user";
import { NotificationService } from "../../notifications/notificationHandler";
import { API } from "../network/network";

// Configuration flag to switch between real and dummy API
const USE_DUMMY_API = true; // Set to false when you want to use real API

export const authLogin = async ({ signInInfo }: { signInInfo: signInPayload }) => {
  // Use dummy API if flag is true
  if (USE_DUMMY_API) {
    return authLoginDummy({ signInInfo });
  }

  // Real API implementation
  try {
    const response = await API.POST({
      URL: "auth/login",
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        email: signInInfo.email.trim().toLowerCase(),
        password: signInInfo.password,
        userType: signInInfo.userType
      },
    });

    return response.data;
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

// Dummy API for testing/development
const authLoginDummy = async ({ signInInfo }: { signInInfo: signInPayload }) => {
  console.log("🔄 Using DUMMY API for authentication");
  console.log("📧 Email:", signInInfo.email);
  console.log("🔑 Password provided:", !!signInInfo.password);
  console.log("👤 UserType:", signInInfo.userType);
  
  // Mock network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Valid credentials - only 3 user types: visitor, therapist, admin
  const validCredentials: { [key: string]: { password: string; userType: string } } = {
    "visitor@test.com": { password: "123456", userType: "visitor" },
    "therapist@test.com": { password: "123456", userType: "therapist" },
    "admin@test.com": { password: "admin123", userType: "admin" }
  };
  
  const email = signInInfo.email.trim().toLowerCase();
  const userCreds = validCredentials[email];
  
  console.log(`🔍 Looking up credentials for: ${email}`);
  console.log(`🔍 Found credentials:`, userCreds ? 'Yes' : 'No');
  
  // Check if password is provided
  if (!signInInfo.password) {
    console.log("❌ Password not provided");
    await NotificationService.sendImmediateNotification({
      title: "❌ Sign In Failed",
      body: "Password is required",
      data: { type: 'sign_in_error' },
      channelId: 'auth-notifications'
    });
    throw new Error("Password is required");
  }
  
  // Validate credentials (only email and password)
  if (!userCreds) {
    console.log("❌ Email not found in dummy database");
    await NotificationService.sendImmediateNotification({
      title: "❌ Sign In Failed",
      body: "Invalid email or password",
      data: { type: 'sign_in_error' },
      channelId: 'auth-notifications'
    });
    throw new Error("Invalid email or password");
  }

  if (userCreds.password !== signInInfo.password) {
    console.log("❌ Password mismatch");
    await NotificationService.sendImmediateNotification({
      title: "❌ Sign In Failed",
      body: "Invalid email or password",
      data: { type: 'sign_in_error' },
      channelId: 'auth-notifications'
    });
    throw new Error("Invalid email or password");
  }

  // Success - log the successful login
  console.log(`✅ Login successful for: ${email} as ${userCreds.userType}`);

  // Generate tokens
  const accessToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ 
    email: email, 
    userType: userCreds.userType,
    exp: Date.now() + 3600000 
  }))}.${Date.now()}`;
  
  const refreshToken = `refresh_${btoa(email)}_${Date.now()}`;

  // Return response in the format expected by your app
  const userData = {
    user: {
      id: email === "visitor@test.com" ? "1" : 
          email === "therapist@test.com" ? "2" : "3",
      uid: email === "visitor@test.com" ? "1" : 
           email === "therapist@test.com" ? "2" : "3",
      email: email,
      displayName: email === "visitor@test.com" ? "Test Visitor" : 
                  email === "therapist@test.com" ? "Dr. Smith" :
                  "Admin User",
      nickname: email === "visitor@test.com" ? "Test Visitor" : 
               email === "therapist@test.com" ? "Dr. Smith" :
               "Admin User",
      phoneNumber: "+1234567890",
      photoURL: `https://example.com/avatar${email === "visitor@test.com" ? "1" : email === "therapist@test.com" ? "2" : "3"}.jpg`,
      birthYear: "1990",
      gender: email === "therapist@test.com" ? "female" : "male",
      userType: userCreds.userType, // Use the stored userType
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      emailVerified: true,
      isVerified: true
    },
    accessToken,
    refreshToken
  };

  console.log("✅ Returning user data:", JSON.stringify(userData, null, 2));
  return userData;
};