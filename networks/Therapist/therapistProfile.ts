// networks/therapist/therapistDetailApi.ts
import { NotificationService } from "../../notifications/notificationHandler";
import { TherapistAPI } from "../network/network";


/**
 * Fetch therapist detail by ID with full details
 * Returns raw API response - NO serialization
 */
export const fetchTherapistDetail = async (
  therapistId: number, 
  language: 'en' | 'ar' = 'en'
): Promise<any> => {
  try {
    console.log(`👤 Fetching therapist detail for ID: ${therapistId}, Language: ${language}`);
    
    const response = await TherapistAPI.GET({
      URL: `api/v2/storefront/products/${therapistId}`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': language,
      },
      params: {
        include: 'images,variants,product_properties,taxons,option_types'
      }
    });

    // Handle nested response structure
    if (!response || !response.data) {
      console.error("❌ Invalid response structure:", response);
      throw new Error("Invalid API response");
    }

    // Extract the actual therapist data from nested structure
    const therapistData = response.data.data || 
                         response.data.product || 
                         response.data.therapist ||
                         response.data;

    console.log('✅ Therapist detail fetched successfully');
    console.log('Response structure:', Object.keys(therapistData));
    console.log('Included data:', {
      hasImages: !!therapistData.images,
      hasVariants: !!therapistData.variants,
      hasProperties: !!therapistData.product_properties,
      hasTaxons: !!therapistData.taxons,
      hasOptionTypes: !!therapistData.option_types
    });
    
    // Return raw data - NO serialization here
    return therapistData;
  } catch (e: any) {
    console.error("❌ Error fetching therapist details:", e);
    console.error("Error details:", {
      message: e.message,
      response: e.response,
      status: e.response?.status,
      data: e.response?.data
    });
    
    const errorMessage = e.response?.data?.message || 
                        e.response?.data?.error || 
                        e.message || 
                        "Failed to fetch therapist details";
    
    await NotificationService.sendImmediateNotification({
      title: "❌ Error",
      body: errorMessage,
      data: { type: 'fetch_error' },
      channelId: 'api-notifications'
    });
    
    throw new Error(errorMessage);
  }
};