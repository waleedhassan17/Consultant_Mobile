import { createAppSlice } from "../store/createAppSlice";
import { userInfo } from "../models/auth";
import { me, persistFcmToken } from "../networks/authcalls/me";
import {
  removeKey,
  KeyForStorage,
} from "../utils/storage_utils/storageUtils";

export interface appContainerSliceState {
  error: string;
  status: "idle" | "loading" | "failed";
  currentUser?: userInfo | null;
  isAppReady: boolean;
}

const initialState: appContainerSliceState = {
  error: "",
  status: "idle",
  currentUser: null,
  isAppReady: false,
};

export const appContainerSlice = createAppSlice({
  name: "appContainer",
  initialState,
  reducers: (create) => ({
    logout: create.reducer((state) => {
      removeKey(KeyForStorage.accessToken);
      state.currentUser = null;
      state.status = "idle";
    }),

    setAppIsReady: create.reducer((state, action: { payload: boolean }) => {
      state.isAppReady = action.payload;
    }),

    fetchMe: create.asyncThunk(
      async () => {
        return await me();
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        fulfilled: (state, action) => {
          state.status = "idle";
          state.currentUser = action.payload;
          state.isAppReady = true;
        },
        rejected: (state, action) => {
          state.status = "failed";
          state.error = action.error.message || "Failed to fetch user";
          state.isAppReady = true;
          console.log("error rejected ", action.error);
        },
      }
    ),

    persistFcmTokenAction: create.asyncThunk(
      async ({ fcmToken, deviceType }: { fcmToken: string; deviceType: string }) => {
        return await persistFcmToken(fcmToken, deviceType);
      },
      {
        pending: (state) => {},
        fulfilled: (state, action) => {
          // Device token persisted successfully
          console.log("FCM token persisted successfully");
        },
        rejected: (state, error) => {
          console.log("Failed to persist FCM token", error);
        },
      }
    ),
  }),

  selectors: {
    selectStatus: (state) => state.status,
    selectError: (state) => state.error,
    selectIsAppReady: (state) => state.isAppReady,
    selectCurrentUser: (state) => state.currentUser,
  },
});

export const {
  logout,
  fetchMe,
  persistFcmTokenAction,
  setAppIsReady,
} = appContainerSlice.actions;

export const {
  selectStatus,
  selectError,
  selectCurrentUser,
  selectIsAppReady,
} = appContainerSlice.selectors;