// AppContainer.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { BaseRouteNames } from "../navigations-maps/Base";
import BaseNavigator from "../navigators/BaseNavigator";

/**
 * Main App Container Component
 */
const AppContainer: React.FC = () => {
  return (
    <NavigationContainer>
      <BaseNavigator initialRouteName={BaseRouteNames.SignIn} />
    </NavigationContainer>
  );
};

export default AppContainer;
