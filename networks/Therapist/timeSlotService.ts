// src/networks/timeSlot/timeSlotService.ts

import { TherapistAPI } from '../network/network';
import { TimeSlot, TherapistInfo } from '../../screens/timeslot-screen/timeSlotSlice';

/**
 * API Response interfaces
 */
interface TimeSlotsByDate {
  [date: string]: TimeSlot[];
}

interface TimeSlotResponse {
  therapistInfo: TherapistInfo;
  availableDates: string[];
  timeSlotsByDate: TimeSlotsByDate;
}

interface BookingRequest {
  therapistId: number;
  date: string;
  slotId: string;
  duration: 30 | 60;
  clientNotes?: string;
}

interface BookingResponse {
  success: boolean;
  bookingId: string;
  confirmationNumber: string;
  therapistName: string;
  date: string;
  time: string;
  duration: number;
  message: string;
}

/**
 * Fetch available time slots for a therapist
 * 
 * @param therapistId - The ID of the therapist
 * @param language - The language for localization (en or ar)
 * @returns Promise with time slot data
 */
export const fetchTherapistTimeSlots = async (
  therapistId: number,
  language: 'en' | 'ar' = 'en'
): Promise<TimeSlotResponse> => {
  try {
    console.log(`📡 Fetching time slots for therapist ${therapistId} (${language})`);

    // Make API call
    const response = await TherapistAPI.GET({
      URL: `api/v2/therapists/${therapistId}/time-slots`,
      params: { language },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': language,
      },
    });

    console.log('✅ Time slots fetched successfully');
    return response.data;

    // Expected API response format:
    // {
    //   therapistInfo: {
    //     id: 123,
    //     name: "Dr. Ahmed Mohammed",
    //     pricing: "$100 per session (30 min) • $180 per session (60 min)"
    //   },
    //   availableDates: ["2025-01-15", "2025-01-16", "2025-01-17", ...],
    //   timeSlotsByDate: {
    //     "2025-01-15": [
    //       {
    //         id: "slot-123",
    //         time: "09:00 AM",
    //         duration: 30,
    //         available: true,
    //         date: "2025-01-15"
    //       },
    //       ...
    //     ],
    //     ...
    //   }
    // }
  } catch (error: any) {
    console.error('❌ Error fetching time slots:', error);
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      throw new Error('Therapist not found');
    } else if (error.response?.status === 400) {
      throw new Error('Invalid request parameters');
    } else if (error.message === 'Network Error') {
      throw new Error('Network connection failed. Please check your internet connection.');
    }
    
    throw new Error('Failed to load available time slots. Please try again later.');
  }
};

/**
 * Create a booking for a time slot
 * 
 * @param bookingData - Booking details
 * @returns Promise with booking confirmation
 */
export const createBooking = async (
  bookingData: BookingRequest
): Promise<BookingResponse> => {
  try {
    console.log('📡 Creating booking:', bookingData);

    const response = await TherapistAPI.POST({
      URL: 'api/v2/bookings',
      data: bookingData,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log('✅ Booking created successfully');
    return response.data;

    // Expected API response format:
    // {
    //   success: true,
    //   bookingId: "booking-456",
    //   confirmationNumber: "CONF-2025-001",
    //   therapistName: "Dr. Ahmed Mohammed",
    //   date: "2025-01-15",
    //   time: "09:00 AM",
    //   duration: 30,
    //   message: "Booking confirmed successfully"
    // }
  } catch (error: any) {
    console.error('❌ Error creating booking:', error);
    
    // Handle specific error cases
    if (error.response?.status === 409) {
      throw new Error('This time slot is no longer available. Please select another slot.');
    } else if (error.response?.status === 400) {
      throw new Error('Invalid booking details. Please try again.');
    } else if (error.response?.status === 401) {
      throw new Error('Please login to book an appointment.');
    }
    
    throw new Error('Failed to create booking. Please try again later.');
  }
};

/**
 * Cancel a booking
 * 
 * @param bookingId - The ID of the booking to cancel
 * @returns Promise with cancellation confirmation
 */
export const cancelBooking = async (
  bookingId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log(`📡 Cancelling booking ${bookingId}`);

    const response = await TherapistAPI.DELETE({
      URL: `api/v2/bookings/${bookingId}`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log('✅ Booking cancelled successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error cancelling booking:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Booking not found');
    } else if (error.response?.status === 400) {
      throw new Error('This booking cannot be cancelled');
    }
    
    throw new Error('Failed to cancel booking. Please try again later.');
  }
};

/**
 * Get user's bookings
 * 
 * @param userId - The ID of the user
 * @param status - Optional filter by status (upcoming, past, cancelled)
 * @returns Promise with list of bookings
 */
export const getUserBookings = async (
  userId: number,
  status?: 'upcoming' | 'past' | 'cancelled'
): Promise<any[]> => {
  try {
    console.log(`📡 Fetching bookings for user ${userId}`);

    const response = await TherapistAPI.GET({
      URL: `api/v2/users/${userId}/bookings`,
      params: { status },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log('✅ Bookings fetched successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching bookings:', error);
    throw new Error('Failed to load bookings. Please try again later.');
  }
};

/**
 * Reschedule a booking to a new time slot
 * 
 * @param bookingId - The ID of the booking to reschedule
 * @param newSlotData - New time slot details
 * @returns Promise with reschedule confirmation
 */
export const rescheduleBooking = async (
  bookingId: string,
  newSlotData: {
    date: string;
    slotId: string;
    duration: 30 | 60;
  }
): Promise<BookingResponse> => {
  try {
    console.log(`📡 Rescheduling booking ${bookingId}`);

    const response = await TherapistAPI.PUT({
      URL: `api/v2/bookings/${bookingId}/reschedule`,
      data: newSlotData,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log('✅ Booking rescheduled successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error rescheduling booking:', error);
    
    if (error.response?.status === 409) {
      throw new Error('The new time slot is not available. Please select another slot.');
    }
    
    throw new Error('Failed to reschedule booking. Please try again later.');
  }
};

// Export all services
export default {
  fetchTherapistTimeSlots,
  createBooking,
  cancelBooking,
  getUserBookings,
  rescheduleBooking,
};