// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import helloReducer from "../screens/HomeScreen/homeScreenSlice";
import { signInSlice } from "../screens/signin-screen/SignInSlice";
import { signUpSlice } from "../screens/signup-screen/SignUpSlice";
import { logoutSlice } from "../screens/LogoutScreen/LogoutSlice";
import { therapistSlice } from "../screens/Therapist/therapistSlice";

export const store = configureStore({
  reducer: {
    hello: helloReducer,
    signIn: signInSlice.reducer,
    signUp: signUpSlice.reducer,
    logout: logoutSlice.reducer,
    therapist: therapistSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;