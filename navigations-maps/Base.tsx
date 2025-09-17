// navigations-maps/Base.ts
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import SignIn from "../screens/signin-screen/SignIn";
import SignUp from "../screens/signup-screen/SignUp";
import LogoutScreen from "../screens/LogoutScreen/logout";
import DrawerNavigator from "../navigators/DrawerNavigator"; // Import your DrawerNavigator
import TherapistScreen from "../screens/Therapist/therapist";

export const BaseRouteNames = {
  SignIn: "SignIn",
  SignUp: "SignUp",
  Logout: "Logout",
  Home: "Home", // This will now be the DrawerNavigator
  Therapist: "Therapist",
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
      headerShown: true,
    },
  },
  {
    component: SignUp,
    title: BaseRouteNames.SignUp,
    options: {
      headerShown: true,
    },
  },
   {
    component: LogoutScreen,
    title: BaseRouteNames.Logout,
    options: {
      headerShown: true,
    },
  },
  {
    component: TherapistScreen,
    title: BaseRouteNames.Therapist,
    options: {
      headerShown: true,
    },
  },
  {
    component: DrawerNavigator,
    title: BaseRouteNames.Home,
    options: {
      headerShown: false, 
    },
  },
];