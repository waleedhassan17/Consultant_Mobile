import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../store/createAppSlice";
import { authLogin } from "../../networks/authcalls/signin";
import { signInSliceState, UserTypeValue, signInPayload, AuthStatus } from "../../models/user";
import {
  KeyForStorage,
  saveData,
  saveUserInfo,
  saveUserType,
} from "../../utils/storage_utils/storageUtils";

const initialState: signInSliceState = {
  email: "",
  password: "",
  showPassword: false,
  selectedUserType: null,
  error: "",
  status: AuthStatus.idle,
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
    setSelectedUserType: create.reducer((state, action: PayloadAction<UserTypeValue | null>) => {
      console.log('🔵 setSelectedUserType:', action.payload);
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
      console.log('🚪 SignIn slice logout - resetting form');
      // Reset all state to initial values (form reset functionality)
      state.email = "";
      state.password = "";
      state.showPassword = false;
      state.selectedUserType = null;
      state.error = "";
      state.accessToken = "";
      state.user = null;
      state.status = AuthStatus.idle;
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
        console.log("========================================");
        console.log("📤 SIGN IN REQUEST");
        console.log("========================================");
        console.log("🔹 Email:", email);
        console.log("🔹 Selected User Type:", userType);
        
        try {
          const payload: signInPayload = {
            email: email.trim(),
            password,
            userType
          };

          const result = await authLogin({ signInInfo: payload });
          
          console.log("========================================");
          console.log("✅ SIGN IN RESPONSE");
          console.log("🔹 Email:", result.email);
          console.log("🔹 User Type:", result.user?.userType);
          console.log("🔹 Has Access Token:", !!result.accessToken);
          console.log("========================================");
          
          return result;
        } catch (error: any) {
          console.log("========================================");
          console.log("❌ SIGN IN ERROR");
          console.log("🔹 Message:", error.message);
          console.log("========================================");
          return rejectWithValue(error.message || "Sign in failed");
        }
      },
      {
        pending: (state) => {
          console.log("⏳ Sign in pending...");
          state.status = AuthStatus.loading;
          state.error = "";
        },
        fulfilled: (state, action) => {
          console.log("✅ Sign in fulfilled");
          
          state.status = AuthStatus.idle;
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken || "";
          state.error = "";
          
          // Save tokens to storage
          saveData(KeyForStorage.accessToken, action.payload.accessToken);
          console.log("💾 Access token saved");
          
          if (action.payload.refreshToken) {
            saveData(KeyForStorage.refreshToken, action.payload.refreshToken);
            console.log("💾 Refresh token saved");
          }
          
          // Save user info to storage
          if (action.payload.user) {
            saveUserInfo(action.payload.user);
            console.log("💾 User info saved");
            
            // CRITICAL: Save userType separately for persistence
            if (action.payload.user.userType) {
              saveUserType(action.payload.user.userType);
              console.log("💾 User type saved:", action.payload.user.userType);
            }
          }
          
          console.log("========================================");
          console.log("✅ SIGN IN COMPLETE");
          console.log("👤 User:", state.user?.email);
          console.log("👤 Type:", state.user?.userType);
          console.log("========================================");
        },
        rejected: (state, action) => {
          console.log("❌ Sign in rejected:", action.payload || action.error.message);
          
          state.status = AuthStatus.failed;
          state.error = (action.payload as string) || action.error.message || "Sign in failed";
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
    selectIsLoading: (state) => state.status === AuthStatus.loading,
    selectIsConsultant: (state) => state.selectedUserType === 'consultant',
    selectIsCorporate: (state) => state.selectedUserType === 'corporate',
    // Form is complete when email and password are filled (userType is optional - defaults to 'user')
    selectIsFormComplete: (state) => 
      state.email.trim().length > 0 && 
      state.password.trim().length >= 6,
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