import React, { JSX } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Therapist } from "../models/therapist";
import { BaseRouteNames } from "../navigations-maps/Base";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type NavigationProp = NativeStackNavigationProp<any>;

interface TherapistCardProps {
  therapist: Therapist;
}

const TherapistCard: React.FC<TherapistCardProps> = ({ therapist }) => {
  const navigation = useNavigation<NavigationProp>();

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
      <View style={styles.header}>
        <Image source={therapist.image} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.name}>{therapist.name}</Text>
          <Text style={styles.specialty}>{therapist.specialty}</Text>

          <View style={styles.ratingRow}>
            <View style={styles.stars}>{renderStars(therapist.rating)}</View>
            <View style={{ flexDirection: "column", alignItems: "flex-start" }}>
              {/* Sessions */}
              <Text style={styles.sessions}>
                <Ionicons name="calendar" size={16} color="#2196F3" />{" "}
                {therapist.sessions}+ Sessions
              </Text>

              {/* Top Therapist */}
              {therapist.id === 2 && (
                <View style={styles.topContainer}>
                  <Image
                    source={require("../assets/top.png")}
                    style={styles.topIcon}
                  />
                  <Text style={styles.topText}>Top therapist</Text>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.reviews}>
            {therapist.rating} ({therapist.reviewCount} Reviews)
          </Text>
        </View>
      </View>

      {/* Interests */}
      <View style={styles.interestsContainer}>
        <Text style={styles.interestsTitle}>Interests:</Text>
        <View style={styles.interestsTags}>
          {therapist.interests.map((interest, index) => (
            <View key={index} style={styles.interestTag}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Appointment */}
      <View style={styles.appointmentRow}>
        <Ionicons name="time" size={16} color="#666" />
        <Text style={styles.appointmentText}>
          Nearest appointment: {therapist.nextAppointment}
        </Text>
      </View>

      {/* Pricing */}
      <View style={styles.pricingRow}>
        <Ionicons name="card" size={16} color="#2196F3" />
        <Text style={styles.pricingText}>
          {therapist.price60} / 60 Min    {therapist.price30} / 30 Min
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => navigation.navigate(BaseRouteNames.TherapistProfile)}
        >
          <Text style={styles.viewText}>View Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookText}>Book Now</Text>
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
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  info: { flex: 1 },
  name: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4d4d4f",
    marginBottom: 4,
  },
  specialty: { fontSize: 14, color: "#2196F3", marginBottom: 8 },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  stars: { flexDirection: "row" },
  sessions: { fontSize: 12, color: "#666" },
  topContainer: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  topIcon: { width: 20, height: 20, resizeMode: "contain" },
  topText: { color: "#fcb045", fontSize: 12, fontWeight: "500" },
  reviews: { fontSize: 12, color: "#666" },
  interestsContainer: { marginBottom: 15 },
  interestsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  interestsTags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 500,
    backgroundColor: "#6cca871a",
  },
  interestText: { fontSize: 12, color: "#60a899" },
  appointmentRow: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 },
  appointmentText: { fontSize: 14, color: "#666" },
  pricingRow: { flexDirection: "row", alignItems: "center", marginBottom: 20, gap: 8 },
  pricingText: { fontSize: 14, color: "#666" },
  buttonRow: { flexDirection: "row", gap: 12 },
  viewButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  viewText: { color: "#4caf50", fontSize: 14, fontWeight: "600" },
  bookButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#2196F3",
    alignItems: "center",
  },
  bookText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
