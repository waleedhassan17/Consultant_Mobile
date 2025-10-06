import React, { JSX, useEffect, useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  Image, ScrollView, SafeAreaView, ActivityIndicator, Animated, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../hooks/useReduxHooks';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  setSearchQuery, toggleFilter, loadTherapists,
  selectSearchQuery, selectTherapists, selectLoading, 
  selectError, toggleLanguage, selectLanguage,
  initializeLanguage, selectLanguageLoaded,
} from './homeScreenSlice';
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BaseRouteNames } from "../../navigations-maps/base";
import { Therapist } from '../../models/therapist';

type NavigationProp = NativeStackNavigationProp<any>;

export default function HomeScreen(): JSX.Element {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp>();
  const { t, isRTL } = useTranslation();

  const searchQuery = useAppSelector(selectSearchQuery);
  const therapists = useAppSelector(selectTherapists);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const language = useAppSelector(selectLanguage);
  const languageLoaded = useAppSelector(selectLanguageLoaded);
  
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);

  // Replicate therapists for testing scroll functionality
  const replicatedTherapists = [...therapists, ...therapists, ...therapists, ...therapists];

  // Initialize language from AsyncStorage on app start
  useEffect(() => {
    dispatch(initializeLanguage());
  }, [dispatch]);

  // Load therapists after language is loaded
  useEffect(() => {
    if (languageLoaded) {
      dispatch(loadTherapists());
    }
  }, [dispatch, languageLoaded]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    try {
      await dispatch(loadTherapists());
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  // Lazy loading handler
  const handleScroll = useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    
    // Check if user scrolled near the bottom (within 100 pixels)
    const paddingToBottom = 100;
    const isCloseToBottom = 
      layoutMeasurement.height + contentOffset.y >= 
      contentSize.height - paddingToBottom;
    
    if (isCloseToBottom && !isLoadingMore && !loading && !refreshing) {
      loadMoreTherapists();
    }
  }, [isLoadingMore, loading, refreshing]);

  // Load more therapists
  const loadMoreTherapists = useCallback(async () => {
    if (isLoadingMore || loading) return;
    
    setIsLoadingMore(true);
    try {
      await dispatch(loadTherapists());
      setPage(prevPage => prevPage + 1);
    } catch (error) {
      console.error('Load more error:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [dispatch, isLoadingMore, loading]);

  const handleLanguageToggle = (): void => {
    dispatch(toggleLanguage());
  };

  const handleSearch = (text: string): void => {
    dispatch(setSearchQuery(text));
  };

  const renderStars = (rating: number): JSX.Element[] =>
    Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name="star"
        size={14}
        color={index < rating ? "#FFD700" : "#E5E5E5"}
      />
    ));

  const renderTherapistCard = (therapist: Therapist, index: number): JSX.Element => (
    <View key={`${therapist.id}-${index}`} style={styles.therapistCard}>
      <View style={[styles.therapistHeader, isRTL && styles.therapistHeaderRTL]}>
        <Image 
          source={therapist.image} 
          style={[styles.therapistImage, isRTL && { marginLeft: 15, marginRight: 0 }]}
        />
        <View style={styles.therapistInfo}>
          <Text style={[styles.therapistName, isRTL && styles.textRTL]}>{therapist.name}</Text>
          <Text style={[styles.therapistSpecialty, isRTL && styles.textRTL]}>{therapist.specialty}</Text>
          
          <View style={styles.ratingContainer}>
            <View style={[styles.starsContainer, isRTL && styles.starsContainerRTL]}>
              {renderStars(therapist.rating)}
            </View>
            <View style={{ flexDirection: "column", alignItems: isRTL ? "flex-end" : "flex-start" }}>
              <Text style={[styles.sessionCount, isRTL && styles.textRTL]}>
                <Ionicons name="calendar" size={16} color="#2196F3" style={styles.topTherapistIcon} /> 
                {therapist.sessions}+ {t('home.sessions')}
              </Text>

              {therapist.id === 2 && (
                <View style={[styles.topTherapistContainer, isRTL && styles.topTherapistContainerRTL]}>
                  <Image 
                    source={require('../../assets/top.png')} 
                    style={styles.topTherapistIcon} 
                  />
                  <Text style={styles.toptherapist}>{t('home.topTherapist')}</Text>
                </View>
              )}
            </View>
          </View>
          
          <Text style={[styles.reviewText, isRTL && styles.textRTL]}>
            {therapist.rating} ({therapist.reviewCount} {t('home.reviews')})
          </Text>
        </View>
      </View>
      
      <View style={styles.interestsContainer}>
        <Text style={[styles.interestsTitle, isRTL && styles.textRTL]}>{t('home.interests')}</Text>
        <View style={[styles.interestsTags, isRTL && styles.interestsTagsRTL]}>
          {therapist.interests.map((interest: string, idx: number) => (
            <View key={idx} style={styles.interestTag}>
              <Text style={[styles.interestText, isRTL && styles.textRTL]}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={[styles.appointmentInfo, isRTL && styles.appointmentInfoRTL]}>
        <Ionicons name="time" size={16} color="#666" />
        <Text style={[styles.appointmentText, isRTL && styles.textRTL]}>
          {t('home.nearestAppointment')} {therapist.nextAppointment}
        </Text>
      </View>
      
      <View style={[styles.pricingContainer, isRTL && styles.pricingContainerRTL]}>
        <Ionicons name="card" size={16} color="#2196F3" />
        <Text style={[styles.pricingText, isRTL && styles.textRTL]}>
          {therapist.price60} / 60 Min    {therapist.price30} / 30 Min
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        // In the renderTherapistCard function, update the View Profile button:

        <TouchableOpacity 
          style={styles.viewProfileButton}
          onPress={() => navigation.navigate(BaseRouteNames.TherapistProfile, { 
          therapistId: therapist.id 
        })}
        >
          <Text style={styles.viewProfileText}>{t('home.viewProfile')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bookNowButton}>
          <Text style={styles.bookNowText}>{t('home.bookNow')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Show loading while language is being initialized
  if (!languageLoaded) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Initializing...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.headerLeft, isRTL && styles.headerLeftRTL]}>
          <View style={styles.logoContainer}>
            <Ionicons name="sync" size={24} color="#2196F3" />
          </View>
          <View>
            <Text style={[styles.appName, isRTL && styles.textRTL]}>{t('header.appName')}</Text>
            <Text style={[styles.appTagline, isRTL && styles.textRTL]}>{t('header.appTagline')}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.languageToggleContainer} 
            onPress={handleLanguageToggle}
            activeOpacity={0.8}
          >
            <Animated.View
              style={[
                styles.slider,
                {
                  transform: [
                    {
                      translateX: language === 'en' ? 0 : 56,
                    },
                  ],
                },
              ]}
            />
            <View style={styles.half}>
              <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>
                English
              </Text>
            </View>
            <View style={styles.half}>
              <Text style={[styles.langText, language === 'ar' && styles.langTextActive]}>
                عربي
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2196F3']}
            tintColor="#2196F3"
            title="Pull to refresh"
            titleColor="#666"
          />
        }
      >
        <View style={[styles.titleRow, isRTL && styles.titleRowRTL]}>
          <TouchableOpacity style={styles.backButton} onPress={navigation.goBack}>
            <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color="#666" />
          </TouchableOpacity>
          <Text style={[styles.mainTitle, isRTL && styles.mainTitleRTL]}>{t('home.title')}</Text>
        </View>

        <View style={styles.titleSection}>
          <Text style={[styles.subtitle, isRTL && styles.textRTL]}>
            {t('home.subtitle')}
            <Text style={styles.subtitleItalic}>
              {t('home.subtitleItalic')}
            </Text>
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={[styles.searchIcon, isRTL && { marginLeft: 10, marginRight: 0 }]} />
          <TextInput
            style={[styles.searchInput, isRTL && styles.searchInputRTL]}
            placeholder={t('home.searchPlaceholder')}
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#999"
          />
        </View>

        <View style={[styles.filterContainer, isRTL && styles.filterContainerRTL]}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => dispatch(toggleFilter())}
          >
            <Ionicons name="options" size={16} color="#666" />
            <Text style={[styles.filterText, isRTL && styles.textRTL]}>{t('home.filters')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.sortButton}>
            <Text style={[styles.sortText, isRTL && styles.textRTL]}>{t('home.sortBy')}</Text>
            <Ionicons name="chevron-down" size={16} color="#2196F3" />
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {loading && !refreshing && therapists.length === 0 ? (
          <View style={styles.initialLoadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Loading therapists...</Text>
          </View>
        ) : (
          <>
            <View style={styles.therapistsList}>
              {replicatedTherapists.map((therapist, index) => renderTherapistCard(therapist, index))}
            </View>

            {isLoadingMore && (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color="#2196F3" />
                <Text style={styles.loadingMoreText}>Loading more therapists...</Text>
              </View>
            )}
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
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
  titleRowRTL: {
    flexDirection: 'row-reverse',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLeftRTL: {
    flexDirection: 'row-reverse',
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
    marginTop: 4,
    gap: 4,
  },
  topTherapistContainerRTL: {
    flexDirection: 'row-reverse',
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
  },
  languageToggleContainer: {
    width: 120,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  slider: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: '48%',
    height: '90%',
    borderRadius: 18,
    backgroundColor: '#2196F3',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  half: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  langText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 0.3,
  },
  langTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backButton: {},
  titleSection: {
    marginBottom: 25,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    marginLeft: 15,
  },
  mainTitleRTL: {
    marginRight: 15,
    marginLeft: 0,
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
  searchInputRTL: {
    textAlign: 'right',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  filterContainerRTL: {
    flexDirection: 'row-reverse',
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
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
  },
  initialLoadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  therapistHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  therapistHeaderRTL: {
    flexDirection: 'row-reverse',
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
    fontWeight: '500',
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
  starsContainerRTL: {
    flexDirection: 'row-reverse',
  },
  sessionCount: {
    fontSize: 12,
    color: '#666',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  interestsTagsRTL: {
    flexDirection: 'row-reverse',
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
  appointmentInfoRTL: {
    flexDirection: 'row-reverse',
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
  pricingContainerRTL: {
    flexDirection: 'row-reverse',
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
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  loadingMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loadingMoreText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
});