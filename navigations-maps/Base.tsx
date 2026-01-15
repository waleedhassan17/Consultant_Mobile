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
import TimeSlotScreen from "../screens/timeslot-screen/timeSlot";
import MoodTrackerScreen from "../screens/moodtracker-screen/moodTracker";

export const BaseRouteNames = {
  SignIn: "SignIn",
  SignUp: "SignUp",
  Logout: "Logout",
  Home: "Home",
  TherapistProfile:"TherapistScreen", // This will now be the DrawerNavigator
  ForgotPassword: "ForgotPassword",
  ResetPassword: "ResetPassword",
  EmailVerification: "EmailVerification",
  TimeSlot: "TimeSlot",
  MoodTracker: "MoodTracker",
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
  },
  {
    component: TimeSlotScreen,
    title: BaseRouteNames.TimeSlot,
    options: {
      headerShown: false,
    }
  },
  {
    component: MoodTrackerScreen,
    title: BaseRouteNames.MoodTracker,
    options: {
      headerShown: false,
    }
  }
];