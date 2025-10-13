import { Therapist } from "../../models/therapist";
import { API } from "../network/network";

const USE_DUMMY_API = true; // Set to false when you want to use real API

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

// Dummy API for testing/development
const fetchTherapistsDummy = async (language: 'en' | 'ar' = 'en') => {
  console.log("🔄 Using DUMMY API for therapists list");
  
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  const data = language === 'en' ? englishTherapistsData : arabicTherapistsData;
  
  return {
    success: true,
    data: data,
  };
};

/**
 * ✅ Fetch therapists - returns RAW API response
 * NO serialization here - that happens in the slice
 */
export const fetchTherapists = async (language: 'en' | 'ar' = 'en'): Promise<any> => {
  try {
    console.log(`Fetching therapists in ${language} language...`);
    
    // Use dummy API if flag is true
    if (USE_DUMMY_API) {
      const response = await fetchTherapistsDummy(language);

      if (!response.success) {
        throw new Error("Failed to fetch therapists");
      }

      // ✅ Return raw data - NO serialization
      return response.data;
    }

    // Real API implementation
    const response = await API.GET({
      URL: "therapists",
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': language,
      },
      params: {
        language: language,
      },
    });

    if (!response.data) {
      throw new Error("Failed to fetch therapists");
    }

    // ✅ Return raw data - NO serialization
    return response.data;
  } catch (e: any) {
    console.error("Error fetching therapists:", e);
    
    const errorMessage = e.response?.data?.message || 
                        e.response?.data?.error || 
                        e.message || 
                        "Unable to fetch therapists";
    
    throw new Error(errorMessage);
  }
};