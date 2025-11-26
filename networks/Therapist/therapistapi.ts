// networks/therapist/therapistApi.ts
import { Therapist } from "../../models/therapist";
import { NotificationService } from "../../notifications/notificationHandler";
import { TherapistAPI } from "../network/network";

/**
 * ✅ Fetch therapists - returns array of therapists with images and related data
 * Handles nested API response structure
 */
export const fetchTherapists = async (language: 'en' | 'ar' = 'en'): Promise<any[]> => {
  try {
    console.log(`📋 Fetching therapists in ${language} language...`);
    
    const response = await TherapistAPI.GET({
      URL: "api/v2/storefront/products",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': language,
      },
      params: {
        language: language,
        include: 'images,variants,product_properties,taxons,option_types'
      },
    });

    // ✅ Handle nested response structure
    if (!response || !response.data) {
      console.error("❌ Invalid response structure:", response);
      throw new Error("Invalid API response");
    }

    // Extract the actual therapist array from nested structure
    // Check multiple possible structures
    const therapistData = response.data.data || 
                         response.data.products || 
                         response.data.therapists ||
                         response.data;

    // Ensure we have an array
    if (!Array.isArray(therapistData)) {
      console.error("❌ API did not return an array:", therapistData);
      console.log("Full response:", JSON.stringify(response, null, 2));
      throw new Error("API response is not an array");
    }

    console.log(`✅ Therapists fetched successfully: ${therapistData.length} items`);
    console.log('✅ Each therapist includes:', {
      hasImages: therapistData.length > 0 && !!therapistData[0].images,
      hasVariants: therapistData.length > 0 && !!therapistData[0].variants,
      hasProperties: therapistData.length > 0 && !!therapistData[0].product_properties,
      hasTaxons: therapistData.length > 0 && !!therapistData[0].taxons,
      hasOptionTypes: therapistData.length > 0 && !!therapistData[0].option_types
    });
    
    // Return the array
    return therapistData;
    
  } catch (e: any) {
    console.error("❌ Error fetching therapists:", e);
    console.error("Error details:", {
      message: e.message,
      response: e.response,
      status: e.response?.status,
      data: e.response?.data
    });
    
    const errorMessage = e.response?.data?.message ||
                        e.response?.data?.error ||
                        e.message ||
                        "Unable to fetch therapists";
    
    await NotificationService.sendImmediateNotification({
      title: "❌ Error",
      body: errorMessage,
      data: { type: 'fetch_error' },
      channelId: 'api-notifications'
    });
    
    throw new Error(errorMessage);
  }
};