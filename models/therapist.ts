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
  note: string;
}