import React, { useEffect } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { Image, View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import * as Progress from "react-native-progress";
import { useAppSelector, useAppDispatch } from "../../hooks/useReduxHooks";
import {
  selectTherapistData,
  selectCurrentComment,
  selectTherapistReviews,
  selectTherapistDetails,
  selectTherapistInterests,
  selectTherapistTags,
  selectTherapistCertificates,
  selectTherapistAwards,
  selectTherapistComments,
  selectCurrentCommentIndex,
  selectIsLoading,
  selectError,
  nextComment,
  prevComment,
  loadTherapistDataAsync,
  clearError,
} from "./therapistSlice";

export default function TherapistScreen(): React.ReactElement {
  const dispatch = useAppDispatch();
  
  // Selectors
  const therapistData = useAppSelector(selectTherapistData);
  const currentComment = useAppSelector(selectCurrentComment);
  const reviews = useAppSelector(selectTherapistReviews);
  const details = useAppSelector(selectTherapistDetails);
  const interests = useAppSelector(selectTherapistInterests);
  const tags = useAppSelector(selectTherapistTags);
  const certificates = useAppSelector(selectTherapistCertificates);
  const awards = useAppSelector(selectTherapistAwards);
  const comments = useAppSelector(selectTherapistComments);
  const currentCommentIndex = useAppSelector(selectCurrentCommentIndex);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  // Load therapist data on component mount (for future API integration)
  useEffect(() => {
    // Uncomment this line when you want to load data from API
    // dispatch(loadTherapistDataAsync("therapist-id-1"));
    
    // Clear any existing errors
    dispatch(clearError());
  }, [dispatch]);

  const handlePrev = () => {
    dispatch(prevComment());
  };

  const handleNext = () => {
    dispatch(nextComment());
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0077cc" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading therapist profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ color: 'red', textAlign: 'center', marginBottom: 20 }}>
          Error: {error}
        </Text>
        <TouchableOpacity 
          style={{ backgroundColor: '#0077cc', padding: 10, borderRadius: 5 }}
          onPress={() => dispatch(loadTherapistDataAsync("therapist-id-1"))}
        >
          <Text style={{ color: 'white' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!therapistData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#666' }}>No therapist data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Therapist Profile</Text>

      {/* Profile Card */}
      <View style={styles.card}>
        <View style={styles.profileRow}>
          <Image source={therapistData.profileImage} style={styles.avatar} />
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={styles.name}>{therapistData.name}</Text>
            <Text style={styles.profession}>{therapistData.profession}</Text>
            <View style={styles.starRow}>
              {[...Array(5)].map((_, i) => (
                <FontAwesome key={i} name="star" size={14} color="gold" />
              ))}
            </View>
            <Text style={styles.reviews}>
              {therapistData.rating} ({therapistData.totalReviews} Reviews){' '}
              {therapistData.isTopTherapist && (
                <Text style={styles.topTherapist}>Top Therapist</Text>
              )}
            </Text>
          </View>
        </View>

        {/* Tags */}
        <View style={styles.tagsRow}>
          {tags.map((tag, index) => (
            <Text key={index} style={styles.tag}>{tag}</Text>
          ))}
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

        <Text style={styles.note}>{therapistData.note}</Text>
      </View>

      {/* Interests */}
      <View style={styles.card}>
        <Text style={styles.Title}>Interests</Text>
        <View style={styles.tagsWrap}>
          {interests.map((interest, index) => (
            <Text key={index} style={styles.interestTag}>{interest}</Text>
          ))}
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
          <Text style={styles.ratingText}>
            {therapistData.rating} ({therapistData.totalReviews} Reviews)
          </Text>
        </View>

        {reviews.map((r) => (
          <View key={r.id} style={styles.reviewRowNew}>
            <Text style={styles.reviewLabel}>{r.label}</Text>
            <View style={styles.progressRow}>
              <Progress.Bar
                progress={r.value / 5}
                width={250}
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
      {currentComment && (
        <View style={styles.commentCard}>
          <FontAwesome name="quote-left" size={38} color="#eee" style={{ marginBottom: 6,display:'flex',justifyContent:'flex-start',marginRight:250 }} />
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
          {comments.length > 1 && (
            <>
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
                    style={[styles.dot, { backgroundColor: index === currentCommentIndex ? "#2ecc71" : "#ccc" }]}
                  />
                ))}
              </View>
            </>
          )}
        </View>
      )}

      <TouchableOpacity>
        <Text style={styles.moreReviews}>Check more reviews</Text>
      </TouchableOpacity>

      {/* Certificates Section */}
      <View style={styles.card}>
        <Text style={styles.Title}>Certificates</Text>
        {certificates.map((item, index, arr) => (
          <View key={index} style={styles.certificateRow}>
            <View style={styles.timeline}>
              {/* <View style={styles.timelineDot} /> */}
              {index !== arr.length  && <View style={styles.timelineLine} />}
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
        {awards.map((item, index, arr) => (
          <View key={index} style={styles.certificateRow}>
            <View style={styles.timeline}>
              {/* <View style={styles.timelineDot} /> */}
              {index !== arr.length  && <View style={styles.timelineLine} />}
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
    marginTop: 10,
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
    marginBottom: 20, 
    marginTop: 5,
  },
  arrowCircle: { 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    backgroundColor: "#2ecc71", 
    justifyContent: "center", 
    alignItems: "center", 

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
    marginBottom: 15, 

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
    width: 6,
    borderRadius: 25, 
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