// BaseNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BaseRoutes, BaseRouteName } from "../navigations-maps/Base";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";

type BaseRoute = {
  title: BaseRouteName;
  component: React.ComponentType<any>;
  options?: NativeStackNavigationOptions;
};

type BaseNavigatorProps = {
  initialRouteName: BaseRouteName;
};

const Stack = createNativeStackNavigator();

const BaseNavigator: React.FC<BaseNavigatorProps> = ({ initialRouteName }) => {
  return (
    <Stack.Navigator initialRouteName={initialRouteName}>
      {BaseRoutes.map((route: BaseRoute) => (
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

export default BaseNavigator;