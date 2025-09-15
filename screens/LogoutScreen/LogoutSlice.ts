// screens/LogoutScreen/LogoutSlice.ts
import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../store/createAppSlice";
import { logoutUser } from "../../networks/authcalls/logout";


interface LogoutSliceState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  isLoggingOut: boolean;
}

const initialState: LogoutSliceState = {
  status: "idle",
  error: null,
  isLoggingOut: false,
};

export const logoutSlice = createAppSlice({
  name: "logout",
  initialState,
  reducers: (create) => ({
    clearError: create.reducer((state) => {
      state.error = null;
    }),
    
    resetLogoutState: create.reducer((state) => {
      Object.assign(state, initialState);
    }),

    logoutUserAsync: create.asyncThunk(
      async (userData?: { accessToken?: string; userId?: string }) => {
        // Call logout API with user data
        const result = await logoutUser(userData);
        return result;
      },
      {
        pending: (state) => {
          state.status = "loading";
          state.isLoggingOut = true;
          state.error = null;
        },
        fulfilled: (state, action) => {
          state.status = "succeeded";
          state.isLoggingOut = false;
          state.error = null;
          console.log('Logout successful:', action.payload);
        },
        rejected: (state, action) => {
          state.status = "failed";
          state.isLoggingOut = false;
          state.error = action.error.message || "Logout failed";
          console.log('Logout failed:', action.error.message);
        },
      }
    ),
  }),

  selectors: {
    selectLogoutStatus: (state) => state.status,
    selectLogoutError: (state) => state.error,
    selectIsLoggingOut: (state) => state.isLoggingOut,
  },
});

export const {
  clearError,
  resetLogoutState,
  logoutUserAsync,
} = logoutSlice.actions;

export const {
  selectLogoutStatus,
  selectLogoutError,
  selectIsLoggingOut,
} = logoutSlice.selectors;