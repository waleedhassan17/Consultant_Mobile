// signInSlice.ts
import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../store/createAppSlice";
import { authLogin } from "../../networks/authcalls/signin";
import { signInSliceState, UserTypeValue, signInPayload } from "../../models/auth";

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
    }),
    setPassword: create.reducer((state, action: PayloadAction<string>) => {
      state.password = action.payload;
    }),
    setSelectedUserType: create.reducer((state, action: PayloadAction<UserTypeValue>) => {
      state.selectedUserType = action.payload;
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
      }) => {
        const payload: signInPayload = {
          email: email.trim(),
          password,
          userType
        };

        // Call authLogin with the correct parameter structure
        const result = await authLogin(payload);

        // Return the response directly since authLogin now returns AuthResponse format
        return result;
      },
      {
        pending: (state) => {
          state.status = "loading";
          state.error = "";
        },
        fulfilled: (state, action) => {
          // Simply update the state - notification handling is now done in App.tsx
          state.status = "idle";
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken || "";
          state.error = "";
          
          console.log('Sign-in successful, state updated for user:', action.payload.user?.userType);
        },
        rejected: (state, action) => {
          state.status = "failed";
          state.error = action.error.message || "Sign in failed";
          console.log('Sign-in failed:', action.error.message);
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
    selectIsAuthenticated: (state) => !!state.user,
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
} = signInSlice.selectors;