// networks/therapist/therapistDetailApi.ts

import { therapistDetailResponseSerializer, TherapistDetail } from "../../serializers/therapistDetailSerilizer";

// English therapist details data
const englishTherapistDetails = [
  {
    id: 1,
    name: "Dr. John Doe",
    profession: "Psychiatrist",
    rating: 4.9,
    totalReviews: 85,
    isTopTherapist: true,
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
    profession: "Clinical Psychologist",
    rating: 4.8,
    totalReviews: 65,
    isTopTherapist: true,
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
    profession: "Marriage Counselor",
    rating: 4.7,
    totalReviews: 120,
    isTopTherapist: false,
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
    profession: "طبيب نفسي",
    rating: 4.9,
    totalReviews: 85,
    isTopTherapist: true,
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
    profession: "أخصائية نفسية إكلينيكية",
    rating: 4.8,
    totalReviews: 65,
    isTopTherapist: true,
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
    profession: "مستشار زواج",
    rating: 4.7,
    totalReviews: 120,
    isTopTherapist: false,
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

// Dummy API with language support
const dummyAPI = {
  GET: async (therapistId: number, language: 'en' | 'ar' = 'en') => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const dataSource = language === 'en' ? englishTherapistDetails : arabicTherapistDetails;
    const data = dataSource.find(t => t.id === therapistId);
    
    if (!data) {
      throw new Error("Therapist not found");
    }
    
    return {
      success: true,
      data: data,
    };
  },
};

/**
 * ✅ Fetch therapist detail with language support
 * Uses serializer to normalize data - works with both dummy and real APIs
 */
export const fetchTherapistDetail = async (
  therapistId: number, 
  language: 'en' | 'ar' = 'en'
): Promise<TherapistDetail> => {
  try {
    console.log(`Fetching therapist detail for ID ${therapistId} in ${language} language...`);
    
    const response = await dummyAPI.GET(therapistId, language);
    
    if (!response.success) {
      throw new Error("Failed to fetch therapist detail");
    }
    
    // ✅ Serialize the response so data is always normalized
    return therapistDetailResponseSerializer(response.data);
  } catch (e: any) {
    console.error("Error fetching therapist detail:", e);
    throw new Error(e.message || "Unable to fetch therapist detail");
  }
};