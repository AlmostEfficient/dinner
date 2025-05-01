export interface BookingAvailabilityResponse {
    services: Service[];
  }
  
  export interface Service {
    name: string;
    times: TimeSlot[];
  }
  
  export interface MinimalTimeSlot {
    name: string; // e.g., "5:00pm"
    time: string; // ISO 8601 format string, e.g., "2025-05-02T17:00:00"
    isBlockOut: boolean; // true if blocked out (unavailable), false if potentially available
    onlySharedTablesRemain: boolean; // true if only shared/communal tables are left for this slot
    // Note: A time slot might be 'not blocked out' but still have bookingOptionsCount = 0 or other constraints.
    // For a truly minimal approach just checking isBlockOut might suffice for a basic display,
    // assuming the API correctly sets isBlockOut for all truly unavailable slots.
    // If you need more precision, you might need bookingOptionsCount as well.
    // bookingOptionsCount: number; // Number of available booking options for this slot
  }
  
  // How to use these types to find available times:
  /*
  Assuming you have fetched the data and parsed it into a variable `responseData`
  of type BookingAvailabilityResponse:
  
  const availableTimes: { serviceName: string; timeName: string; time: string }[] = [];
  
  responseData.services.forEach(service => {
    service.times.forEach(timeSlot => {
      // A time slot is generally available if it's not blocked out
      // and potentially has booking options (though checking isBlockOut might be enough)
      if (!timeSlot.isBlockOut) { // && timeSlot.bookingOptionsCount > 0 if needed
        availableTimes.push({
          serviceName: service.name,
          timeName: timeSlot.name,
          time: timeSlot.time,
        });
      }
    });
  });
  
  console.log("Available Booking Times:", availableTimes);
  */

  
  // Define the full types for the incoming API response structure
  // (You can keep these internal to the route file or put them in types.ts)
  export interface TimeSlotSection {
      id: string;
      sectionState: boolean;
      isSectionBlocked: boolean;
      availableTableIds: string[] | null;
  }
  
  export interface TimeSlot {
      name: string;
      expired: boolean;
      bookingOptionsCount: number;
      isBlockOut: boolean;
      isStandByListAvailable: boolean;
      time: string;
      sections: TimeSlotSection[];
      includesWalkInTables: boolean;
      onlySharedTablesRemain: boolean;
  }
  
  export interface ServiceSection {
      id: string;
      name: string;
      order: number;
  }
  
  export interface PaymentDetails {
      // Only including fields seen in the sample that might be relevant if needed,
      // but we won't process most of these for minimal output.
      paymentType: string;
      peopleRequired: number;
      price: number;
      // ... other payment fields if necessary, omitted for brevity
  }
  
  export interface ExternalService {
      id: string;
      name: string;
      online: boolean;
      duration: number;
      bookingInterval: number;
      sections: ServiceSection[];
      times: TimeSlot[];
      paymentDetails: PaymentDetails;
      description: string;
      policyAgreement: string;
      policyAgreementText: string;
      serviceType: string;
      maxBookingsPerInterval: number | null;
      minPaxPerBooking: number | null;
      maxCoversPerInterval: number | null;
      enableCustomPaxPerIntervals: boolean;
      intervalsCustom: any | null;
      isBlockoutPartiallyEnabled: boolean;
      blockoutMessage: string | null;
  }
  
  export interface ExternalBookingAvailabilityResponse {
      dayName: string | null;
      isVenueOpen: boolean;
      blockoutMessage: string | null;
      currentBookingsOnStandbyList: number;
      maxBookingsOnStandbyList: number;
      tags: any[];
      services: ExternalService[];
  }
  
  export interface MinimalService {
    name: string;
    times: MinimalTimeSlot[];
  }
  
  export interface MinimalBookingAvailabilityResponse {
    services: MinimalService[];
  }
  