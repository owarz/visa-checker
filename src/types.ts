/**
 * @fileoverview Type definitions for the visa checker application
 * Contains interfaces and types used throughout the application
 */

/**
 * Represents a visa appointment from the API
 * Contains all the information needed to track and notify about appointment availability
 */
export interface VisaAppointment {
  /** Unique identifier for the appointment */
  id: number;
  /** Number of people tracking this appointment */
  tracking_count: number;
  /** Source country code (e.g., 'tur' for Turkey) */
  country_code: string;
  /** Destination/mission country code (e.g., 'nld' for Netherlands) */
  mission_code: string;
  /** Visa category (e.g., 'SHORT TERM VISA') */
  visa_category: string;
  /** Specific visa type (e.g., 'TOURISM VISA APPLICATION') */
  visa_type: string;
  /** Full name of the visa application center */
  center: string;
  /** Current appointment status ('open', 'closed', 'waitlist_open', 'waitlist_closed') */
  status: string;
  /** ISO 8601 timestamp of when the appointment was last checked */
  last_checked_at: string;
  /** ISO 8601 timestamp of when the appointment was last available (optional) */
  last_open_at?: string;
  /** Last available appointment date in DD/MM/YYYY format (optional) */
  last_available_date?: string;
}

/**
 * Cache storage structure for tracking sent notifications
 * Prevents duplicate notifications for the same appointment
 */
export interface AppointmentCache {
  /** 
   * Cache entries keyed by appointment ID
   * Each entry contains metadata about when the notification was sent
   */
  [key: string]: { 
    /** Timestamp when the notification was sent */
    timestamp: number 
  };
}
