
export enum UserRole {
  CLIENT = 'client',
  BARBER = 'barber',
  ADMIN = 'admin', // Owner of the barbershop using the SaaS
  SUPER_ADMIN = 'super_admin' // Platform owner (Navalha Digital itself)
}

export enum PlanTier {
  FREE = 'free',
  PRO = 'pro',
  PREMIUM = 'premium',
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  barbershopId?: string; // If user is ADMIN or BARBER
  currentPlan?: PlanTier; // For ADMIN users
  planExpiryDate?: string; // For ADMIN users
  profilePictureUrl?: string;
}

export interface Barbershop {
  id: string;
  name: string;
  address: string;
  logoUrl?: string;
  ownerId: string; // User ID of the admin
  phone?: string;
  description?: string;
  photos?: string[]; // URLs of barbershop photos
  operatingHours?: OperatingHours[]; // e.g., [{ day: 'Monday', open: '09:00', close: '18:00' }]
}

export interface OperatingHours {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  open: string; // HH:mm
  close: string; // HH:mm
  isClosed?: boolean;
}


export interface Service {
  id: string;
  barbershopId: string;
  name: string;
  duration: number; // in minutes
  price: number;
  description?: string;
  assignedBarberIds: string[]; // IDs of barbers who can perform this service
  isActive: boolean;
  category?: string; // e.g., Hair, Beard, Special
}

export interface Barber {
  id: string;
  barbershopId: string;
  userId: string; // Link to User table
  name: string; // Duplicated for convenience, or fetch from User
  email: string; // Duplicated for convenience
  specialties: string[];
  availability: AvailabilitySlot[]; // Specific working hours
  profilePictureUrl?: string;
  bio?: string;
}

export interface AvailabilitySlot {
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isWorking: boolean;
}

export enum BookingStatus {
  PENDING = 'pending', // Client booked, pending confirmation (if needed)
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED_CLIENT = 'cancelled_client',
  CANCELLED_ADMIN = 'cancelled_admin',
  NO_SHOW = 'no_show',
}

export interface Booking {
  id: string;
  barbershopId: string;
  clientId: string; // User ID of the client
  clientName: string; // Denormalized for display
  clientEmail: string; // Denormalized for display
  clientPhone: string; // Denormalized for display
  serviceId: string;
  serviceName: string; // Denormalized
  barberId: string;
  barberName: string; // Denormalized
  startTime: string; // ISO Date string
  endTime: string; // ISO Date string
  status: BookingStatus;
  notes?: string;
  priceAtBooking: number; // Price of service at the time of booking
  createdAt: string; // ISO Date string
}

export interface Review {
  id: string;
  barbershopId: string;
  bookingId: string; // Link to the booking this review is for
  clientId: string;
  clientName: string;
  serviceId: string;
  serviceName: string;
  barberId: string;
  barberName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string; // ISO Date string
  isApproved: boolean;
}

export interface Plan {
  id: PlanTier;
  name: string;
  pricePerMonth: number;
  features: string[];
  maxBookingsPerMonth?: number; // Null for unlimited
  maxBarbers?: number; // Null for unlimited
}

// For Supabase responses, often generic
export interface SupabaseResponse<T,> {
  data: T | null;
  error: Error | null;
}

export interface SupabaseAuthUser {
  id: string;
  email?: string;
  // Supabase returns more, but these are key
}

export interface TimeSlot {
  time: string; // e.g., "09:00"
  available: boolean;
}

export interface DailySchedule {
  date: string; // YYYY-MM-DD
  timeSlots: TimeSlot[];
}
    