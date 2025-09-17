import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, DrawerActions, CommonActions } from "@react-navigation/native";
import { useAppSelector } from "../../hooks/useReduxHooks";
import type { RootState } from "../../store/store";

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const message = useAppSelector((state: RootState) => state.hello.message);

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const goToTherapist = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: "Therapist",
      })
    );
  };

  return (
    <View style={styles.container}>
      {/* Drawer Button */}
      <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
        <Ionicons name="menu" size={30} color="#333" />
      </TouchableOpacity>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.screenTitle}>HomeScreen</Text>
        <Text style={styles.message}>{message}</Text>

        {/* Therapist Button */}
        <TouchableOpacity style={styles.therapistButton} onPress={goToTherapist}>
          <Text style={styles.therapistButtonText}>Therapist</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  menuButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  therapistButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    elevation: 3,
  },
  therapistButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});