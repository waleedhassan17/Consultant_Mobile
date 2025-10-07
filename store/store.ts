// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
<<<<<<< HEAD
import homeScreenReducer from "../screens/home-Screen/homeScreenSlice";
import { signInSlice } from "../screens/signin-screen/SignInSlice";
=======
import homeScreenReducer from "../screens/home-screen/homeScreenSlice";
import { signInSlice } from "../screens/signin-screen/SignInSlice"
>>>>>>> ad5da93f3e9bf860b7ad3f9f67131d7670bab3ff
import { signUpSlice } from "../screens/signup-screen/SignUpSlice";
import { logoutSlice } from "../screens/logout-screen/logoutSlice";
import { therapistSlice } from "../screens/therapist-screen/therapistSlice";
import { appContainerSlice } from "../components/appContainerSlice";

export const store = configureStore({
  reducer: {
    // hello: helloReducer,
    signIn: signInSlice.reducer,
    signUp: signUpSlice.reducer,
    logout: logoutSlice.reducer,
    homeScreen: homeScreenReducer,
    therapist: therapistSlice.reducer,
    appContainer: appContainerSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;