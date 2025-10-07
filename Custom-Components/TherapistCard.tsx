import React, { JSX } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Therapist } from "../models/therapist";
import { BaseRouteNames } from "../navigations-maps/Base";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "../hooks/useTranslation";

type NavigationProp = NativeStackNavigationProp<any>;

interface TherapistCardProps {
  therapist: Therapist;
}

const TherapistCard: React.FC<TherapistCardProps> = ({ therapist }) => {
  const navigation = useNavigation<NavigationProp>();
  const { t, isRTL } = useTranslation();

  const renderStars = (rating: number): JSX.Element[] =>
    Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name="star"
        size={14}
        color={index < rating ? "#FFD700" : "#E5E5E5"}
      />
    ));

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <Image 
          source={therapist.image} 
          style={[styles.image, isRTL && styles.imageRTL]} 
        />
        <View style={styles.info}>
          <Text style={[styles.name, isRTL && styles.textRTL]}>
            {therapist.name}
          </Text>
          <Text style={[styles.specialty, isRTL && styles.textRTL]}>
            {therapist.specialty}
          </Text>

          <View style={styles.ratingRow}>
            <View style={[styles.stars, isRTL && styles.starsRTL]}>
              {renderStars(therapist.rating)}
            </View>
            <View style={{ 
              flexDirection: "column", 
              alignItems: isRTL ? "flex-end" : "flex-start" 
            }}>
              {/* Sessions */}
              <Text style={[styles.sessions, isRTL && styles.textRTL]}>
                <Ionicons name="calendar" size={16} color="#2196F3" />{" "}
                {therapist.sessions}+ {t('home.sessions')}
              </Text>

              {/* Top Therapist */}
              {therapist.id === 2 && (
                <View style={[styles.topContainer, isRTL && styles.topContainerRTL]}>
                  <Image
                    source={require("../assets/top.png")}
                    style={styles.topIcon}
                  />
                  <Text style={styles.topText}>{t('home.topTherapist')}</Text>
                </View>
              )}
            </View>
          </View>

          <Text style={[styles.reviews, isRTL && styles.textRTL]}>
            {therapist.rating} ({therapist.reviewCount} {t('home.reviews')})
          </Text>
        </View>
      </View>

      {/* Interests */}
      <View style={styles.interestsContainer}>
        <Text style={[styles.interestsTitle, isRTL && styles.textRTL]}>
          {t('home.interests')}
        </Text>
        <View style={[styles.interestsTags, isRTL && styles.interestsTagsRTL]}>
          {therapist.interests.map((interest, index) => (
            <View key={index} style={styles.interestTag}>
              <Text style={[styles.interestText, isRTL && styles.textRTL]}>
                {interest}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Appointment */}
      <View style={[styles.appointmentRow, isRTL && styles.appointmentRowRTL]}>
        <Ionicons name="time" size={16} color="#666" />
        <Text style={[styles.appointmentText, isRTL && styles.textRTL]}>
          {t('home.nearestAppointment')} {therapist.nextAppointment}
        </Text>
      </View>

      {/* Pricing */}
      <View style={[styles.pricingRow, isRTL && styles.pricingRowRTL]}>
        <Ionicons name="card" size={16} color="#2196F3" />
        <Text style={[styles.pricingText, isRTL && styles.textRTL]}>
          {therapist.price60} / 60 Min    {therapist.price30} / 30 Min
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => navigation.navigate(BaseRouteNames.TherapistProfile, {
            therapistId: therapist.id
          })}
        >
          <Text style={styles.viewText}>{t('home.viewProfile')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookText}>{t('home.bookNow')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TherapistCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    marginBottom: 15,
  },
  headerRTL: {
    flexDirection: "row-reverse",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  imageRTL: {
    marginRight: 0,
    marginLeft: 15,
  },
  info: { 
    flex: 1,
  },
  name: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4d4d4f",
    marginBottom: 4,
    fontFamily: 'Montserrat',
  },
  specialty: { 
    fontSize: 14, 
    color: "#2196F3", 
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  stars: { 
    flexDirection: "row",
  },
  starsRTL: {
    flexDirection: "row-reverse",
  },
  sessions: { 
    fontSize: 12, 
    color: "#666",
  },
  topContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginTop: 4,
    gap: 4,
  },
  topContainerRTL: {
    flexDirection: "row-reverse",
  },
  topIcon: { 
    width: 20, 
    height: 20, 
    resizeMode: "contain",
  },
  topText: { 
    color: "#fcb045", 
    fontSize: 12, 
    fontWeight: "500",
  },
  reviews: { 
    fontSize: 12, 
    color: "#666",
  },
  interestsContainer: { 
    marginBottom: 15,
  },
  interestsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  interestsTags: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: 8,
  },
  interestsTagsRTL: {
    flexDirection: "row-reverse",
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 500,
    backgroundColor: "#6cca871a",
  },
  interestText: { 
    fontSize: 12, 
    color: "#60a899",
  },
  appointmentRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 12, 
    gap: 8,
  },
  appointmentRowRTL: {
    flexDirection: "row-reverse",
  },
  appointmentText: { 
    fontSize: 14, 
    color: "#666",
  },
  pricingRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 20, 
    gap: 8,
  },
  pricingRowRTL: {
    flexDirection: "row-reverse",
  },
  pricingText: { 
    fontSize: 14, 
    color: "#666",
  },
  buttonRow: { 
    flexDirection: "row", 
    gap: 12,
  },
  viewButton: { 
    flex: 1, 
    paddingVertical: 12, 
    borderRadius: 8, 
    alignItems: "center",
  },
  viewText: { 
    color: "#4caf50", 
    fontSize: 14, 
    fontWeight: "600",
  },
  bookButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#2196F3",
    alignItems: "center",
  },
  bookText: { 
    color: "#fff", 
    fontSize: 14, 
    fontWeight: "600",
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});