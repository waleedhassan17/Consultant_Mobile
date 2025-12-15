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
 * Corporate Home Screen
 * Main dashboard for corporate users
 */
const CorporateHome: React.FC = () => {
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
            <Text style={styles.greeting}>Welcome,</Text>
            <Text style={styles.companyName}>
              {currentUser?.companyName || 'Corporate User'}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FF5252" />
          </TouchableOpacity>
        </View>

        {/* Company Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Company Information</Text>
          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={20} color="#17A2B8" />
            <Text style={styles.infoText}>
              {currentUser?.companyName || 'Not specified'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="construct-outline" size={20} color="#17A2B8" />
            <Text style={styles.infoText}>
              Industry: {currentUser?.industryType || 'Not specified'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={20} color="#17A2B8" />
            <Text style={styles.infoText}>
              Size: {currentUser?.companySize || 'Not specified'}
            </Text>
          </View>
        </View>

        {/* Contact Person */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Contact Person</Text>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color="#17A2B8" />
            <Text style={styles.infoText}>
              {currentUser?.firstName} {currentUser?.lastName}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#17A2B8" />
            <Text style={styles.infoText}>{currentUser?.email}</Text>
          </View>
          {currentUser?.phone && (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color="#17A2B8" />
              <Text style={styles.infoText}>{currentUser.phone}</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="search-outline" size={24} color="#17A2B8" />
            <Text style={styles.actionText}>Find Consultants</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="briefcase-outline" size={24} color="#17A2B8" />
            <Text style={styles.actionText}>Active Projects</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="calendar-outline" size={24} color="#17A2B8" />
            <Text style={styles.actionText}>Schedule Meeting</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="document-text-outline" size={24} color="#17A2B8" />
            <Text style={styles.actionText}>Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="card-outline" size={24} color="#17A2B8" />
            <Text style={styles.actionText}>Billing & Payments</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="settings-outline" size={24} color="#17A2B8" />
            <Text style={styles.actionText}>Company Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={32} color="#17A2B8" />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Consultants</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="briefcase" size={32} color="#4CAF50" />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Projects</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="calendar" size={32} color="#FF9800" />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trending-up" size={32} color="#9C27B0" />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>
        </View>
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
  companyName: {
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
  actionsContainer: {
    marginHorizontal: 16,
    marginTop: 16,
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
  statsContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
});

export default CorporateHome;
