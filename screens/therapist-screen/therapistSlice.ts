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
}

const initialState: TherapistSliceState = {
  therapistData: null,
  currentCommentIndex: 0,
  status: "idle",
  error: null,
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
  },
});

export const {
  setCurrentCommentIndex,
  nextComment,
  prevComment,
  setTherapistData,
  clearError,
  setLoading,
  setError,
} = therapistSlice.actions;

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
} = therapistSlice.selectors;

/**
 * ✅ Thunk to load therapist detail with language support
 * No need for fallback data - the serializer handles data normalization
 */
export const loadTherapistDetail = (therapistId: number, language?: Language) => async (dispatch: any, getState: any) => {
  try {
    dispatch(setLoading(true));
    dispatch(clearError());
    
    // Use provided language or default to 'en'
    const lang = language || 'en';
    
    console.log(`Loading therapist ${therapistId} in ${lang}`);
    
    // ✅ The API call returns serialized data - no additional processing needed
    const data = await fetchTherapistDetail(therapistId, lang);

    console.log(`Fetched therapist data for ID ${therapistId}`);

    if (!data) {
      throw new Error(lang === 'ar' 
        ? "لم يتم إرجاع بيانات المعالج من API" 
        : "No therapist data returned from API"
      );
    }

    dispatch(setTherapistData(data));
  } catch (error: any) {
    console.error("Failed to fetch therapist:", error);
    const lang = language || 'en';
    
    dispatch(setError(
      error.message || (lang === 'ar' 
        ? "فشل في تحميل ملف المعالج" 
        : "Failed to load therapist profile")
    ));
  } finally {
    dispatch(setLoading(false));
  }
};