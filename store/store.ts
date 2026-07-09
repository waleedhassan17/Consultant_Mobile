// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import homeScreenReducer from "../screens/home-screen/homeScreenSlice";
import { signInSlice } from "../screens/signin-screen/SignInSlice"
import { signUpSlice } from "../screens/signup-screen/SignUpSlice";
import { logoutSlice } from "../screens/logout-screen/logoutSlice";
import { therapistSlice } from "../screens/therapist-screen/therapistSlice";
import { appContainerSlice } from "../components/appContainerSlice";
import { emailVerificationSlice } from "../screens/email-verification/emailVerificationSlice";
import { forgotPasswordSlice } from "../screens/forgot-password/forgotPasswordSlice";
import { resetPasswordSlice } from "../screens/reset-password/resetPasswordSlice";
import { timeSlotSlice } from "../screens/timeslot-screen/timeSlotSlice";
import moodTrackerReducer from "../screens/moodtracker-screen/moodTrackerSlice";

export const store = configureStore({
  reducer: {
    // hello: helloReducer,
    signIn: signInSlice.reducer,
    signUp: signUpSlice.reducer,
    logout: logoutSlice.reducer,
    homeScreen: homeScreenReducer,
    therapist: therapistSlice.reducer,
    appContainer: appContainerSlice.reducer,
    emailVerification: emailVerificationSlice.reducer,
    forgotPassword: forgotPasswordSlice.reducer,
    resetPassword: resetPasswordSlice.reducer,
    timeSlot: timeSlotSlice.reducer,
    moodTracker: moodTrackerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;