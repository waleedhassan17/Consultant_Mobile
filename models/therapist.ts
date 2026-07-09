// models/therapistModel.ts
import { ImageSourcePropType } from "react-native";

// ==================== BASE MODELS ====================

export interface Therapist {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  sessions: string;
  interests: string[];
  nextAppointment: string;
  price60: string;
  price30: string;
  image: ImageSourcePropType;
  isTopTherapist?: boolean; // optional boolean flag for featured therapists
  languages?: string[]; 
}

export interface Review {
  id: number;
  label: string;
  value: number;
}

export interface Comment {
  id: number;
  text: string;
  user: string;
  rating: number;
  time: string;
}

export interface Detail {
  id: number;
  label: string;
  value: string;
  icon: any;
}

export interface Certificate {
  title: string;
  org: string;
  date: string;
}

export interface Award {
  title: string;
  org: string;
  date: string;
}

export interface Experience {
  title: string;
  company: string;
  period: string;
  description?: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  description?: string;
}

// ==================== EXTENDED MODELS ====================

export interface TherapistDetail extends Therapist {
  profession: string;
  totalReviews: number;
  isTopTherapist: boolean;
  profileImage: ImageSourcePropType;
  tags: string[];
  details: Detail[];
  reviews: Review[];
  comments: Comment[];
  certificates: Certificate[];
  awards: Award[];
  experiences: Experience[];  // New field
  education: Education[];     // New field
  note: string;
  pricing: Array<{
    amount: string;
    duration: string;
    type: string;
  }>;
  languages: string[];        // Made required
  country: string;            // Made required
  joiningDate: string;        // Made required
  numberOfSessions: string;   // Made required
  linkedInUrl: string;        // Made required
  

}