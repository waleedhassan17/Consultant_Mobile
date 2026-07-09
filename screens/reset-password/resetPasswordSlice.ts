import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../store/createAppSlice";
import { resetPasswordAPI } from "../../networks/authcalls/forgotPassword";

interface ResetPasswordSliceState {
  email: string;
  verificationToken: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  error: string;
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: ResetPasswordSliceState = {
  email: "",
  verificationToken: "",
  password: "",
  confirmPassword: "",
  showPassword: false,
  showConfirmPassword: false,
  error: "",
  status: "idle",
};

export const resetPasswordSlice = createAppSlice({
  name: "resetPassword",
  initialState,
  reducers: (create) => ({
    setEmail: create.reducer((state, action: PayloadAction<string>) => {
      state.email = action.payload;
    }),
    setVerificationToken: create.reducer((state, action: PayloadAction<string>) => {
      state.verificationToken = action.payload;
    }),
    setPassword: create.reducer((state, action: PayloadAction<string>) => {
      state.password = action.payload;
      // Clear error and status when user types
      if (state.error) {
        state.error = "";
        state.status = "idle";
      }
    }),
    setConfirmPassword: create.reducer((state, action: PayloadAction<string>) => {
      state.confirmPassword = action.payload;
      // Clear error and status when user types
      if (state.error) {
        state.error = "";
        state.status = "idle";
      }
    }),
    togglePasswordVisibility: create.reducer((state) => {
      state.showPassword = !state.showPassword;
    }),
    toggleConfirmPasswordVisibility: create.reducer((state) => {
      state.showConfirmPassword = !state.showConfirmPassword;
    }),
    clearError: create.reducer((state) => {
      state.error = "";
      state.status = "idle";
    }),
    resetForm: create.reducer((state) => {
      state.email = "";
      state.verificationToken = "";
      state.password = "";
      state.confirmPassword = "";
      state.showPassword = false;
      state.showConfirmPassword = false;
      state.error = "";
      state.status = "idle";
    }),

    submitResetPasswordAsync: create.asyncThunk(
      async (
        { 
          email, 
          verificationToken, 
          newPassword 
        }: { 
          email: string; 
          verificationToken: string; 
          newPassword: string;
        }, 
        { rejectWithValue }
      ) => {
        console.log("📤 submitResetPasswordAsync started with:", { email, verificationToken });
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          console.log("❌ Invalid email format");
          return rejectWithValue("Invalid email address");
        }

        // Validate password
        if (!newPassword || newPassword.length < 6) {
          console.log("❌ Password too short");
          return rejectWithValue("Password must be at least 6 characters long");
        }

        // Validate token
        if (!verificationToken || verificationToken.trim().length === 0) {
          console.log("❌ Missing verification token");
          return rejectWithValue("Invalid or missing verification token. Please request a new password reset.");
        }
        
        try {
          const result = await resetPasswordAPI({ 
            email: email.trim(),
            verificationToken: verificationToken.trim(),
            newPassword 
          });
          
          console.log("📥 submitResetPasswordAsync received result:", JSON.stringify(result, null, 2));
          
          return result;
        } catch (error: any) {
          console.log("❌ submitResetPasswordAsync caught error:", error.message);
          
          // Return user-friendly error message
          const errorMessage = error.message || "Failed to reset password. Please try again.";
          return rejectWithValue(errorMessage);
        }
      },
      {
        pending: (state) => {
          console.log("⏳ Reset password pending...");
          state.status = "loading";
          state.error = "";
        },
        fulfilled: (state, action) => {
          console.log("✅ Reset password fulfilled");
          
          state.status = "succeeded";
          state.error = "";
          
          // Clear sensitive data after successful reset
          state.password = "";
          state.confirmPassword = "";
          state.verificationToken = "";
          state.showPassword = false;
          state.showConfirmPassword = false;
          
          console.log("💾 Password reset successfully");
        },
        rejected: (state, action) => {
          console.log("❌ Reset password rejected:", action.payload || action.error.message);
          
          state.status = "failed";
          state.error = (action.payload as string) || 
                       action.error.message || 
                       "Failed to reset password. Please try again.";
          
          console.log("Error set in state:", state.error);
        },
      }
    ),
  }),

  selectors: {
    selectEmail: (state) => state.email,
    selectVerificationToken: (state) => state.verificationToken,
    selectPassword: (state) => state.password,
    selectConfirmPassword: (state) => state.confirmPassword,
    selectShowPassword: (state) => state.showPassword,
    selectShowConfirmPassword: (state) => state.showConfirmPassword,
    selectStatus: (state) => state.status,
    selectError: (state) => state.error,
    selectIsLoading: (state) => state.status === "loading",
    selectIsFormComplete: (state) => 
      state.password.trim().length > 0 && 
      state.confirmPassword.trim().length > 0,
    selectPasswordsMatch: (state) => 
      state.password === state.confirmPassword && 
      state.password.length > 0 && 
      state.confirmPassword.length > 0,
    selectIsPasswordValid: (state) => state.password.length >= 6,
    selectCanSubmit: (state) => 
      state.password.trim().length >= 6 && 
      state.password === state.confirmPassword &&
      state.confirmPassword.trim().length > 0 &&
      state.status !== "loading",
  },
});

export const {
  setEmail,
  setVerificationToken,
  setPassword,
  setConfirmPassword,
  togglePasswordVisibility,
  toggleConfirmPasswordVisibility,
  clearError,
  resetForm,
  submitResetPasswordAsync,
} = resetPasswordSlice.actions;

export const {
  selectEmail,
  selectVerificationToken,
  selectPassword,
  selectConfirmPassword,
  selectShowPassword,
  selectShowConfirmPassword,
  selectStatus,
  selectError,
  selectIsLoading,
  selectIsFormComplete,
  selectPasswordsMatch,
  selectIsPasswordValid,
  selectCanSubmit,
} = resetPasswordSlice.selectors;