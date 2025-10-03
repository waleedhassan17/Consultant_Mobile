import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';

interface SortModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (option: string) => void;
}

const SortModal: React.FC<SortModalProps> = ({ visible, onClose, onSelect }) => {
  return (
    <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.sortModal}>
          <View style={styles.sortRow}>
          <Text style={styles.sortTitle}>Sort by</Text>
          <Pressable 
            style={styles.cancelButton} 
            onPress={onClose}
          >
            <Ionicons name="close" size={18} color="#000" />
          </Pressable>
          </View>
    
          <Pressable 
            style={styles.sortOption} 
            onPress={() => {  onSelect("price"); onClose();}}
          >
            <Text style={styles.sortOptionText}>Fees (Low to High)</Text>
            
          </Pressable>
    
          <Pressable 
            style={styles.sortOption} 
            onPress={() => {  onSelect("price"); onClose();}}
          >
            <Text style={styles.sortOptionText}>Fees (High to Low)</Text>
          </Pressable>
    
          <Pressable 
            style={styles.sortOption} 
            onPress={() => { onSelect("rating");onClose(); }}
          >
            <Text style={styles.sortOptionText}>Top rated therapists</Text>
          </Pressable>
          <Pressable 
            style={styles.sortOption} 
            onPress={() => { onSelect("sessions"); onClose(); }}
          >
            <Text style={styles.sortOptionText}>Reset</Text>
          </Pressable>
    
          
        </View>
      </View>
    </Modal>
      );
    };
    
    export default SortModal;
    
    const styles = StyleSheet.create({
        
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    marginTop: 35,
    fontFamily: "Montserrat-Regular",
  },
  sortModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    display: "flex",
    // justifyContent: "center",
    alignItems: "center",
  },
  sortRow: {
    flexDirection: "row",
    justifyContent: "center",
  marginLeft: 40,
},

  sortTitle: {
    fontSize: 18,
    color: "#2196F3",
    // borderBottomWidth: 1,
    // borderBottomColor: "#eee",
    paddingBottom: 12,
    width: "80%",
    textAlign: "center",
    // marginLeft: 45,
  },
  sortOption: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  
    width: "100%",
    
    
  },
  sortOptionText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  cancelButton: {
    marginLeft: 20,
    paddingVertical: 1,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  cancelText: {
    fontSize: 16,
    color: "#111",
  },
});