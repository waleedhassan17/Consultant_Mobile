import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppSelector, useAppDispatch } from '../../hooks/useReduxHooks';
import { useTranslation } from '../../hooks/useTranslation';
import { selectLanguage } from '../home-screen/homeScreenSlice';
import {
  selectMoodEntries,
  selectSelectedMood,
  selectCurrentNote,
  selectSelectedActivities,
  selectIsLoading,
  selectError,
  selectMoodStats,
  selectViewMode,
  selectTodayEntry,
  selectWeeklyEntries,
  setSelectedMood,
  setCurrentNote,
  toggleActivity,
  setViewMode,
  resetMoodForm,
  deleteEntry,
  saveMoodEntry,
  loadMoodEntries,
  moodConfig,
  availableActivities,
  MoodType,
  MoodEntry,
} from './moodTrackerSlice';

type NavigationProp = NativeStackNavigationProp<any>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MoodTrackerScreen(): React.ReactElement {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp>();
  const language = useAppSelector(selectLanguage);
  const { t } = useTranslation();

  const entries = useAppSelector(selectMoodEntries);
  const selectedMood = useAppSelector(selectSelectedMood);
  const currentNote = useAppSelector(selectCurrentNote);
  const selectedActivities = useAppSelector(selectSelectedActivities);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const stats = useAppSelector(selectMoodStats);
  const viewMode = useAppSelector(selectViewMode);
  const todayEntry = useAppSelector(selectTodayEntry);
  const weeklyEntries = useAppSelector(selectWeeklyEntries);

  const [refreshing, setRefreshing] = useState(false);
  const isRTL = language === 'ar';

  useEffect(() => {
    dispatch(loadMoodEntries());
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(loadMoodEntries());
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleMoodSelect = (mood: MoodType) => {
    dispatch(setSelectedMood(mood));
  };

  const handleActivityToggle = (activityId: string) => {
    dispatch(toggleActivity(activityId));
  };

  const handleSaveMood = async () => {
    if (!selectedMood) {
      Alert.alert(
        isRTL ? 'تنبيه' : 'Notice',
        isRTL ? 'يرجى اختيار حالتك المزاجية' : 'Please select your mood first'
      );
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    
    await dispatch(saveMoodEntry({
      mood: selectedMood,
      note: currentNote,
      date: today,
      activities: selectedActivities,
    }));

    Alert.alert(
      isRTL ? 'تم الحفظ!' : 'Saved!',
      isRTL ? 'تم تسجيل حالتك المزاجية بنجاح' : 'Your mood has been logged successfully'
    );
  };

  const handleDeleteEntry = (entryId: string) => {
    Alert.alert(
      isRTL ? 'حذف' : 'Delete',
      isRTL ? 'هل أنت متأكد من حذف هذا الإدخال؟' : 'Are you sure you want to delete this entry?',
      [
        { text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: isRTL ? 'حذف' : 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteEntry(entryId)),
        },
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return isRTL ? 'اليوم' : 'Today';
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return isRTL ? 'أمس' : 'Yesterday';
    }

    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderMoodSelector = () => (
    <View style={styles.moodSelectorContainer}>
      <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
        {isRTL ? 'كيف تشعر اليوم؟' : 'How are you feeling today?'}
      </Text>
      <View style={[styles.moodOptions, isRTL && styles.moodOptionsRTL]}>
        {(Object.keys(moodConfig) as MoodType[]).map((mood) => {
          const config = moodConfig[mood];
          const isSelected = selectedMood === mood;
          return (
            <TouchableOpacity
              key={mood}
              style={[
                styles.moodButton,
                isSelected && { backgroundColor: config.color + '20', borderColor: config.color },
              ]}
              onPress={() => handleMoodSelect(mood)}
            >
              <Text style={styles.moodEmoji}>{config.emoji}</Text>
              <Text style={[styles.moodLabel, isSelected && { color: config.color }]}>
                {isRTL ? config.labelAr : config.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderActivitySelector = () => (
    <View style={styles.activityContainer}>
      <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
        {isRTL ? 'ماذا فعلت اليوم؟' : 'What did you do today?'}
      </Text>
      <View style={[styles.activitiesGrid, isRTL && styles.activitiesGridRTL]}>
        {availableActivities.map((activity) => {
          const isSelected = selectedActivities.includes(activity.id);
          return (
            <TouchableOpacity
              key={activity.id}
              style={[
                styles.activityChip,
                isSelected && styles.activityChipSelected,
              ]}
              onPress={() => handleActivityToggle(activity.id)}
            >
              <Ionicons
                name={activity.icon as any}
                size={16}
                color={isSelected ? '#fff' : '#60a899'}
              />
              <Text
                style={[
                  styles.activityChipText,
                  isSelected && styles.activityChipTextSelected,
                ]}
              >
                {isRTL ? activity.labelAr : activity.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderNoteInput = () => (
    <View style={styles.noteContainer}>
      <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
        {isRTL ? 'أضف ملاحظة (اختياري)' : 'Add a note (optional)'}
      </Text>
      <TextInput
        style={[styles.noteInput, isRTL && styles.noteInputRTL]}
        placeholder={isRTL ? 'كيف كان يومك؟ ما الذي يدور في ذهنك؟' : "How was your day? What's on your mind?"}
        placeholderTextColor="#999"
        multiline
        numberOfLines={4}
        value={currentNote}
        onChangeText={(text) => dispatch(setCurrentNote(text))}
        textAlignVertical="top"
      />
    </View>
  );

  const renderLogView = () => (
    <View style={styles.logContainer}>
      {todayEntry ? (
        <View style={styles.todayEntryBanner}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          <Text style={[styles.todayEntryText, isRTL && styles.textRTL]}>
            {isRTL 
              ? `لقد سجلت مزاجك اليوم: ${moodConfig[todayEntry.mood as MoodType].emoji} ${moodConfig[todayEntry.mood as MoodType].labelAr}`
              : `You've logged today: ${moodConfig[todayEntry.mood as MoodType].emoji} ${moodConfig[todayEntry.mood as MoodType].label}`
            }
          </Text>
        </View>
      ) : null}
      
      {renderMoodSelector()}
      {renderActivitySelector()}
      {renderNoteInput()}

      <TouchableOpacity
        style={[styles.saveButton, !selectedMood && styles.saveButtonDisabled]}
        onPress={handleSaveMood}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="save" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>
              {isRTL ? 'حفظ المزاج' : 'Save Mood'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderHistoryView = () => (
    <View style={styles.historyContainer}>
      {entries.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={64} color="#ccc" />
          <Text style={[styles.emptyStateText, isRTL && styles.textRTL]}>
            {isRTL ? 'لا توجد إدخالات بعد' : 'No entries yet'}
          </Text>
          <Text style={[styles.emptyStateSubtext, isRTL && styles.textRTL]}>
            {isRTL ? 'ابدأ بتسجيل مزاجك اليوم!' : 'Start logging your mood today!'}
          </Text>
        </View>
      ) : (
        entries.map((entry: MoodEntry) => (
          <View key={entry.id} style={styles.historyCard}>
            <View style={[styles.historyCardHeader, isRTL && styles.historyCardHeaderRTL]}>
              <View style={[styles.historyMoodBadge, { backgroundColor: moodConfig[entry.mood as MoodType].color + '20' }]}>
                <Text style={styles.historyEmoji}>{moodConfig[entry.mood as MoodType].emoji}</Text>
                <Text style={[styles.historyMoodLabel, { color: moodConfig[entry.mood as MoodType].color }]}>
                  {isRTL ? moodConfig[entry.mood as MoodType].labelAr : moodConfig[entry.mood as MoodType].label}
                </Text>
              </View>
              <View style={[styles.historyDateContainer, isRTL && { alignItems: 'flex-start' }]}>
                <Text style={styles.historyDate}>{formatDate(entry.date)}</Text>
                <TouchableOpacity onPress={() => handleDeleteEntry(entry.id)}>
                  <Ionicons name="trash-outline" size={18} color="#999" />
                </TouchableOpacity>
              </View>
            </View>
            
            {entry.note ? (
              <Text style={[styles.historyNote, isRTL && styles.textRTL]}>
                {entry.note}
              </Text>
            ) : null}

            {entry.activities.length > 0 && (
              <View style={[styles.historyActivities, isRTL && styles.historyActivitiesRTL]}>
                {entry.activities.map((actId: string) => {
                  const activity = availableActivities.find(a => a.id === actId);
                  return activity ? (
                    <View key={actId} style={styles.historyActivityTag}>
                      <Ionicons name={activity.icon as any} size={12} color="#60a899" />
                      <Text style={styles.historyActivityText}>
                        {isRTL ? activity.labelAr : activity.label}
                      </Text>
                    </View>
                  ) : null;
                })}
              </View>
            )}
          </View>
        ))
      )}
    </View>
  );

  const renderInsightsView = () => {
    // Calculate mood distribution for the chart
    const moodCounts: Record<MoodType, number> = { great: 0, good: 0, okay: 0, bad: 0, awful: 0 };
    entries.forEach((e: MoodEntry) => moodCounts[e.mood as MoodType]++);
    const maxCount = Math.max(...Object.values(moodCounts), 1);

    return (
      <View style={styles.insightsContainer}>
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={24} color="#2196F3" />
            <Text style={styles.statValue}>{stats.totalEntries}</Text>
            <Text style={[styles.statLabel, isRTL && styles.textRTL]}>
              {isRTL ? 'إجمالي الإدخالات' : 'Total Entries'}
            </Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="flame" size={24} color="#FF9800" />
            <Text style={styles.statValue}>{stats.streakDays}</Text>
            <Text style={[styles.statLabel, isRTL && styles.textRTL]}>
              {isRTL ? 'أيام متتالية' : 'Day Streak'}
            </Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="trending-up" size={24} color="#4CAF50" />
            <Text style={styles.statValue}>{stats.averageMood.toFixed(1)}</Text>
            <Text style={[styles.statLabel, isRTL && styles.textRTL]}>
              {isRTL ? 'متوسط المزاج' : 'Avg Mood'}
            </Text>
          </View>
          
          <View style={styles.statCard}>
            {stats.mostCommonMood && (
              <Text style={{ fontSize: 24 }}>{moodConfig[stats.mostCommonMood as MoodType].emoji}</Text>
            )}
            <Text style={styles.statValue}>
              {stats.mostCommonMood 
                ? (isRTL ? moodConfig[stats.mostCommonMood as MoodType].labelAr : moodConfig[stats.mostCommonMood as MoodType].label)
                : '-'
              }
            </Text>
            <Text style={[styles.statLabel, isRTL && styles.textRTL]}>
              {isRTL ? 'المزاج الأكثر شيوعاً' : 'Most Common'}
            </Text>
          </View>
        </View>

        {/* Mood Distribution Chart */}
        <View style={styles.chartCard}>
          <Text style={[styles.chartTitle, isRTL && styles.textRTL]}>
            {isRTL ? 'توزيع المزاج' : 'Mood Distribution'}
          </Text>
          <View style={styles.chartContainer}>
            {(Object.keys(moodConfig) as MoodType[]).map((mood) => {
              const count = moodCounts[mood];
              const percentage = (count / maxCount) * 100;
              return (
                <View key={mood} style={styles.chartRow}>
                  <Text style={styles.chartEmoji}>{moodConfig[mood].emoji}</Text>
                  <View style={styles.chartBarContainer}>
                    <View
                      style={[
                        styles.chartBar,
                        {
                          width: `${Math.max(percentage, 5)}%`,
                          backgroundColor: moodConfig[mood].color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.chartCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Weekly Summary */}
        <View style={styles.weeklyCard}>
          <Text style={[styles.chartTitle, isRTL && styles.textRTL]}>
            {isRTL ? 'ملخص الأسبوع' : 'This Week'}
          </Text>
          <View style={[styles.weeklyMoods, isRTL && styles.weeklyMoodsRTL]}>
            {Array.from({ length: 7 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (6 - i));
              const dateStr = date.toISOString().split('T')[0];
              const entry = entries.find((e: MoodEntry) => e.date === dateStr);
              const dayName = date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { weekday: 'short' });
              
              return (
                <View key={i} style={styles.weeklyDay}>
                  <Text style={styles.weeklyDayLabel}>{dayName}</Text>
                  <View
                    style={[
                      styles.weeklyMoodCircle,
                      entry && { backgroundColor: moodConfig[entry.mood as MoodType].color + '30' },
                    ]}
                  >
                    {entry ? (
                      <Text style={{ fontSize: 20 }}>{moodConfig[entry.mood as MoodType].emoji}</Text>
                    ) : (
                      <Ionicons name="remove" size={20} color="#ccc" />
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isRTL ? 'متتبع المزاج' : 'Mood Tracker'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, isRTL && styles.tabContainerRTL]}>
        <TouchableOpacity
          style={[styles.tab, viewMode === 'log' && styles.tabActive]}
          onPress={() => dispatch(setViewMode('log'))}
        >
          <Ionicons
            name="add-circle"
            size={20}
            color={viewMode === 'log' ? '#2196F3' : '#999'}
          />
          <Text style={[styles.tabText, viewMode === 'log' && styles.tabTextActive]}>
            {isRTL ? 'تسجيل' : 'Log'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, viewMode === 'history' && styles.tabActive]}
          onPress={() => dispatch(setViewMode('history'))}
        >
          <Ionicons
            name="time"
            size={20}
            color={viewMode === 'history' ? '#2196F3' : '#999'}
          />
          <Text style={[styles.tabText, viewMode === 'history' && styles.tabTextActive]}>
            {isRTL ? 'السجل' : 'History'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, viewMode === 'insights' && styles.tabActive]}
          onPress={() => dispatch(setViewMode('insights'))}
        >
          <Ionicons
            name="stats-chart"
            size={20}
            color={viewMode === 'insights' ? '#2196F3' : '#999'}
          />
          <Text style={[styles.tabText, viewMode === 'insights' && styles.tabTextActive]}>
            {isRTL ? 'إحصائيات' : 'Insights'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2196F3']}
            tintColor="#2196F3"
          />
        }
      >
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="warning" size={20} color="#c62828" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {viewMode === 'log' && renderLogView()}
        {viewMode === 'history' && renderHistoryView()}
        {viewMode === 'insights' && renderInsightsView()}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  tabContainerRTL: {
    flexDirection: 'row-reverse',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#e3f2fd',
  },
  tabText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#2196F3',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  errorText: {
    color: '#c62828',
    flex: 1,
  },

  // Log View Styles
  logContainer: {
    paddingTop: 16,
  },
  todayEntryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 10,
  },
  todayEntryText: {
    flex: 1,
    color: '#2e7d32',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  moodSelectorContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  moodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodOptionsRTL: {
    flexDirection: 'row-reverse',
  },
  moodButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 60,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activityContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activitiesGridRTL: {
    flexDirection: 'row-reverse',
  },
  activityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#60a899',
    backgroundColor: '#fff',
    gap: 6,
  },
  activityChipSelected: {
    backgroundColor: '#60a899',
    borderColor: '#60a899',
  },
  activityChipText: {
    fontSize: 13,
    color: '#60a899',
  },
  activityChipTextSelected: {
    color: '#fff',
  },
  noteContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
    color: '#333',
  },
  noteInputRTL: {
    textAlign: 'right',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#b0bec5',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // History View Styles
  historyContainer: {
    paddingTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  historyCardHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  historyMoodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  historyEmoji: {
    fontSize: 18,
  },
  historyMoodLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  historyDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyDate: {
    fontSize: 13,
    color: '#999',
  },
  historyNote: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 10,
  },
  historyActivities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  historyActivitiesRTL: {
    flexDirection: 'row-reverse',
  },
  historyActivityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f7f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  historyActivityText: {
    fontSize: 11,
    color: '#60a899',
  },

  // Insights View Styles
  insightsContainer: {
    paddingTop: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: (SCREEN_WIDTH - 56) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  chartContainer: {
    gap: 12,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chartEmoji: {
    fontSize: 20,
    width: 30,
  },
  chartBarContainer: {
    flex: 1,
    height: 24,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  chartBar: {
    height: '100%',
    borderRadius: 12,
  },
  chartCount: {
    width: 30,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'right',
  },
  weeklyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  weeklyMoods: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weeklyMoodsRTL: {
    flexDirection: 'row-reverse',
  },
  weeklyDay: {
    alignItems: 'center',
    gap: 8,
  },
  weeklyDayLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  weeklyMoodCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
});