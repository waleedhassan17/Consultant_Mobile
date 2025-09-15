import { signInPayload, AuthResponse, userInfo, UserType } from "../../models/auth";
import { notificationHandler } from "../../notifications/notificationHandler";

// Dummy API function to replace the imported API
const dummyAPI = {
  POST: async ({ URL, headers, data }: { URL: string; headers: any; data: any }) => {
    // Mock network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate API response structure
    return {
      success: true,
      data: data,
      message: "API call successful"
    };
  }
};

// Hardcoded users for testing - matching your userInfo interface
const MOCK_USERS: userInfo[] = [
  {
    id: "1",
    nickname: "Test User",
    email: "user@test.com",
    phone: "+1234567890",
    birthYear: "1990",
    gender: "male",
    userType: UserType.visitor,
    avatar: "https://example.com/avatar1.jpg",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: "2",
    nickname: "Dr. Smith",
    email: "therapist@test.com",
    phone: "+1234567891",
    birthYear: "1985",
    gender: "female",
    userType: UserType.therapist,
    avatar: "https://example.com/avatar2.jpg",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: "3",
    nickname: "Admin User",
    email: "admin@test.com",
    phone: "+1234567892",
    birthYear: "1988",
    gender: "other",
    userType: UserType.visitor, // Since admin is not in your UserType enum
    avatar: "https://example.com/avatar3.jpg",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
  }
];

// Store passwords separately for testing (in real app, these would be hashed)
const MOCK_PASSWORDS: { [key: string]: string } = {
  "user@test.com": "123456",
  "therapist@test.com": "123456",
  "admin@test.com": "admin123"
};

// Mock delay to simulate network request
const mockDelay = () => new Promise(resolve => setTimeout(resolve, 1500));

export const authLogin = async (signInInfo: signInPayload): Promise<AuthResponse> => {
  try {
    // Using dummy API instead of imported API
    // const response = await dummyAPI.POST({
    //   URL: "login",
    //   headers: {},
    //   data: signInInfo,
    // });

    // Mock network delay
    await mockDelay();

    // Find user by email
    const user = MOCK_USERS.find(u => u.email === signInInfo.email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Check password
    const storedPassword = MOCK_PASSWORDS[signInInfo.email];
    if (!storedPassword || storedPassword !== signInInfo.password) {
      throw new Error("Invalid credentials");
    }

    // Check if user type matches
    if (user.userType !== signInInfo.userType) {
      throw new Error("Invalid user type for this account");
    }

    // Create successful response matching AuthResponse interface
    const authResponse: AuthResponse = {
      user: user,
      accessToken: `mock_jwt_token_${user.id}_${Date.now()}`,
      refreshToken: `mock_refresh_token_${user.id}_${Date.now()}`,
      message: "Login successful"
    };

    console.log("Login successful:", authResponse);
    return authResponse;

  } catch (e: any) {
    console.error("Login error:", e);
    notificationHandler({ statusCode: "credentials_invalid" });
    const newError = new Error(e.message || "Invalid email or password");
    throw newError;
  }
};