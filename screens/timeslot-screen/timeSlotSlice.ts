import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../store/createAppSlice";

// Types
export interface TimeSlot {
  id: string;
  time: string;
  duration: 30 | 60;
  available: boolean;
  date: string;
}

export interface TherapistInfo {
  id: number;
  name: string;
  pricing: string;
}

interface TimeSlotsByDate {
  [date: string]: TimeSlot[];
}

interface TimeSlotSliceState {
  therapistInfo: TherapistInfo | null;
  availableDates: string[];
  timeSlotsByDate: TimeSlotsByDate;
  selectedDate: string | null;
  selectedSlot: TimeSlot | null;
  status: "idle" | "loading" | "failed";
  error: string | null;
  hasLoaded: boolean;
}

const initialState: TimeSlotSliceState = {
  therapistInfo: null,
  availableDates: [],
  timeSlotsByDate: {},
  selectedDate: null,
  selectedSlot: null,
  status: "idle",
  error: null,
  hasLoaded: false,
};

// Helper function to generate dummy time slots
const generateDummyTimeSlots = (date: string): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const times = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
    "05:00 PM",
    "05:30 PM",
  ];

  times.forEach((time, index) => {
    // Randomly make some slots unavailable
    const available = Math.random() > 0.3;
    // Alternate between 30 and 60 minute slots
    const duration = index % 3 === 0 ? 60 : 30;

    slots.push({
      id: `${date}-${time.replace(/[: ]/g, "-")}`,
      time,
      duration: duration as 30 | 60,
      available,
      date,
    });
  });

  return slots;
};

// Helper function to generate dates for the next 14 days
const generateAvailableDates = (): string[] => {
  const dates: string[] = [];
  const today = new Date();

  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date.toISOString().split("T")[0]);
  }

  return dates;
};

export const timeSlotSlice = createAppSlice({
  name: "timeSlot",
  initialState,
  reducers: (create) => ({
    loadTimeSlots: create.asyncThunk(
      async ({
        therapistId,
        language = "en",
      }: {
        therapistId: number;
        language?: "en" | "ar";
      }) => {
        console.log(
          `🔄 Loading time slots for therapist ID: ${therapistId}, Language: ${language}`
        );

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Generate dummy data
        const availableDates = generateAvailableDates();
        const timeSlotsByDate: TimeSlotsByDate = {};

        availableDates.forEach((date) => {
          timeSlotsByDate[date] = generateDummyTimeSlots(date);
        });

        const therapistInfo: TherapistInfo = {
          id: therapistId,
          name: language === "ar" ? "د. أحمد محمد" : "Dr. Ahmed Mohammed",
          pricing:
            language === "ar"
              ? "100 ريال للجلسة (30 دقيقة) • 180 ريال للجلسة (60 دقيقة)"
              : "$100 per session (30 min) • $180 per session (60 min)",
        };

        console.log(`✅ Time slots loaded successfully`);

        return {
          therapistInfo,
          availableDates,
          timeSlotsByDate,
        };
      },
      {
        pending: (state) => {
          console.log("⏳ loadTimeSlots: pending");
          state.status = "loading";
          state.error = null;
        },
        fulfilled: (state, action) => {
          console.log("✅ loadTimeSlots: fulfilled");

          state.therapistInfo = action.payload.therapistInfo;
          state.availableDates = action.payload.availableDates;
          state.timeSlotsByDate = action.payload.timeSlotsByDate;

          // Auto-select first available date
          if (action.payload.availableDates.length > 0) {
            state.selectedDate = action.payload.availableDates[0];
          }

          state.status = "idle";
          state.hasLoaded = true;
          state.error = null;
        },
        rejected: (state, action) => {
          console.error("❌ loadTimeSlots: rejected");
          console.error("Error:", action.error);

          state.status = "failed";
          state.error =
            action.error.message || "Failed to load available time slots";
          state.availableDates = [];
          state.timeSlotsByDate = {};
          state.selectedDate = null;
          state.selectedSlot = null;
        },
      }
    ),

    selectDate: create.reducer((state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
      // Clear selected slot when date changes
      state.selectedSlot = null;
    }),

    selectTimeSlot: create.reducer((state, action: PayloadAction<string>) => {
      const slotId = action.payload;

      // Find the slot
      if (state.selectedDate && state.timeSlotsByDate[state.selectedDate]) {
        const slot = state.timeSlotsByDate[state.selectedDate].find(
          (s) => s.id === slotId
        );

        if (slot && slot.available) {
          state.selectedSlot = slot;
        }
      }
    }),

    clearSelectedSlot: create.reducer((state) => {
      state.selectedSlot = null;
    }),

    setTimeSlots: create.reducer(
      (
        state,
        action: PayloadAction<{
          availableDates: string[];
          timeSlotsByDate: TimeSlotsByDate;
        }>
      ) => {
        state.availableDates = action.payload.availableDates;
        state.timeSlotsByDate = action.payload.timeSlotsByDate;
        state.status = "idle";
        state.error = null;
        state.hasLoaded = true;
      }
    ),

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

    resetTimeSlots: create.reducer((state) => {
      state.therapistInfo = null;
      state.availableDates = [];
      state.timeSlotsByDate = {};
      state.selectedDate = null;
      state.selectedSlot = null;
      state.error = null;
      state.status = "idle";
      state.hasLoaded = false;
    }),
  }),

  selectors: {
    selectTherapistInfo: (state) => state.therapistInfo,
    selectAvailableDates: (state) => state.availableDates,
    selectTimeSlotsByDate: (state) => {
      if (state.selectedDate && state.timeSlotsByDate[state.selectedDate]) {
        return state.timeSlotsByDate[state.selectedDate];
      }
      return [];
    },
    selectAllTimeSlots: (state) => state.timeSlotsByDate,
    selectSelectedDate: (state) => state.selectedDate,
    selectSelectedSlot: (state) => state.selectedSlot,
    selectStatus: (state) => state.status,
    selectError: (state) => state.error,
    selectIsLoading: (state) => state.status === "loading",
    selectHasLoaded: (state) => state.hasLoaded,
    selectHasError: (state) => state.status === "failed",
    selectAvailableSlotsCount: (state) => {
      if (state.selectedDate && state.timeSlotsByDate[state.selectedDate]) {
        return state.timeSlotsByDate[state.selectedDate].filter(
          (slot) => slot.available
        ).length;
      }
      return 0;
    },
  },
});

// Export actions
export const {
  loadTimeSlots,
  selectDate,
  selectTimeSlot,
  clearSelectedSlot,
  setTimeSlots,
  setLoading,
  setError,
  clearError,
  resetTimeSlots,
} = timeSlotSlice.actions;

// Export selectors
export const {
  selectTherapistInfo,
  selectAvailableDates,
  selectTimeSlotsByDate,
  selectAllTimeSlots,
  selectSelectedDate,
  selectSelectedSlot,
  selectStatus,
  selectError,
  selectIsLoading,
  selectHasLoaded,
  selectHasError,
  selectAvailableSlotsCount,
} = timeSlotSlice.selectors;

export default timeSlotSlice.reducer;