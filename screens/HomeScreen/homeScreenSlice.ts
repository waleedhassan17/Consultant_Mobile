import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../store/createAppSlice";
import { Therapist } from "../../models/therapist";
import { fetchTherapists } from "../../networks/Therapist/therapistapi"; // ✅ API call

export interface HomeScreenState {
  message: string;
  searchQuery: string;
  filterActive: boolean;
  therapists: Therapist[];
  loading: boolean;       // ✅ Added loading state
  error: string | null;   // ✅ Added error state
}

const initialState: HomeScreenState = {
  message: "Hello Pakistan",
  searchQuery: "",
  filterActive: false,
  therapists: [],
  loading: false,
  error: null,
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

    // ✅ Loading & error state reducers
    setLoading: create.reducer((state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    }),
    setError: create.reducer((state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }),
    setTherapists: create.reducer((state, action: PayloadAction<Therapist[]>) => {
      state.therapists = action.payload;
    }),
  }),

  selectors: {
    selectMessage: (state) => state.message,
    selectSearchQuery: (state) => state.searchQuery,
    selectFilterActive: (state) => state.filterActive,
    selectAllTherapists: (state) => state.therapists,
    selectLoading: (state) => state.loading,
    selectError: (state) => state.error,
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
} = homeScreenSlice.selectors;

export default homeScreenSlice.reducer;

/**
 * ✅ Thunk to fetch therapists from API
 */
export const loadTherapists = () => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));
    const data = await fetchTherapists();

    console.log("Fetched therapists:", data); // 👀 check in console

    if (!data || data.length === 0) {
      throw new Error("No therapists returned from API");
    }

    dispatch(setTherapists(data));
  } catch (error: any) {
    console.error("Failed to fetch therapists:", error);
    dispatch(setError(error.message || "Failed to load therapists"));

    // ✅ Fallback so screen isn't empty
    dispatch(
      setTherapists([
        {
          id: 1,
          name: "Fallback Therapist",
          specialty: "Psychiatrist",
          rating: 4.8,
          reviewCount: 12,
          sessions: "200",
          interests: ["Stress", "Anxiety"],
          nextAppointment: "Tomorrow at 5:00 PM",
          price60: "99 USD",
          price30: "50 USD",
          image: require("../../assets/profile.jpg"),
        },
      ])
    );
  } finally {
    dispatch(setLoading(false));
  }
};