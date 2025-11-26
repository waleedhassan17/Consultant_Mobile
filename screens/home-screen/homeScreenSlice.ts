import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../store/createAppSlice";
import { Therapist } from "../../models/therapist";
import { fetchTherapists } from "../../networks/therapist/therapistapi";
import { LanguageStorage, Language } from "../../utils/language-storage/languageStorage";

export type SortOption = "default" | "price-low" | "price-high" | "rating" | "sessions";

export interface FilterState {
  availability: {
    today: boolean;
    thisWeek: boolean;
    specificDate: string | null;
  };
  areasOfInterest: string[];
  duration: 'all' | '30min' | '60min';
  therapistGender: 'all' | 'male' | 'female';
  ratings: number;
  language: string;
  country: string;
  sessionFees: {
    min: number;
    max: number;
  };
  canPrescribeMedication: {
    psychiatrist: boolean;
    psychologist: boolean;
  };
  takesInsuranceProceeds: boolean;
  acceptBundles: boolean;
}

export const defaultFilters: FilterState = {
  availability: {
    today: false,
    thisWeek: false,
    specificDate: null,
  },
  areasOfInterest: [],
  duration: 'all',
  therapistGender: 'all',
  ratings: 0,
  language: '',
  country: '',
  sessionFees: {
    min: 0,
    max: 10000,
  },
  canPrescribeMedication: {
    psychiatrist: false,
    psychologist: false,
  },
  takesInsuranceProceeds: false,
  acceptBundles: false,
};

export interface HomeScreenState {
  message: string;
  searchQuery: string;
  filterActive: boolean;
  filters: FilterState;
  therapists: Therapist[];
  loading: boolean;
  error: string | null;
  language: Language;
  languageLoaded: boolean;
  sortOption: SortOption;
}

const initialState: HomeScreenState = {
  message: "Hello Pakistan",
  searchQuery: "",
  filterActive: false,
  filters: defaultFilters,
  therapists: [],
  loading: false,
  error: null,
  language: 'en',
  languageLoaded: false,
  sortOption: 'default',
};

// Helper function to check if any filters are active
const hasActiveFilters = (filters: FilterState): boolean => {
  return (
    filters.availability.today ||
    filters.availability.thisWeek ||
    filters.availability.specificDate !== null ||
    filters.areasOfInterest.length > 0 ||
    filters.duration !== 'all' ||
    filters.therapistGender !== 'all' ||
    filters.ratings > 0 ||
    filters.language.trim() !== '' ||
    filters.country.trim() !== '' ||
    filters.sessionFees.min > 0 ||
    filters.sessionFees.max < 10000 ||
    filters.canPrescribeMedication.psychiatrist ||
    filters.canPrescribeMedication.psychologist ||
    filters.takesInsuranceProceeds ||
    filters.acceptBundles
  );
};

// Helper function to check if date is today
const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

// Helper function to check if date is this week
const isThisWeek = (date: Date): boolean => {
  const today = new Date();
  const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const lastDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
  return date >= firstDayOfWeek && date <= lastDayOfWeek;
};

// Helper function to check if therapist matches date filter
const matchesDateFilter = (therapist: Therapist, filters: FilterState): boolean => {
  const { today, thisWeek, specificDate } = filters.availability;
  
  // If no date filters are active, pass all therapists
  if (!today && !thisWeek && !specificDate) return true;
  
  // For now, we'll check against current date
  // In production, you would check therapist.availableSlots
  const currentDate = new Date();
  
  if (today && isToday(currentDate)) return true;
  if (thisWeek && isThisWeek(currentDate)) return true;
  if (specificDate) {
    const selectedDate = new Date(specificDate);
    // In production, check if therapist has availability on this date
    return true; // Placeholder
  }
  
  return false;
};

// Helper function to apply all filters to therapists
const applyFilters = (therapists: Therapist[], filters: FilterState): Therapist[] => {
  console.log(`🔍 Applying filters to ${therapists.length} therapists`);
  console.log('Active filters:', JSON.stringify(filters, null, 2));
  
  // If no filters are active, return all therapists
  if (!hasActiveFilters(filters)) {
    console.log('✅ No active filters, returning all therapists');
    return therapists;
  }

  const filtered = therapists.filter((therapist) => {
    // Date filter
    if (!matchesDateFilter(therapist, filters)) {
      console.log(`❌ ${therapist.name} filtered by date`);
      return false;
    }
    
    // Duration filter
    if (filters.duration !== 'all') {
      // Assuming therapist offers both 30min and 60min sessions
      // You can add a 'durations' field to Therapist model if needed
      // For now, we'll pass all therapists
    }
    
    // Gender filter
    if (filters.therapistGender !== 'all') {
      // You'll need to add gender field to your Therapist model
      // Placeholder: assuming all therapists match
      // if (therapist.gender !== filters.therapistGender) return false;
    }
    
    // Ratings filter
    if (filters.ratings > 0) {
      if (therapist.rating < filters.ratings) {
        console.log(`❌ ${therapist.name} filtered by rating (${therapist.rating} < ${filters.ratings})`);
        return false;
      }
    }
    
    // Session fees filter
    if (filters.sessionFees.min > 0 || filters.sessionFees.max < 10000) {
      const price = parseFloat(therapist.price60.replace(/[^\d.]/g, ''));
      if (price < filters.sessionFees.min || price > filters.sessionFees.max) {
        console.log(`❌ ${therapist.name} filtered by price (${price} not in ${filters.sessionFees.min}-${filters.sessionFees.max})`);
        return false;
      }
    }
    
    // Language filter
    if (filters.language && filters.language.trim() !== '') {
      // Placeholder: You'll need to add languages field to Therapist model
      // const therapistLanguages = therapist.languages || [];
      // if (!therapistLanguages.some(lang => 
      //   lang.toLowerCase().includes(filters.language.toLowerCase())
      // )) return false;
    }
    
    // Country filter
    if (filters.country && filters.country.trim() !== '') {
      // Placeholder: You'll need to add country field to Therapist model
      // if (therapist.country?.toLowerCase() !== filters.country.toLowerCase()) return false;
    }
    
    // Areas of interest filter
    if (filters.areasOfInterest.length > 0) {
      const hasMatchingInterest = filters.areasOfInterest.some(interest =>
        therapist.interests?.some(ti => 
          ti.toLowerCase().includes(interest.toLowerCase())
        ) || therapist.specialty?.toLowerCase().includes(interest.toLowerCase())
      );
      if (!hasMatchingInterest) {
        console.log(`❌ ${therapist.name} filtered by interests`);
        return false;
      }
    }
    
    // Medication prescription filters
    if (filters.canPrescribeMedication.psychiatrist || filters.canPrescribeMedication.psychologist) {
      // Placeholder: You'll need to add profession field to Therapist model
      // if (filters.canPrescribeMedication.psychiatrist && therapist.profession !== 'psychiatrist') return false;
      // if (filters.canPrescribeMedication.psychologist && therapist.profession !== 'psychologist') return false;
    }
    
    // Insurance filter
    if (filters.takesInsuranceProceeds) {
      // Placeholder: You'll need to add takesInsurance field to Therapist model
      // if (!therapist.takesInsurance) return false;
    }
    
    // Bundles filter
    if (filters.acceptBundles) {
      // Placeholder: You'll need to add acceptsBundles field to Therapist model
      // if (!therapist.acceptsBundles) return false;
    }
    
    console.log(`✅ ${therapist.name} passed all filters`);
    return true;
  });
  
  console.log(`🔍 Filtered down to ${filtered.length} therapists`);
  return filtered;
};

export const homeScreenSlice = createAppSlice({
  name: "homeScreen",
  initialState,
  reducers: (create) => ({
    setMessage: create.reducer((state, action: PayloadAction<string>) => {
      state.message = action.payload;
    }),
    setSearchQuery: create.reducer((state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    }),
    toggleFilter: create.reducer((state) => {
      state.filterActive = !state.filterActive;
    }),
    setFilters: create.reducer((state, action: PayloadAction<FilterState>) => {
      state.filters = action.payload;
      state.filterActive = hasActiveFilters(action.payload);
      console.log('✅ Filters updated:', action.payload);
      console.log('Filter active:', state.filterActive);
    }),
    resetFilters: create.reducer((state) => {
      state.filters = defaultFilters;
      state.filterActive = false;
      console.log('✅ Filters reset to default');
    }),
    addTherapist: create.reducer((state, action: PayloadAction<Therapist>) => {
      state.therapists.push(action.payload);
    }),
    setLanguage: create.reducer((state, action: PayloadAction<Language>) => {
      state.language = action.payload;
    }),
    setLanguageLoaded: create.reducer((state, action: PayloadAction<boolean>) => {
      state.languageLoaded = action.payload;
    }),
    setSortOption: create.reducer((state, action: PayloadAction<SortOption>) => {
      state.sortOption = action.payload;
    }),
    updateTherapist: create.reducer(
      (state, action: PayloadAction<{ id: number; updates: Partial<Therapist> }>) => {
        const { id, updates } = action.payload;
        const index = state.therapists.findIndex((t) => t.id === id);
        if (index !== -1) {
          state.therapists[index] = {
            ...state.therapists[index],
            ...updates,
          };
        }
      }
    ),
    setLoading: create.reducer((state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    }),
    setError: create.reducer((state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }),
    setTherapists: create.reducer((state, action: PayloadAction<Therapist[]>) => {
      state.therapists = action.payload;
    }),
    loadTherapists: create.asyncThunk(
      async (language: Language | undefined, { getState }) => {
        const state = getState() as { homeScreen: HomeScreenState };
        const lang = language || state.homeScreen.language;
        
        console.log(`🔄 Starting loadTherapists for language: ${lang}`);
        
        try {
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout - taking too long')), 30000)
          );
          
          const apiPromise = fetchTherapists(lang);
          
          const rawResponse = await Promise.race([apiPromise, timeoutPromise]) as any[];
          
          console.log(`✅ API returned ${rawResponse?.length || 0} therapists`);
          
          if (!Array.isArray(rawResponse)) {
            console.error('❌ Invalid response type:', typeof rawResponse);
            throw new Error('API did not return an array');
          }
          
          return rawResponse;
        } catch (error: any) {
          console.error('❌ loadTherapists error:', error);
          throw error;
        }
      },
      {
        pending: (state) => {
          console.log('⏳ loadTherapists: pending');
          state.loading = true;
          state.error = null;
        },
        fulfilled: (state, action: PayloadAction<any[]>) => {
          console.log('✅ loadTherapists: fulfilled');
          
          try {
            const serializedTherapists = action.payload.map((t: any) => 
              therapistResponseSerializer(t)
            );
            
            state.therapists = serializedTherapists;
            state.loading = false;
            state.error = null;
            
            console.log(`✅ Loaded ${serializedTherapists.length} therapists successfully`);
          } catch (serializationError: any) {
            console.error('❌ Serialization error:', serializationError);
            state.loading = false;
            state.error = 'Failed to process therapist data';
            state.therapists = [];
          }
        },
        rejected: (state, action) => {
          console.error('❌ loadTherapists: rejected');
          console.error('Error:', action.error);
          
          state.loading = false;
          state.error = action.error.message || "Failed to load therapists";
          
          console.log(`Keeping ${state.therapists.length} existing therapists`);
        },
      }
    ),
  }),

  selectors: {
    selectMessage: (state) => state.message,
    selectSearchQuery: (state) => state.searchQuery,
    selectFilterActive: (state) => state.filterActive,
    selectFilters: (state) => state.filters,
    selectAllTherapists: (state) => state.therapists,
    selectLoading: (state) => state.loading,
    selectError: (state) => state.error,
    selectLanguage: (state) => state.language,
    selectLanguageLoaded: (state) => state.languageLoaded,
    selectSortOption: (state) => state.sortOption,
    selectTherapists: (state) => {
      let therapists = state.therapists;
      
      console.log(`🔍 selectTherapists: Starting with ${therapists.length} therapists`);
      
      // Apply filters first
      therapists = applyFilters(therapists, state.filters);
      console.log(`🔍 selectTherapists: After filters ${therapists.length} therapists`);
      
      // Then apply search query
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        therapists = therapists.filter(
          (therapist) =>
            therapist.name.toLowerCase().includes(query) ||
            therapist.specialty.toLowerCase().includes(query) ||
            therapist.interests?.some((interest) =>
              interest.toLowerCase().includes(query)
            )
        );
        console.log(`🔍 selectTherapists: After search ${therapists.length} therapists`);
      }
      
      return therapists;
    },
    selectTherapistById: (state) => (id: number) =>
      state.therapists.find((therapist) => therapist.id === id),
  },
});

export const {
  setMessage,
  setSearchQuery,
  toggleFilter,
  setFilters,
  resetFilters,
  addTherapist,
  updateTherapist,
  setLoading,
  setError,
  setTherapists,
  setLanguage,
  setLanguageLoaded,
  setSortOption,
  loadTherapists,
} = homeScreenSlice.actions;

export const {
  selectMessage,
  selectSearchQuery,
  selectFilterActive,
  selectFilters,
  selectAllTherapists,
  selectLoading,
  selectError,
  selectTherapists,
  selectTherapistById,
  selectLanguage,
  selectLanguageLoaded,
  selectSortOption,
} = homeScreenSlice.selectors;

export default homeScreenSlice.reducer;

export const initializeLanguage = () => async (dispatch: any) => {
  try {
    const savedLanguage = await LanguageStorage.getLanguage();
    dispatch(setLanguage(savedLanguage));
    dispatch(setLanguageLoaded(true));
    console.log(`✅ Initialized language: ${savedLanguage}`);
  } catch (error) {
    console.error('❌ Failed to initialize language:', error);
    try {
      await LanguageStorage.saveLanguage('en');
    } catch (saveError) {
      console.error('❌ Failed to save fallback language:', saveError);
    }
    dispatch(setLanguage('en'));
    dispatch(setLanguageLoaded(true));
  }
};

export const toggleLanguage = () => async (dispatch: any, getState: any) => {
  try {
    const currentLanguage = selectLanguage(getState());
    const newLanguage: Language = currentLanguage === 'en' ? 'ar' : 'en';
    
    console.log(`🔄 Toggling language from ${currentLanguage} to ${newLanguage}`);
    
    await LanguageStorage.saveLanguage(newLanguage);
    dispatch(setLanguage(newLanguage));
    await dispatch(loadTherapists(newLanguage));
    
    console.log(`✅ Language toggled to: ${newLanguage}`);
  } catch (error) {
    console.error('❌ Failed to toggle language:', error);
  }
};

// Export helper to check if filters are active (for UI indicators)
export const checkFiltersActive = (filters: FilterState): boolean => {
  return hasActiveFilters(filters);
};