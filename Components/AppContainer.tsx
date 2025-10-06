import React, { useEffect, useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "../hooks/useReduxHooks";

import { BaseRouteNames } from "../navigations-maps/base";
import BaseNavigator from "../navigators/baseNavigator";

import {
  selectCurrentUser,
  selectStatus,
  fetchMe,
  logout,
  persistFcmTokenAction,
  setAppIsReady,
  selectIsAppReady,
} from "./appContainerSlice";

import {
  KeyForStorage,
  retriveData,
} from "../utils/storage_utils/storageUtils";

// Define Black color (adjust as needed)
const Black = "#000000";

/**
 * Main App Container Component
 */
export const AppContainer: React.FC = () => {
  const currentUser = useAppSelector(selectCurrentUser);
  const status = useAppSelector(selectStatus);
  const dispatch = useAppDispatch();
  const isAppReady = useAppSelector(selectIsAppReady);

  const retrieveTokenFromStorageIfAny = useCallback(async () => {
    const token = await retriveData(KeyForStorage.accessToken);

    if (token) {
      dispatch(fetchMe());
    } else {
      dispatch(setAppIsReady(true));
    }
  }, [dispatch]);

  useEffect(() => {
    retrieveTokenFromStorageIfAny();
  }, [retrieveTokenFromStorageIfAny]);

  useEffect(() => {
    const persistDeviceToken = async () => {
      const fcmToken = ""; // Get this from your push notification service
      
      if (fcmToken && currentUser) {
        dispatch(
          persistFcmTokenAction({
            fcmToken,
            deviceType: Platform.OS,
          })
        );
      }
    };

    persistDeviceToken();
  }, [currentUser, dispatch]);

  if (!isAppReady) {
    return null;
  }

  // Determine initial route based on authentication status
  const getInitialRoute = () => {
    // If user is authenticated, go to Home; otherwise go to SignIn
    return currentUser ? BaseRouteNames.Home : BaseRouteNames.SignIn;
  };

  return (
    <GestureHandlerRootView style={styles.gestureStyle}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <NavigationContainer>
          <BaseNavigator initialRouteName={getInitialRoute()} />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  gestureStyle: {
    flex: 1,
    backgroundColor: Black,
  },
});

export default AppContainer;