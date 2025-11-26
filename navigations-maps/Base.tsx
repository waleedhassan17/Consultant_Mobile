// navigations-maps/Base.ts
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import SignIn from "../screens/signin-screen/SignIn"
import SignUp from "../screens/signup-screen/SignUp";
import LogoutScreen from "../screens/logout-screen/logout";
import HomeScreen from "../screens/home-screen/homeScreen";
import TherapistScreen from "../screens/therapist-screen/therapist"// Import your DrawerNavigator
import ForgotPassword from "../screens/forgot-password/forgotPassword";
import ResetPassword from "../screens/reset-password/resetPassword";
import EmailVerification from "../screens/email-verification/emailVerification";


export const BaseRouteNames = {
  SignIn: "SignIn",
  SignUp: "SignUp",
  Logout: "Logout",
  Home: "Home",
  TherapistProfile:"TherapistScreen", // This will now be the DrawerNavigator
  ForgotPassword: "ForgotPassword",
  ResetPassword: "ResetPassword",
  EmailVerification: "EmailVerification",
} as const;

export type BaseRouteName = typeof BaseRouteNames[keyof typeof BaseRouteNames];

export interface IRoute {
  title: BaseRouteName;
  component: React.ComponentType<any>;
  options?: NativeStackNavigationOptions;
}

export const BaseRoutes: IRoute[] = [
  {
    component: SignIn,
    title: BaseRouteNames.SignIn,
    options: {
      headerShown: false,
    },
  },
  {
    component: SignUp,
    title: BaseRouteNames.SignUp,
    options: {
      headerShown: false,
    },
  },
  {
    component: HomeScreen, // Changed from HomeScreen to DrawerNavigator
    title: BaseRouteNames.Home,
    options: {
      headerShown: false, // Hide header since DrawerNavigator manages its own headers
    },
  },
  {
    component: TherapistScreen, // Changed from Therapist to DrawerNavigator
    title: BaseRouteNames.TherapistProfile,
    options: {
      headerShown: false, // Hide header since DrawerNavigator manages its own headers
    },
  },
  {
    component: ForgotPassword,
    title: BaseRouteNames.ForgotPassword,
    options: {
      headerShown: false,
    }
  },
  {
    component: ResetPassword,
    title: BaseRouteNames.ResetPassword,
    options: {
      headerShown: false,
    }
  },
  {
    component: EmailVerification,
    title: BaseRouteNames.EmailVerification,
    options: {
      headerShown: false,
    }
  }
];