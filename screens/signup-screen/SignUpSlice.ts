import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../store/createAppSlice";
import { registerUser } from "../../networks/authcalls/signup";
import { 
  signUpSliceState, 
  UserTypeValue, 
  GenderValue,
  RegisterUserRequest,
  RegisterConsultantRequest,
  RegisterCorporateRequest
} from "../../models/user";
import {
  KeyForStorage,
  saveData,
  saveUserInfo,
} from "../../utils/storage_utils/storageUtils";

// Extended state interface with all new fields
interface ExtendedSignUpState extends signUpSliceState {
  firstName: string;
  lastName: string;
  country: string;
  preferredCurrency: string;
  discipline: string;
  languagesSpoken: string[];
  availableForIndividual: boolean;
  availableForEnterprise: boolean;
  availableForMembership: boolean;
  // Corporate specific fields
  companyName: string;
  industryType: string;
  companySize: string;
}

const initialState: ExtendedSignUpState = {
  // Keep existing fields for backward compatibility
  nickname: "",
  phone: "",
  birthYear: "",
  
  // New fields
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  country: "",
  preferredCurrency: "",
  discipline: "",
  languagesSpoken: [],
  gender: null,
  selectedUserType: null, // null = default user registration
  
  // Availability options (Consultant only)
  availableForIndividual: true,
  availableForEnterprise: false,
  availableForMembership: false,
  
  // Corporate specific fields
  companyName: "",
  industryType: "",
  companySize: "",
  
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
    // Basic info actions
    setFirstName: create.reducer((state, action: PayloadAction<string>) => {
      state.firstName = action.payload;
      state.nickname = action.payload;
    }),
    setLastName: create.reducer((state, action: PayloadAction<string>) => {
      state.lastName = action.payload;
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
    
    // Location & preferences
    setCountry: create.reducer((state, action: PayloadAction<string>) => {
      state.country = action.payload;
      state.birthYear = action.payload;
    }),
    setPreferredCurrency: create.reducer((state, action: PayloadAction<string>) => {
      state.preferredCurrency = action.payload;
    }),
    
    // Consultant specific fields
    setDiscipline: create.reducer((state, action: PayloadAction<string>) => {
      state.discipline = action.payload;
    }),
    setLanguagesSpoken: create.reducer((state, action: PayloadAction<string[]>) => {
      state.languagesSpoken = action.payload;
    }),
    addLanguage: create.reducer((state, action: PayloadAction<string>) => {
      if (!state.languagesSpoken.includes(action.payload)) {
        state.languagesSpoken.push(action.payload);
      }
    }),
    removeLanguage: create.reducer((state, action: PayloadAction<string>) => {
      state.languagesSpoken = state.languagesSpoken.filter(
        lang => lang !== action.payload
      );
    }),
    toggleAvailableForIndividual: create.reducer((state) => {
      state.availableForIndividual = !state.availableForIndividual;
    }),
    toggleAvailableForEnterprise: create.reducer((state) => {
      state.availableForEnterprise = !state.availableForEnterprise;
    }),
    toggleAvailableForMembership: create.reducer((state) => {
      state.availableForMembership = !state.availableForMembership;
    }),
    
    // Corporate specific fields
    setCompanyName: create.reducer((state, action: PayloadAction<string>) => {
      state.companyName = action.payload;
    }),
    setIndustryType: create.reducer((state, action: PayloadAction<string>) => {
      state.industryType = action.payload;
    }),
    setCompanySize: create.reducer((state, action: PayloadAction<string>) => {
      state.companySize = action.payload;
    }),
    
    // Common fields
    setGender: create.reducer((state, action: PayloadAction<GenderValue>) => {
      state.gender = action.payload;
    }),
    setSelectedUserType: create.reducer((state, action: PayloadAction<UserTypeValue | null>) => {
      state.selectedUserType = action.payload;
    }),
    
    // UI state
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
    
    // Backward compatibility actions
    setNickname: create.reducer((state, action: PayloadAction<string>) => {
      state.nickname = action.payload;
      state.firstName = action.payload;
    }),
    setPhone: create.reducer((state, action: PayloadAction<string>) => {
      state.phone = action.payload;
    }),
    setBirthYear: create.reducer((state, action: PayloadAction<string>) => {
      state.birthYear = action.payload;
      state.country = action.payload;
    }),

    // Submit registration - uses single API with role parameter
    submitSignUpAsync: create.asyncThunk(
      async (registrationData: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        confirmPassword: string;
        country: string;
        preferredCurrency?: string;
        gender: GenderValue;
        userType: UserTypeValue | null; // null = default user registration
        discipline?: string;
        languagesSpoken?: string[];
        availableForIndividual?: boolean;
        availableForEnterprise?: boolean;
        availableForMembership?: boolean;
        companyName?: string;
        industryType?: string;
        companySize?: string;
        agreeToPrivacy: boolean;
      }) => {
        const { 
          firstName,
          lastName,
          email,
          password,
          confirmPassword,
          country,
          preferredCurrency,
          gender,
          userType,
          discipline,
          languagesSpoken,
          availableForIndividual,
          availableForEnterprise,
          availableForMembership,
          companyName,
          industryType,
          companySize,
          agreeToPrivacy
        } = registrationData;

        // Basic validation
        if (!email || !password) {
          throw new Error("Email and password are required");
        }
        if (!firstName || !lastName) {
          throw new Error("First name and last name are required");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (!country) {
          throw new Error("Country is required");
        }
        if (!gender) {
          throw new Error("Gender is required");
        }
        if (!agreeToPrivacy) {
          throw new Error("You must agree to the Terms & Conditions and Privacy Policy");
        }

        // Prepare data based on user type
        let userData: RegisterUserRequest | RegisterConsultantRequest | RegisterCorporateRequest;
        
        // If userType is null or 'user', register as default user
        if (!userType || userType === 'user') {
          userData = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            password,
            confirmPassword,
            country: country.trim(),
            gender,
            agreeToPrivacy,
          };
          
        } else if (userType === 'consultant') {
          // Consultant specific validation
          if (!discipline) {
            throw new Error("Discipline is required for consultants");
          }
          if (!languagesSpoken || languagesSpoken.length === 0) {
            throw new Error("At least one language must be selected");
          }
          if (!preferredCurrency) {
            throw new Error("Preferred currency is required for consultants");
          }
          if (!availableForIndividual && !availableForEnterprise && !availableForMembership) {
            throw new Error("Please select at least one availability option");
          }
          
          userData = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            password,
            confirmPassword,
            country: country.trim(),
            preferredCurrency: preferredCurrency.trim(),
            discipline: discipline.trim(),
            languagesSpoken,
            availableForIndividual: availableForIndividual || false,
            availableForEnterprise: availableForEnterprise || false,
            availableForMembership: availableForMembership || false,
            gender,
            agreeToPrivacy,
          };
          
        } else if (userType === 'corporate') {
          // Corporate specific validation
          if (!companyName) {
            throw new Error("Company name is required for corporate accounts");
          }
          if (!industryType) {
            throw new Error("Industry type is required for corporate accounts");
          }
          if (!companySize) {
            throw new Error("Company size is required for corporate accounts");
          }
          
          userData = {
            companyName: companyName.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            password,
            confirmPassword,
            industryType: industryType.trim(),
            companySize: companySize.trim(),
            country: country.trim(),
            gender,
            agreeToPrivacy,
          };
          
        } else {
          throw new Error("Invalid user type");
        }
        
        // Call the unified registration API
        const result = await registerUser({ userData });
        return result;
      },
      {
        pending: (state) => {
          state.status = "loading";
          state.error = "";
        },
        fulfilled: (state, action) => {
          state.status = "idle";
          // Safely assign user with proper type casting
          if (action.payload.user) {
            state.user = {
              ...action.payload.user,
              userType: action.payload.user.userType as UserTypeValue
            };
          }
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
        },
      }
    ),
  }),

  selectors: {
    // New selectors
    selectFirstName: (state) => state.firstName,
    selectLastName: (state) => state.lastName,
    selectCountry: (state) => state.country,
    selectPreferredCurrency: (state) => state.preferredCurrency,
    selectDiscipline: (state) => state.discipline,
    selectLanguagesSpoken: (state) => state.languagesSpoken,
    selectAvailableForIndividual: (state) => state.availableForIndividual,
    selectAvailableForEnterprise: (state) => state.availableForEnterprise,
    selectAvailableForMembership: (state) => state.availableForMembership,
    selectCompanyName: (state) => state.companyName,
    selectIndustryType: (state) => state.industryType,
    selectCompanySize: (state) => state.companySize,
    
    // Existing selectors
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
      const hasFirstName = state.firstName.trim().length > 0;
      const hasLastName = state.lastName.trim().length > 0;
      const hasEmail = state.email.trim().length > 0;
      const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim());
      const hasPassword = state.password.trim().length > 0;
      const hasValidPassword = state.password.length >= 6;
      const passwordsMatch = state.password === state.confirmPassword;
      const hasCountry = state.country.trim().length > 0;
      const hasGender = !!state.gender;
      const hasAgreedToTerms = state.agreeToPrivacy;

      // Base validation for all registration types (including default user)
      let isValid = hasFirstName &&
        hasLastName &&
        hasEmail &&
        hasValidEmail &&
        hasPassword &&
        hasValidPassword &&
        passwordsMatch &&
        hasCountry &&
        hasGender &&
        hasAgreedToTerms;

      // If no userType selected (null), it's default user registration - base validation is enough
      if (!state.selectedUserType || state.selectedUserType === 'user') {
        return isValid;
      }

      // Consultant specific validation
      if (state.selectedUserType === 'consultant') {
        const hasDiscipline = state.discipline.trim().length > 0;
        const hasLanguages = state.languagesSpoken.length > 0;
        const hasPreferredCurrency = state.preferredCurrency.trim().length > 0;
        const hasAvailability = state.availableForIndividual || 
          state.availableForEnterprise || 
          state.availableForMembership;
        
        isValid = isValid && hasDiscipline && hasLanguages && hasPreferredCurrency && hasAvailability;
      }

      // Corporate specific validation
      if (state.selectedUserType === 'corporate') {
        const hasCompanyName = state.companyName.trim().length > 0;
        const hasIndustryType = state.industryType.trim().length > 0;
        const hasCompanySize = state.companySize.trim().length > 0;
        
        isValid = isValid && hasCompanyName && hasIndustryType && hasCompanySize;
      }

      return isValid;
    },
  },
});

export const {
  setFirstName,
  setLastName,
  setEmail,
  setPassword,
  setConfirmPassword,
  setCountry,
  setPreferredCurrency,
  setDiscipline,
  setLanguagesSpoken,
  addLanguage,
  removeLanguage,
  toggleAvailableForIndividual,
  toggleAvailableForEnterprise,
  toggleAvailableForMembership,
  setCompanyName,
  setIndustryType,
  setCompanySize,
  setGender,
  setSelectedUserType,
  togglePasswordVisibility,
  toggleConfirmPasswordVisibility,
  togglePrivacyAgreement,
  clearError,
  setAccessToken,
  resetForm,
  setNickname,
  setPhone,
  setBirthYear,
  submitSignUpAsync,
} = signUpSlice.actions;

export const {
  selectFirstName,
  selectLastName,
  selectCountry,
  selectPreferredCurrency,
  selectDiscipline,
  selectLanguagesSpoken,
  selectAvailableForIndividual,
  selectAvailableForEnterprise,
  selectAvailableForMembership,
  selectCompanyName,
  selectIndustryType,
  selectCompanySize,
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