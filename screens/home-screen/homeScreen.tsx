import React, { JSX, useEffect, useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, SafeAreaView, ActivityIndicator, Animated, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../hooks/useReduxHooks';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  setSearchQuery, toggleFilter, loadTherapists,
  selectSearchQuery, selectTherapists, selectLoading, 
  selectError, toggleLanguage, selectLanguage,
  initializeLanguage, selectLanguageLoaded, setSortOption,
  selectSortOption
} from './homeScreenSlice';
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import TherapistCard from '../../custom-components/TherapistCard';
import SortModal from '../../custom-components/SortMenu';

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
  const sortOption = useAppSelector(selectSortOption);
  
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [sortVisible, setSortVisible] = useState(false);

  // Sort therapists based on selected option
  const sortedTherapists = [...therapists].sort((a, b) => {
    switch (sortOption) {
      case "price-low":
        return parseFloat(a.price60.replace(/[^\d.]/g, '')) - parseFloat(b.price60.replace(/[^\d.]/g, ''));
      case "price-high":
        return parseFloat(b.price60.replace(/[^\d.]/g, '')) - parseFloat(a.price60.replace(/[^\d.]/g, ''));
      case "rating":
        return b.rating - a.rating;
      case "sessions":
        return Number(b.sessions) - Number(a.sessions);
      default:
        return 0;
    }
  });

  // Replicate therapists for testing scroll functionality
  const replicatedTherapists = [...sortedTherapists, ...sortedTherapists, ...sortedTherapists];

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

  const handleSortSelect = (option: string): void => {
    dispatch(setSortOption(option));
    setSortVisible(false);
  };

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
      {/* Header */}
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
        {/* Title Row */}
        <View style={[styles.titleRow, isRTL && styles.titleRowRTL]}>
          <TouchableOpacity style={styles.backButton} onPress={navigation.goBack}>
            <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color="#666" />
          </TouchableOpacity>
          <Text style={[styles.mainTitle, isRTL && styles.mainTitleRTL]}>{t('home.title')}</Text>
        </View>

        {/* Subtitle */}
        <View style={styles.titleSection}>
          <Text style={[styles.subtitle, isRTL && styles.textRTL]}>
            {t('home.subtitle')}
            <Text style={styles.subtitleItalic}>
              {t('home.subtitleItalic')}
            </Text>
          </Text>
        </View>

        {/* Search Bar */}
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

        {/* Filter and Sort Buttons */}
        <View style={[styles.filterContainer, isRTL && styles.filterContainerRTL]}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => dispatch(toggleFilter())}
          >
            <Ionicons name="options" size={16} color="#60a899" />
            <Text style={styles.filterText}>{t('home.filters')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.sortButton}
            onPress={() => setSortVisible(true)}
          >
            <Text style={styles.sortText}>{t('home.sortBy')}</Text>
            <Ionicons name="chevron-down" size={16} color="#60a899" />
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Loading State */}
        {loading && !refreshing && therapists.length === 0 ? (
          <View style={styles.initialLoadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Loading therapists...</Text>
          </View>
        ) : (
          <>
            {/* Therapists List using TherapistCard Component */}
            <View style={styles.therapistsList}>
              {replicatedTherapists.map((therapist, index) => (
                <TherapistCard 
                  key={`${therapist.id}-${index}`} 
                  therapist={therapist} 
                />
              ))}
            </View>

            {/* Load More Indicator */}
            {isLoadingMore && (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color="#2196F3" />
                <Text style={styles.loadingMoreText}>Loading more therapists...</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Sort Modal */}
      <SortModal 
        visible={sortVisible} 
        onClose={() => setSortVisible(false)} 
        onSelect={handleSortSelect} 
      />
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