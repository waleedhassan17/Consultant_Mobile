import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { SortOption } from '../screens/home-screen/homeScreenSlice';

interface SortModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (option: SortOption) => void;
}

const SortModal: React.FC<SortModalProps> = ({ visible, onClose, onSelect }) => {
  const sortOptions: Array<{ label: string; value: SortOption }> = [
    { label: "Fees (Low to High)", value: "price-low" as const },
    { label: "Fees (High to Low)", value: "price-high" as const },
    { label: "Top rated therapists", value: "rating" as const },
    { label: "Most experienced", value: "sessions" as const },
    { label: "Reset", value: "default" as const },
  ];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.sortModal} onPress={(e) => e.stopPropagation()}>
          <View style={styles.sortRow}>
            <Text style={styles.sortTitle}>Sort by</Text>
            <Pressable 
              style={styles.cancelButton} 
              onPress={onClose}
            >
              <Ionicons name="close" size={18} color="#000" />
            </Pressable>
          </View>

          {sortOptions.map((option, index) => (
            <Pressable 
              key={option.value}
              style={[
                styles.sortOption,
                index === 0 && styles.firstOption,
              ]} 
              onPress={() => onSelect(option.value)}
            >
              <Text 
                style={[
                  styles.sortOptionText,
                  option.value === "default" && styles.resetText
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default SortModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sortModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
  },
  sortRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    position: "relative",
  },
  sortTitle: {
    fontSize: 18,
    color: "#2196F3",
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
  },
  cancelButton: {
    position: "absolute",
    right: 0,
    padding: 4,
  },
  sortOption: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    width: "100%",
  },
  firstOption: {
    marginTop: 5,
  },
  sortOptionText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  resetText: {
    color: "#2196F3",
    fontWeight: "600",
  },
});