// appContainerSlice.ts - FIXED VERSION
import { createAppSlice } from "../store/createAppSlice";
import { userInfo, UserTypeValue, UserType, AuthStatus, AuthStatusValue } from "../models/user";
import { me, persistFcmToken } from "../networks/authcalls/me";
import {
  KeyForStorage,
  clearAuthData,
  getUserType,
  saveUserType,
} from "../utils/storage_utils/storageUtils";

export interface appContainerSliceState {
  error: string;
  status: AuthStatusValue;
  currentUser: userInfo | null;
  isAppReady: boolean;
  networkIsDown: boolean;
}

const initialState: appContainerSliceState = {
  error: "",
  status: AuthStatus.idle,
  currentUser: null,
  isAppReady: false,
  networkIsDown: false,
};

export const appContainerSlice = createAppSlice({
  name: "appContainer",
  initialState,
  reducers: (create) => ({
    logout: create.reducer((state) => {
      console.log('🚪 Logging out user...');
      // Clear all auth data
      clearAuthData();
      state.currentUser = null;
      state.status = AuthStatus.idle;
      state.error = "";
      console.log('✅ Logout complete');
    }),

    setAppIsReady: create.reducer((state, action: { payload: boolean }) => {
      state.isAppReady = action.payload;
      console.log('📱 App ready state:', action.payload);
    }),

    setNetworkIsDown: create.reducer((state, action: { payload: boolean }) => {
      state.networkIsDown = action.payload;
    }),

    setCurrentUser: create.reducer((state, action: { payload: userInfo | null }) => {
      state.currentUser = action.payload;
      // Ensure app is ready when user is set (important for post-login navigation)
      if (action.payload) {
        state.isAppReady = true;
      }
      console.log('👤 Current user set:', action.payload?.email, 'Type:', action.payload?.userType);
    }),

    updateCurrentUser: create.reducer((state, action: { payload: Partial<userInfo> }) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
        console.log('👤 Current user updated');
      }
    }),
    
    /**
     * Update user type in state and storage
     * Useful when we need to manually set the user type
     */
    setUserType: create.reducer((state, action: { payload: UserTypeValue }) => {
      if (state.currentUser) {
        state.currentUser.userType = action.payload;
        // Also save to storage
        saveUserType(action.payload);
        console.log('👤 User type updated to:', action.payload);
      }
    }),

    /**
     * Fetch current user data
     * FIXED: Properly handles user type from storage when backend doesn't return it
     */
    fetchMe: create.asyncThunk(
      async (_, { rejectWithValue }) => {
        try {
          console.log('========================================');
          console.log('📤 FETCH ME REQUEST');
          console.log('========================================');
          
          const userData = await me();
          
          // The me() function now handles storage-based userType
          // But let's double-check and ensure we have a valid type
          if (!userData.userType || userData.userType === 'user') {
            // Check if there's a stored type that should override
            const storedUserType = await getUserType();
            if (storedUserType && storedUserType !== 'user') {
              console.log('🔍 Overriding with stored userType:', storedUserType);
              userData.userType = storedUserType;
            }
          }
          
          console.log('========================================');
          console.log('✅ FETCH ME RESPONSE');
          console.log('🔹 Email:', userData.email);
          console.log('🔹 User Type:', userData.userType);
          console.log('🔹 User ID:', userData.id);
          console.log('========================================');
          
          return userData;
        } catch (error: any) {
          console.error('========================================');
          console.error('❌ FETCH ME ERROR');
          console.error('Message:', error.message);
          console.error('========================================');
          return rejectWithValue(error.message || "Failed to fetch user");
        }
      },
      {
        pending: (state) => {
          console.log('⏳ fetchMe pending...');
          state.status = AuthStatus.loading;
          state.error = "";
        },
        fulfilled: (state, action) => {
          console.log('✅ fetchMe fulfilled');
          state.status = AuthStatus.idle;
          state.currentUser = action.payload as userInfo;
          state.isAppReady = true;
          state.error = "";
          
          console.log('👤 User loaded:', {
            email: state.currentUser?.email,
            userType: state.currentUser?.userType,
          });
        },
        rejected: (state, action) => {
          console.log('❌ fetchMe rejected:', action.payload || action.error.message);
          state.status = AuthStatus.failed;
          state.error = (action.payload as string) || action.error.message || "Failed to fetch user";
          state.isAppReady = true;
          state.currentUser = null;
        },
      }
    ),

    persistFcmTokenAction: create.asyncThunk(
      async ({ fcmToken, deviceType }: { fcmToken: string; deviceType: string }) => {
        return await persistFcmToken(fcmToken, deviceType);
      },
      {
        pending: (state) => {
          // Optionally set loading state
        },
        fulfilled: (state, action) => {
          console.log("✅ FCM token persisted successfully");
        },
        rejected: (state, action) => {
          console.log("❌ Failed to persist FCM token:", action.error.message);
        },
      }
    ),
  }),

  selectors: {
    selectStatus: (state) => state.status,
    selectError: (state) => state.error,
    selectIsAppReady: (state) => state.isAppReady,
    selectCurrentUser: (state) => state.currentUser,
    selectNetworkIsDown: (state) => state.networkIsDown,
    
    // User type selectors
    selectUserType: (state) => state.currentUser?.userType,
    selectIsConsultant: (state) => state.currentUser?.userType === UserType.consultant,
    selectIsCorporate: (state) => state.currentUser?.userType === UserType.corporate,
    selectIsUser: (state) => state.currentUser?.userType === UserType.user || !state.currentUser?.userType,
    selectIsAuthenticated: (state) => !!state.currentUser,
    
    // Additional helpful selectors
    selectUserEmail: (state) => state.currentUser?.email,
    selectUserId: (state) => state.currentUser?.id,
    selectUserDisplayName: (state) => state.currentUser?.displayName || state.currentUser?.nickname || state.currentUser?.firstName || '',
  },
});

export const {
  logout,
  fetchMe,
  persistFcmTokenAction,
  setAppIsReady,
  setNetworkIsDown,
  setCurrentUser,
  updateCurrentUser,
  setUserType,
} = appContainerSlice.actions;

export const {
  selectStatus,
  selectError,
  selectCurrentUser,
  selectIsAppReady,
  selectNetworkIsDown,
  selectUserType,
  selectIsConsultant,
  selectIsCorporate,
  selectIsUser,
  selectIsAuthenticated,
  selectUserEmail,
  selectUserId,
  selectUserDisplayName,
} = appContainerSlice.selectors;