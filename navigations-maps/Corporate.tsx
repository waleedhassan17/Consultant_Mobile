// navigations-maps/Corporate.ts
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
// Import corporate-specific screens
import CorporateHome from "../screens/corporate-home/CorporateHome";
import HomeScreen from "../screens/home-screen/homeScreen";
import TherapistScreen from "../screens/therapist-screen/therapist";
import TimeSlotScreen from "../screens/timeslot-screen/timeSlot";
import MoodTrackerScreen from "../screens/moodtracker-screen/moodTracker";

export const CorporateRouteNames = {
  CorporateHome: "CorporateHome",
  CorporateProfile: "CorporateProfile",
  CorporateDashboard: "CorporateDashboard",
  CorporateSettings: "CorporateSettings",
  CorporateTeam: "CorporateTeam",
  TherapistProfile: "TherapistScreen",
  TimeSlot: "TimeSlot",
  MoodTracker: "MoodTracker",
} as const;

export type CorporateRouteName = typeof CorporateRouteNames[keyof typeof CorporateRouteNames];

export interface ICorporateRoute {
  title: CorporateRouteName;
  component: React.ComponentType<any>;
  options?: NativeStackNavigationOptions;
}

export const CorporateRoutes: ICorporateRoute[] = [
  {
    component: CorporateHome,
    title: CorporateRouteNames.CorporateHome,
    options: {
      headerShown: false,
    },
  },
  {
    component: HomeScreen, // Replace with actual CorporateProfile screen
    title: CorporateRouteNames.CorporateProfile,
    options: {
      headerShown: false,
    },
  },
  {
    component: HomeScreen, // Replace with actual CorporateDashboard screen
    title: CorporateRouteNames.CorporateDashboard,
    options: {
      headerShown: false,
    },
  },
  {
    component: HomeScreen, // Replace with actual CorporateSettings screen
    title: CorporateRouteNames.CorporateSettings,
    options: {
      headerShown: false,
    },
  },
  {
    component: HomeScreen, // Replace with actual CorporateTeam screen
    title: CorporateRouteNames.CorporateTeam,
    options: {
      headerShown: false,
    },
  },
  {
    component: TherapistScreen,
    title: CorporateRouteNames.TherapistProfile,
    options: {
      headerShown: false,
    },
  },
  {
    component: TimeSlotScreen,
    title: CorporateRouteNames.TimeSlot,
    options: {
      headerShown: false,
    },
  },
  {
    component: MoodTrackerScreen,
    title: CorporateRouteNames.MoodTracker,
    options: {
      headerShown: false,
    },
  },
];