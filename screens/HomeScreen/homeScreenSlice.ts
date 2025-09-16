import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ImageSourcePropType } from 'react-native';
// import profileImage from "../../assets/profile.jpg";

// Types
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

export interface HomeScreenState {
  searchQuery: string;
  filterActive: boolean;
  therapists: Therapist[];
}

export interface RootState {
  homeScreen: HomeScreenState;
}

const initialState: HomeScreenState = {
  searchQuery: '',
  filterActive: false,
  therapists: [
    {
      id: 1,
      name: 'Ass. prof. Abdur- Rehman Gujjar',
      specialty: 'Psychiatrist',
      rating: 4.95,
      reviewCount: 78,
      sessions: '500',
      interests: ['Anxiety Disorders', 'Depression'],
      nextAppointment: 'Tuesday, Sep.16 at 11:30 PM',
      price60: '129 USD',
      price30: '65 USD',
      image: require('../../assets/profile.jpg'),
    },
    // You can add more therapists here
  ],
};

const homeScreenSlice = createSlice({
  name: 'homeScreen',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    toggleFilter: (state) => {
      state.filterActive = !state.filterActive;
    },
    addTherapist: (state, action: PayloadAction<Therapist>) => {
      state.therapists.push(action.payload);
    },
    updateTherapist: (
      state, 
      action: PayloadAction<{ id: number; updates: Partial<Therapist> }>
    ) => {
      const { id, updates } = action.payload;
      const therapistIndex = state.therapists.findIndex((t) => t.id === id);
      if (therapistIndex !== -1) {
        state.therapists[therapistIndex] = { 
          ...state.therapists[therapistIndex], 
          ...updates 
        };
      }
    },
  },
});

// Selectors
export const selectSearchQuery = (state: RootState): string => 
  state.homeScreen.searchQuery;

export const selectFilterActive = (state: RootState): boolean => 
  state.homeScreen.filterActive;

export const selectTherapists = (state: RootState): Therapist[] => {
  const { searchQuery, therapists } = state.homeScreen;
  if (!searchQuery) return therapists;
  
  return therapists.filter((therapist) => 
    therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    therapist.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    therapist.interests.some((interest) => 
      interest.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
};

export const selectAllTherapists = (state: RootState): Therapist[] => 
  state.homeScreen.therapists;

export const selectTherapistById = (state: RootState) => (id: number): Therapist | undefined =>
  state.homeScreen.therapists.find((therapist) => therapist.id === id);

export const { 
  setSearchQuery, 
  toggleFilter, 
  addTherapist, 
  updateTherapist 
} = homeScreenSlice.actions;

export default homeScreenSlice.reducer;