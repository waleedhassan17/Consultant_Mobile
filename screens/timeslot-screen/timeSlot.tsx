import React, { useEffect, useState, useCallback } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { useAppSelector, useAppDispatch } from "../../hooks/useReduxHooks";
import {
  selectAvailableDates,
  selectSelectedDate,
  selectTimeSlotsByDate,
  selectSelectedSlot,
  selectIsLoading,
  selectError,
  selectTherapistInfo,
  loadTimeSlots,
  selectDate,
  selectTimeSlot,
  clearSelectedSlot,
  resetTimeSlots,
} from "./timeSlotSlice";
import { selectLanguage } from "../home-screen/homeScreenSlice";

type TimeSlotScreenRouteProp = RouteProp<
  {
    TimeSlot: { therapistId: number; therapistName: string };
  },
  "TimeSlot"
>;

export default function TimeSlotScreen(): React.ReactElement {
  const dispatch = useAppDispatch();
  const route = useRoute<TimeSlotScreenRouteProp>();
  const navigation = useNavigation();
  const language = useAppSelector(selectLanguage);

  const therapistId = route.params?.therapistId || 1;
  const therapistName = route.params?.therapistName || "Therapist";

  const availableDates = useAppSelector(selectAvailableDates);
  const selectedDate = useAppSelector(selectSelectedDate);
  const timeSlots = useAppSelector(selectTimeSlotsByDate);
  const selectedSlot = useAppSelector(selectSelectedSlot);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const therapistInfo = useAppSelector(selectTherapistInfo);

  const [refreshing, setRefreshing] = useState(false);

  const isRTL = language === "ar";

  useEffect(() => {
    dispatch(loadTimeSlots({ therapistId, language }));
    
    return () => {
      // Cleanup when leaving screen
      dispatch(resetTimeSlots());
    };
  }, [dispatch, therapistId, language]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(loadTimeSlots({ therapistId, language }));
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, therapistId, language]);

  const handleDateSelect = (date: string) => {
    dispatch(selectDate(date));
  };

  const handleSlotSelect = (slotId: string) => {
    dispatch(selectTimeSlot(slotId));
  };

  const handleConfirmBooking = () => {
    if (!selectedSlot) {
      Alert.alert(
        isRTL ? "تنبيه" : "Alert",
        isRTL
          ? "الرجاء اختيار وقت للموعد"
          : "Please select a time slot first"
      );
      return;
    }

    Alert.alert(
      isRTL ? "تأكيد الحجز" : "Confirm Booking",
      isRTL
        ? `هل تريد حجز موعد في ${selectedSlot.time} بتاريخ ${selectedDate}؟`
        : `Do you want to book an appointment at ${selectedSlot.time} on ${selectedDate}?`,
      [
        {
          text: isRTL ? "إلغاء" : "Cancel",
          style: "cancel",
        },
        {
          text: isRTL ? "تأكيد" : "Confirm",
          onPress: () => {
            // TODO: Implement booking confirmation
            console.log("Booking confirmed:", {
              therapistId,
              date: selectedDate,
              slot: selectedSlot,
            });
            Alert.alert(
              isRTL ? "نجح" : "Success",
              isRTL ? "تم حجز الموعد بنجاح" : "Appointment booked successfully"
            );
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleRetry = () => {
    dispatch(loadTimeSlots({ therapistId, language }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
    };
    return date.toLocaleDateString(isRTL ? "ar-SA" : "en-US", options);
  };

  const getDayLabel = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      return isRTL ? "اليوم" : "Today";
    } else if (date.getTime() === tomorrow.getTime()) {
      return isRTL ? "غداً" : "Tomorrow";
    }
    return "";
  };

  if (isLoading && !refreshing && availableDates.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#0077cc" />
        <Text style={styles.loadingText}>
          {isRTL ? "جاري تحميل المواعيد المتاحة..." : "Loading available slots..."}
        </Text>
      </View>
    );
  }

  if (error && availableDates.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#c62828" />
          <Text style={styles.errorText}>
            {isRTL ? `خطأ: ${error}` : `Error: ${error}`}
          </Text>
        </View>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>
            {isRTL ? "إعادة المحاولة" : "Retry"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { flexDirection: isRTL ? "row-reverse" : "row" },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name={isRTL ? "arrow-forward" : "arrow-back"}
            size={24}
            color="#0077cc"
          />
        </TouchableOpacity>
        <View
          style={[
            styles.headerTextContainer,
            { alignItems: isRTL ? "flex-end" : "flex-start" },
          ]}
        >
          <Text
            style={[styles.headerTitle, { textAlign: isRTL ? "right" : "left" }]}
          >
            {isRTL ? "اختيار موعد" : "Select Time Slot"}
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { textAlign: isRTL ? "right" : "left" },
            ]}
          >
            {isRTL ? `مع ${therapistName}` : `with ${therapistName}`}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0077cc"]}
            tintColor="#0077cc"
          />
        }
      >
        {/* Therapist Info Card */}
        {therapistInfo && (
          <View style={styles.infoCard}>
            <View
              style={[
                styles.infoRow,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
            >
              <MaterialCommunityIcons
                name="clock-outline"
                size={20}
                color="#0077cc"
              />
              <Text
                style={[
                  styles.infoText,
                  {
                    marginLeft: isRTL ? 0 : 8,
                    marginRight: isRTL ? 8 : 0,
                  },
                ]}
              >
                {isRTL
                  ? "مدة الجلسة: 30 أو 60 دقيقة"
                  : "Session duration: 30 or 60 minutes"}
              </Text>
            </View>
            <View
              style={[
                styles.infoRow,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
            >
              <MaterialCommunityIcons
                name="currency-usd"
                size={20}
                color="#0077cc"
              />
              <Text
                style={[
                  styles.infoText,
                  {
                    marginLeft: isRTL ? 0 : 8,
                    marginRight: isRTL ? 8 : 0,
                  },
                ]}
              >
                {therapistInfo.pricing}
              </Text>
            </View>
          </View>
        )}

        {/* Date Selection */}
        <View style={styles.sectionContainer}>
          <Text
            style={[
              styles.sectionTitle,
              { textAlign: isRTL ? "right" : "left" },
            ]}
          >
            {isRTL ? "اختر التاريخ" : "Select Date"}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.dateScroll}
            contentContainerStyle={{
              flexDirection: isRTL ? "row-reverse" : "row",
            }}
          >
            {availableDates.map((date) => {
              const isSelected = date === selectedDate;
              const dayLabel = getDayLabel(date);
              return (
                <TouchableOpacity
                  key={date}
                  style={[
                    styles.dateCard,
                    isSelected && styles.dateCardSelected,
                  ]}
                  onPress={() => handleDateSelect(date)}
                >
                  {dayLabel ? (
                    <Text
                      style={[
                        styles.dayLabel,
                        isSelected && styles.dayLabelSelected,
                      ]}
                    >
                      {dayLabel}
                    </Text>
                  ) : null}
                  <Text
                    style={[
                      styles.dateText,
                      isSelected && styles.dateTextSelected,
                    ]}
                  >
                    {formatDate(date)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Time Slots */}
        {selectedDate && timeSlots.length > 0 && (
          <View style={styles.sectionContainer}>
            <View
              style={[
                styles.sectionHeader,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  { textAlign: isRTL ? "right" : "left" },
                ]}
              >
                {isRTL ? "المواعيد المتاحة" : "Available Times"}
              </Text>
              <View
                style={[
                  styles.slotCountBadge,
                  { flexDirection: isRTL ? "row-reverse" : "row" },
                ]}
              >
                <Text style={styles.slotCountText}>
                  {timeSlots.filter((slot) => slot.available).length}
                </Text>
                <Text style={styles.slotCountLabel}>
                  {isRTL ? " متاح" : " available"}
                </Text>
              </View>
            </View>

            <View style={styles.slotsGrid}>
              {timeSlots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id;
                const isAvailable = slot.available;
                return (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      styles.slotCard,
                      !isAvailable && styles.slotCardDisabled,
                      isSelected && styles.slotCardSelected,
                    ]}
                    onPress={() => isAvailable && handleSlotSelect(slot.id)}
                    disabled={!isAvailable}
                  >
                    <View style={styles.slotContent}>
                      <Text
                        style={[
                          styles.slotTime,
                          !isAvailable && styles.slotTimeDisabled,
                          isSelected && styles.slotTimeSelected,
                        ]}
                      >
                        {slot.time}
                      </Text>
                      <View
                        style={[
                          styles.durationBadge,
                          slot.duration === 30
                            ? styles.durationBadge30
                            : styles.durationBadge60,
                          !isAvailable && styles.durationBadgeDisabled,
                        ]}
                      >
                        <Text
                          style={[
                            styles.durationText,
                            !isAvailable && styles.durationTextDisabled,
                          ]}
                        >
                          {slot.duration}
                          {isRTL ? " د" : " min"}
                        </Text>
                      </View>
                    </View>
                    {!isAvailable && (
                      <View style={styles.bookedOverlay}>
                        <Text style={styles.bookedText}>
                          {isRTL ? "محجوز" : "Booked"}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {selectedDate && timeSlots.length === 0 && (
          <View style={styles.noSlotsContainer}>
            <Ionicons name="calendar-outline" size={48} color="#ccc" />
            <Text style={styles.noSlotsText}>
              {isRTL
                ? "لا توجد مواعيد متاحة في هذا اليوم"
                : "No available slots for this date"}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      {selectedSlot && selectedDate && (
        <View style={styles.bottomBar}>
          <View
            style={[
              styles.selectedSlotInfo,
              { alignItems: isRTL ? "flex-end" : "flex-start" },
            ]}
          >
            <Text
              style={[
                styles.selectedSlotLabel,
                { textAlign: isRTL ? "right" : "left" },
              ]}
            >
              {isRTL ? "الموعد المختار:" : "Selected:"}
            </Text>
            <Text
              style={[
                styles.selectedSlotDetails,
                { textAlign: isRTL ? "right" : "left" },
              ]}
            >
              {formatDate(selectedDate!)} • {selectedSlot.time} (
              {selectedSlot.duration}
              {isRTL ? " دقيقة" : " min"})
            </Text>
          </View>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmBooking}
          >
            <Text style={styles.confirmButtonText}>
              {isRTL ? "تأكيد الحجز" : "Confirm Booking"}
            </Text>
            <Ionicons
              name={isRTL ? "arrow-back" : "arrow-forward"}
              size={20}
              color="#fff"
              style={{ marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 5,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0077cc",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  scrollContainer: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: "#e3f2fd",
    margin: 15,
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    fontSize: 14,
    color: "#333",
  },
  sectionContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  slotCountBadge: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  slotCountText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2e7d32",
  },
  slotCountLabel: {
    fontSize: 12,
    color: "#2e7d32",
  },
  dateScroll: {
    paddingLeft: 15,
  },
  dateCard: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    marginRight: 10,
    minWidth: 100,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  dateCardSelected: {
    backgroundColor: "#0077cc",
    borderColor: "#0077cc",
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#0077cc",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  dayLabelSelected: {
    color: "#fff",
  },
  dateText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  dateTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 15,
    gap: 10,
  },
  slotCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    width: "31%",
    minHeight: 80,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  slotCardDisabled: {
    backgroundColor: "#f5f5f5",
    borderColor: "#e0e0e0",
  },
  slotCardSelected: {
    backgroundColor: "#e3f2fd",
    borderColor: "#0077cc",
    borderWidth: 3,
  },
  slotContent: {
    alignItems: "center",
    gap: 8,
  },
  slotTime: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  slotTimeDisabled: {
    color: "#999",
  },
  slotTimeSelected: {
    color: "#0077cc",
    fontWeight: "700",
  },
  durationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  durationBadge30: {
    backgroundColor: "#e8f5e9",
  },
  durationBadge60: {
    backgroundColor: "#fff3e0",
  },
  durationBadgeDisabled: {
    backgroundColor: "#e0e0e0",
  },
  durationText: {
    fontSize: 11,
    fontWeight: "600",
  },
  durationTextDisabled: {
    color: "#999",
  },
  bookedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  bookedText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
  },
  noSlotsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  noSlotsText: {
    fontSize: 16,
    color: "#999",
    marginTop: 15,
    textAlign: "center",
  },
  bottomBar: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
    elevation: 5,
  },
  selectedSlotInfo: {
    marginBottom: 12,
  },
  selectedSlotLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  selectedSlotDetails: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  confirmButton: {
    backgroundColor: "#0077cc",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
  },
  errorContainer: {
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#c62828",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
  retryButton: {
    backgroundColor: "#0077cc",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});