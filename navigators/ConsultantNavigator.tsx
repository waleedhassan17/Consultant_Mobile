// navigators/ConsultantNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ConsultantRoutes, ConsultantRouteName } from "../navigations-maps/Consultant";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";

type ConsultantRoute = {
  title: ConsultantRouteName;
  component: React.ComponentType<any>;
  options?: NativeStackNavigationOptions;
};

type ConsultantNavigatorProps = {
  initialRouteName: ConsultantRouteName;
};

const Stack = createNativeStackNavigator();

const ConsultantNavigator: React.FC<ConsultantNavigatorProps> = ({ initialRouteName }) => {
  return (
    <Stack.Navigator initialRouteName={initialRouteName}>
      {ConsultantRoutes.map((route: ConsultantRoute) => (
        <Stack.Screen
          key={route.title}
          name={route.title}
          component={route.component}
          options={route.options || { title: route.title }}
        />
      ))}
    </Stack.Navigator>
  );
};

export default ConsultantNavigator;