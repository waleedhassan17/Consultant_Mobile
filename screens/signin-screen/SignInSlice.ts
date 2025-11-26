import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../store/createAppSlice";
import { authLogin } from "../../networks/authcalls/signin";
import { signInSliceState, UserTypeValue, signInPayload } from "../../models/user";
import {
  KeyForStorage,
  saveData,
  saveUserInfo,
} from "../../utils/storage_utils/storageUtils";

const initialState: signInSliceState = {
  email: "",
  password: "",
  showPassword: false,
  selectedUserType: null,
  error: "",
  status: "idle",
  accessToken: "",
  user: null,
};

export const signInSlice = createAppSlice({
  name: "signIn",
  initialState,
  reducers: (create) => ({
    setEmail: create.reducer((state, action: PayloadAction<string>) => {
      state.email = action.payload;
      // Clear error when user types
      if (state.error) {
        state.error = "";
      }
    }),
    setPassword: create.reducer((state, action: PayloadAction<string>) => {
      state.password = action.payload;
      // Clear error when user types
      if (state.error) {
        state.error = "";
      }
    }),
    setSelectedUserType: create.reducer((state, action: PayloadAction<UserTypeValue>) => {
      state.selectedUserType = action.payload;
      // Clear error when user selects type
      if (state.error) {
        state.error = "";
      }
    }),
    togglePasswordVisibility: create.reducer((state) => {
      state.showPassword = !state.showPassword;
    }),
    clearError: create.reducer((state) => {
      state.error = "";
    }),
    setAccessToken: create.reducer((state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    }),
    logout: create.reducer((state) => {
      // Reset all state to initial values (form reset functionality)
      state.email = "";
      state.password = "";
      state.showPassword = false;
      state.selectedUserType = null;
      state.error = "";
      state.accessToken = "";
      state.user = null;
      state.status = "idle";
    }),

    submitSignInAsync: create.asyncThunk(
      async ({
        email,
        password,
        userType
      }: {
        email: string;
        password: string;
        userType: UserTypeValue
      }, { rejectWithValue }) => {
        console.log("📤 submitSignInAsync started with:", { email, userType });
        
        try {
          const payload: signInPayload = {
            email: email.trim(),
            password,
            userType
          };

          const result = await authLogin({ signInInfo: payload });
          
          console.log("📥 submitSignInAsync received result:", JSON.stringify(result, null, 2));
          
          return result;
        } catch (error: any) {
          console.log("❌ submitSignInAsync caught error:", error.message);
          return rejectWithValue(error.message || "Sign in failed");
        }
      },
      {
        pending: (state) => {
          console.log("⏳ Sign in pending...");
          state.status = "loading";
          state.error = "";
        },
        fulfilled: (state, action) => {
          console.log("✅ Sign in fulfilled with payload:", JSON.stringify(action.payload, null, 2));
          
          state.status = "idle";
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken || "";
          state.error = "";
          
          // Save tokens and user info to storage
          saveData(KeyForStorage.accessToken, action.payload.accessToken);
          if (action.payload.refreshToken) {
            saveData(KeyForStorage.refreshToken, action.payload.refreshToken);
          }
          if (action.payload.user) {
            saveUserInfo(action.payload.user);
            saveData(KeyForStorage.userType, action.payload.user.userType);
          }
          
          console.log("💾 User data saved to storage");
          console.log("👤 Current user:", state.user?.email, "Type:", state.user?.userType);
        },
        rejected: (state, action) => {
          console.log("❌ Sign in rejected:", action.payload || action.error.message);
          
          state.status = "failed";
          // Use action.payload if available (from rejectWithValue), otherwise use error.message
          state.error = (action.payload as string) || action.error.message || "Sign in failed";
          
          // Note: Alert is now handled in the component for better UX
          console.log("Error set in state:", state.error);
        },
      }
    ),
  }),

  selectors: {
    selectEmail: (state) => state.email,
    selectPassword: (state) => state.password,
    selectShowPassword: (state) => state.showPassword,
    selectSelectedUserType: (state) => state.selectedUserType,
    selectStatus: (state) => state.status,
    selectError: (state) => state.error,
    selectAccessToken: (state) => state.accessToken,
    selectUser: (state) => state.user,
    selectIsAuthenticated: (state) => !!state.user && !!state.accessToken,
    selectUserType: (state) => state.user?.userType,
    selectUserId: (state) => state.user?.id,
    selectUserNickname: (state) => state.user?.nickname,
    // Additional selectors to match UI state
    selectIsLoading: (state) => state.status === "loading",
    // ✅ FIXED: Changed 'visitor' to 'consultant' and 'therapist' to 'corporate'
    selectIsConsultant: (state) => state.selectedUserType === 'consultant',
    selectIsCorporate: (state) => state.selectedUserType === 'corporate',
    selectIsFormComplete: (state) => 
      !!state.selectedUserType && 
      state.email.trim().length > 0 && 
      state.password.trim().length > 0,
  },
});

export const {
  setEmail,
  setPassword,
  setSelectedUserType,
  togglePasswordVisibility,
  clearError,
  setAccessToken,
  logout,
  submitSignInAsync,
} = signInSlice.actions;

export const {
  selectEmail,
  selectPassword,
  selectShowPassword,
  selectSelectedUserType,
  selectStatus,
  selectError,
  selectAccessToken,
  selectUser,
  selectIsAuthenticated,
  selectUserType,
  selectUserId,
  selectUserNickname,
  selectIsLoading,
  selectIsConsultant,
  selectIsCorporate,
  selectIsFormComplete,
} = signInSlice.selectors;