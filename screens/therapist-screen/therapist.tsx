import React, { useEffect, useState, useCallback } from "react";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { Image, View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Linking } from "react-native";
import * as Progress from "react-native-progress";
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
  selectTherapistExperiences,
  selectTherapistRating,
  selectTherapistEducation,
  selectTherapistComments,
  selectCurrentCommentIndex,
  selectIsLoading,
  selectError,
  nextComment,
  prevComment,
  loadTherapistDetail,
} from "./therapistSlice";
import { selectLanguage } from "../home-screen/homeScreenSlice";

type TherapistScreenRouteProp = RouteProp<{ 
  TherapistProfile: { therapistId: number } 
}, 'TherapistProfile'>;

// Navigation params type for navigating to other screens
type RootStackParamList = {
  TimeSlot: { therapistId: number; therapistName: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TherapistScreen(): React.ReactElement {
  const dispatch = useAppDispatch();
  const route = useRoute<TherapistScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const language = useAppSelector(selectLanguage);
  
  const therapistId = route.params?.therapistId || 1;
  
  const therapistData = useAppSelector(selectTherapistData);
  const currentComment = useAppSelector(selectCurrentComment);
  const reviews = useAppSelector(selectTherapistReviews);
  const details = useAppSelector(selectTherapistDetails);
  const interests = useAppSelector(selectTherapistInterests);
  const tags = useAppSelector(selectTherapistTags);
  const certificates = useAppSelector(selectTherapistCertificates);
  const awards = useAppSelector(selectTherapistAwards);
  const experiences = useAppSelector(selectTherapistExperiences);
  interface EducationItem {
    degree: string;
    institution: string;
    year: string;
    description?: string;
  }
  
  const education = useAppSelector(selectTherapistEducation) as EducationItem[];
  const comments = useAppSelector(selectTherapistComments);
  const currentCommentIndex = useAppSelector(selectCurrentCommentIndex);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  
  const [refreshing, setRefreshing] = useState(false);

  const isRTL = language === 'ar';

  useEffect(() => {
    dispatch(loadTherapistDetail({ therapistId, language }));
  }, [dispatch, therapistId, language]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      dispatch(loadTherapistDetail({ therapistId, language }));
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, therapistId, language]);

  const handlePrev = () => {
    dispatch(prevComment());
  };

  const handleNext = () => {
    dispatch(nextComment());
  };

  const handleRetry = () => {
    dispatch(loadTherapistDetail({ therapistId, language }));
  };

  const handleLinkedInProfile = () => {
    if (therapistData?.linkedInUrl) {
      Linking.openURL(therapistData.linkedInUrl);
    }
  };

  const handleSelectTimeSlot = () => {
    console.log('Navigate to time slot selection');
    navigation.navigate('TimeSlot', {
      therapistId: therapistId,
      therapistName: therapistData?.name || 'Therapist',
    });
  };

  if (isLoading && !refreshing && !therapistData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#0077cc" />
        <Text style={[styles.loadingText, { textAlign: 'center' }]}>
          {isRTL ? 'جاري تحميل الملف الشخصي...' : 'Loading therapist profile...'}
        </Text>
      </View>
    );
  }

  if (error && !therapistData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {isRTL ? `خطأ: ${error}` : `Error: ${error}`}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={handleRetry}
        >
          <Text style={styles.retryButtonText}>
            {isRTL ? 'إعادة المحاولة' : 'Retry'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!therapistData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.noDataText}>
          {isRTL ? 'لا توجد بيانات متاحة' : 'No therapist data available'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#0077cc']}
          tintColor="#0077cc"
          title={isRTL ? "اسحب للتحديث" : "Pull to refresh"}
          titleColor="#666"
        />
      }
    >
      {/* Header with Back Button */}
      <View style={[styles.titleRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color="#666" />
        </TouchableOpacity>
        <Text style={[styles.sectionTitle, isRTL ? { marginRight: 15, marginLeft: 0 } : { marginLeft: 15 }]}>
          {isRTL ? 'الملف الشخصي للمعالج' : 'Therapist Profile'}
        </Text>
      </View>

      {/* Profile Card */}
      <View style={styles.card}>
        <View style={[styles.profileRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Image source={therapistData.profileImage} style={styles.avatar} />
          <View style={[
            styles.profileInfo,
            { 
              marginLeft: isRTL ? 0 : 15,
              marginRight: isRTL ? 15 : 0,
              alignItems: isRTL ? 'flex-end' : 'flex-start'
            }
          ]}>
            <Text style={[styles.name, { textAlign: isRTL ? 'right' : 'left' }]}>
              {therapistData.name}
            </Text>
            <Text style={[styles.profession, { textAlign: isRTL ? 'right' : 'left' }]}>
              {therapistData.profession}
            </Text>
            <View style={[styles.starRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              {[...Array(5)].map((_, i) => (
                <FontAwesome key={i} name="star" size={14} color="gold" />
              ))}
            </View>
            <Text style={[styles.reviews, { textAlign: isRTL ? 'right' : 'left' }]}>
              {therapistData.rating} ({therapistData.totalReviews} {isRTL ? 'تقييم' : 'Reviews'}){' '}
              {therapistData.isTopTherapist && (
                <Text style={styles.topTherapist}>
                  {isRTL ? 'معالج متميز' : 'Top Therapist'}
                </Text>
              )}
            </Text>
          </View>
        </View>

        {/* Tags */}
        {tags.length > 0 && (
          <View style={[styles.tagsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {tags.map((tag, index) => (
              <Text 
                key={index} 
                style={[
                  styles.tag,
                  {
                    marginRight: isRTL ? 0 : 6,
                    marginLeft: isRTL ? 6 : 0,
                  }
                ]}
              >
                {tag}
              </Text>
            ))}
          </View>
        )}

        {/* Info Details with Icons - ALWAYS SHOW */}
        <View style={styles.infoSection}>
          {/* Languages - ALWAYS SHOW */}
          <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Ionicons 
              name="globe-outline" 
              size={20} 
              color="#0077cc" 
              style={[
                styles.infoIcon,
                {
                  marginRight: isRTL ? 0 : 10,
                  marginLeft: isRTL ? 10 : 0,
                }
              ]} 
            />
            <Text style={[styles.infoText, { textAlign: isRTL ? 'right' : 'left' }]}>
              <Text style={styles.infoLabel}>
                {isRTL ? 'اللغة: ' : 'Language: '}
              </Text>
              {therapistData.languages?.join(', ') || (isRTL ? 'غير محدد' : 'Not specified')}
            </Text>
          </View>

          {/* Country - ALWAYS SHOW */}
          <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Ionicons 
              name="location-outline" 
              size={20} 
              color="#0077cc" 
              style={[
                styles.infoIcon,
                {
                  marginRight: isRTL ? 0 : 10,
                  marginLeft: isRTL ? 10 : 0,
                }
              ]} 
            />
            <Text style={[styles.infoText, { textAlign: isRTL ? 'right' : 'left' }]}>
              <Text style={styles.infoLabel}>
                {isRTL ? 'البلد: ' : 'Country: '}
              </Text>
              {therapistData.country || (isRTL ? 'غير محدد' : 'Not specified')}
            </Text>
          </View>

          {/* Joining Date - ALWAYS SHOW */}
          <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Ionicons 
              name="calendar-outline" 
              size={20} 
              color="#0077cc" 
              style={[
                styles.infoIcon,
                {
                  marginRight: isRTL ? 0 : 10,
                  marginLeft: isRTL ? 10 : 0,
                }
              ]} 
            />
            <Text style={[styles.infoText, { textAlign: isRTL ? 'right' : 'left' }]}>
              <Text style={styles.infoLabel}>
                {isRTL ? 'تاريخ الانضمام: ' : 'Joining Date: '}
              </Text>
              {therapistData.joiningDate || (isRTL ? 'غير محدد' : 'Not specified')}
            </Text>
          </View>

          {/* Number of Sessions - ALWAYS SHOW */}
          <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Ionicons 
              name="stats-chart-outline" 
              size={20} 
              color="#0077cc" 
              style={[
                styles.infoIcon,
                {
                  marginRight: isRTL ? 0 : 10,
                  marginLeft: isRTL ? 10 : 0,
                }
              ]} 
            />
            <Text style={[styles.infoText, { textAlign: isRTL ? 'right' : 'left' }]}>
              <Text style={styles.infoLabel}>
                {isRTL ? 'عدد الجلسات: ' : 'Number of sessions: '}
              </Text>
              {therapistData.numberOfSessions || (isRTL ? 'غير محدد' : 'Not specified')}
            </Text>
          </View>
        </View>

        {/* VAT Notice */}
        <Text style={styles.vatNotice}>
          {isRTL ? '(جميع الأسعار تشمل ضريبة القيمة المضافة ورسوم الخدمة)' : '(All prices include VAT and Service Fees.)'}
        </Text>

        {/* Action Buttons - ALWAYS SHOW */}
        <View style={styles.actionButtons}>
          {/* LinkedIn Button - ALWAYS SHOW */}
          <TouchableOpacity 
            style={[styles.linkedInButton, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
            onPress={handleLinkedInProfile}
          >
            <FontAwesome name="linkedin-square" size={18} color="#0077B5" />
            <Text style={[
              styles.linkedInButtonText,
              {
                marginLeft: isRTL ? 0 : 8,
                marginRight: isRTL ? 8 : 0,
              }
            ]}>
              {isRTL ? 'عرض الملف الشخصي' : 'See LinkedIn Profile'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.selectTimeSlotButton}
            onPress={handleSelectTimeSlot}
          >
            <Text style={styles.selectTimeSlotButtonText}>
              {isRTL ? 'اختر الوقت' : 'Select Time Slot'}
            </Text>
          </TouchableOpacity>
        </View>

        {therapistData.note && <Text style={styles.note}>{therapistData.note}</Text>}
      </View>

      {/* Interests */}
      {interests.length > 0 && (
        <View style={styles.card}>
          <Text style={[styles.Title, { textAlign: isRTL ? 'right' : 'left' }]}>
            {isRTL ? 'الاهتمامات' : 'Interests'}
          </Text>
          <View style={[styles.tagsWrap, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {interests.map((interest, index) => (
              <Text 
                key={index} 
                style={[
                  styles.interestTag,
                  {
                    marginRight: isRTL ? 0 : 6,
                    marginLeft: isRTL ? 6 : 0,
                  }
                ]}
              >
                {interest}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Ratings Section */}
      {reviews.length > 0 && (
        <View style={styles.card}>
          <View style={[styles.topRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {[...Array(5)].map((_, i) => (
              <FontAwesome key={i} name="star" size={16} color="#f5b301" style={{ marginRight: 2 }} />
            ))}
            <View style={styles.badge}>
              <FontAwesome name="star" size={12} color="#fff" />
            </View>
            <Text style={styles.ratingText}>
              {therapistData.rating} ({therapistData.totalReviews} {isRTL ? 'تقييم' : 'Reviews'})
            </Text>
          </View>

          {reviews.map((r) => (
            <View key={r.id} style={styles.reviewRowNew}>
              <Text style={[styles.reviewLabel, { textAlign: isRTL ? 'right' : 'left' }]}>
                {r.label}
              </Text>
              <View style={[styles.progressRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Progress.Bar
                  progress={r.value / 5}
                  width={200}
                  height={10}
                  color="#333"
                  unfilledColor="#e6e6e6"
                  borderWidth={0}
                  borderRadius={999}
                />
                <Text 
                  style={[
                    styles.progressValue,
                    {
                      marginLeft: isRTL ? 0 : 8,
                      marginRight: isRTL ? 8 : 0,
                    }
                  ]}
                >
                  {r.value.toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Users Comment */}
      {currentComment && (
        <View style={styles.commentCard}>
          <FontAwesome 
            name={isRTL ? "quote-right" : "quote-left"} 
            size={18} 
            color="#ccc" 
            style={{ marginBottom: 6, alignSelf: isRTL ? 'flex-end' : 'flex-start' }} 
          />
          <Text style={[
            styles.commentText,
            { 
              textAlign: 'center',
              writingDirection: isRTL ? 'rtl' : 'ltr'
            }
          ]}>
            {currentComment.text}
          </Text>

          <View style={[
            styles.commentFooter,
            { flexDirection: isRTL ? 'row-reverse' : 'row' }
          ]}>
            <Text style={styles.commentUser}>{currentComment.user}</Text>
            <Text style={styles.commentTime}>{currentComment.time}</Text>
          </View>

          <View style={[styles.starRowNew, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {[...Array(currentComment.rating)].map((_, i) => (
              <FontAwesome key={i} name="star" size={16} color="#f5b301" />
            ))}
          </View>

          {comments.length > 1 && (
            <>
              <View style={[
                styles.arrows,
                { flexDirection: isRTL ? 'row-reverse' : 'row' }
              ]}>
                <TouchableOpacity style={styles.arrowCircle} onPress={handlePrev}>
                  <FontAwesome 
                    name={isRTL ? "chevron-right" : "chevron-left"} 
                    size={14} 
                    color="#fff" 
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.arrowCircle} onPress={handleNext}>
                  <FontAwesome 
                    name={isRTL ? "chevron-left" : "chevron-right"} 
                    size={14} 
                    color="#fff" 
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.dotsRow}>
                {comments.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot, 
                      { backgroundColor: index === currentCommentIndex ? "#2ecc71" : "#ccc" }
                    ]}
                  />
                ))}
              </View>
            </>
          )}
        </View>
      )}

      {comments.length > 0 && (
        <TouchableOpacity>
          <Text style={styles.moreReviews}>
            {isRTL ? 'عرض المزيد من التقييمات' : 'Check more reviews'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Experience Section */}
      {experiences.length > 0 && (
        <View style={styles.card}>
          <Text style={[styles.Title, { textAlign: isRTL ? 'right' : 'left' }]}>
            {isRTL ? 'الخبرة' : 'Experience'}
          </Text>
          {experiences.map((item, index, arr) => (
            <View 
              key={index} 
              style={[styles.certificateRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
            >
              <View 
                style={[
                  styles.timeline,
                  {
                    marginRight: isRTL ? 0 : 12,
                    marginLeft: isRTL ? 12 : 0,
                  }
                ]}
              >
                <View style={styles.timelineDot} />
                {index !== arr.length - 1 && <View style={styles.timelineLine} />}
              </View>
              <View style={[
                styles.certificateTextWrap,
                { alignItems: isRTL ? 'flex-end' : 'flex-start' }
              ]}>
                <Text style={[styles.certificateTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {item.title}
                </Text>
                <Text style={[styles.certificateOrg, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {item.company}
                </Text>
                <Text style={[styles.certificateDate, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {item.period}
                </Text>
                {item.description && (
                  <Text style={[styles.experienceDesc, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {item.description}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Education Section */}
      {education.length > 0 && (
        <View style={styles.card}>
          <Text style={[styles.Title, { textAlign: isRTL ? 'right' : 'left' }]}>
            {isRTL ? 'التعليم' : 'Education'}
          </Text>
          {education.map((item, index, arr) => (
            <View 
              key={index} 
              style={[styles.certificateRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
            >
              <View 
                style={[
                  styles.timeline,
                  {
                    marginRight: isRTL ? 0 : 12,
                    marginLeft: isRTL ? 12 : 0,
                  }
                ]}
              >
                <View style={styles.timelineDot} />
                {index !== arr.length - 1 && <View style={styles.timelineLine} />}
              </View>
              <View style={[
                styles.certificateTextWrap,
                { alignItems: isRTL ? 'flex-end' : 'flex-start' }
              ]}>
                <Text style={[styles.certificateTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {item.degree}
                </Text>
                <Text style={[styles.certificateOrg, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {item.institution}
                </Text>
                <Text style={[styles.certificateDate, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {item.year}
                </Text>
                {item.description && (
                  <Text style={[styles.experienceDesc, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {item.description}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Certificates Section */}
      {certificates.length > 0 && (
        <View style={styles.card}>
          <Text style={[styles.Title, { textAlign: isRTL ? 'right' : 'left' }]}>
            {isRTL ? 'الشهادات' : 'Certificates'}
          </Text>
          {certificates.map((item, index, arr) => (
            <View 
              key={index} 
              style={[styles.certificateRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
            >
              <View 
                style={[
                  styles.timeline,
                  {
                    marginRight: isRTL ? 0 : 12,
                    marginLeft: isRTL ? 12 : 0,
                  }
                ]}
              >
                <View style={styles.timelineDot} />
                {index !== arr.length - 1 && <View style={styles.timelineLine} />}
              </View>
              <View style={[
                styles.certificateTextWrap,
                { alignItems: isRTL ? 'flex-end' : 'flex-start' }
              ]}>
                <Text style={[styles.certificateTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {item.title}
                </Text>
                <Text style={[styles.certificateOrg, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {item.org}
                </Text>
                <Text style={[styles.certificateDate, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {item.date}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Awards & Recognitions Section */}
      {awards.length > 0 && (
        <View style={styles.card}>
          <Text style={[styles.Title, { textAlign: isRTL ? 'right' : 'left' }]}>
            {isRTL ? 'الجوائز والتقديرات' : 'Awards & Recognitions'}
          </Text>
          {awards.map((item, index, arr) => (
            <View 
              key={index} 
              style={[styles.certificateRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
            >
              <View 
                style={[
                  styles.timeline,
                  {
                    marginRight: isRTL ? 0 : 12,
                    marginLeft: isRTL ? 12 : 0,
                  }
                ]}
              >
                <View style={styles.timelineDot} />
                {index !== arr.length - 1 && <View style={styles.timelineLine} />}
              </View>
              <View style={[
                styles.certificateTextWrap,
                { alignItems: isRTL ? 'flex-end' : 'flex-start' }
              ]}>
                <Text style={[styles.certificateTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {item.title}
                </Text>
                <Text style={[styles.certificateOrg, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {item.org}
                </Text>
                <Text style={[styles.certificateDate, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {item.date}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    padding: 10,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  backButton: {},
  sectionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0077cc",
  },
  Title: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#035fe9",
    fontFamily: "Montserrat,sans-serif",
  },
  profileRow: {
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ccc",
  },
  profileInfo: {
    flex: 1,
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
    flexWrap: "wrap",
    marginTop: 9,
    marginBottom: 3,
  },
  tag: {
    backgroundColor: "#6cca871a",
    paddingHorizontal: 13,
    paddingVertical: 5,
    borderRadius: 20,
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
    alignItems: "center", 
    marginBottom: 6 
  },
  detailIcon: { 
    width: 20, 
    height: 20,
  },
  detailText: { 
    fontSize: 14, 
    color: "#444",
    flex: 1,
  },
  detailLabel: { 
    fontWeight: "500", 
    color: "#035FE9" 
  },
  infoSection: {
    marginTop: 15,
    marginBottom: 10,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    width: 20,
  },
  infoText: {
    fontSize: 14,
    color: "#444",
    flex: 1,
  },
  infoLabel: {
    fontWeight: "600",
    color: "#0077cc",
  },
  vatNotice: {
    fontSize: 12,
    color: "#777",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 5,
  },
  actionButtons: {
    marginTop: 15,
    gap: 10,
  },
  linkedInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0077B5',
  },
  linkedInButtonText: {
    color: '#0077B5',
    fontSize: 15,
    fontWeight: '600',
  },
  selectTimeSlotButton: {
    backgroundColor: '#2e7d96',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectTimeSlotButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    flexWrap: "wrap" 
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#60a899",
    backgroundColor: "#6cca871a",
  },
  topRow: { 
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
    alignItems: "center" 
  },
  progressValue: { 
    fontWeight: "600", 
    color: "#444" 
  },
  reviewLabel: { 
    fontSize: 14, 
    color: "#333", 
    marginBottom: 6,
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
    marginBottom: 6,
  },
  commentFooter: { 
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
    marginTop: 5, 
  },
  arrows: { 
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
    marginBottom: 15 
  },
  timeline: { 
    alignItems: "center",
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
    flex: 1,
  },
  certificateTitle: { 
    fontSize: 14, 
    fontWeight: "400", 
    color: "#4d4d4f", 
    fontFamily: "Montserrat,sans-serif",
  },
  certificateOrg: { 
    color: "#4d4d4f", 
    fontSize: 14, 
    fontWeight: "500",
  },
  certificateDate: { 
    color: "#035fe9", 
    marginTop: 2, 
    fontSize: 15, 
    fontWeight: "500",
  },
  experienceDesc: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
    lineHeight: 18,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#0077cc',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noDataText: {
    color: '#666',
    fontSize: 16,
  },
});