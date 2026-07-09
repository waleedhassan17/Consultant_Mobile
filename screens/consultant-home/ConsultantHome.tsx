import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../hooks/useReduxHooks';
import { selectCurrentUser, logout } from '../../components/appContainerSlice';

/**
 * Consultant Home Screen
 * Main dashboard for consultant users
 */
const ConsultantHome: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>
              {currentUser?.firstName || 'Consultant'}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FF5252" />
          </TouchableOpacity>
        </View>

        {/* User Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Your Profile</Text>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#17A2B8" />
            <Text style={styles.infoText}>{currentUser?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="briefcase-outline" size={20} color="#17A2B8" />
            <Text style={styles.infoText}>
              Discipline: {currentUser?.discipline || 'Not specified'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={20} color="#17A2B8" />
            <Text style={styles.infoText}>
              Currency: {currentUser?.preferredCurrency || 'USD'}
            </Text>
          </View>
        </View>

        {/* Availability Status */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Availability Status</Text>
          <View style={styles.availabilityContainer}>
            <View style={styles.availabilityItem}>
              <Ionicons
                name={currentUser?.availableForIndividual ? 'checkmark-circle' : 'close-circle'}
                size={24}
                color={currentUser?.availableForIndividual ? '#4CAF50' : '#CCCCCC'}
              />
              <Text style={styles.availabilityText}>Individual (B2C)</Text>
            </View>
            <View style={styles.availabilityItem}>
              <Ionicons
                name={currentUser?.availableForEnterprise ? 'checkmark-circle' : 'close-circle'}
                size={24}
                color={currentUser?.availableForEnterprise ? '#4CAF50' : '#CCCCCC'}
              />
              <Text style={styles.availabilityText}>Enterprise (B2B)</Text>
            </View>
            <View style={styles.availabilityItem}>
              <Ionicons
                name={currentUser?.availableForMembership ? 'checkmark-circle' : 'close-circle'}
                size={24}
                color={currentUser?.availableForMembership ? '#4CAF50' : '#CCCCCC'}
              />
              <Text style={styles.availabilityText}>Mentorship</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="calendar-outline" size={24} color="#17A2B8" />
            <Text style={styles.actionText}>View Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="people-outline" size={24} color="#17A2B8" />
            <Text style={styles.actionText}>My Clients</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="stats-chart-outline" size={24} color="#17A2B8" />
            <Text style={styles.actionText}>Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="settings-outline" size={24} color="#17A2B8" />
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Languages Spoken */}
        {currentUser?.languagesSpoken && currentUser.languagesSpoken.length > 0 && (
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Languages Spoken</Text>
            <View style={styles.languagesContainer}>
              {currentUser.languagesSpoken.map((lang, index) => (
                <View key={index} style={styles.languageChip}>
                  <Text style={styles.languageText}>{lang}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  greeting: {
    fontSize: 14,
    color: '#666666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 12,
  },
  availabilityContainer: {
    gap: 12,
  },
  availabilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityText: {
    fontSize: 14,
    color: '#1A1A1A',
    marginLeft: 12,
  },
  actionsContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 16,
    color: '#1A1A1A',
    marginLeft: 16,
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageChip: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  languageText: {
    fontSize: 12,
    color: '#17A2B8',
    fontWeight: '500',
  },
});

export default ConsultantHome;
