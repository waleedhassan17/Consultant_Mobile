import React, { JSX, useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../hooks/useReduxHooks';
import { 
  setSearchQuery, toggleFilter, loadTherapists,
  selectSearchQuery, selectTherapists
} from './homeScreenSlice';
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import SortModal from '../../Custom-Components/SortMenu';
import TherapistCard from '../../Custom-Components/TherapistCard';

type NavigationProp = NativeStackNavigationProp<any>;

export default function HomeScreen(): JSX.Element {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp>();

  const searchQuery = useAppSelector(selectSearchQuery);
  const therapists = useAppSelector(selectTherapists);

  const [sortVisible, setSortVisible] = useState(false);
  const [sortOption, setSortOption] = useState("default");

  const sortedTherapists = [...therapists].sort((a, b) => {
    if (sortOption === "rating") return b.rating - a.rating;
    if (sortOption === "sessions") return Number(b.sessions) - Number(a.sessions);
    if (sortOption === "price") return Number(a.price60) - Number(b.price60);
    return 0; // default
  });

  // ✅ Load therapists on mount
  useEffect(() => {
    dispatch(loadTherapists());
  }, [dispatch]);

  const handleSearch = (text: string): void => {
    dispatch(setSearchQuery(text));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Ionicons name="sync" size={24} color="#2196F3" />
          </View>
          <View>
            <Text style={styles.appName}>Shezlong</Text>
            <Text style={styles.appTagline}>FOR YOU - FOR THEM</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.languageButton}>العربية</Text>
          <TouchableOpacity style={styles.signInButton} onPress={ () => navigation.navigate('SignIn')}>
            <Text style={styles.signInText}>Sign in</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signUpButton} onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signUpText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
{/* Title Row with Back Button */}
<View style={styles.titleRow}>
  <TouchableOpacity style={styles.backButton} onPress={navigation.goBack}>
    <Ionicons name="arrow-back" size={24} color="#666" />
  </TouchableOpacity>
  <Text style={styles.mainTitle}>Our Therapists</Text>
</View>

{/* Subtitle Section */}
<View style={styles.titleSection}>
  <Text style={styles.subtitle}>
    Book your appointment and get our help.
    <Text style={styles.subtitleItalic}>
      (All prices include VAT and Service Fees)
    </Text>
  </Text>
</View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Therapist Name or Title"
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#999"
          />
        </View>

        {/* Filter and Sort Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => dispatch(toggleFilter())}
          >
            <Ionicons name="options" size={16} color="#60a899" />
            <Text style={styles.filterText}>Filters</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.sortButton} 
            onPress={() => setSortVisible(true)}
          >
            <Ionicons name="chevron-down" size={16} color="#60a899" />
            <Text style={styles.sortText}>Sort by</Text>
          </TouchableOpacity>
        </View>

        {/* Therapists List */}
        <View style={styles.therapistsList}>
        {sortedTherapists.map((therapist) => (
    <TherapistCard key={therapist.id} therapist={therapist} />
  ))}
        </View>
      </ScrollView>

      {/* Sort Modal */}
      <SortModal 
        visible={sortVisible} 
        onClose={() => setSortVisible(false)} 
        onSelect={(option) => setSortOption(option)} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
header: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingVertical: 15,
  paddingTop: 50, // Add this line - increases top padding
  backgroundColor: '#fff',
  borderBottomWidth: 1,
  borderBottomColor: '#e5e5e5',
},
titleRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 20,
  marginBottom: 10,
},
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  appTagline: {
    fontSize: 10,
    color: '#666',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  languageButton: {
    color: '#666',
    fontSize: 14,
  },
  signInButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  signInText: {
    color: '#666',
    fontSize: 14,
  },
  signUpButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2196F3',
  },
  signUpText: {
    color: '#fff',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backButton: {
   // marginTop: 20,
   // marginBottom: 10,
  },
  titleSection: {
    marginBottom: 25,
  },
mainTitle: {
  fontSize: 28,
  fontWeight: 'bold',
  color: '#2196F3',
  marginLeft: 15, // Add this line - space between arrow and title
},
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  subtitleItalic: {
    fontStyle: 'italic',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 55,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#60a899',
    backgroundColor: '#fff',
    gap: 5,
  },
  filterText: {
    color: '#60a899',
    fontSize: 12,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 55,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#60a899',
    backgroundColor: '#fff',
    gap: 5,
  },
  sortText: {
    color: '#60a899',
    fontSize: 12,
  },
  therapistsList: {
    gap: 20,
    paddingBottom: 30,
  },
});
