import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerNavigationProp } from '@react-navigation/drawer';

interface User {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  avatar: string;
}

// Define your drawer navigator's route params if needed
type RootDrawerParamList = {
  Profile: undefined;
  Settings: undefined;
  Home: undefined;
  // Add other routes as needed
};

interface ProfileScreenProps {
  navigation: DrawerNavigationProp<RootDrawerParamList, 'Profile'>;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showImagePicker, setShowImagePicker] = useState<boolean>(false);
  const [user, setUser] = useState<User>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    bio: 'Software developer passionate about mobile app development and user experience design.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  });

  const [editedUser, setEditedUser] = useState<User>({ ...user });

  const openDrawer = (): void => {
    navigation.openDrawer();
  };

  const handleSave = (): void => {
    setUser({ ...editedUser });
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleCancel = (): void => {
    setEditedUser({ ...user });
    setIsEditing(false);
  };

  const handleImagePicker = (): void => {
    setShowImagePicker(true);
  };

  const selectImage = (imageUrl: string): void => {
    setEditedUser({ ...editedUser, avatar: imageUrl });
    setShowImagePicker(false);
  };

  const sampleImages = [
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
            <Ionicons name="menu" size={24} color="#1976d2" />
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity
            onPress={isEditing ? handleSave : () => setIsEditing(true)}
            style={styles.editButton}
          >
            <Ionicons 
              name={isEditing ? "checkmark" : "create-outline"} 
              size={24} 
              color="#1976d2" 
            />
          </TouchableOpacity>
        </View>

        {/* Profile Picture Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity 
            onPress={isEditing ? handleImagePicker : undefined}
            style={styles.avatarContainer}
          >
            <Image source={{ uri: editedUser.avatar }} style={styles.avatar} />
            {isEditing && (
              <View style={styles.avatarOverlay}>
                <Ionicons name="camera" size={24} color="white" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.userName}>{isEditing ? editedUser.name : user.name}</Text>
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.infoItem}>
            <View style={styles.infoLeft}>
              <Ionicons name="person-outline" size={24} color="#666" />
              <Text style={styles.infoLabel}>Name</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedUser.name}
                onChangeText={(text) => setEditedUser({ ...editedUser, name: text })}
                placeholder="Enter your name"
              />
            ) : (
              <Text style={styles.infoValue}>{user.name}</Text>
            )}
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoLeft}>
              <Ionicons name="mail-outline" size={24} color="#666" />
              <Text style={styles.infoLabel}>Email</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedUser.email}
                onChangeText={(text) => setEditedUser({ ...editedUser, email: text })}
                placeholder="Enter your email"
                keyboardType="email-address"
              />
            ) : (
              <Text style={styles.infoValue}>{user.email}</Text>
            )}
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoLeft}>
              <Ionicons name="call-outline" size={24} color="#666" />
              <Text style={styles.infoLabel}>Phone</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedUser.phone}
                onChangeText={(text) => setEditedUser({ ...editedUser, phone: text })}
                placeholder="Enter your phone"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.infoValue}>{user.phone}</Text>
            )}
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoLeft}>
              <Ionicons name="location-outline" size={24} color="#666" />
              <Text style={styles.infoLabel}>Location</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedUser.location}
                onChangeText={(text) => setEditedUser({ ...editedUser, location: text })}
                placeholder="Enter your location"
              />
            ) : (
              <Text style={styles.infoValue}>{user.location}</Text>
            )}
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.bioContainer}>
            {isEditing ? (
              <TextInput
                style={styles.bioInput}
                value={editedUser.bio}
                onChangeText={(text) => setEditedUser({ ...editedUser, bio: text })}
                placeholder="Tell us about yourself..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            ) : (
              <Text style={styles.bioText}>{user.bio}</Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        {isEditing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Ionicons name="close-outline" size={20} color="white" />
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Ionicons name="checkmark-outline" size={20} color="white" />
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Navigation Buttons */}
        {!isEditing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={20} color="white" />
              <Text style={styles.buttonText}>Go to Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]}
              onPress={() => navigation.navigate('Home')}
            >
              <Ionicons name="home-outline" size={20} color="white" />
              <Text style={styles.buttonText}>Go to Home</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Profile Picture</Text>
            <View style={styles.imageGrid}>
              {sampleImages.map((imageUrl, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => selectImage(imageUrl)}
                  style={styles.imageOption}
                >
                  <Image source={{ uri: imageUrl }} style={styles.imagePreview} />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowImagePicker(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  menuButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginLeft: 15,
  },
  editButton: {
    padding: 8,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#1976d2',
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
    flex: 1,
    textAlign: 'right',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
    borderBottomWidth: 1,
    borderBottomColor: '#1976d2',
    paddingBottom: 5,
  },
  bioContainer: {
    padding: 16,
  },
  bioText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  bioInput: {
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#1976d2',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    flex: 1,
    marginHorizontal: 5,
  },
  primaryButton: {
    backgroundColor: '#1976d2',
  },
  secondaryButton: {
    backgroundColor: '#757575',
  },
  saveButton: {
    backgroundColor: '#4caf50',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  imageOption: {
    margin: 5,
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#1976d2',
  },
  modalCloseButton: {
    backgroundColor: '#757575',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;