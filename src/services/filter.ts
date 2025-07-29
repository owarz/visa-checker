import type { VisaAppointment } from "../types";
import { config } from "../config/environment";
import { extractCity } from "../core/cityExtractor";
import { VALID_APPOINTMENT_STATUSES } from "../utils/constants";

/**
 * Service responsible for filtering appointments based on configuration
 */
export class AppointmentFilterService {
  /**
   * Validates an appointment against all configured filters
   * @param appointment The appointment to validate
   * @returns true if appointment passes all filters, false otherwise
   */
  isAppointmentValid(appointment: VisaAppointment): boolean {
    return (
      this.hasValidStatus(appointment) &&
      this.matchesTargetCountry(appointment) &&
      this.matchesMissionCountries(appointment) &&
      this.matchesTargetCities(appointment) &&
      this.matchesVisaSubcategories(appointment)
    );
  }

  /**
   * Checks if appointment has a valid status for notification
   * @param appointment The appointment to check
   * @returns true if status is valid
   */
  private hasValidStatus(appointment: VisaAppointment): boolean {
    const isValid = VALID_APPOINTMENT_STATUSES.includes(
      appointment.status as typeof VALID_APPOINTMENT_STATUSES[number]
    );
    
    if (!isValid && config.app.debug) {
      console.log(
        `Skipping appointment ID ${appointment.id} due to status: ${appointment.status}`
      );
    }
    
    return isValid;
  }

  /**
   * Checks if appointment matches the target source country
   * @param appointment The appointment to check
   * @returns true if country matches
   */
  private matchesTargetCountry(appointment: VisaAppointment): boolean {
    if (config.app.targetCountry.toLowerCase() === "all") {
      return true;
    }

    const matches = appointment.country_code.toLowerCase() === config.app.targetCountry.toLowerCase();
    
    if (!matches && config.app.debug) {
      console.log(
        `Skipping appointment ID ${appointment.id}: Source country ${appointment.country_code} doesn't match target ${config.app.targetCountry}`
      );
    }
    
    return matches;
  }

  /**
   * Checks if appointment matches any of the target mission countries
   * @param appointment The appointment to check
   * @returns true if mission country is in the target list
   */
  private matchesMissionCountries(appointment: VisaAppointment): boolean {
    const matches = config.app.missionCountries.some(
      (code) => code.toLowerCase() === appointment.mission_code.toLowerCase()
    );
    
    if (!matches && config.app.debug) {
      console.log(
        `Skipping appointment ID ${appointment.id}: Mission country ${
          appointment.mission_code
        } not in target list [${config.app.missionCountries.join(", ")}]`
      );
    }
    
    return matches;
  }

  /**
   * Checks if appointment matches any of the target cities (if specified)
   * @param appointment The appointment to check
   * @returns true if no cities specified or city matches
   */
  private matchesTargetCities(appointment: VisaAppointment): boolean {
    if (config.app.targetCities.length === 0) {
      return true;
    }

    const appointmentCity = extractCity(appointment.center);
    const matches = config.app.targetCities.some((city) =>
      appointmentCity.toLowerCase().includes(city.toLowerCase())
    );
    
    if (!matches && config.app.debug) {
      console.log(
        `Skipping appointment ID ${
          appointment.id
        }: City ${appointmentCity} not in target list [${config.app.targetCities.join(
          ", "
        )}]`
      );
    }
    
    return matches;
  }

  /**
   * Checks if appointment matches any of the target visa subcategories (if specified)
   * @param appointment The appointment to check
   * @returns true if no subcategories specified or visa type matches
   */
  private matchesVisaSubcategories(appointment: VisaAppointment): boolean {
    if (config.app.targetSubCategories.length === 0) {
      return true;
    }

    const visaType = appointment.visa_type || "";
    const matches = config.app.targetSubCategories.some(
      (subCategory) => visaType.toLowerCase().includes(subCategory.toLowerCase())
    );
    
    if (!matches && config.app.debug) {
      console.log(
        `Skipping appointment ID ${
          appointment.id
        }: Visa type "${visaType}" not in target list [${config.app.targetSubCategories.join(
          ", "
        )}]`
      );
    }
    
    return matches;
  }
}

// Export singleton instance
export const appointmentFilterService = new AppointmentFilterService();