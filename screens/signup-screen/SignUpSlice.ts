// SignUpSlice.ts
import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../store/createAppSlice";
import { registerUser } from "../../networks/authcalls/signup";
import { 
  signUpSliceState, 
  signUpPayload, 
  UserTypeValue, 
  GenderValue,
  userInfo 
} from "../../models/auth";

const initialState: signUpSliceState = {
  nickname: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  birthYear: "",
  gender: null,
  selectedUserType: null,
  showPassword: false,
  showConfirmPassword: false,
  agreeToPrivacy: false,
  error: "",
  status: "idle",
  accessToken: "",
  user: null,
};

export const signUpSlice = createAppSlice({
  name: "signUp",
  initialState,
  reducers: (create) => ({
    setNickname: create.reducer((state, action: PayloadAction<string>) => {
      state.nickname = action.payload;
    }),
    setEmail: create.reducer((state, action: PayloadAction<string>) => {
      state.email = action.payload;
    }),
    setPassword: create.reducer((state, action: PayloadAction<string>) => {
      state.password = action.payload;
    }),
    setConfirmPassword: create.reducer((state, action: PayloadAction<string>) => {
      state.confirmPassword = action.payload;
    }),
    setPhone: create.reducer((state, action: PayloadAction<string>) => {
      state.phone = action.payload;
    }),
    setBirthYear: create.reducer((state, action: PayloadAction<string>) => {
      state.birthYear = action.payload;
    }),
    setGender: create.reducer((state, action: PayloadAction<GenderValue>) => {
      state.gender = action.payload;
    }),
    setSelectedUserType: create.reducer((state, action: PayloadAction<UserTypeValue>) => {
      state.selectedUserType = action.payload;
    }),
    togglePasswordVisibility: create.reducer((state) => {
      state.showPassword = !state.showPassword;
    }),
    toggleConfirmPasswordVisibility: create.reducer((state) => {
      state.showConfirmPassword = !state.showConfirmPassword;
    }),
    togglePrivacyAgreement: create.reducer((state) => {
      state.agreeToPrivacy = !state.agreeToPrivacy;
    }),
    clearError: create.reducer((state) => {
      state.error = "";
    }),
    setAccessToken: create.reducer((state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    }),
    resetForm: create.reducer((state) => {
      Object.assign(state, initialState);
    }),

    submitSignUpAsync: create.asyncThunk(
      async (formData: {
        nickname: string;
        email: string;
        password: string;
        confirmPassword: string;
        phone: string;
        birthYear: string;
        gender: GenderValue;
        userType: UserTypeValue;
        agreeToPrivacy: boolean;
      }) => {
        const payload: signUpPayload = {
          nickname: formData.nickname.trim(),
          email: formData.email.trim(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          phone: formData.phone.trim(),
          birthYear: formData.birthYear.trim(),
          gender: formData.gender,
          userType: formData.userType,
          agreeToPrivacy: formData.agreeToPrivacy,
        };
        
        // Call registerUser with the correct parameter structure
        const result = await registerUser(payload);
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
          
          console.log('Sign-up successful, state updated for user:', action.payload.user?.userType);
        },
        rejected: (state, action) => {
          state.status = "failed";
          state.error = action.error.message || "Registration failed";
          console.log('Sign-up failed:', action.error.message);
        },
      }
    ),
  }),

  selectors: {
    selectNickname: (state) => state.nickname,
    selectEmail: (state) => state.email,
    selectPassword: (state) => state.password,
    selectConfirmPassword: (state) => state.confirmPassword,
    selectPhone: (state) => state.phone,
    selectBirthYear: (state) => state.birthYear,
    selectGender: (state) => state.gender,
    selectSelectedUserType: (state) => state.selectedUserType,
    selectShowPassword: (state) => state.showPassword,
    selectShowConfirmPassword: (state) => state.showConfirmPassword,
    selectAgreeToPrivacy: (state) => state.agreeToPrivacy,
    selectStatus: (state) => state.status,
    selectError: (state) => state.error,
    selectAccessToken: (state) => state.accessToken,
    selectUser: (state) => state.user,
    selectIsFormValid: (state) => {
      return (
        state.selectedUserType &&
        state.nickname.trim() &&
        state.email.trim() &&
        state.password.trim() &&
        state.confirmPassword.trim() &&
        state.phone.trim() &&
        state.birthYear.trim() &&
        state.gender &&
        state.agreeToPrivacy &&
        state.password === state.confirmPassword &&
        state.password.length >= 6
      );
    },
  },
});

export const {
  setNickname,
  setEmail,
  setPassword,
  setConfirmPassword,
  setPhone,
  setBirthYear,
  setGender,
  setSelectedUserType,
  togglePasswordVisibility,
  toggleConfirmPasswordVisibility,
  togglePrivacyAgreement,
  clearError,
  setAccessToken,
  resetForm,
  submitSignUpAsync,
} = signUpSlice.actions;

export const {
  selectNickname,
  selectEmail,
  selectPassword,
  selectConfirmPassword,
  selectPhone,
  selectBirthYear,
  selectGender,
  selectSelectedUserType,
  selectShowPassword,
  selectShowConfirmPassword,
  selectAgreeToPrivacy,
  selectStatus,
  selectError,
  selectAccessToken,
  selectUser,
  selectIsFormValid,
} = signUpSlice.selectors;