// serializers/therapistSerializer.ts
import { Therapist, TherapistDetail } from '../models/therapist';

// ==================== RESPONSE SERIALIZERS ====================

/**
 * Serializer to normalize raw API data into a Therapist object (for list view)
 */
 const therapistResponseSerializer = (payload: any): Therapist => {
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
 * Serializer to normalize therapist detail API responses (for detail view)
 * This ensures consistent data structure regardless of API source
 */
 const therapistDetailResponseSerializer = (data: any): TherapistDetail => {
  return {
    // Base Therapist fields
    id: data?.id ?? 0,
    name: data?.name?.trim() ?? '',
    specialty: data?.specialty?.trim() ?? '',
    rating: typeof data?.rating === 'number' ? data.rating : 0,
    reviewCount: typeof data?.reviewCount === 'number' ? data.reviewCount : 0,
    sessions: data?.sessions?.toString() ?? '',
    interests: Array.isArray(data?.interests) ? data.interests : [],
    nextAppointment: data?.nextAppointment ?? '',
    price60: data?.price60 ?? '',
    price30: data?.price30 ?? '',
    image: data?.image ?? require("../assets/profile.jpg"),
    
    // Detail-specific fields
    profession: data?.profession?.trim() ?? data?.specialty?.trim() ?? '',
    totalReviews: typeof data?.totalReviews === 'number' ? data.totalReviews : (data?.reviewCount ?? 0),
    isTopTherapist: Boolean(data?.isTopTherapist),
    profileImage: data?.profileImage ?? data?.image ?? null,
    tags: Array.isArray(data?.tags) ? data.tags : [],
    details: Array.isArray(data?.details) ? data.details : [],
    reviews: Array.isArray(data?.reviews) ? data.reviews : [],
    comments: Array.isArray(data?.comments) ? data.comments : [],
    certificates: Array.isArray(data?.certificates) ? data.certificates : [],
    awards: Array.isArray(data?.awards) ? data.awards : [],
    note: data?.note ?? '',
  };
};

/**
 * Serializer for list of therapists
 */
 const therapistListResponseSerializer = (payloads: any[]): Therapist[] => {
  if (!Array.isArray(payloads)) return [];
  return payloads.map(therapistResponseSerializer);
};

// ==================== PAYLOAD SERIALIZERS ====================

/**
 * Serializer for creating payload when sending Therapist data to API
 */
 const therapistPayloadSerializer = (therapist: Partial<Therapist>): any => {
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
 * Serializer for creating detailed therapist payload to API
 */
 const therapistDetailPayloadSerializer = (therapist: Partial<TherapistDetail>): any => {
  return {
    ...therapistPayloadSerializer(therapist),
    profession: therapist.profession,
    totalReviews: therapist.totalReviews,
    isTopTherapist: therapist.isTopTherapist,
    tags: therapist.tags,
    details: therapist.details,
    reviews: therapist.reviews,
    comments: therapist.comments,
    certificates: therapist.certificates,
    awards: therapist.awards,
    note: therapist.note,
  };
};

// ==================== VALIDATION ====================

/**
 * Validate therapist object
 */
 const validateTherapistData = (
  data: Partial<Therapist>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.name || data.name.trim() === '') {
    errors.push('Therapist name is required');
  }

  if (!data.specialty || data.specialty.trim() === '') {
    errors.push('Specialty is required');
  }

  if (data.rating !== undefined && (data.rating < 0 || data.rating > 5)) {
    errors.push('Rating must be between 0 and 5');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate detailed therapist data
 */
 const validateTherapistDetailData = (
  data: Partial<TherapistDetail>
): { isValid: boolean; errors: string[] } => {
  const baseValidation = validateTherapistData(data);
  const errors = [...baseValidation.errors];

  if (!data.profession || data.profession.trim() === '') {
    errors.push('Profession is required');
  }

  if (data.isTopTherapist === undefined) {
    errors.push('Top therapist status is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ==================== FORM INITIALIZERS ====================

/**
 * Create initial form data for therapist creation
 */
 const createInitialTherapistForm = (): Therapist => {
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

/**
 * Create initial form data for detailed therapist creation
 */
 const createInitialTherapistDetailForm = (): TherapistDetail => {
  return {
    ...createInitialTherapistForm(),
    profession: '',
    totalReviews: 0,
    isTopTherapist: false,
    profileImage: require("../assets/profile2.jpg"),
    tags: [],
    details: [],
    reviews: [],
    comments: [],
    certificates: [],
    awards: [],
    note: '',
  };
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Convert Therapist to TherapistDetail (for migration or upgrade)
 */
 const upgradeToTherapistDetail = (therapist: Therapist): TherapistDetail => {
  return {
    ...therapist,
    profession: therapist.specialty,
    totalReviews: therapist.reviewCount,
    isTopTherapist: false,
    profileImage: therapist.image,
    tags: [],
    details: [],
    reviews: [],
    comments: [],
    certificates: [],
    awards: [],
    note: '',
  };
};

/**
 * Extract base Therapist data from TherapistDetail
 */
 const extractBaseTherapist = (detail: TherapistDetail): Therapist => {
  return {
    id: detail.id,
    name: detail.name,
    specialty: detail.specialty,
    rating: detail.rating,
    reviewCount: detail.reviewCount,
    sessions: detail.sessions,
    interests: detail.interests,
    nextAppointment: detail.nextAppointment,
    price60: detail.price60,
    price30: detail.price30,
    image: detail.image,
  };
};

export {
  therapistResponseSerializer,
  therapistDetailResponseSerializer,
  therapistListResponseSerializer,
  therapistPayloadSerializer,
  therapistDetailPayloadSerializer,
  validateTherapistData,
  validateTherapistDetailData,
  createInitialTherapistForm,
  createInitialTherapistDetailForm,
  upgradeToTherapistDetail,
  extractBaseTherapist,
}