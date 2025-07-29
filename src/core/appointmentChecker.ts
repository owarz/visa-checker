/**
 * @fileoverview Core appointment checking functionality
 * Handles the main logic for checking visa appointments and processing notifications
 */

import type { VisaAppointment } from "../types";
import { config } from "../config/environment";
import { fetchAppointments } from "../services/api";
import { cacheService } from "../services/cache";
import { telegramService } from "../services/telegram";
import { appointmentFilterService } from "../services/filter";

/**
 * Main function to check for new appointments and send notifications
 * Fetches appointments, filters them, and processes valid ones
 */
export async function checkAppointments(): Promise<void> {
  try {
    const appointments = await fetchAppointments();

    if (appointments.length === 0) {
      console.log("No appointments found or an error occurred");
      return;
    }

    await processAppointments(appointments);
  } catch (error) {
    console.error("Error during appointment check:", error);
  }
}

/**
 * Processes a list of appointments, filtering and handling valid ones
 * @param appointments Array of appointments to process
 */
async function processAppointments(appointments: VisaAppointment[]): Promise<void> {
  for (const appointment of appointments) {
    if (!appointmentFilterService.isAppointmentValid(appointment)) {
      continue;
    }

    await handleValidAppointment(appointment);
  }
}

/**
 * Handles a single valid appointment, checking cache and sending notifications
 * @param appointment The valid appointment to handle
 */
async function handleValidAppointment(appointment: VisaAppointment): Promise<void> {
  const appointmentKey = cacheService.createKey(appointment);

  logAppointmentDetails(appointment);

  if (!cacheService.has(appointmentKey)) {
    logProcessingAppointment(appointment);
    await processNewAppointment(appointment, appointmentKey);
  } else {
    logSkippingCachedAppointment(appointment);
  }
}

/**
 * Logs appointment details if debug mode is enabled
 * @param appointment The appointment to log
 */
function logAppointmentDetails(appointment: VisaAppointment): void {
  if (config.app.debug) {
    console.log(
      `Valid appointment found (ID: ${appointment.id}): ${appointment.center}, Status: ${appointment.status}, Last checked: ${appointment.last_checked_at}`
    );
  }
}

/**
 * Logs that an appointment is being processed if debug mode is enabled
 * @param appointment The appointment being processed
 */
function logProcessingAppointment(appointment: VisaAppointment): void {
  if (config.app.debug) {
    console.log(
      `Appointment (ID: ${appointment.id}) not in cache. Processing...`
    );
  }
}

/**
 * Logs that a cached appointment is being skipped if debug mode is enabled
 * @param appointment The appointment being skipped
 */
function logSkippingCachedAppointment(appointment: VisaAppointment): void {
  if (config.app.debug) {
    console.log(
      `Appointment (ID: ${appointment.id}) already in cache. Skipping.`
    );
  }
}

/**
 * Processes a new appointment by caching it and sending notification
 * @param appointment The appointment to process
 * @param appointmentKey The cache key for the appointment
 */
async function processNewAppointment(
  appointment: VisaAppointment,
  appointmentKey: string
): Promise<void> {
  // Add to cache first to prevent duplicate processing
  cacheService.set(appointmentKey);

  console.log(
    `Sending new appointment notification: ID ${appointment.id} - ${appointment.center}`
  );
  
  const success = await telegramService.sendNotification(appointment);
  
  if (success) {
    console.log(`Notification sent successfully: ID ${appointment.id}`);
  } else {
    console.error(
      `Failed to send notification: ID ${appointment.id}. Removing from cache.`
    );
    // Remove from cache if notification failed, so we can retry next time
    cacheService.delete(appointmentKey);
  }
}
