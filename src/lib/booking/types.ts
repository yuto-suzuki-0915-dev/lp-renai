export type AvailabilitySlot = {
  id: string;
  startsAt: string;
  endsAt: string;
};

export type AvailabilitySchedule = {
  startHour: number;
  endHour: number;
  horizonWeeks: number;
};

export type BookingConfirmation = {
  bookingId: string;
  confirmationCode: string;
  startsAt: string;
  endsAt: string;
};

export type BookingRequest = {
  name: string;
  email: string;
  slotId: string;
  website?: string;
};
