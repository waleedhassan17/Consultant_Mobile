import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../store/createAppSlice";
import { registerUser } from "../../networks/authcalls/signup";
import { 
  signUpSliceState, 
  signUpPayload, 
  UserTypeValue, 
  GenderValue 
} from "../../models/user";
import {
  KeyForStorage,
  saveData,
  saveUserInfo,
} from "../../utils/storage_utils/storageUtils";

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
      async ({
        nickname,
        email,
        password,
        confirmPassword,
        phone,
        birthYear,
        gender,
        userType,
        agreeToPrivacy
      }: {
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
        // Validation
        if (!email || !password) {
          throw new Error("Email and password are required");
        }
        if (!nickname) {
          throw new Error("Nickname is required");
        }
        if (!phone) {
          throw new Error("Phone number is required");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (!gender) {
          throw new Error("Gender is required");
        }
        if (!userType) {
          throw new Error("User type is required");
        }
        if (!agreeToPrivacy) {
          throw new Error("You must agree to the privacy policy");
        }

        const payload: signUpPayload = {
          nickname: nickname.trim(),
          email: email.trim(),
          password,
          confirmPassword,
          phone: phone.trim(),
          birthYear: birthYear.trim(),
          gender,
          userType,
          agreeToPrivacy,
        };
        
        const result = await registerUser({ signUpInfo: payload });
        return result;
      },
      {
        pending: (state) => {
          state.status = "loading";
          state.error = "";
        },
        fulfilled: (state, action) => {
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
        },
        rejected: (state, action) => {
          state.status = "failed";
          state.error = action.error.message || "Registration failed";
          alert(action.error.message);
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