// AppContainer.tsx - FIXED VERSION
import React, { useEffect, useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Platform, ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "../hooks/useReduxHooks";

import { BaseRouteNames } from "../navigations-maps/Base";
import { ConsultantRouteNames } from "../navigations-maps/Consultant";
import { CorporateRouteNames } from "../navigations-maps/Corporate";

import BaseNavigator from "../navigators/BaseNavigator";
import ConsultantNavigator from "../navigators/ConsultantNavigator";
import CorporateNavigator from "../navigators/CorporateNavigator";

import {
  selectCurrentUser,
  selectStatus,
  fetchMe,
  persistFcmTokenAction,
  setAppIsReady,
  selectIsAppReady,
  selectUserType,
  selectIsAuthenticated,
} from "./appContainerSlice";

import {
  KeyForStorage,
  retriveData,
} from "../utils/storage_utils/storageUtils";

import { UserType } from "../models/user";

// Define colors
const Black = "#000000";
const Primary = "#17A2B8";

/**
 * Main App Container Component
 * Handles authentication state and navigation routing based on user type
 * 
 * Routing Logic:
 * - Not authenticated → SignIn screen
 * - Authenticated as 'user' → HomeScreen (BaseNavigator)
 * - Authenticated as 'consultant' → ConsultantNavigator
 * - Authenticated as 'corporate' → CorporateNavigator
 */
export const AppContainer: React.FC = () => {
  const currentUser = useAppSelector(selectCurrentUser);
  const status = useAppSelector(selectStatus);
  const dispatch = useAppDispatch();
  const isAppReady = useAppSelector(selectIsAppReady);
  const userType = useAppSelector(selectUserType);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const retrieveTokenFromStorageIfAny = useCallback(async () => {
    try {
      const token = await retriveData(KeyForStorage.accessToken);

      if (token) {
        console.log('🔑 Token found, fetching user data...');
        dispatch(fetchMe());
      } else {
        console.log('🔑 No token found, showing login screen');
        dispatch(setAppIsReady(true));
      }
    } catch (error) {
      console.error('❌ Error retrieving token:', error);
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

  // Debug logging
  useEffect(() => {
    console.log('🔄 AppContainer state:', {
      isAppReady,
      isAuthenticated,
      userType,
      status,
      hasCurrentUser: !!currentUser,
    });
  }, [isAppReady, isAuthenticated, userType, status, currentUser]);

  // Show loading indicator while app is initializing
  if (!isAppReady) {
    return (
      <GestureHandlerRootView style={styles.gestureStyle}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Primary} />
        </View>
      </GestureHandlerRootView>
    );
  }

  // Determine which navigator to show based on authentication and user type
  const renderNavigator = () => {
    // Not authenticated - show Base navigator with SignIn
    if (!isAuthenticated || !currentUser) {
      console.log('📱 Rendering: BaseNavigator (SignIn) - Not authenticated');
      return <BaseNavigator initialRouteName={BaseRouteNames.SignIn} />;
    }

    // Authenticated - route based on user type
    switch (userType) {
      case UserType.consultant:
        console.log('📱 Rendering: ConsultantNavigator - User is Consultant');
        return <ConsultantNavigator initialRouteName={ConsultantRouteNames.ConsultantHome} />;
      
      case UserType.corporate:
        console.log('📱 Rendering: CorporateNavigator - User is Corporate');
        return <CorporateNavigator initialRouteName={CorporateRouteNames.CorporateHome} />;
      
      case UserType.user:
      default:
        // Users go to Home screen (HomeScreen component)
        console.log('📱 Rendering: BaseNavigator (Home) - User is regular User');
        return <BaseNavigator initialRouteName={BaseRouteNames.Home} />;
    }
  };

  return (
    <GestureHandlerRootView style={styles.gestureStyle}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <NavigationContainer>
          {renderNavigator()}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default AppContainer;