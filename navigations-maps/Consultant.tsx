// navigations-maps/Consultant.ts
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
// Import consultant-specific screens
import ConsultantHome from "../screens/consultant-home/ConsultantHome";
import HomeScreen from "../screens/home-screen/homeScreen";

export const ConsultantRouteNames = {
  ConsultantHome: "ConsultantHome",
  ConsultantProfile: "ConsultantProfile",
  ConsultantDashboard: "ConsultantDashboard",
  ConsultantSettings: "ConsultantSettings",
} as const;

export type ConsultantRouteName = typeof ConsultantRouteNames[keyof typeof ConsultantRouteNames];

export interface IConsultantRoute {
  title: ConsultantRouteName;
  component: React.ComponentType<any>;
  options?: NativeStackNavigationOptions;
}

export const ConsultantRoutes: IConsultantRoute[] = [
  {
    component: ConsultantHome,
    title: ConsultantRouteNames.ConsultantHome,
    options: {
      headerShown: false,
    },
  },
  {
    component: HomeScreen, // Replace with actual ConsultantProfile screen
    title: ConsultantRouteNames.ConsultantProfile,
    options: {
      headerShown: false,
    },
  },
  {
    component: HomeScreen, // Replace with actual ConsultantDashboard screen
    title: ConsultantRouteNames.ConsultantDashboard,
    options: {
      headerShown: false,
    },
  },
  {
    component: HomeScreen, // Replace with actual ConsultantSettings screen
    title: ConsultantRouteNames.ConsultantSettings,
    options: {
      headerShown: false,
    },
  },
];