import React, { JSX } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  SafeAreaView,
  ImageSourcePropType
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../hooks/useReduxHooks';
import { 
setSearchQuery, 
toggleFilter 
} from './homeScreenSlice';
import { selectSearchQuery, selectTherapists } from './homeScreenSlice';

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BaseRouteNames } from "../../navigations-maps/Base";

type NavigationProp = NativeStackNavigationProp<any>; // Or use a proper param list if you have one



export interface Therapist {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  sessions: string;
  interests: string[];
  nextAppointment: string;
  price60: string;
  price30: string;
  image: ImageSourcePropType;
}

export default function HomeScreen(): JSX.Element {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector(selectSearchQuery);
  const therapists = useAppSelector(selectTherapists);
  const navigation = useNavigation<NavigationProp>();

  

  const handleSearch = (text: string): void => {
    dispatch(setSearchQuery(text));
  };

  const renderStars = (rating: number): JSX.Element[] => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name="star"
        size={14}
        color={index < rating ? "#FFD700" : "#E5E5E5"}
      />
    ));
  };

  const renderTherapistCard = (therapist: Therapist): JSX.Element => (
    <View key={therapist.id} style={styles.therapistCard}>
      <View style={styles.therapistHeader}>
        <Image 
          source={therapist.image} 
          style={styles.therapistImage}
        />
        <View style={styles.therapistInfo}>
          <Text style={styles.therapistName}>{therapist.name}</Text>
          <Text style={styles.therapistSpecialty}>{therapist.specialty}</Text>
          
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {renderStars(therapist.rating)}
            </View>
            <View style={{ flexDirection: "column", alignItems: "flex-start" }}>
  {/* Sessions */}
              <Text style={styles.sessionCount}>
                <Ionicons name="calendar" size={16} color="#2196F3" style={styles.topTherapistIcon} /> 
                {therapist.sessions}+ Sessions
              </Text>

              {/* Top Therapist */}
              {therapist.id === 2 && (  // Only show for therapist with id 1}
              <View style={styles.topTherapistContainer}>
                <Image 
                  source={require('../../assets/top.png')} 
                  style={styles.topTherapistIcon} 
                />
                <Text style={styles.toptherapist}>Top therapist</Text>
              </View>)}
            </View>


             
            
          </View>
          
          <Text style={styles.reviewText}>
            {therapist.rating} ({therapist.reviewCount} Reviews)
          </Text>
        </View>
      </View>
      
      <View style={styles.interestsContainer}>
        <Text style={styles.interestsTitle}>Interests:</Text>
        <View style={styles.interestsTags}>
          {therapist.interests.map((interest: string, index: number) => (
            <View key={index} style={styles.interestTag}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.appointmentInfo}>
        <Ionicons name="time" size={16} color="#666" />
        <Text style={styles.appointmentText}>
          Nearest appointment: {therapist.nextAppointment}
        </Text>
      </View>
      
      <View style={styles.pricingContainer}>
        <Ionicons name="card" size={16} color="#2196F3" />
        <Text style={styles.pricingText}>
          {therapist.price60} / 60 Min    {therapist.price30} / 30 Min
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
      <TouchableOpacity 
        style={styles.viewProfileButton}
        onPress={() => navigation.navigate(BaseRouteNames.TherapistProfile)}
      >
        <Text style={styles.viewProfileText}>View Profile</Text>
      </TouchableOpacity>
        <TouchableOpacity style={styles.bookNowButton}>
          <Text style={styles.bookNowText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
          <TouchableOpacity style={styles.signInButton}>
            <Text style={styles.signInText}>Sign in</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signUpButton}>
            <Text style={styles.signUpText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#666" />
        </TouchableOpacity>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Our Therapists</Text>
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
            <Ionicons name="options" size={16} color="#666" />
            <Text style={styles.filterText}>Filters</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.sortButton}>
            <Text style={styles.sortText}>Sort by</Text>
            <Ionicons name="chevron-down" size={16} color="#2196F3" />
          </TouchableOpacity>
        </View>

        {/* Therapists List */}
        <View style={styles.therapistsList}>
          {therapists.map(renderTherapistCard)}
          {therapists.map(renderTherapistCard)}
          {therapists.map(renderTherapistCard)}
          {therapists.map(renderTherapistCard)}
          {therapists.map(renderTherapistCard)}
          {therapists.map(renderTherapistCard)}
        </View>
      </ScrollView>
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
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
  topTherapistContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4, // adds some spacing below sessions
    gap: 4,       // space between icon and text
  },
  topTherapistIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',

  },
  toptherapist: {
    color: '#fcb045',
    fontSize: 12,
    fontWeight: '500',
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
    marginTop: 20,
    marginBottom: 10,
  },
  titleSection: {
    marginBottom: 25,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
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
    shadowOffset: {
      width: 0,
      height: 1,
    },
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    backgroundColor: '#fff',
    gap: 8,
  },
  filterText: {
    color: '#666',
    fontSize: 14,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    backgroundColor: '#fff',
    gap: 8,
  },
  sortText: {
    color: '#2196F3',
    fontSize: 14,
  },
  therapistsList: {
    gap: 20,
    paddingBottom: 30,
  },
  therapistCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  therapistHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  therapistImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  therapistInfo: {
    flex: 1,
  },
  therapistName: {
    fontSize: 12,
    fontWeight: 500,
    color: '#4d4d4f',
    marginBottom: 4,
    fontFamily: 'Montserrat',
  },
  therapistSpecialty: {
    fontSize: 14,
    color: '#2196F3',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  sessionCount: {
    fontSize: 12,
    color: '#666',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // space between icon and text
  },
  reviewText: {
    fontSize: 12,
    color: '#666',
  },
  interestsContainer: {
    marginBottom: 15,
  },
  interestsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  interestsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 500,
    backgroundColor: '#6cca871a',
  },
  interestText: {
    fontSize: 12,
    color: '#60a899',
  },
  appointmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  appointmentText: {
    fontSize: 14,
    color: '#666',
  },
  pricingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  pricingText: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  viewProfileButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    // borderWidth: 1,
    // borderColor: '#4caf50',
    alignItems: 'center',
  },
  viewProfileText: {
    color: '#4caf50',
    fontSize: 14,
    fontWeight: '600',
  },
  bookNowButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  bookNowText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});