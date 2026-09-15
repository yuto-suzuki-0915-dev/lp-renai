export type AvailabilitySlot = {
  id: string;
  startsAt: string;
  endsAt: string;
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
