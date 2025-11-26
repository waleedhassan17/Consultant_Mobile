import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../store/createAppSlice";
import { fetchTherapistDetail } from "../../networks/therapist/therapistProfile";
import { TherapistDetail } from "../../serializers/therapistDetailSerilizer";
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
        console.log(`🔄 Starting loadTherapistDetail for ID: ${therapistId}, Language: ${language}`);
        
        try {
          // Add timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout - taking too long')), 30000)
          );
          
          const apiPromise = fetchTherapistDetail(therapistId, language);
          
          const rawResponse = await Promise.race([apiPromise, timeoutPromise]) as any;
          
          console.log(`✅ API returned therapist detail`);
          
          // Validate response
          if (!rawResponse || typeof rawResponse !== 'object') {
            console.error('❌ Invalid response type:', typeof rawResponse);
            throw new Error('API did not return valid data');
          }
          
          return rawResponse;
        } catch (error: any) {
          console.error('❌ loadTherapistDetail error:', error);
          throw error;
        }
      },
      {
        pending: (state) => {
          console.log('⏳ loadTherapistDetail: pending');
          state.status = "loading";
          state.error = null;
        },
        fulfilled: (state, action: PayloadAction<any>) => {
          console.log('✅ loadTherapistDetail: fulfilled');
          
          try {
            // Serialize HERE in fulfilled
            state.therapistData = therapistDetailResponseSerializer(action.payload);
            state.currentCommentIndex = 0;
            state.status = "idle";
            state.hasLoaded = true;
            state.error = null;
            
            console.log('✅ Therapist detail loaded successfully:', state.therapistData?.name);
          } catch (serializationError: any) {
            console.error('❌ Serialization error:', serializationError);
            state.status = "failed";
            state.error = 'Failed to process therapist data';
            state.therapistData = null;
          }
        },
        rejected: (state, action) => {
          console.error('❌ loadTherapistDetail: rejected');
          console.error('Error:', action.error);
          
          state.status = "failed";
          state.error = action.error.message || "Failed to load therapist detail";
          
          // Clear therapist data on error
          state.therapistData = null;
          state.currentCommentIndex = 0;
        },
      }
    ),
    setTherapistData: create.reducer((state, action: PayloadAction<TherapistDetail>) => {
      state.therapistData = action.payload;
      state.currentCommentIndex = 0; 
      state.status = "idle";
      state.error = null;
      state.hasLoaded = true;
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
      if (state.status === "failed") {
        state.status = "idle";
      }
    }),
    resetTherapistData: create.reducer((state) => {
      state.therapistData = null;
      state.currentCommentIndex = 0;
      state.error = null;
      state.status = "idle";
      state.hasLoaded = false;
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
    selectTherapistPricing: (state) => state.therapistData?.pricing || [],
    selectTherapistLinkedInUrl: (state) => state.therapistData?.linkedInUrl,
    selectTherapistLanguages: (state) => state.therapistData?.languages || [],
    selectTherapistCountry: (state) => state.therapistData?.country,
    selectTherapistJoiningDate: (state) => state.therapistData?.joiningDate,
    selectTherapistNumberOfSessions: (state) => state.therapistData?.numberOfSessions,
    selectStatus: (state) => state.status,
    selectError: (state) => state.error,
    selectIsLoading: (state) => state.status === "loading",
    selectHasLoaded: (state) => state.hasLoaded,
    selectHasError: (state) => state.status === "failed",
    selectTherapistExperiences: (state) => state.therapistData?.experiences || [],
    selectTherapistEducation: (state) => state.therapistData?.education || [],
  },
});

// Export actions
export const {
  setCurrentCommentIndex,
  nextComment,
  prevComment,
  clearError,
  setTherapistData,
  setLoading,
  setError,
  resetTherapistData,
  loadTherapistDetail,
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
  selectTherapistPricing,
  selectTherapistLinkedInUrl,
  selectTherapistLanguages,
  selectTherapistCountry,
  selectTherapistJoiningDate,
  selectTherapistNumberOfSessions,
  selectStatus,
  selectError,
  selectIsLoading,
  selectHasLoaded,
  selectHasError,
  selectTherapistExperiences,    // ADD THIS
  selectTherapistEducation, 
} = therapistSlice.selectors;

export default therapistSlice.reducer;