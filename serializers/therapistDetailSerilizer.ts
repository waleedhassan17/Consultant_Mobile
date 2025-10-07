// serializers/therapistDetailSerializer.ts

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
  icon: any;
}

interface Certificate {
  title: string;
  org: string;
  date: string;
}

interface Award {
  title: string;
  org: string;
  date: string;
}

export interface TherapistDetail {
  id: string;
  name: string;
  profession: string;
  rating: number;
  totalReviews: number;
  isTopTherapist: boolean;
  profileImage: any;
  tags: string[];
  interests: string[];
  details: Detail[];
  reviews: Review[];
  comments: Comment[];
  certificates: Certificate[];
  awards: Award[];
  note: string;
}

/**
 * ✅ Serializer to normalize therapist detail API responses
 * This ensures consistent data structure regardless of API source
 */
export const therapistDetailResponseSerializer = (data: any): TherapistDetail => {
  return {
    id: String(data.id),
    name: data.name || "",
    profession: data.profession || "",
    rating: Number(data.rating) || 0,
    totalReviews: Number(data.totalReviews) || 0,
    isTopTherapist: Boolean(data.isTopTherapist),
    profileImage: data.profileImage || null,
    tags: Array.isArray(data.tags) ? data.tags : [],
    interests: Array.isArray(data.interests) ? data.interests : [],
    details: Array.isArray(data.details) ? data.details : [],
    reviews: Array.isArray(data.reviews) ? data.reviews : [],
    comments: Array.isArray(data.comments) ? data.comments : [],
    certificates: Array.isArray(data.certificates) ? data.certificates : [],
    awards: Array.isArray(data.awards) ? data.awards : [],
    note: data.note || "",
  };
};