// networks/therapist/therapistDetailApi.ts
import { NotificationService } from "../../notifications/notificationHandler";
import { API_URL, API } from "../network/network";


export const fetchTherapistDetail = async (
  therapistId: number, 
  language: 'en' | 'ar' = 'en'
): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}therapists/${therapistId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Accept-Language": language,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // Return raw data - NO serialization here
    return data;
  } catch (e: any) {
    await NotificationService.sendImmediateNotification({
      title: "❌ Error",
      body: "Failed to fetch therapist details",
      data: { type: 'fetch_error' },
      channelId: 'api-notifications'
    });
    throw e;
  }
};

/**
 * Fetch therapist list - returns raw API response
 */
export const fetchTherapistList = async (
  language: 'en' | 'ar' = 'en',
  params?: any
): Promise<any> => {
  try {
    const response = await API.GET({
      URL: "therapists",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Accept-Language": language,
      },
      params: {
        language: language,
        ...params,
      },
    });

    return response.data;
  } catch (e: any) {
    await NotificationService.sendImmediateNotification({
      title: "❌ Error",
      body: "Failed to fetch therapist list",
      data: { type: 'fetch_error' },
      channelId: 'api-notifications'
    });
    throw e;
  }
};

/**
 * Book appointment - POST request example
 */
export const bookTherapistAppointment = async (
  therapistId: number,
  appointmentData: any
): Promise<any> => {
  try {
    const response = await API.POST({
      URL: `therapists/${therapistId}/appointments`,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      data: appointmentData,
    });

    return response.data;
  } catch (e: any) {
    await NotificationService.sendImmediateNotification({
      title: "❌ Booking Failed",
      body: "Failed to book appointment",
      data: { type: 'booking_error' },
      channelId: 'api-notifications'
    });
    throw e;
  }
};

// ==================== DUMMY DATA (for testing) ====================

// English therapist details data
const englishTherapistDetails = [
  {
    id: 1,
    name: "Dr. John Doe",
    specialty: "Psychiatrist", 
    profession: "Psychiatrist",
    rating: 4.9,
    reviewCount: 85, 
    totalReviews: 85,
    sessions: "400", 
    price60: "120 USD", 
    price30: "65 USD", 
    nextAppointment: "Monday, Oct. 21 at 9:00 PM", 
    isTopTherapist: true,
    image: require("../../assets/profile.jpg"), 
    profileImage: require("../../assets/profile.jpg"),
    tags: ["Depression", "Anxiety"],
    interests: ["Depression", "Anxiety", "Stress Management", "PTSD"],
    details: [
      { id: 1, label: "Language", value: "English, Spanish", icon: require("../../assets/languageicon.png") },
      { id: 2, label: "Country", value: "USA", icon: require("../../assets/countryicon.png") },
      { id: 3, label: "Joining Date", value: "3 years ago", icon: require("../../assets/calendaricon.png") },
      { id: 4, label: "Number of sessions", value: "400+ Sessions", icon: require("../../assets/sessionsicon.png") },
    ],
    reviews: [
      { id: 1, label: "Communication", value: 4.9 },
      { id: 2, label: "Understanding of the situation", value: 4.8 },
      { id: 3, label: "Providing effective solutions", value: 4.9 },
      { id: 4, label: "Commitment to start and end times", value: 5 },
    ],
    comments: [
      { id: 1, text: "Dr. Doe helped me tremendously with my anxiety. Highly recommended!", user: "Sarah M.", rating: 5, time: "2 days ago" },
      { id: 2, text: "Very professional and understanding.", user: "Mike T.", rating: 5, time: "1 week ago" },
    ],
    certificates: [
      { title: "Board Certified Psychiatrist", org: "American Board of Psychiatry", date: "Jan 2015 - Present" },
      { title: "MD in Psychiatry", org: "Harvard Medical School", date: "2010 - 2014" },
    ],
    awards: [
      { title: "Excellence in Mental Health", org: "National Psychiatry Association", date: "2023" },
    ],
    note: "(All prices include VAT and Service Fees.)"
  },
  {
    id: 2,
    name: "Dr. Jane Smith",
    specialty: "Clinical Psychologist", 
    profession: "Clinical Psychologist",
    rating: 4.8,
    reviewCount: 65, 
    totalReviews: 65,
    sessions: "300", 
    price60: "110 USD", 
    price30: "55 USD",
    nextAppointment: "Tuesday, Oct. 22 at 6:00 PM", 
    isTopTherapist: true,
    image: require("../../assets/profile2.jpg"), 
    profileImage: require("../../assets/profile2.jpg"),
    tags: ["Relationships", "Stress"],
    interests: ["Relationships", "Stress", "Self-Esteem", "Work-Life Balance"],
    details: [
      { id: 1, label: "Language", value: "English, French", icon: require("../../assets/languageicon.png") },
      { id: 2, label: "Country", value: "Canada", icon: require("../../assets/countryicon.png") },
      { id: 3, label: "Joining Date", value: "2 years ago", icon: require("../../assets/calendaricon.png") },
      { id: 4, label: "Number of sessions", value: "300+ Sessions", icon: require("../../assets/sessionsicon.png") },
    ],
    reviews: [
      { id: 1, label: "Communication", value: 4.8 },
      { id: 2, label: "Understanding of the situation", value: 4.9 },
      { id: 3, label: "Providing effective solutions", value: 4.7 },
      { id: 4, label: "Commitment to start and end times", value: 4.8 },
    ],
    comments: [
      { id: 1, text: "Dr. Smith is amazing! She helped me improve my relationships.", user: "Emma R.", rating: 5, time: "3 days ago" },
      { id: 2, text: "Very insightful and compassionate.", user: "John K.", rating: 4, time: "5 days ago" },
    ],
    certificates: [
      { title: "Licensed Clinical Psychologist", org: "Canadian Psychological Association", date: "Jan 2018 - Present" },
      { title: "PhD in Psychology", org: "University of Toronto", date: "2014 - 2018" },
    ],
    awards: [
      { title: "Top Psychologist Award", org: "Mental Health Canada", date: "2022" },
    ],
    note: "(All prices include VAT and Service Fees.)"
  },
  {
    id: 3,
    name: "Dr. Michael Brown",
    specialty: "Marriage Counselor", 
    profession: "Marriage Counselor",
    rating: 4.7,
    reviewCount: 120, 
    totalReviews: 120,
    sessions: "500", 
    price60: "100 USD", 
    price30: "50 USD", 
    nextAppointment: "Wednesday, Oct. 23 at 3:00 PM", 
    isTopTherapist: false,
    image: require("../../assets/profile.jpg"), 
    profileImage: require("../../assets/profile.jpg"),
    tags: ["Marriage Issues", "Family Therapy"],
    interests: ["Marriage Issues", "Family Therapy", "Communication", "Parenting"],
    details: [
      { id: 1, label: "Language", value: "English", icon: require("../../assets/languageicon.png") },
      { id: 2, label: "Country", value: "UK", icon: require("../../assets/countryicon.png") },
      { id: 3, label: "Joining Date", value: "5 years ago", icon: require("../../assets/calendaricon.png") },
      { id: 4, label: "Number of sessions", value: "500+ Sessions", icon: require("../../assets/sessionsicon.png") },
    ],
    reviews: [
      { id: 1, label: "Communication", value: 4.7 },
      { id: 2, label: "Understanding of the situation", value: 4.8 },
      { id: 3, label: "Providing effective solutions", value: 4.6 },
      { id: 4, label: "Commitment to start and end times", value: 4.7 },
    ],
    comments: [
      { id: 1, text: "Dr. Brown saved our marriage. Forever grateful!", user: "Linda & Mark", rating: 5, time: "1 week ago" },
      { id: 2, text: "Great counselor for couples therapy.", user: "Anna P.", rating: 4, time: "2 weeks ago" },
    ],
    certificates: [
      { title: "Licensed Marriage & Family Therapist", org: "British Association for Counselling", date: "Jan 2012 - Present" },
      { title: "Master in Family Therapy", org: "University of London", date: "2010 - 2012" },
    ],
    awards: [
      { title: "Family Therapist of the Year", org: "UK Counseling Board", date: "2021" },
    ],
    note: "(All prices include VAT and Service Fees.)"
  }
];

// Arabic therapist details data
const arabicTherapistDetails = [
  {
    id: 1,
    name: "د. أحمد محمود",
    specialty: "طبيب نفسي", 
    profession: "طبيب نفسي",
    rating: 4.9,
    reviewCount: 85, 
    totalReviews: 85,
    sessions: "400", 
    price60: "120 دولار", 
    price30: "65 دولار",
    nextAppointment: "الاثنين، 21 أكتوبر الساعة 9:00 مساءً", 
    isTopTherapist: true,
    image: require("../../assets/profile.jpg"), 
    profileImage: require("../../assets/profile.jpg"),
    tags: ["الاكتئاب", "القلق"],
    interests: ["الاكتئاب", "القلق", "إدارة الضغط النفسي", "اضطراب ما بعد الصدمة"],
    details: [
      { id: 1, label: "اللغة", value: "العربية، الإنجليزية", icon: require("../../assets/languageicon.png") },
      { id: 2, label: "الدولة", value: "مصر", icon: require("../../assets/countryicon.png") },
      { id: 3, label: "تاريخ الانضمام", value: "منذ 3 سنوات", icon: require("../../assets/calendaricon.png") },
      { id: 4, label: "عدد الجلسات", value: "400+ جلسة", icon: require("../../assets/sessionsicon.png") },
    ],
    reviews: [
      { id: 1, label: "التواصل", value: 4.9 },
      { id: 2, label: "فهم الحالة", value: 4.8 },
      { id: 3, label: "تقديم حلول فعالة", value: 4.9 },
      { id: 4, label: "الالتزام بالمواعيد", value: 5 },
    ],
    comments: [
      { id: 1, text: "ألف شكر لـ الدكتور أحمد، ساعدني كثيراً", user: "سارة م.", rating: 5, time: "منذ يومين" },
      { id: 2, text: "طبيب محترف جداً ومتفهم", user: "محمد ت.", rating: 5, time: "منذ أسبوع" },
    ],
    certificates: [
      { title: "طبيب نفسي معتمد", org: "الجمعية المصرية للطب النفسي", date: "يناير 2015 - حتى الآن" },
      { title: "دكتوراه في الطب النفسي", org: "جامعة القاهرة", date: "2010 - 2014" },
    ],
    awards: [
      { title: "جائزة التميز في الصحة النفسية", org: "الجمعية الوطنية للطب النفسي", date: "2023" },
    ],
    note: "(جميع الأسعار تشمل ضريبة القيمة المضافة ورسوم الخدمة.)"
  },
  {
    id: 2,
    name: "د. سارة علي",
    specialty: "أخصائية نفسية إكلينيكية", 
    profession: "أخصائية نفسية إكلينيكية",
    rating: 4.8,
    reviewCount: 65, 
    totalReviews: 65,
    sessions: "300", 
    price60: "110 دولار", 
    price30: "55 دولار", 
    nextAppointment: "الثلاثاء، 22 أكتوبر الساعة 6:00 مساءً", 
    isTopTherapist: true,
    image: require("../../assets/profile2.jpg"), 
    profileImage: require("../../assets/profile2.jpg"),
    tags: ["العلاقات", "الضغط النفسي"],
    interests: ["العلاقات", "الضغط النفسي", "تقدير الذات", "التوازن بين العمل والحياة"],
    details: [
      { id: 1, label: "اللغة", value: "العربية، الفرنسية", icon: require("../../assets/languageicon.png") },
      { id: 2, label: "الدولة", value: "الإمارات", icon: require("../../assets/countryicon.png") },
      { id: 3, label: "تاريخ الانضمام", value: "منذ سنتين", icon: require("../../assets/calendaricon.png") },
      { id: 4, label: "عدد الجلسات", value: "300+ جلسة", icon: require("../../assets/sessionsicon.png") },
    ],
    reviews: [
      { id: 1, label: "التواصل", value: 4.8 },
      { id: 2, label: "فهم الحالة", value: 4.9 },
      { id: 3, label: "تقديم حلول فعالة", value: 4.7 },
      { id: 4, label: "الالتزام بالمواعيد", value: 4.8 },
    ],
    comments: [
      { id: 1, text: "دكتورة سارة رائعة! ساعدتني في تحسين علاقاتي", user: "إيمان ر.", rating: 5, time: "منذ 3 أيام" },
      { id: 2, text: "دكتورة متفهمة ومحترفة", user: "جون ك.", rating: 4, time: "منذ 5 أيام" },
    ],
    certificates: [
      { title: "أخصائية نفسية إكلينيكية معتمدة", org: "جمعية علم النفس الإماراتية", date: "يناير 2018 - حتى الآن" },
      { title: "دكتوراه في علم النفس", org: "جامعة دبي", date: "2014 - 2018" },
    ],
    awards: [
      { title: "جائزة أفضل أخصائية نفسية", org: "الصحة النفسية الإمارات", date: "2022" },
    ],
    note: "(جميع الأسعار تشمل ضريبة القيمة المضافة ورسوم الخدمة.)"
  },
  {
    id: 3,
    name: "د. محمد حسن",
    specialty: "مستشار زواج", 
    profession: "مستشار زواج",
    rating: 4.7,
    reviewCount: 120, 
    totalReviews: 120,
    sessions: "500", 
    price60: "100 دولار", 
    price30: "50 دولار", 
    nextAppointment: "الأربعاء، 23 أكتوبر الساعة 3:00 مساءً", 
    isTopTherapist: false,
    image: require("../../assets/profile.jpg"), 
    profileImage: require("../../assets/profile.jpg"),
    tags: ["مشاكل الزواج", "العلاج الأسري"],
    interests: ["مشاكل الزواج", "العلاج الأسري", "التواصل", "تربية الأطفال"],
    details: [
      { id: 1, label: "اللغة", value: "العربية", icon: require("../../assets/languageicon.png") },
      { id: 2, label: "الدولة", value: "السعودية", icon: require("../../assets/countryicon.png") },
      { id: 3, label: "تاريخ الانضمام", value: "منذ 5 سنوات", icon: require("../../assets/calendaricon.png") },
      { id: 4, label: "عدد الجلسات", value: "500+ جلسة", icon: require("../../assets/sessionsicon.png") },
    ],
    reviews: [
      { id: 1, label: "التواصل", value: 4.7 },
      { id: 2, label: "فهم الحالة", value: 4.8 },
      { id: 3, label: "تقديم حلول فعالة", value: 4.6 },
      { id: 4, label: "الالتزام بالمواعيد", value: 4.7 },
    ],
    comments: [
      { id: 1, text: "دكتور محمد أنقذ زواجنا. ممتنون للأبد!", user: "ليندا ومارك", rating: 5, time: "منذ أسبوع" },
      { id: 2, text: "مستشار رائع للعلاج الزوجي", user: "آنا ب.", rating: 4, time: "منذ أسبوعين" },
    ],
    certificates: [
      { title: "مستشار زواج وعائلة معتمد", org: "الجمعية السعودية للإرشاد", date: "يناير 2012 - حتى الآن" },
      { title: "ماجستير في العلاج الأسري", org: "جامعة الملك سعود", date: "2010 - 2012" },
    ],
    awards: [
      { title: "معالج عائلي للعام", org: "مجلس الإرشاد السعودي", date: "2021" },
    ],
    note: "(جميع الأسعار تشمل ضريبة القيمة المضافة ورسوم الخدمة.)"
  }
];

/**
 * DUMMY API - for testing without real backend
 * Remove this when connecting to real API
 */
export const fetchTherapistDetailDummy = async (
  therapistId: number, 
  language: 'en' | 'ar' = 'en'
): Promise<any> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  const dataSource = language === 'en' ? englishTherapistDetails : arabicTherapistDetails;
  const data = dataSource.find(t => t.id === therapistId);
  
  if (!data) {
    throw new Error("Therapist not found");
  }
  
  return data;
};