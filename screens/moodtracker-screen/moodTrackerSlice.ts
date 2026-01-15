import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store/store';

// Types
export type MoodType = 'great' | 'good' | 'okay' | 'bad' | 'awful';

export interface MoodEntry {
  id: string;
  mood: MoodType;
  note: string;
  date: string;
  timestamp: number;
  activities: string[];
}

export interface MoodStats {
  totalEntries: number;
  averageMood: number;
  mostCommonMood: MoodType | null;
  streakDays: number;
}

interface MoodTrackerState {
  entries: MoodEntry[];
  selectedMood: MoodType | null;
  currentNote: string;
  selectedActivities: string[];
  isLoading: boolean;
  error: string | null;
  stats: MoodStats;
  viewMode: 'log' | 'history' | 'insights';
}

// Dummy data for mood entries
const dummyEntries: MoodEntry[] = [
  {
    id: '1',
    mood: 'great',
    note: 'Had a wonderful therapy session today. Feeling really positive about my progress!',
    date: '2024-01-15',
    timestamp: Date.now() - 86400000 * 0, // Today
    activities: ['therapy', 'exercise', 'meditation'],
  },
  {
    id: '2',
    mood: 'good',
    note: 'Productive day at work. Managed stress well.',
    date: '2024-01-14',
    timestamp: Date.now() - 86400000 * 1, // Yesterday
    activities: ['work', 'reading'],
  },
  {
    id: '3',
    mood: 'okay',
    note: 'Feeling neutral today. Nothing special happened.',
    date: '2024-01-13',
    timestamp: Date.now() - 86400000 * 2,
    activities: ['rest'],
  },
  {
    id: '4',
    mood: 'good',
    note: 'Great workout session and healthy eating!',
    date: '2024-01-12',
    timestamp: Date.now() - 86400000 * 3,
    activities: ['exercise', 'healthy-eating'],
  },
  {
    id: '5',
    mood: 'bad',
    note: 'Struggled with anxiety. Will talk to therapist about it.',
    date: '2024-01-11',
    timestamp: Date.now() - 86400000 * 4,
    activities: ['journaling'],
  },
  {
    id: '6',
    mood: 'great',
    note: 'Family gathering was amazing. Felt so loved and supported.',
    date: '2024-01-10',
    timestamp: Date.now() - 86400000 * 5,
    activities: ['socializing', 'family'],
  },
  {
    id: '7',
    mood: 'good',
    note: 'Meditation really helped today.',
    date: '2024-01-09',
    timestamp: Date.now() - 86400000 * 6,
    activities: ['meditation', 'yoga'],
  },
];

// Available activities for tracking
export const availableActivities = [
  { id: 'therapy', label: 'Therapy', labelAr: 'علاج', icon: 'medical' },
  { id: 'exercise', label: 'Exercise', labelAr: 'تمرين', icon: 'fitness' },
  { id: 'meditation', label: 'Meditation', labelAr: 'تأمل', icon: 'leaf' },
  { id: 'work', label: 'Work', labelAr: 'عمل', icon: 'briefcase' },
  { id: 'reading', label: 'Reading', labelAr: 'قراءة', icon: 'book' },
  { id: 'socializing', label: 'Socializing', labelAr: 'اجتماعي', icon: 'people' },
  { id: 'family', label: 'Family', labelAr: 'عائلة', icon: 'home' },
  { id: 'rest', label: 'Rest', labelAr: 'راحة', icon: 'bed' },
  { id: 'journaling', label: 'Journaling', labelAr: 'كتابة', icon: 'create' },
  { id: 'yoga', label: 'Yoga', labelAr: 'يوغا', icon: 'body' },
  { id: 'healthy-eating', label: 'Healthy Eating', labelAr: 'أكل صحي', icon: 'nutrition' },
  { id: 'nature', label: 'Nature Walk', labelAr: 'المشي', icon: 'leaf' },
];

// Mood configuration
export const moodConfig = {
  great: { emoji: '😄', label: 'Great', labelAr: 'ممتاز', color: '#4CAF50', value: 5 },
  good: { emoji: '🙂', label: 'Good', labelAr: 'جيد', color: '#8BC34A', value: 4 },
  okay: { emoji: '😐', label: 'Okay', labelAr: 'عادي', color: '#FFC107', value: 3 },
  bad: { emoji: '😔', label: 'Bad', labelAr: 'سيء', color: '#FF9800', value: 2 },
  awful: { emoji: '😢', label: 'Awful', labelAr: 'سيء جداً', color: '#F44336', value: 1 },
};

// Helper function to calculate stats
const calculateStats = (entries: MoodEntry[]): MoodStats => {
  if (entries.length === 0) {
    return {
      totalEntries: 0,
      averageMood: 0,
      mostCommonMood: null,
      streakDays: 0,
    };
  }

  const moodValues = entries.map(e => moodConfig[e.mood].value);
  const averageMood = moodValues.reduce((a, b) => a + b, 0) / moodValues.length;

  // Count mood occurrences
  const moodCounts: Record<MoodType, number> = {
    great: 0, good: 0, okay: 0, bad: 0, awful: 0
  };
  entries.forEach(e => moodCounts[e.mood]++);
  
  const mostCommonMood = (Object.keys(moodCounts) as MoodType[])
    .reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b);

  // Calculate streak (consecutive days with entries)
  let streakDays = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    
    if (entries.some(e => e.date === dateStr)) {
      streakDays++;
    } else if (i > 0) {
      break;
    }
  }

  return {
    totalEntries: entries.length,
    averageMood: Math.round(averageMood * 10) / 10,
    mostCommonMood,
    streakDays,
  };
};

const initialState: MoodTrackerState = {
  entries: dummyEntries,
  selectedMood: null,
  currentNote: '',
  selectedActivities: [],
  isLoading: false,
  error: null,
  stats: calculateStats(dummyEntries),
  viewMode: 'log',
};

// Async thunk to simulate loading entries (would be API call in production)
export const loadMoodEntries = createAsyncThunk(
  'moodTracker/loadEntries',
  async (_, { rejectWithValue }) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return dummyEntries;
    } catch (error) {
      return rejectWithValue('Failed to load mood entries');
    }
  }
);

// Async thunk to save a new mood entry
export const saveMoodEntry = createAsyncThunk(
  'moodTracker/saveEntry',
  async (entry: Omit<MoodEntry, 'id' | 'timestamp'>, { rejectWithValue }) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newEntry: MoodEntry = {
        ...entry,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };
      
      return newEntry;
    } catch (error) {
      return rejectWithValue('Failed to save mood entry');
    }
  }
);

const moodTrackerSlice = createSlice({
  name: 'moodTracker',
  initialState,
  reducers: {
    setSelectedMood: (state, action: PayloadAction<MoodType | null>) => {
      state.selectedMood = action.payload;
    },
    setCurrentNote: (state, action: PayloadAction<string>) => {
      state.currentNote = action.payload;
    },
    toggleActivity: (state, action: PayloadAction<string>) => {
      const activityId = action.payload;
      const index = state.selectedActivities.indexOf(activityId);
      if (index === -1) {
        state.selectedActivities.push(activityId);
      } else {
        state.selectedActivities.splice(index, 1);
      }
    },
    clearSelectedActivities: (state) => {
      state.selectedActivities = [];
    },
    setViewMode: (state, action: PayloadAction<'log' | 'history' | 'insights'>) => {
      state.viewMode = action.payload;
    },
    resetMoodForm: (state) => {
      state.selectedMood = null;
      state.currentNote = '';
      state.selectedActivities = [];
    },
    deleteEntry: (state, action: PayloadAction<string>) => {
      state.entries = state.entries.filter(e => e.id !== action.payload);
      state.stats = calculateStats(state.entries);
    },
  },
  extraReducers: (builder) => {
    builder
      // Load entries
      .addCase(loadMoodEntries.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadMoodEntries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.entries = action.payload;
        state.stats = calculateStats(action.payload);
      })
      .addCase(loadMoodEntries.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Save entry
      .addCase(saveMoodEntry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveMoodEntry.fulfilled, (state, action) => {
        state.isLoading = false;
        state.entries.unshift(action.payload);
        state.stats = calculateStats(state.entries);
        // Reset form after successful save
        state.selectedMood = null;
        state.currentNote = '';
        state.selectedActivities = [];
      })
      .addCase(saveMoodEntry.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setSelectedMood,
  setCurrentNote,
  toggleActivity,
  clearSelectedActivities,
  setViewMode,
  resetMoodForm,
  deleteEntry,
} = moodTrackerSlice.actions;

// Selectors
export const selectMoodEntries = (state: RootState) => state.moodTracker.entries;
export const selectSelectedMood = (state: RootState) => state.moodTracker.selectedMood;
export const selectCurrentNote = (state: RootState) => state.moodTracker.currentNote;
export const selectSelectedActivities = (state: RootState) => state.moodTracker.selectedActivities;
export const selectIsLoading = (state: RootState) => state.moodTracker.isLoading;
export const selectError = (state: RootState) => state.moodTracker.error;
export const selectMoodStats = (state: RootState) => state.moodTracker.stats;
export const selectViewMode = (state: RootState) => state.moodTracker.viewMode;

// Get entries for the last 7 days
export const selectWeeklyEntries = (state: RootState) => {
  const weekAgo = Date.now() - 7 * 86400000;
  return state.moodTracker.entries.filter((e: MoodEntry) => e.timestamp >= weekAgo);
};

// Get today's entry if exists
export const selectTodayEntry = (state: RootState) => {
  const today = new Date().toISOString().split('T')[0];
  return state.moodTracker.entries.find((e: MoodEntry) => e.date === today);
};

export default moodTrackerSlice.reducer;