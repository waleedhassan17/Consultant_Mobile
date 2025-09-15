import { signUpPayload, AuthResponse, userInfo, UserType, Gender } from "../../models/auth";
import { notificationHandler } from "../../notifications/notificationHandler";

// Dummy API function to replace the imported API
const dummyAPI = {
  POST: async ({ URL, headers, data }: { URL: string; headers: any; data: any }) => {
    // Mock network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate API response structure
    return {
      success: true,
      data: data,
      message: "API call successful"
    };
  }
};

// Mock existing emails to simulate conflicts
const EXISTING_EMAILS = ["existing@test.com", "taken@test.com"];

// Mock existing phones to simulate conflicts
const EXISTING_PHONES = ["+1234567999"];

// Mock delay to simulate network request
const mockDelay = () => new Promise(resolve => setTimeout(resolve, 2000));

export const registerUser = async (signUpData: signUpPayload): Promise<AuthResponse> => {
  try {
    // Using dummy API instead of imported API
    // const response = await dummyAPI.POST({
    //   URL: "signup",
    //   headers: {},
    //   data: signUpData,
    // });

    // Mock network delay
    await mockDelay();

    // Comprehensive validation
    if (!signUpData.email || !signUpData.password) {
      throw new Error("Email and password are required");
    }

    if (!signUpData.nickname?.trim()) {
      throw new Error("Nickname is required");
    }

    if (!signUpData.phone?.trim()) {
      throw new Error("Phone number is required");
    }

    if (!signUpData.birthYear?.trim()) {
      throw new Error("Birth year is required");
    }

    if (!signUpData.gender) {
      throw new Error("Gender is required");
    }

    if (!signUpData.userType) {
      throw new Error("User type is required");
    }

    if (!signUpData.agreeToPrivacy) {
      throw new Error("You must agree to the privacy policy");
    }

    // Password validation
    if (signUpData.password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      throw new Error("Passwords do not match");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signUpData.email)) {
      throw new Error("Invalid email format");
    }

    // Check if email already exists
    if (EXISTING_EMAILS.includes(signUpData.email)) {
      throw new Error("Email already registered");
    }

    // Check if phone already exists
    if (EXISTING_PHONES.includes(signUpData.phone)) {
      throw new Error("Phone number already registered");
    }

    // Birth year validation
    const currentYear = new Date().getFullYear();
    const birthYear = parseInt(signUpData.birthYear);
    if (birthYear < 1900 || birthYear > currentYear - 13) {
      throw new Error("Invalid birth year");
    }

    // Phone number basic validation (adjust regex as needed)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(signUpData.phone.replace(/\s+/g, ''))) {
      throw new Error("Invalid phone number format");
    }

    // Generate new user ID
    const newUserId = `user_${Date.now()}`;

    // Create new user object matching userInfo interface
    const newUser: userInfo = {
      id: newUserId,
      nickname: signUpData.nickname.trim(),
      email: signUpData.email.trim(),
      phone: signUpData.phone.trim(),
      birthYear: signUpData.birthYear.trim(),
      gender: signUpData.gender,
      userType: signUpData.userType,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(signUpData.nickname)}&background=random`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Create successful response matching AuthResponse interface
    const authResponse: AuthResponse = {
      user: newUser,
      accessToken: `mock_jwt_token_${newUserId}_${Date.now()}`,
      refreshToken: `mock_refresh_token_${newUserId}_${Date.now()}`,
      message: "Registration successful"
    };

    console.log("Signup successful:", authResponse);
    return authResponse;

  } catch (e: any) {
    console.error("Signup error:", e);
    notificationHandler({ statusCode: "signup_failed" });
    const newError = new Error(e.message || "Registration failed");
    throw newError;
  }
};