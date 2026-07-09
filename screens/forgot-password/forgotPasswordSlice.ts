import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../store/createAppSlice";
import { forgotPasswordAPI } from "../../networks/authcalls/forgotPassword";

interface ForgotPasswordSliceState {
  email: string;
  error: string;
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: ForgotPasswordSliceState = {
  email: "",
  error: "",
  status: "idle",
};

export const forgotPasswordSlice = createAppSlice({
  name: "forgotPassword",
  initialState,
  reducers: (create) => ({
    setEmail: create.reducer((state, action: PayloadAction<string>) => {
      state.email = action.payload;
      // Clear error when user types
      if (state.error) {
        state.error = "";
        state.status = "idle";
      }
    }),
    clearError: create.reducer((state) => {
      state.error = "";
      state.status = "idle";
    }),
    resetForm: create.reducer((state) => {
      state.email = "";
      state.error = "";
      state.status = "idle";
    }),

    submitForgotPasswordAsync: create.asyncThunk(
      async ({ email }: { email: string }, { rejectWithValue }) => {
        console.log("📤 submitForgotPasswordAsync started with:", { email });
        
        // Validate email format before API call
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          console.log("❌ Invalid email format");
          return rejectWithValue("Please enter a valid email address");
        }
        
        try {
          const result = await forgotPasswordAPI({ email: email.trim() });
          
          console.log("📥 submitForgotPasswordAsync received result:", JSON.stringify(result, null, 2));
          
          return result;
        } catch (error: any) {
          console.log("❌ submitForgotPasswordAsync caught error:", error.message);
          
          // Return a user-friendly error message
          const errorMessage = error.message || "Failed to send reset email. Please try again.";
          return rejectWithValue(errorMessage);
        }
      },
      {
        pending: (state) => {
          console.log("⏳ Forgot password request pending...");
          state.status = "loading";
          state.error = "";
        },
        fulfilled: (state, action) => {
          console.log("✅ Forgot password fulfilled with payload:", JSON.stringify(action.payload, null, 2));
          
          state.status = "succeeded";
          state.error = "";
          
          console.log("💾 Reset email sent successfully to:", state.email);
        },
        rejected: (state, action) => {
          console.log("❌ Forgot password rejected:", action.payload || action.error.message);
          
          state.status = "failed";
          state.error = (action.payload as string) || 
                       action.error.message || 
                       "Failed to send reset email. Please try again.";
          
          console.log("Error set in state:", state.error);
        },
      }
    ),
  }),

  selectors: {
    selectEmail: (state) => state.email,
    selectStatus: (state) => state.status,
    selectError: (state) => state.error,
    selectIsLoading: (state) => state.status === "loading",
    selectIsFormComplete: (state) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return state.email.trim().length > 0 && emailRegex.test(state.email.trim());
    },
  },
});

export const {
  setEmail,
  clearError,
  resetForm,
  submitForgotPasswordAsync,
} = forgotPasswordSlice.actions;

export const {
  selectEmail,
  selectStatus,
  selectError,
  selectIsLoading,
  selectIsFormComplete,
} = forgotPasswordSlice.selectors;