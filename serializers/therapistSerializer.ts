import { Therapist } from "../models/therapist";

/**
 * Serializer to normalize raw API data into a Therapist object
 */
export const therapistResponseSerializer = (payload: any): Therapist => {
  return {
    id: payload?.id ?? 0,
    name: payload?.name?.trim() ?? '',
    specialty: payload?.specialty?.trim() ?? '',
    rating: typeof payload?.rating === 'number' ? payload.rating : 0,
    reviewCount: typeof payload?.reviewCount === 'number' ? payload.reviewCount : 0,
    sessions: payload?.sessions?.toString() ?? '',
    interests: Array.isArray(payload?.interests) ? payload.interests : [],
    nextAppointment: payload?.nextAppointment ?? '',
    price60: payload?.price60 ?? '',
    price30: payload?.price30 ?? '',
    image: payload?.image ?? require("../assets/profile.jpg"),
  };
};

/**
 * Serializer for creating payload when sending Therapist data to API
 */
export const therapistPayloadSerializer = (therapist: Therapist): any => {
  return {
    id: therapist.id,
    name: therapist.name,
    specialty: therapist.specialty,
    rating: therapist.rating,
    reviewCount: therapist.reviewCount,
    sessions: therapist.sessions,
    interests: therapist.interests,
    nextAppointment: therapist.nextAppointment,
    price60: therapist.price60,
    price30: therapist.price30,
    // image usually handled by upload endpoint, so we may skip or send URL only
  };
};

/**
 * Validate therapist object
 */
export const validateTherapistData = (
  data: Partial<Therapist>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.name || data.name.trim() === '') {
    errors.push('Therapist name is required');
  }

  if (!data.specialty || data.specialty.trim() === '') {
    errors.push('Specialty is required');
  }

  if (data.rating && (data.rating < 0 || data.rating > 5)) {
    errors.push('Rating must be between 0 and 5');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Create initial form data for therapist creation
 */
export const createInitialTherapistForm = (): Therapist => {
  return {
    id: 0,
    name: '',
    specialty: '',
    rating: 0,
    reviewCount: 0,
    sessions: '',
    interests: [],
    nextAppointment: '',
    price60: '',
    price30: '',
    image: require("../assets/profile2.jpg"),
  };
};
