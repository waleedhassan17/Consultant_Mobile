import { signInPayload, AuthResponse, userInfo, UserType } from "../../models/auth";
import { notificationHandler } from "../../notifications/notificationHandler";
import { signInResponseSerializer, validateSignInData, signInPayloadSerializer } from "../../serializers/signin";

// Dummy API function to replace the imported API
const dummyAPI = {
  POST: async ({ URL, headers, data }: { URL: string; headers: any; data: any }) => {
    // Mock network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate API response structure that matches what serializer expects
    return {
      success: true,
      data: {
        user: {
          uid: data.email === "user@test.com" ? "1" : 
               data.email === "therapist@test.com" ? "2" : "3",
          email: data.email,
          displayName: data.email === "user@test.com" ? "Test User" : 
                      data.email === "therapist@test.com" ? "Dr. Smith" : "Admin User",
          nickname: data.email === "user@test.com" ? "Test User" : 
                   data.email === "therapist@test.com" ? "Dr. Smith" : "Admin User",
          phoneNumber: "+1234567890",
          photoURL: `https://example.com/avatar${data.email === "user@test.com" ? "1" : "2"}.jpg`,
          birthYear: "1990",
          gender: data.email === "therapist@test.com" ? "female" : "male",
          userType: data.userType,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
          emailVerified: true,
          isVerified: true
        },
        accessToken: `mock_jwt_token_${Date.now()}`,
        refreshToken: `mock_refresh_token_${Date.now()}`
      },
      message: "Login successful"
    };
  }
};

// Store passwords separately for testing
const MOCK_PASSWORDS: { [key: string]: string } = {
  "user@test.com": "123456",
  "therapist@test.com": "123456",
  "admin@test.com": "admin123"
};

export const authLogin = async (signInInfo: signInPayload): Promise<AuthResponse> => {
  try {
    // Step 1: Validate input data using serializer
    const validation = validateSignInData(signInInfo);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // Step 2: Serialize the payload (clean and format data)
    const serializedPayload = signInPayloadSerializer(signInInfo);
    
    // Step 3: Check credentials against mock data
    const storedPassword = MOCK_PASSWORDS[serializedPayload.email];
    if (!storedPassword || storedPassword !== serializedPayload.password) {
      throw new Error("Invalid credentials");
    }

    // Step 4: Call dummy API with serialized data
    const response = await dummyAPI.POST({
      URL: "login",
      headers: {
        'Content-Type': 'application/json'
      },
      data: serializedPayload,
    });

    if (!response.success) {
      throw new Error("API call failed");
    }

    // Step 5: Use serializer to transform API response to match our userInfo model
    const serializedUser = signInResponseSerializer(response);

    // Step 6: Create AuthResponse matching our model
    const authResponse: AuthResponse = {
      user: serializedUser,
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      message: response.message
    };

    console.log("Login successful with proper architecture:", authResponse);
    return authResponse;

  } catch (e: any) {
    console.error("Login error:", e);
    notificationHandler({ statusCode: "credentials_invalid" });
    throw new Error(e.message || "Invalid email or password");
  }
};