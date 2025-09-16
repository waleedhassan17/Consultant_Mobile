import React, { useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { Image, View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import * as Progress from "react-native-progress";
import { useAppSelector, useAppDispatch } from "../../hooks/useReduxHooks";
// import { selectMessage, setMessage } from "./homeScreenSlice";
import { useRoute } from "@react-navigation/native";

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
   
}

const reviews: Review[] = [
  { id: 1, label: "Communication", value: 5 },
  { id: 2, label: "Understanding of the situation", value: 4.84 },
  { id: 3, label: "Providing effective solutions", value: 5 },
  { id: 4, label: "Commitment to start and end times", value: 4.84 },
];

const comments: Comment[] = [
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
];

const details: Detail[] = [
  { id: 1, label: "Language", value: "English, Arabic, Deutsch" },
  { id: 2, label: "Country", value: "Egypt"},
  { id: 3, label: "Joining Date", value: "4 years ago" },
  { id: 4, label: "Number of sessions", value: "500+ Sessions"},
];

export default function TherapistProfile(): React.ReactElement {
  const dispatch = useAppDispatch();
//   const message = useAppSelector(selectMessage);
  const Profile = require("../../assets/profile.jpg");
  

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentComment = comments[currentIndex];

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? comments.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === comments.length - 1 ? 0 : prev + 1));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Therapist Profile</Text>

      {/* Profile Card */}
      <View style={styles.card}>
        <View style={styles.profileRow}>
          <Image source={Profile} style={styles.avatar} />
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={styles.name}>Ass. prof. Mohamed Elsheikh</Text>
            <Text style={styles.profession}>Psychiatrist</Text>
            <View style={styles.starRow}>
              {[...Array(5)].map((_, i) => (
                <FontAwesome key={i} name="star" size={14} color="gold" />
              ))}
            </View>
            <Text style={styles.reviews}>
              4.95 (80 Reviews) <Text style={styles.topTherapist}>Top Therapist</Text>
            </Text>
          </View>
        </View>

        {/* Tags */}
        <View style={styles.tagsRow}>
          <Text style={styles.tag}>Anxiety Disorders</Text>
          <Text style={styles.tag}>Depression</Text>
        </View>

        {/* Details */}
        <View style={styles.details}>
          {details.map((item) => (
            <View key={item.id} style={styles.detailRow}>
              <Image source={item.icon} style={styles.detailIcon} resizeMode="contain" />
              <Text style={styles.detailText}>
                <Text style={styles.detailLabel}>{item.label}: </Text>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.note}>(All prices include VAT and Service Fees.)</Text>
      </View>

      {/* Interests */}
      <View style={styles.card}>
        <Text style={styles.Title}>Interests</Text>
        <View style={styles.tagsWrap}>
          <Text style={styles.interestTag}>Mood disorders (depression)</Text>
          <Text style={styles.interestTag}>Anxiety disorders and obsessions</Text>
          <Text style={styles.interestTag}>Marriage Counselling/Relationship</Text>
          <Text style={styles.interestTag}>Addiction</Text>
        </View>
      </View>

      {/* Ratings Section */}
      <View style={styles.card}>
        <View style={styles.topRow}>
          {[...Array(5)].map((_, i) => (
            <FontAwesome key={i} name="star" size={16} color="#f5b301" style={{ marginRight: 2 }} />
          ))}
          <View style={styles.badge}>
            <FontAwesome name="star" size={12} color="#fff" />
          </View>
          <Text style={styles.ratingText}>4.95 (80 Reviews)</Text>
        </View>

        {reviews.map((r) => (
          <View key={r.id} style={styles.reviewRowNew}>
            <Text style={styles.reviewLabel}>{r.label}</Text>
            <View style={styles.progressRow}>
              <Progress.Bar
                progress={r.value / 5}
                width={200}
                height={10}
                color="#333"
                unfilledColor="#e6e6e6"
                borderWidth={0}
                borderRadius={999}
              />
              <Text style={styles.progressValue}>{r.value.toFixed(2)}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Users Comment */}
      <View style={styles.commentCard}>
        <FontAwesome name="quote-left" size={18} color="#ccc" style={{ marginBottom: 6 }} />
        <Text style={styles.commentText}>{currentComment.text}</Text>

        <View style={styles.commentFooter}>
          <Text style={styles.commentUser}>{currentComment.user}</Text>
          <Text style={styles.commentTime}>{currentComment.time}</Text>
        </View>

        <View style={styles.starRowNew}>
          {[...Array(currentComment.rating)].map((_, i) => (
            <FontAwesome key={i} name="star" size={16} color="#f5b301" />
          ))}
        </View>

        {/* Pagination Controls */}
        <View style={styles.arrows}>
          <TouchableOpacity style={styles.arrowCircle} onPress={handlePrev}>
            <FontAwesome name="chevron-left" size={14} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.arrowCircle} onPress={handleNext}>
            <FontAwesome name="chevron-right" size={14} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.dotsRow}>
          {comments.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, { backgroundColor: index === currentIndex ? "#2ecc71" : "#ccc" }]}
            />
          ))}
        </View>
      </View>

      <TouchableOpacity>
        <Text style={styles.moreReviews}>Check more reviews</Text>
      </TouchableOpacity>

      {/* Certificates Section */}
      <View style={styles.card}>
        <Text style={styles.Title}>Certificates</Text>
        {[
          { title: "Member of the WPA-TPS", org: "WPA-TPS", date: "Dec 2020 - Present" },
          { title: "German Board of Psychiatry", org: "University of Freidburg", date: "Feb 2017 - Present" },
          { title: "Membership", org: "DGPPN & EPA", date: "Jan 2016 - Present" },
          { title: "Member of the european psychiatric association EPA", org: "European Psychiatric Association EPA", date: "Jan 2013 - Present" },
          { title: "German Board of Psychiatry and Psychotherapy", org: "Facharzt, Bezirksärztekammer Südbaden", date: "Jan 2011 - Jan 2016" },
          { title: "Member of the German psychiatric association DGPPN", org: "DGPPN, Germany", date: "Jan 2010 - Present" },
          { title: "Doctor of medicine in Psychiatry", org: "All Saints University", date: "—" },
        ].map((item, index, arr) => (
          <View key={index} style={styles.certificateRow}>
            <View style={styles.timeline}>
              <View style={styles.timelineDot} />
              {index !== arr.length - 1 && <View style={styles.timelineLine} />}
            </View>
            <View style={styles.certificateTextWrap}>
              <Text style={styles.certificateTitle}>{item.title}</Text>
              <Text style={styles.certificateOrg}>{item.org}</Text>
              <Text style={styles.certificateDate}>{item.date}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Awards & Recognitions Section */}
      <View style={styles.card}>
        <Text style={styles.Title}>Awards & Recognitions</Text>
        {[
          { title: "Best Psychiatrist Award", org: "Health Association", date: "2022" },
          { title: "Excellence in Psychiatry", org: "Medical Board", date: "2021" },
          { title: "Top Mental Health Practitioner", org: "Global Psychiatry Summit", date: "2020" },
        ].map((item, index, arr) => (
          <View key={index} style={styles.certificateRow}>
            <View style={styles.timeline}>
              <View style={styles.timelineDot} />
              {index !== arr.length - 1 && <View style={styles.timelineLine} />}
            </View>
            <View style={styles.certificateTextWrap}>
              <Text style={styles.certificateTitle}>{item.title}</Text>
              <Text style={styles.certificateOrg}>{item.org}</Text>
              <Text style={styles.certificateDate}>{item.date}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    padding: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    marginTop: 50,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#0077cc",
    textAlign: "center",
  },
  Title: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#035fe9",
    textAlign: "left",
    fontFamily: "Montserrat,sans-serif",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ccc",
  },
  name: {
    fontSize: 17,
    fontWeight: "500",
    color: "#4d4d4f",
    marginTop: 15,
  },
  profession: {
    fontSize: 17,
    fontWeight: "500",
    color: "#035FE9",
    marginTop: 5,
  },
  starRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    gap: 3,
  },
  reviews: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4d4d4f",
    marginTop: 6,
    textDecorationLine: "underline",
  },
  topTherapist: {
    fontSize: 12,
    color: "#27ae60",
    textDecorationLine: "none",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 9,
    marginBottom: 3,
  },
  tag: {
    backgroundColor: "#6cca871a",
    paddingHorizontal: 13,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 6,
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "500",
    color: "#60a899",
  },
  details: { 
  marginTop: 8, 
  gap: 4 
},
detailRow: { 
  flexDirection: "row", 
  alignItems: "center", 
  marginBottom: 6 
},
detailIcon: { 
  width: 20, 
  height: 20, 
  marginRight: 8 
},
detailText: { 
  fontSize: 14, 
  color: "#444" 
},
detailLabel: { 
  fontWeight: "500", 
  color: "#035FE9" 
},
note: { 
  marginTop: 10, 
  fontSize: 12, 
  fontWeight: "600", 
  color: "#777", 
  textAlign: "center", 
  fontStyle: "italic" 
},
tagsWrap: { 
  flexDirection: "row", 
  flexWrap: "wrap" 
},

  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    marginRight: 6,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#60a899",
    backgroundColor: "#6cca871a",
  },
  topRow: { 
  flexDirection: "row", 
  alignItems: "center", 
  marginBottom: 16 
},
badge: { 
  width: 22, 
  height: 22, 
  borderRadius: 11, 
  backgroundColor: "#2ecc71", 
  justifyContent: "center", 
  alignItems: "center", 
  marginHorizontal: 8 
},
ratingText: { 
  fontSize: 14, 
  fontWeight: "500", 
  color: "#444" 
},
reviewRowNew: { 
  marginBottom: 12 
},
progressRow: { 
  flexDirection: "row", 
  alignItems: "center" 
},
progressValue: { 
  marginLeft: 8, 
  fontWeight: "600", 
  color: "#444" 
},
reviewLabel: { 
  fontSize: 14, 
  color: "#333", 
  marginBottom: 6 
},
commentCard: { 
  backgroundColor: "#fff", 
  borderRadius: 12, 
  padding: 16, 
  marginBottom: 12, 
  elevation: 2, 
  alignItems: "center" 
},
commentText: { 
  fontSize: 14, 
  color: "#333", 
  textAlign: "center", 
  marginBottom: 6,
},
commentFooter: { 
  flexDirection: "row", 
  justifyContent: "space-between", 
  width: "100%", 
  marginTop: 6,
},
commentUser: { 
  fontSize: 15,
  fontWeight: "600", 
  color: "#777",
},
commentTime: { 
  fontSize: 12, 
  color: "#777",
  marginTop: 3,
},
starRowNew: { 
  flexDirection: "row", 
  marginTop: 5, 
},
arrows: { 
  flexDirection: "row", 
  justifyContent: "space-between", 
  width: "100%", 
  marginBottom: 12, 
  marginTop: 12,
},
arrowCircle: { 
  width: 28, 
  height: 28, 
  borderRadius: 14, 
  backgroundColor: "#2ecc71", 
  justifyContent: "center", 
  alignItems: "center" 
},
dotsRow: { 
  flexDirection: "row", 
  marginTop: 12 
},
dot: { 
  width: 8, 
  height: 8, 
  borderRadius: 4, 
  marginHorizontal: 3 
},
moreReviews: { 
  color: "#60a899", 
  fontSize: 15, 
  textAlign: "center", 
  marginBottom: 25, 
  fontWeight: "600" 
},
certificateRow: { 
  flexDirection: "row", 
  marginBottom: 15 
},
timeline: { 
  alignItems: "center", 
  marginRight: 12, 
  width: 16 
},
timelineDot: { 
  width: 10, 
  height: 10, 
  borderRadius: 5, 
  backgroundColor: "#0077cc" 
},
timelineLine: { 
  flex: 1, 
  width: 2, 
  backgroundColor: "#0077cc", 
  marginTop: 2 
},
certificateTextWrap: { 
  flex: 1 
},
certificateTitle: { 
  fontSize: 14, 
  fontWeight: "400", 
  color: "#4d4d4f", 
  fontFamily: "Montserrat,sans-serif" 
},
certificateOrg: { 
  color: "#4d4d4f", 
  fontSize: 14, 
  fontWeight: "500" 
},
certificateDate: { 
  color: "#035fe9", 
  marginTop: 2, 
  fontSize: 15, 
  fontWeight: "500" 
},
});