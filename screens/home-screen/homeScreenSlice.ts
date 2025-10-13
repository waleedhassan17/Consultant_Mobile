import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../store/createAppSlice";
import { Therapist } from "../../models/therapist";
import { fetchTherapists } from "../../networks/therapist/therapistapi";
import { therapistResponseSerializer } from "../../serializers/therapistSerializer";
import { LanguageStorage, Language } from "../../utils/language-storage/languageStorage";

export type SortOption = "default" | "price-low" | "price-high" | "rating" | "sessions";

export interface HomeScreenState {
  message: string;
  searchQuery: string;
  filterActive: boolean;
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
  therapists: [],
  loading: false,
  error: null,
  language: 'en',
  languageLoaded: false,
  sortOption: 'default',
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
    // Async thunk for loading therapists
    loadTherapists: create.asyncThunk(
      async (language: Language | undefined, { getState }) => {
        const state = getState() as { homeScreen: HomeScreenState };
        // Use provided language or get from state
        const lang = language || state.homeScreen.language;
        
        // Just call API and return raw response
        return await fetchTherapists(lang);
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        fulfilled: (state, action: PayloadAction<any[]>) => {
          // Serialize HERE in fulfilled
          const serializedTherapists = action.payload.map((t: any) => 
            therapistResponseSerializer(t)
          );
          
          state.therapists = serializedTherapists;
          state.loading = false;
          console.log(`Loaded ${serializedTherapists.length} therapists`);
        },
        rejected: (state, action) => {
          state.loading = false;
          state.error = action.error.message || "Failed to load therapists";
          console.error("Failed to fetch therapists:", action.error);
          
          // Keep existing therapists if any (for refresh scenarios)
          // Otherwise leave empty array - let UI handle empty state properly
          // state.therapists = []; // Not needed, keeps existing state
        },
      }
    ),
  }),

  selectors: {
    selectMessage: (state) => state.message,
    selectSearchQuery: (state) => state.searchQuery,
    selectFilterActive: (state) => state.filterActive,
    selectAllTherapists: (state) => state.therapists,
    selectLoading: (state) => state.loading,
    selectError: (state) => state.error,
    selectLanguage: (state) => state.language,
    selectLanguageLoaded: (state) => state.languageLoaded,
    selectSortOption: (state) => state.sortOption,
    selectTherapists: (state) => {
      if (!state.searchQuery) return state.therapists;
      return state.therapists.filter(
        (therapist) =>
          therapist.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          therapist.specialty.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          therapist.interests.some((interest) =>
            interest.toLowerCase().includes(state.searchQuery.toLowerCase())
          )
      );
    },
    selectTherapistById: (state) => (id: number) =>
      state.therapists.find((therapist) => therapist.id === id),
  },
});

export const {
  setMessage,
  setSearchQuery,
  toggleFilter,
  addTherapist,
  updateTherapist,
  setLoading,
  setError,
  setTherapists,
  setLanguage,
  setLanguageLoaded,
  setSortOption,
  loadTherapists, //  Export the async thunk
} = homeScreenSlice.actions;

export const {
  selectMessage,
  selectSearchQuery,
  selectFilterActive,
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

/**
 * Thunk to initialize language from AsyncStorage
 */
export const initializeLanguage = () => async (dispatch: any) => {
  try {
    const savedLanguage = await LanguageStorage.getLanguage();
    dispatch(setLanguage(savedLanguage));
    dispatch(setLanguageLoaded(true));
    console.log(`Initialized language: ${savedLanguage}`);
  } catch (error) {
    console.error('Failed to initialize language:', error);
    try {
      await LanguageStorage.saveLanguage('en');
    } catch (saveError) {
      console.error('Failed to save fallback language:', saveError);
    }
    dispatch(setLanguage('en'));
    dispatch(setLanguageLoaded(true));
  }
};

/**
 *  Thunk to toggle language and persist to AsyncStorage
 */
export const toggleLanguage = () => async (dispatch: any, getState: any) => {
  try {
    const currentLanguage = selectLanguage(getState());
    const newLanguage: Language = currentLanguage === 'en' ? 'ar' : 'en';
    
    // Save to AsyncStorage
    await LanguageStorage.saveLanguage(newLanguage);
    
    // Update Redux state
    dispatch(setLanguage(newLanguage));
    
    // Reload therapists with new language
    dispatch(loadTherapists(newLanguage));
    
    console.log(`Language toggled to: ${newLanguage}`);
  } catch (error) {
    console.error('Failed to toggle language:', error);
  }
};