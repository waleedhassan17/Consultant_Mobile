import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../store/createAppSlice";

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
  error: string;
}

const initialState: TherapistSliceState = {
  therapistData: {
    id: "1",
    name: "Ass. prof. Mohamed Elsheikh",
    profession: "Psychiatrist",
    rating: 4.95,
    totalReviews: 80,
    isTopTherapist: true,
    profileImage: require("../../assets/images/profile.png"),
    tags: ["Anxiety Disorders", "Depression"],
    interests: [
      "Mood disorders (depression)",
      "Anxiety disorders and obsessions",
      "Marriage Counselling/Relationship",
      "Addiction"
    ],
    details: [
      { 
        id: 1, 
        label: "Language", 
        value: "English, Arabic, Deutsch", 
        icon: require("../../assets/images/languageicon.png") 
      },
      { 
        id: 2, 
        label: "Country", 
        value: "Egypt", 
        icon: require("../../assets/images/countryicon.png") 
      },
      { 
        id: 3, 
        label: "Joining Date", 
        value: "4 years ago", 
        icon: require("../../assets/images/calendaricon.png") 
      },
      { 
        id: 4, 
        label: "Number of sessions", 
        value: "500+ Sessions", 
        icon: require("../../assets/images/sessionsicon.png") 
      },
    ],
    reviews: [
      { id: 1, label: "Communication", value: 5 },
      { id: 2, label: "Understanding of the situation", value: 4.84 },
      { id: 3, label: "Providing effective solutions", value: 5 },
      { id: 4, label: "Commitment to start and end times", value: 4.84 },
    ],
    comments: [
      {
        id: 1,
        text: "ألف شكر لـ الدكتور محمد الشيخ",
        user: "Ali",
        rating: 5,
        time: "8 days ago",
      },
      {
        id: 2,
        text: "Very professional and helpful.",
        user: "Sara",
        rating: 4,
        time: "5 days ago",
      },
    ],
    certificates: [
      { title: "Member of the WPA-TPS", org: "WPA-TPS", date: "Dec 2020 - Present" },
      { title: "German Board of Psychiatry", org: "University of Freidburg", date: "Feb 2017 - Present" },
      { title: "Membership", org: "DGPPN & EPA", date: "Jan 2016 - Present" },
      { title: "Member of the european psychiatric association EPA", org: "European Psychiatric Association EPA", date: "Jan 2013 - Present" },
      { title: "German Board of Psychiatry and Psychotherapy", org: "Facharzt, Bezirksärztekammer Südbaden", date: "Jan 2011 - Jan 2016" },
      { title: "Member of the German psychiatric association DGPPN", org: "DGPPN, Germany", date: "Jan 2010 - Present" },
      { title: "Doctor of medicine in Psychiatry", org: "All Saints University", date: "—" },
    ],
    awards: [
      { title: "Best Psychiatist Award", org: "Health Association", date: "2022" },
      { title: "Excellence in Psychiatry", org: "Medical Board", date: "2021" },
      { title: "Top Mental Health Practitioner", org: "Global Psychiatry Summit", date: "2020" },
    ],
    note: "(All prices include VAT and Service Fees.)"
  },
  currentCommentIndex: 0,
  status: "idle",
  error: "",
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
    }),
    clearError: create.reducer((state) => {
      state.error = "";
    }),
    
    loadTherapistDataAsync: create.asyncThunk(
      async (therapistId: string) => {
        console.log('Loading therapist data for ID:', therapistId);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return initialState.therapistData;
      },
      {
        pending: (state) => {
          state.status = "loading";
          state.error = "";
        },
        fulfilled: (state, action) => {
          state.status = "idle";
          if (action.payload) {
            state.therapistData = action.payload;
            state.currentCommentIndex = 0;
          }
          console.log('Therapist data loaded successfully');
        },
        rejected: (state, action) => {
          state.status = "failed";
          state.error = action.error.message || "Failed to load therapist data";
          console.log('Failed to load therapist data:', action.error.message);
        },
      }
    ),
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
  loadTherapistDataAsync,
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