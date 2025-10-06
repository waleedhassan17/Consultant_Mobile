import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../store/createAppSlice";
import { fetchTherapistDetail } from "../../networks/therapist/therapistProfile";
import { Language } from "../../utils/language-storage/languageStorage";

interface Review {
  id: number;
  label: string;
  value: number;
}

interface Comment {
  id: number;
  text: string;
  user: string;
  rating: number;
  time: string;
}

interface Detail {
  id: number;
  label: string;
  value: string;
  icon: any;
}

interface Certificate {
  title: string;
  org: string;
  date: string;
}

interface Award {
  title: string;
  org: string;
  date: string;
}

interface TherapistData {
  id: string;
  name: string;
  profession: string;
  rating: number;
  totalReviews: number;
  isTopTherapist: boolean;
  profileImage: any;
  tags: string[];
  interests: string[];
  details: Detail[];
  reviews: Review[];
  comments: Comment[];
  certificates: Certificate[];
  awards: Award[];
  note: string;
}

interface TherapistSliceState {
  therapistData: TherapistData | null;
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

/**
 * ✅ Fallback data with RTL/LTR support
 */
const getFallbackData = (language: Language): TherapistData => {
  const isArabic = language === 'ar';
  
  return {
    id: "1",
    name: isArabic ? "معالج احتياطي" : "Fallback Therapist",
    profession: isArabic ? "طبيب نفسي" : "Psychiatrist",
    rating: 4.95,
    totalReviews: 80,
    isTopTherapist: true,
    profileImage: require("../../assets/profile.jpg"),
    tags: isArabic 
      ? ["اضطرابات القلق", "الاكتئاب"] 
      : ["Anxiety Disorders", "Depression"],
    interests: isArabic
      ? [
          "اضطرابات المزاج (الاكتئاب)",
          "اضطرابات القلق والوساوس",
          "الاستشارات الزوجية والعلاقات",
          "الإدمان"
        ]
      : [
          "Mood disorders (depression)",
          "Anxiety disorders and obsessions",
          "Marriage Counselling/Relationship",
          "Addiction"
        ],
    details: isArabic
      ? [
          { 
            id: 1, 
            label: "اللغة", 
            value: "الإنجليزية، العربية", 
            icon: require("../../assets/languageicon.png") 
          },
          { 
            id: 2, 
            label: "البلد", 
            value: "مصر", 
            icon: require("../../assets/countryicon.png") 
          },
          { 
            id: 3, 
            label: "تاريخ الانضمام", 
            value: "منذ 4 سنوات", 
            icon: require("../../assets/calendaricon.png") 
          },
          { 
            id: 4, 
            label: "عدد الجلسات", 
            value: "500+ جلسة", 
            icon: require("../../assets/sessionsicon.png") 
          },
        ]
      : [
          { 
            id: 1, 
            label: "Language", 
            value: "English, Arabic", 
            icon: require("../../assets/languageicon.png") 
          },
          { 
            id: 2, 
            label: "Country", 
            value: "Egypt", 
            icon: require("../../assets/countryicon.png") 
          },
          { 
            id: 3, 
            label: "Joining Date", 
            value: "4 years ago", 
            icon: require("../../assets/calendaricon.png") 
          },
          { 
            id: 4, 
            label: "Number of sessions", 
            value: "500+ Sessions", 
            icon: require("../../assets/sessionsicon.png") 
          },
        ],
    reviews: isArabic
      ? [
          { id: 1, label: "التواصل", value: 5 },
          { id: 2, label: "فهم الموقف", value: 4.84 },
          { id: 3, label: "تقديم حلول فعالة", value: 5 },
          { id: 4, label: "الالتزام بأوقات البداية والنهاية", value: 4.84 },
        ]
      : [
          { id: 1, label: "Communication", value: 5 },
          { id: 2, label: "Understanding of the situation", value: 4.84 },
          { id: 3, label: "Providing effective solutions", value: 5 },
          { id: 4, label: "Commitment to start and end times", value: 4.84 },
        ],
    comments: isArabic
      ? [
          {
            id: 1,
            text: "محترف جداً ومفيد.",
            user: "مستخدم احتياطي",
            rating: 5,
            time: "مؤخراً",
          },
        ]
      : [
          {
            id: 1,
            text: "Very professional and helpful.",
            user: "Fallback User",
            rating: 5,
            time: "Recently",
          },
        ],
    certificates: isArabic
      ? [
          { title: "عضو في WPA-TPS", org: "WPA-TPS", date: "ديسمبر 2020 - الحاضر" },
          { title: "المجلس الألماني للطب النفسي", org: "جامعة فرايبورغ", date: "فبراير 2017 - الحاضر" },
        ]
      : [
          { title: "Member of the WPA-TPS", org: "WPA-TPS", date: "Dec 2020 - Present" },
          { title: "German Board of Psychiatry", org: "University of Freidburg", date: "Feb 2017 - Present" },
        ],
    awards: isArabic
      ? [
          { title: "جائزة أفضل طبيب نفسي", org: "جمعية الصحة", date: "2022" },
        ]
      : [
          { title: "Best Psychiatrist Award", org: "Health Association", date: "2022" },
        ],
    note: isArabic 
      ? "(جميع الأسعار شاملة ضريبة القيمة المضافة ورسوم الخدمة.)"
      : "(All prices include VAT and Service Fees.)"
  };
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
    setTherapistData: create.reducer((state, action: PayloadAction<TherapistData>) => {
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
    }),
    clearError: create.reducer((state) => {
      state.error = null;
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
 * ✅ Thunk to load therapist detail with language support and RTL/LTR handling
 */
export const loadTherapistDetail = (therapistId: number, language?: Language) => async (dispatch: any, getState: any) => {
  try {
    dispatch(setLoading(true));
    dispatch(clearError());
    
    // Use provided language or default to 'en'
    const lang = language || 'en';
    
    console.log(`Loading therapist ${therapistId} in ${lang}`);
    
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

    // ✅ Fallback data with language support
    dispatch(setTherapistData(getFallbackData(lang)));
  } finally {
    dispatch(setLoading(false));
  }
};