import { 
  Therapist, 
  TherapistDetail, 
  Review, 
  Comment, 
  Detail, 
  Certificate, 
  Award,
  Experience,
  Education 
} from '../models/therapist';
import { ImageSourcePropType } from 'react-native';

const DEFAULT_PROFILE_IMAGE = require("../assets/profile.jpg");

// Utility Functions
const stripHtmlTags = (html: string | undefined | null): string => {
  if (!html || typeof html !== 'string') return '';
  return html.replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'").replace(/\s+/g, ' ').trim();
};

const cleanText = (text: any): string => !text ? '' : stripHtmlTags(String(text)).trim();

const getImageSource = (imageUrl: any): ImageSourcePropType => 
  (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') 
    ? DEFAULT_PROFILE_IMAGE 
    : { uri: imageUrl.trim() };

const parseRating = (rating: any): number => {
  if (typeof rating === 'number') return Math.max(0, Math.min(5, rating));
  if (typeof rating === 'string') {
    const parsed = parseFloat(rating);
    return isNaN(parsed) ? 0 : Math.max(0, Math.min(5, parsed));
  }
  return 0;
};

const parseCount = (count: any): number => {
  if (typeof count === 'number') return Math.max(0, count);
  if (typeof count === 'string') {
    const parsed = parseInt(count, 10);
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
  }
  return 0;
};

const extractConsultantName = (productName: string): string => {
  if (!productName) return 'Professional Consultant';
  let name = productName.replace(/Auto-generated product for\s*/gi, '').replace(/[\w.-]+@[\w.-]+\.\w+/g, '');
  name = name.trim().replace(/\s+/g, ' ');
  return name.length < 2 ? 'Professional Consultant' : name;
};

const findIncluded = (included: any[], type: string, id: string): any => 
  included?.find((item: any) => item.type === type && item.id === id);

// Serializer Helpers
const serializeImage = (relationships: any, included: any[]): ImageSourcePropType => {
  const imageRefs = relationships?.images?.data || [];
  if (imageRefs.length > 0 && included?.length > 0) {
    const imageData = findIncluded(included, 'image', imageRefs[0].id);
    const imageUrl = imageData?.attributes?.styles?.find((style: any) => style.url)?.url;
    if (imageUrl) return { uri: imageUrl };
  }
  return DEFAULT_PROFILE_IMAGE;
};

const serializeVariants = (relationships: any, included: any[]): { price60: string, price30: string } => {
  const variantRefs = relationships?.variants?.data || [];
  let price60 = '$60.00', price30 = '$30.00';
  
  variantRefs.forEach((variantRef: any) => {
    const variant = findIncluded(included, 'variant', variantRef.id);
    if (!variant) return;
    const timeOption = (variant.attributes?.options || []).find((opt: any) => opt.name === 'time');
    if (timeOption) {
      const displayPrice = variant.attributes?.display_price || `$${variant.attributes?.price || '0.00'}`;
      if (timeOption.value === '60-minutes') price60 = displayPrice;
      else if (timeOption.value === '30-minutes') price30 = displayPrice;
    }
  });
  return { price60, price30 };
};

const serializeTaxons = (relationships: any, included: any[]): {
  interests: string[]; languages: string[]; gender: string;
} => {
  const taxonRefs = relationships?.taxons?.data || [];
  const interests: string[] = [], languages: string[] = [];
  let gender = '';
  
  taxonRefs.forEach((taxonRef: any) => {
    const taxon = findIncluded(included, 'taxon', taxonRef.id);
    if (!taxon) return;
    const prettyName = taxon.attributes?.pretty_name || '';
    const name = taxon.attributes?.name || '';
    
    if (prettyName.startsWith('Language ->')) languages.push(name.toUpperCase());
    else if (prettyName.startsWith('Gender ->')) gender = name;
    else if (prettyName.startsWith('Service Interests ->')) {
      const lastPart = prettyName.split(' -> ').pop();
      if (lastPart && !interests.includes(lastPart)) interests.push(lastPart);
    }
  });
  return { interests, languages, gender };
};

const serializeProductProperties = (relationships: any, included: any[]): any => {
  const propertyRefs = relationships?.product_properties?.data || [];
  const properties: any = {};
  
  propertyRefs.forEach((propRef: any) => {
    const prop = findIncluded(included, 'product_property', propRef.id);
    if (!prop) return;
    const key = prop.attributes?.name || prop.attributes?.property_name;
    const value = prop.attributes?.value;
    
    if (key && value) {
      properties[key] = value;
      if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
        try { properties[key] = JSON.parse(value); } catch (e) {}
      }
    }
  });
  return properties;
};

const parseArrayProperty = (data: any): any[] => {
  if (!data) return [];
  if (typeof data === 'string') {
    try { return JSON.parse(data); } catch (e) { return []; }
  }
  return Array.isArray(data) ? data : [];
};

const extractExperiences = (properties: any): Experience[] => {
  const expData = properties.experience || properties.experiences || properties.work_experience || properties.work_history;
  return parseArrayProperty(expData).map((exp: any) => ({
    title: cleanText(exp.title || exp.position || exp.role || 'Position'),
    company: cleanText(exp.company || exp.organization || exp.employer || 'Company'),
    period: cleanText(exp.period || exp.duration || exp.years || exp.dates || ''),
    description: cleanText(exp.description || exp.details || exp.responsibilities || '')
  }));
};

const extractEducation = (properties: any): Education[] => {
  const eduData = properties.education || properties.qualifications || properties.academic_background;
  return parseArrayProperty(eduData).map((edu: any) => ({
    degree: cleanText(edu.degree || edu.qualification || edu.title || edu.program || 'Degree'),
    institution: cleanText(edu.institution || edu.school || edu.university || edu.college || 'Institution'),
    year: String(edu.year || edu.graduation_year || edu.completion_year || ''),
    description: cleanText(edu.description || edu.details || edu.field_of_study || '')
  }));
};

const extractCertificates = (properties: any): Certificate[] => {
  const certData = properties.certificates || properties.certifications || properties.credentials;
  return parseArrayProperty(certData).map((cert: any) => ({
    title: cleanText(cert.title || cert.name || cert.certification || 'Certificate'),
    org: cleanText(cert.org || cert.organization || cert.issuer || cert.issued_by || 'Organization'),
    date: String(cert.date || cert.year || cert.issued_date || cert.issue_year || '')
  }));
};

const extractAwards = (properties: any): Award[] => {
  const awardData = properties.awards || properties.achievements || properties.honors;
  return parseArrayProperty(awardData).map((award: any) => ({
    title: cleanText(award.title || award.name || award.award || 'Award'),
    org: cleanText(award.org || award.organization || award.issuer || award.given_by || 'Organization'),
    date: String(award.date || award.year || award.received_date || '')
  }));
};

const generateReviews = (rating: number, properties: any): Review[] => {
  const reviewData = properties.reviews || properties.review_breakdown;
  const parsed = parseArrayProperty(reviewData);
  if (parsed.length > 0) {
    return parsed.map((review: any, index: number) => ({
      id: index + 1,
      label: cleanText(review.label || review.category || review.name || 'Review'),
      value: parseRating(review.value || review.rating || review.score || 0)
    }));
  }
  
  if (rating === 0) return [];
  return [
    { id: 1, label: 'Expertise', value: rating },
    { id: 2, label: 'Communication', value: Math.min(5, rating + 0.2) },
    { id: 3, label: 'Professionalism', value: Math.min(5, rating + 0.1) },
    { id: 4, label: 'Value for Money', value: Math.max(0, rating - 0.3) }
  ];
};

const generateDetails = (attributes: any, properties: any, sessions: string): Detail[] => {
  const details: Detail[] = [];
  if (properties.label) details.push({ id: 1, label: 'Specialization', value: cleanText(properties.label), icon: null });
  if (properties.years_of_experience || properties.experience_years) {
    details.push({ id: details.length + 1, label: 'Years of Experience', value: String(properties.years_of_experience || properties.experience_years), icon: null });
  }
  if (sessions !== 'New') details.push({ id: details.length + 1, label: 'Sessions Completed', value: sessions, icon: null });
  if (properties.response_time) details.push({ id: details.length + 1, label: 'Response Time', value: cleanText(properties.response_time), icon: null });
  if (properties.availability) details.push({ id: details.length + 1, label: 'Availability', value: cleanText(properties.availability), icon: null });
  if (properties.location || properties.country) details.push({ id: details.length + 1, label: 'Location', value: cleanText(properties.location || properties.country), icon: null });
  return details;
};

// Main Serializers
export function therapistResponseSerializer(payload: any): Therapist {
  const data = payload?.data || payload;
  const attributes = data?.attributes || {};
  const relationships = data?.relationships || {};
  const included = payload?.included || [];
  
  const properties = serializeProductProperties(relationships, included);
  const { price60, price30 } = serializeVariants(relationships, included);
  const { interests } = serializeTaxons(relationships, included);
  
  const sessionCount = parseCount(properties.session_count || properties.sessions_completed || properties.total_sessions || attributes.session_count || 0);
  const rating = parseRating(properties.rating || properties.average_rating || attributes.rating || 0);
  const reviewCount = parseCount(properties.review_count || properties.reviews_count || properties.total_reviews || attributes.review_count || 0);
  
  const availableOn = attributes.available_on ? new Date(attributes.available_on) : new Date();
  
  return {
    id: parseInt(data.id) || 0,
    name: extractConsultantName(attributes.name || ''),
    specialty: cleanText(properties.label) || 'Professional Consultant',
    rating,
    reviewCount,
    sessions: sessionCount > 0 ? `${sessionCount}+` : 'New',
    interests: interests.slice(0, 3),
    nextAppointment: availableOn.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    price60,
    price30,
    image: serializeImage(relationships, included),
  };
}

export function therapistDetailResponseSerializer(payload: any): TherapistDetail {
  const data = payload?.data || payload;
  const attributes = data?.attributes || {};
  const relationships = data?.relationships || {};
  const included = payload?.included || [];
  
  const baseTherapist = therapistResponseSerializer(payload);
  const { interests, languages } = serializeTaxons(relationships, included);
  const properties = serializeProductProperties(relationships, included);
  const { price60, price30 } = serializeVariants(relationships, included);
  
  const note = cleanText(properties.bio || properties.about || properties.description || attributes.description) || 'No additional information available.';
  const profession = cleanText(properties.profession || properties.title || properties.label) || baseTherapist.specialty;
  
  const comments: Comment[] = parseArrayProperty(properties.comments || properties.testimonials || properties.user_reviews).map((comment: any, index: number) => ({
    id: index + 1,
    text: cleanText(comment.text || comment.comment || comment.review || ''),
    user: cleanText(comment.user || comment.username || comment.author || 'Anonymous'),
    rating: parseRating(comment.rating || comment.stars || 5),
    time: cleanText(comment.time || comment.date || comment.created_at || 'Recently')
  }));
  
  const tags: string[] = [...interests];
  const tagData = parseArrayProperty(properties.tags);
  if (tagData.length === 0 && typeof properties.tags === 'string') {
    properties.tags.split(',').forEach((tag: string) => {
      const cleanTag = cleanText(tag);
      if (cleanTag && !tags.includes(cleanTag)) tags.push(cleanTag);
    });
  } else {
    tagData.forEach((tag: string) => {
      const cleanTag = cleanText(tag);
      if (cleanTag && !tags.includes(cleanTag)) tags.push(cleanTag);
    });
  }
  
  return {
    ...baseTherapist,
    profession,
    totalReviews: baseTherapist.reviewCount,
    isTopTherapist: baseTherapist.rating >= 4.5 && baseTherapist.reviewCount >= 10,
    profileImage: baseTherapist.image,
    tags,
    details: generateDetails(attributes, properties, baseTherapist.sessions),
    reviews: generateReviews(baseTherapist.rating, properties),
    comments,
    certificates: extractCertificates(properties),
    awards: extractAwards(properties),
    experiences: extractExperiences(properties),
    education: extractEducation(properties),
    note,
    pricing: [
      { amount: price60, duration: '60 Minutes', type: cleanText(properties.session_type_60 || 'Standard Session') },
      { amount: price30, duration: '30 Minutes', type: cleanText(properties.session_type_30 || 'Quick Consultation') }
    ],
    languages: languages.length > 0 ? languages : ['EN'],
    country: cleanText(properties.country || properties.location || attributes.country) || '',
    joiningDate: cleanText(properties.joining_date || properties.member_since) || (attributes.available_on ? new Date(attributes.available_on).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''),
    numberOfSessions: baseTherapist.sessions,
    linkedInUrl: cleanText(properties.linkedin_url || properties.linkedin || properties.linkedin_profile) || '',
  };
}

export function therapistListResponseSerializer(payload: any): Therapist[] {
  const data = payload?.data || payload;
  if (!Array.isArray(data)) return [];
  return data.map((item: any) => therapistResponseSerializer({ data: item, included: payload?.included }));
}

export function therapistPayloadSerializer(therapist: Partial<Therapist>): any {
  return {
    data: {
      type: 'product',
      attributes: {
        name: therapist.name,
        description: therapist.specialty,
        price: therapist.price60,
      }
    }
  };
}

export function therapistDetailPayloadSerializer(therapist: Partial<TherapistDetail>): any {
  return {
    data: {
      type: 'product',
      attributes: {
        name: therapist.name,
        description: therapist.note || therapist.profession,
        price: therapist.price60,
      }
    }
  };
}