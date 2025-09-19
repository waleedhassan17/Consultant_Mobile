import { ImageSourcePropType } from "react-native";

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
