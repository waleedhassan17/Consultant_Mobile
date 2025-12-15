// navigators/CorporateNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CorporateRoutes, CorporateRouteName } from "../navigations-maps/Corporate";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";

type CorporateRoute = {
  title: CorporateRouteName;
  component: React.ComponentType<any>;
  options?: NativeStackNavigationOptions;
};

type CorporateNavigatorProps = {
  initialRouteName: CorporateRouteName;
};

const Stack = createNativeStackNavigator();

const CorporateNavigator: React.FC<CorporateNavigatorProps> = ({ initialRouteName }) => {
  return (
    <Stack.Navigator initialRouteName={initialRouteName}>
      {CorporateRoutes.map((route: CorporateRoute) => (
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

export default CorporateNavigator;