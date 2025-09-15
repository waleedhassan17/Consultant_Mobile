// networks/authcalls/signup.ts
import { signUpPayload, AuthResponse } from "../../models/auth";
import { signUpResponseSerializer, validateSignUpData } from "../../serializers/signup";
import { notificationHandler } from "../../notifications/notificationHandler";

// Mock existing emails/phones to simulate conflicts
const EXISTING_EMAILS = ["existing@test.com", "taken@test.com"];
const EXISTING_PHONES = ["+1234567999"];

// Mock delay to simulate network request
const mockDelay = () => new Promise(resolve => setTimeout(resolve, 2000));

export const registerUser = async (signUpData: signUpPayload): Promise<AuthResponse> => {
  try {
    // Mock network delay
    await mockDelay();

    // Validate using serializer
    const validationResult = validateSignUpData(signUpData);
    if (!validationResult.isValid) {
      throw new Error(validationResult.errors[0]);
    }

    // Check for existing email/phone conflicts
    if (EXISTING_EMAILS.includes(signUpData.email)) {
      throw new Error("Email already registered");
    }

    if (EXISTING_PHONES.includes(signUpData.phone)) {
      throw new Error("Phone number already registered");
    }

    // Simulate API call response structure
    const mockAPIResponse = {
      success: true,
      data: {
        user: {
          uid: `user_${Date.now()}`,
          email: signUpData.email.trim(),
          displayName: signUpData.nickname.trim(),
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(signUpData.nickname)}&background=random`,
          phoneNumber: signUpData.phone.trim(),
          emailVerified: false,
          nickname: signUpData.nickname.trim(),
          phone: signUpData.phone.trim(),
          birthYear: signUpData.birthYear.trim(),
          gender: signUpData.gender,
          userType: signUpData.userType,
          collection: signUpData.userType === 'therapist' ? 'therapists' : 'users',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isVerified: false,
          specializations: signUpData.userType === 'therapist' ? [] : undefined,
          experience: signUpData.userType === 'therapist' ? '' : undefined,
          qualifications: signUpData.userType === 'therapist' ? [] : undefined,
        },
        tokens: {
          accessToken: `mock_jwt_token_${Date.now()}`,
          refreshToken: `mock_refresh_token_${Date.now()}`,
        }
      },
      message: "Registration successful"
    };

    // Use serializer to transform response to model-compliant format
    const serializedUser = signUpResponseSerializer(mockAPIResponse);

    // Create AuthResponse
    const authResponse: AuthResponse = {
      user: serializedUser,
      accessToken: mockAPIResponse.data.tokens.accessToken,
      refreshToken: mockAPIResponse.data.tokens.refreshToken,
      message: mockAPIResponse.message
    };

    console.log("Signup successful:", authResponse);
    return authResponse;

  } catch (error: any) {
    console.error("Signup error:", error);
    notificationHandler({ statusCode: "signup_failed" });
    throw new Error(error.message || "Registration failed");
  }
};