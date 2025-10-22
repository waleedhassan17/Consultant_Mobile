// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
 
import { signInSlice } from "../screens/signin-screen/SignInSlice"
 
import { appContainerSlice } from "../Components/appContainerSlice";

export const store = configureStore({
  reducer: {
    // hello: helloReducer,
    signIn: signInSlice.reducer,
    appContainer: appContainerSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;