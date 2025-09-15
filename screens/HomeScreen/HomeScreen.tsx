// screens/HomeScreen/HomeScreen.tsx
import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from "../../hooks/useReduxHooks";
import { setMessage } from "./homeScreenSlice";
import type { RootState } from "../../store/store";

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const message = useAppSelector((state: RootState) => state.hello.message);

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View style={styles.container}>
      {/* Simple Sidebar Button */}
      <TouchableOpacity 
        style={styles.menuButton} 
        onPress={openDrawer}
      >
        <Ionicons name="menu" size={30} color="#333" />
      </TouchableOpacity>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.screenTitle}>HomeScreen</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  menuButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    padding: 10,
    backgroundColor: '#f0f0f0',
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
    color: '#333',
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
});