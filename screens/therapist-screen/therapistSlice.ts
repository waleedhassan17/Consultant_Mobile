import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../store/createAppSlice";
import { fetchTherapistDetail } from "../../networks/therapist/therapistProfile";
import { fetchTherapistDetailDummy } from "../../networks/therapist/therapistProfile";
import { TherapistDetail } from "../../models/therapist";
import { therapistDetailResponseSerializer } from "../../serializers/therapistSerializer";
import { Language } from "../../utils/language-storage/languageStorage";

interface TherapistSliceState {
  therapistData: TherapistDetail | null;
  currentCommentIndex: number;
  status: "idle" | "loading" | "failed";
  error: string | null;
  hasLoaded: boolean;
}

const initialState: TherapistSliceState = {
  therapistData: null,
  currentCommentIndex: 0,
  status: "idle",
  error: null,
  hasLoaded: false,
};

export const therapistSlice = createAppSlice({
  name: "therapist",
  initialState,
  reducers: (create) => ({
    setCurrentCommentIndex: create.reducer((state, action: PayloadAction<number>) => {
      if (state.therapistData && state.therapistData.comments.length > 0) {
        state.currentCommentIndex = action.payload;
      }
    }),
    nextComment: create.reducer((state) => {
      if (state.therapistData && state.therapistData.comments.length > 0) {
        state.currentCommentIndex = state.currentCommentIndex === state.therapistData.comments.length - 1 
          ? 0 
          : state.currentCommentIndex + 1;
      }
    }),
    prevComment: create.reducer((state) => {
      if (state.therapistData && state.therapistData.comments.length > 0) {
        state.currentCommentIndex = state.currentCommentIndex === 0 
          ? state.therapistData.comments.length - 1 
          : state.currentCommentIndex - 1;
      }
    }),
    loadTherapistDetail: create.asyncThunk(
      async ({ 
        therapistId, 
        language = 'en' 
      }: { 
        therapistId: number; 
        language?: 'en' | 'ar' 
      }) => {
        // Just call API and return raw response
        return await fetchTherapistDetailDummy(therapistId, language);
      },
      {
        pending: (state) => {
          state.status = "loading";
          state.error = null;
        },
        fulfilled: (state, action: PayloadAction<any>) => {
          // Serialize HERE in fulfilled
          state.therapistData = therapistDetailResponseSerializer(action.payload);
          state.currentCommentIndex = 0;
          state.status = "idle";
          state.hasLoaded = true;
        },
        rejected: (state, action) => {
          state.status = "failed";
          state.error = action.error.message || "Failed to load therapist detail";
        },
      }
    ),
    setTherapistData: create.reducer((state, action: PayloadAction<TherapistDetail>) => {
      state.therapistData = action.payload;
      state.currentCommentIndex = 0; 
      state.status = "idle";
      state.error = null;
    }),
    setLoading: create.reducer((state, action: PayloadAction<boolean>) => {
      state.status = action.payload ? "loading" : "idle";
    }),
    setError: create.reducer((state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.status = "failed";
    }),
    clearError: create.reducer((state) => {
      state.error = null;
      state.status = "idle";
    }),
    resetTherapistData: create.reducer((state) => {
      state.therapistData = null;
      state.currentCommentIndex = 0;
      state.error = null;
      state.status = "idle";
    }),
  }),

  selectors: {
    selectTherapistData: (state) => state.therapistData,
    selectCurrentCommentIndex: (state) => state.currentCommentIndex,
    selectCurrentComment: (state) => {
      if (state.therapistData && state.therapistData.comments.length > 0) {
        return state.therapistData.comments[state.currentCommentIndex];
      }
      return null;
    },
    selectTherapistName: (state) => state.therapistData?.name,
    selectTherapistProfession: (state) => state.therapistData?.profession,
    selectTherapistRating: (state) => state.therapistData?.rating,
    selectTherapistReviews: (state) => state.therapistData?.reviews || [],
    selectTherapistComments: (state) => state.therapistData?.comments || [],
    selectTherapistDetails: (state) => state.therapistData?.details || [],
    selectTherapistInterests: (state) => state.therapistData?.interests || [],
    selectTherapistTags: (state) => state.therapistData?.tags || [],
    selectTherapistCertificates: (state) => state.therapistData?.certificates || [],
    selectTherapistAwards: (state) => state.therapistData?.awards || [],
    selectStatus: (state) => state.status,
    selectError: (state) => state.error,
    selectIsLoading: (state) => state.status === "loading",
    selectHasLoaded: (state) => state.hasLoaded,
  },
});

// Export actions - the key is to destructure from therapistSlice.actions
export const {
  setCurrentCommentIndex,
  nextComment,
  prevComment,
  clearError,
  setTherapistData,
  setLoading,
  setError,
  resetTherapistData,
  loadTherapistDetail, // Make sure this is included here
} = therapistSlice.actions;

// Export selectors
export const {
  selectTherapistData,
  selectCurrentCommentIndex,
  selectCurrentComment,
  selectTherapistName,
  selectTherapistProfession,
  selectTherapistRating,
  selectTherapistReviews,
  selectTherapistComments,
  selectTherapistDetails,
  selectTherapistInterests,
  selectTherapistTags,
  selectTherapistCertificates,
  selectTherapistAwards,
  selectStatus,
  selectError,
  selectIsLoading,
  selectHasLoaded,
} = therapistSlice.selectors;