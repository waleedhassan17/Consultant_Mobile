// homeScreenSlice.ts
import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../store/createAppSlice";
import { ImageSourcePropType } from "react-native";

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
  message: string;
  searchQuery: string;
  filterActive: boolean;
  therapists: Therapist[];
}

const initialState: HomeScreenState = {
  message: "Hello Pakistan",
  searchQuery: "",
  filterActive: false,
  therapists: [
    {
      id: 1,
      name: "Ass. prof. Abdur- Rehman Gujjar",
      specialty: "Psychiatrist",
      rating: 4.95,
      reviewCount: 78,
      sessions: "500",
      interests: ["Anxiety Disorders", "Depression"],
      nextAppointment: "Tuesday, Sep.16 at 11:30 PM",
      price60: "129 USD",
      price30: "65 USD",
      image: require("../../assets/profile.jpg"),
    },
    {
      id: 2,
      name: "Ass. prof. Haris Asif",
      specialty: "Psychiatrist",
      rating: 4.9,
      reviewCount: 70,
      sessions: "500",
      interests: ["Anxiety Disorders", "Depression"],
      nextAppointment: "Tuesday, Sep.19 at 9:30 PM",
      price60: "109 USD",
      price30: "50 USD",
      image: require("../../assets/profile2.jpg"),
    },
    // Add more therapists here if needed
  ],
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
  }),

  selectors: {
    selectMessage: (state) => state.message,
    selectSearchQuery: (state) => state.searchQuery,
    selectFilterActive: (state) => state.filterActive,
    selectAllTherapists: (state) => state.therapists,
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
} = homeScreenSlice.actions;

export const {
  selectMessage,
  selectSearchQuery,
  selectFilterActive,
  selectAllTherapists,
  selectTherapists,
  selectTherapistById,
} = homeScreenSlice.selectors;

export default homeScreenSlice.reducer;
