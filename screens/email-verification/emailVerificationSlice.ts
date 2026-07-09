import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../store/createAppSlice";
import { 
  resendVerificationEmailAPI, 
  checkVerificationStatusAPI 
} from "../../networks/authcalls/forgotPassword";

type VerificationType = "email_verification" | "password_reset";
type VerificationStatus = "pending" | "verified" | "failed";
type UserType = "user" | "corporate" | "consultant";

interface EmailVerificationSliceState {
  email: string;
  verificationType: VerificationType;
  userType: UserType | null;
  verificationStatus: VerificationStatus;
  resendTimer: number;
  error: string;
  status: "idle" | "loading" | "succeeded" | "failed";
  verificationToken: string | null;
}

const initialState: EmailVerificationSliceState = {
  email: "",
  verificationType: "email_verification",
  userType: null,
  verificationStatus: "pending",
  resendTimer: 0,
  error: "",
  status: "idle",
  verificationToken: null,
};

export const emailVerificationSlice = createAppSlice({
  name: "emailVerification",
  initialState,
  reducers: (create) => ({
    setEmail: create.reducer((state, action: PayloadAction<string>) => {
      state.email = action.payload;
    }),
    setVerificationType: create.reducer((state, action: PayloadAction<VerificationType>) => {
      state.verificationType = action.payload;
    }),
    setUserType: create.reducer((state, action: PayloadAction<UserType>) => {
      state.userType = action.payload;
    }),
    setVerificationStatus: create.reducer((state, action: PayloadAction<VerificationStatus>) => {
      state.verificationStatus = action.payload;
    }),
    setResendTimer: create.reducer((state, action: PayloadAction<number>) => {
      state.resendTimer = action.payload;
    }),
    decrementResendTimer: create.reducer((state) => {
      if (state.resendTimer > 0) {
        state.resendTimer -= 1;
      }
    }),
    clearError: create.reducer((state) => {
      state.error = "";
      state.status = "idle";
    }),
    setVerificationToken: create.reducer((state, action: PayloadAction<string>) => {
      state.verificationToken = action.payload;
    }),
    resetForm: create.reducer((state) => {
      state.email = "";
      state.verificationType = "email_verification";
      state.userType = null;
      state.verificationStatus = "pending";
      state.resendTimer = 0;
      state.error = "";
      state.status = "idle";
      state.verificationToken = null;
    }),

    resendVerificationEmailAsync: create.asyncThunk(
      async (
        { email, verificationType, userType }: { 
          email: string; 
          verificationType: VerificationType;
          userType?: UserType;
        }, 
        { rejectWithValue }
      ) => {
        console.log("📤 resendVerificationEmailAsync started with:", { email, verificationType, userType });
        
        // Validate email format before API call
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          console.log("❌ Invalid email format");
          return rejectWithValue("Please enter a valid email address");
        }
        
        try {
          const result = await resendVerificationEmailAPI({ 
            email: email.trim(), 
            type: verificationType,
            userType 
          });
          
          console.log("📥 resendVerificationEmailAsync received result:", JSON.stringify(result, null, 2));
          
          return result;
        } catch (error: any) {
          console.log("❌ resendVerificationEmailAsync caught error:", error.message);
          
          // Return user-friendly error message
          const errorMessage = error.message || "Failed to resend verification email. Please try again.";
          return rejectWithValue(errorMessage);
        }
      },
      {
        pending: (state) => {
          console.log("⏳ Resend email pending...");
          state.status = "loading";
          state.error = "";
        },
        fulfilled: (state, action) => {
          console.log("✅ Resend email fulfilled");
          
          state.status = "succeeded";
          state.error = "";
          state.resendTimer = 60; // Set 60 second cooldown
          
          console.log("💾 Verification email sent successfully");
        },
        rejected: (state, action) => {
          console.log("❌ Resend email rejected:", action.payload || action.error.message);
          
          state.status = "failed";
          state.error = (action.payload as string) || 
                       action.error.message || 
                       "Failed to resend verification email. Please try again.";
          
          console.log("Error set in state:", state.error);
        },
      }
    ),

    checkVerificationStatusAsync: create.asyncThunk(
      async (
        { email, verificationType, userType }: { 
          email: string; 
          verificationType: VerificationType;
          userType?: UserType;
        }, 
        { rejectWithValue }
      ) => {
        console.log("📤 checkVerificationStatusAsync started with:", { email, verificationType, userType });
        
        // Validate email format before API call
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          console.log("❌ Invalid email format");
          return rejectWithValue("Please enter a valid email address");
        }
        
        try {
          const result = await checkVerificationStatusAPI({ 
            email: email.trim(), 
            type: verificationType,
            userType 
          });
          
          console.log("📥 checkVerificationStatusAsync received result:", JSON.stringify(result, null, 2));
          
          return result;
        } catch (error: any) {
          console.log("❌ checkVerificationStatusAsync caught error:", error.message);
          
          // Return user-friendly error message
          const errorMessage = error.message || "Failed to verify email. Please try again.";
          return rejectWithValue(errorMessage);
        }
      },
      {
        pending: (state) => {
          console.log("⏳ Checking verification status...");
          state.status = "loading";
          state.error = "";
        },
        fulfilled: (state, action) => {
          console.log("✅ Verification check fulfilled:", JSON.stringify(action.payload, null, 2));
          
          state.status = "succeeded";
          state.error = "";
          
          if (action.payload.isVerified) {
            state.verificationStatus = "verified";
            if (action.payload.verificationToken) {
              state.verificationToken = action.payload.verificationToken;
            }
            console.log("✅ Email verified successfully");
          } else {
            state.verificationStatus = "failed";
            console.log("❌ Email not verified yet");
          }
        },
        rejected: (state, action) => {
          console.log("❌ Verification check rejected:", action.payload || action.error.message);
          
          state.status = "failed";
          state.verificationStatus = "failed";
          state.error = (action.payload as string) || 
                       action.error.message || 
                       "Failed to verify email. Please try again.";
          
          console.log("Error set in state:", state.error);
        },
      }
    ),
  }),

  selectors: {
    selectEmail: (state) => state.email,
    selectVerificationType: (state) => state.verificationType,
    selectUserType: (state) => state.userType,
    selectVerificationStatus: (state) => state.verificationStatus,
    selectResendTimer: (state) => state.resendTimer,
    selectStatus: (state) => state.status,
    selectError: (state) => state.error,
    selectVerificationToken: (state) => state.verificationToken,
    selectIsLoading: (state) => state.status === "loading",
    selectIsVerified: (state) => state.verificationStatus === "verified",
    selectCanResend: (state) => state.resendTimer === 0 && state.verificationStatus !== "verified" && state.status !== "loading",
    selectIsPasswordReset: (state) => state.verificationType === "password_reset",
  },
});

export const {
  setEmail,
  setVerificationType,
  setUserType,
  setVerificationStatus,
  setResendTimer,
  decrementResendTimer,
  clearError,
  setVerificationToken,
  resetForm,
  resendVerificationEmailAsync,
  checkVerificationStatusAsync,
} = emailVerificationSlice.actions;

export const {
  selectEmail,
  selectVerificationType,
  selectUserType,
  selectVerificationStatus,
  selectResendTimer,
  selectStatus,
  selectError,
  selectVerificationToken,
  selectIsLoading,
  selectIsVerified,
  selectCanResend,
  selectIsPasswordReset,
} = emailVerificationSlice.selectors;