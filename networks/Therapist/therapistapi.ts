import { therapistResponseSerializer } from "../../serializers/therapistSerializer";
import { Therapist } from "../../models/therapist";

// Dummy API for now (you can replace later with real API)
const dummyAPI = {
  GET: async (URL: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      success: true,
      data: [
        {
          id: 1,
          name: "Dr. John Doe",
          specialty: "Psychiatrist",
          rating: 4.9,
          reviewCount: 85,
          sessions: "400",
          interests: ["Depression", "Anxiety"],
          nextAppointment: "Monday, Oct. 21 at 9:00 PM",
          price60: "120 USD",
          price30: "65 USD",
          image: require("../../assets/profile.jpg"),
        },
        {
          id: 2,
          name: "Dr. Jane Smith",
          specialty: "Therapist",
          rating: 4.8,
          reviewCount: 65,
          sessions: "300",
          interests: ["Relationships", "Stress"],
          nextAppointment: "Tuesday, Oct. 22 at 6:00 PM",
          price60: "110 USD",
          price30: "55 USD",
          image: require("../../assets/profile2.jpg"),
        },
      ],
    };
  },
};

export const fetchTherapists = async (): Promise<Therapist[]> => {
  try {
    const response = await dummyAPI.GET("/therapists");

    if (!response.success) {
      throw new Error("Failed to fetch therapists");
    }

    // ✅ Serialize each therapist so data is always normalized
    return response.data.map((t: any) => therapistResponseSerializer(t));
  } catch (e: any) {
    console.error("Error fetching therapists:", e);
    throw new Error(e.message || "Unable to fetch therapists");
  }
};
