import { therapistResponseSerializer } from "../../serializers/therapistSerializer";
import { Therapist } from "../../models/therapist";

// English API Data
const englishTherapistsData = [
  {
    id: 1,
    name: "Dr. John Doe",
    specialty: "Psychiatrist",
    rating: 4.9,
    reviewCount: 85,
    sessions: "400",
    interests: ["Depression", "Anxiety", "Stress Management"],
    nextAppointment: "Monday, Oct. 21 at 9:00 PM",
    price60: "120 USD",
    price30: "65 USD",
    image: require("../../assets/profile.jpg"),
  },
  {
    id: 2,
    name: "Dr. Jane Smith",
    specialty: "Clinical Psychologist",
    rating: 4.8,
    reviewCount: 65,
    sessions: "300",
    interests: ["Relationships", "Stress", "Self-Esteem"],
    nextAppointment: "Tuesday, Oct. 22 at 6:00 PM",
    price60: "110 USD",
    price30: "55 USD",
    image: require("../../assets/profile2.jpg"),
  },
  {
    id: 3,
    name: "Dr. Michael Brown",
    specialty: "Marriage Counselor",
    rating: 4.7,
    reviewCount: 120,
    sessions: "500",
    interests: ["Marriage Issues", "Family Therapy", "Communication"],
    nextAppointment: "Wednesday, Oct. 23 at 3:00 PM",
    price60: "100 USD",
    price30: "50 USD",
    image: require("../../assets/profile.jpg"),
  },
];

// Arabic API Data
const arabicTherapistsData = [
  {
    id: 1,
    name: "د. أحمد محمود",
    specialty: "طبيب نفسي",
    rating: 4.9,
    reviewCount: 85,
    sessions: "400",
    interests: ["الاكتئاب", "القلق", "إدارة الضغط النفسي"],
    nextAppointment: "الاثنين، 21 أكتوبر الساعة 9:00 مساءً",
    price60: "120 دولار",
    price30: "65 دولار",
    image: require("../../assets/profile.jpg"),
  },
  {
    id: 2,
    name: "د. سارة علي",
    specialty: "أخصائية نفسية إكلينيكية",
    rating: 4.8,
    reviewCount: 65,
    sessions: "300",
    interests: ["العلاقات", "الضغط النفسي", "تقدير الذات"],
    nextAppointment: "الثلاثاء، 22 أكتوبر الساعة 6:00 مساءً",
    price60: "110 دولار",
    price30: "55 دولار",
    image: require("../../assets/profile2.jpg"),
  },
  {
    id: 3,
    name: "د. محمد حسن",
    specialty: "مستشار زواج",
    rating: 4.7,
    reviewCount: 120,
    sessions: "500",
    interests: ["مشاكل الزواج", "العلاج الأسري", "التواصل"],
    nextAppointment: "الأربعاء، 23 أكتوبر الساعة 3:00 مساءً",
    price60: "100 دولار",
    price30: "50 دولار",
    image: require("../../assets/profile.jpg"),
  },
];

// Dummy API with language support
const dummyAPI = {
  GET: async (URL: string, language: 'en' | 'ar' = 'en') => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const data = language === 'en' ? englishTherapistsData : arabicTherapistsData;
    
    return {
      success: true,
      data: data,
    };
  },
};

export const fetchTherapists = async (language: 'en' | 'ar' = 'en'): Promise<Therapist[]> => {
  try {
    console.log(`Fetching therapists in ${language} language...`);
    
    const response = await dummyAPI.GET("/therapists", language);

    if (!response.success) {
      throw new Error("Failed to fetch therapists");
    }

    // ✅ Serialize each therapist so data is always normalized
    return response.data.map((t: any) => therapistResponseSerializer(t));
  } catch (e: any) {
    console.error("Error fetching therapists:", e);
    throw new Error(e.message || "Unable to fetch therapists");
  }
};