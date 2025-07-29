import { Telegraf } from "telegraf";
import type { Context } from "telegraf";
import type { Update } from "telegraf/typings/core/types/typegram";
import type { VisaAppointment } from "../types";
import { config } from "../config/environment";
import { STATUS_EMOJI } from "../utils/constants";

interface TelegramError {
  response?: {
    parameters?: {
      retry_after?: number;
    };
  };
}

/**
 * Telegram servis sınıfı
 * Telegram mesajlarının gönderilmesi ve bot yönetiminden sorumludur
 */
class TelegramService {
  private bot: Telegraf;
  private messageCount = 0;
  private lastReset = Date.now();
  private resetInterval?: ReturnType<typeof setInterval>;

  constructor() {
    this.bot = new Telegraf(config.telegram.botToken);
    this.setupErrorHandler();
    this.startRateLimitReset();
  }

  /**
   * Escapes markdown special characters for MarkdownV2 format
   * @param text Text to escape
   * @returns Escaped text
   */
  private escapeMarkdown(text: string): string {
    return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, "\\$&");
  }

  /**
   * Bot hata yakalayıcısını ayarlar
   * Bot çalışırken oluşabilecek hataları yakalar ve loglar
   */
  private setupErrorHandler(): void {
    this.bot.catch((err: unknown, ctx: Context<Update>) => {
      console.error("Telegram bot hatası:", {
        error: err,
        updateType: ctx.updateType,
        chatId: ctx.chat?.id,
      });
    });
  }

  /**
   * Rate limit sayacını sıfırlar
   * Her dakika başında çalışır
   */
  private startRateLimitReset(): void {
    // Önceki interval'i temizle
    if (this.resetInterval) {
      clearInterval(this.resetInterval);
    }

    this.resetInterval = setInterval(() => {
      if (this.messageCount > 0) {
        console.log(
          `Rate limit sayacı sıfırlandı. Önceki mesaj sayısı: ${this.messageCount}`
        );
      }
      this.messageCount = 0;
      this.lastReset = Date.now();
    }, 60000); // Her dakika
  }

  /**
   * Rate limit kontrolü yapar ve gerekirse bekler
   */
  private async handleRateLimit(): Promise<void> {
    if (this.messageCount >= config.telegram.rateLimit) {
      const timeToWait = 60000 - (Date.now() - this.lastReset);
      if (timeToWait > 0) {
        console.log(
          `Rate limit aşıldı. ${Math.ceil(
            timeToWait / 1000
          )} saniye bekleniyor...`
        );
        await new Promise((resolve) => setTimeout(resolve, timeToWait));
        this.messageCount = 0;
        this.lastReset = Date.now();
      }
    }
  }

  /**
   * Formats appointment information into a readable message
   * @param appointment The appointment to format
   * @returns Formatted message string in MarkdownV2 format
   */
  formatMessage(appointment: VisaAppointment): string {
    const lastChecked = new Date(appointment.last_checked_at);
    const statusEmoji = this.getStatusEmoji(appointment.status);

    return [
      `*${statusEmoji} NEW APPOINTMENT STATUS\\! *`,
      `🏢 *Center:* ${this.escapeMarkdown(appointment.center)}`,
      `🌍 *Country/Mission:* ${this.escapeMarkdown(appointment.country_code.toUpperCase())} \\-\\> ${this.escapeMarkdown(appointment.mission_code.toUpperCase())}`,
      `🏛️ *Category:* ${this.escapeMarkdown(appointment.visa_category)}`,
      `📄 *Type:* ${this.escapeMarkdown(appointment.visa_type)}`,
      `🚦 *Status:* ${statusEmoji} ${this.escapeMarkdown(appointment.status)}`,
      `📅 *Last Available Date:* ${this.formatAvailableDate(appointment.last_available_date)}`,
      `📊 *Tracking Count:* ${appointment.tracking_count}`,
      `⏰ *Last Check:* ${this.escapeMarkdown(this.formatDate(lastChecked))}`
    ].join("\n");
  }

  /**
   * Gets the appropriate emoji for appointment status
   * @param status The appointment status
   * @returns Emoji for the status
   */
  private getStatusEmoji(status: string): string {
    return STATUS_EMOJI[status as keyof typeof STATUS_EMOJI] || "❓";
  }

  /**
   * Formats a date for display
   * @param date The date to format
   * @returns Formatted date string
   */
  private formatDate(date: Date | string): string {
    if (typeof date === "string") {
      date = new Date(date);
    }
    return date.toLocaleString("tr-TR", {
      timeZone: "Europe/Istanbul",
      dateStyle: "medium",
      timeStyle: "medium",
    });
  }

  /**
   * Formats the available date or returns default text if not available
   * @param dateStr The date string to format
   * @returns Formatted date or default text
   */
  private formatAvailableDate(dateStr?: string): string {
    if (!dateStr) return "No Information";
    return this.escapeMarkdown(dateStr);
  }

  /**
   * Yeni randevu bilgisini Telegram kanalına gönderir
   * @returns Mesaj başarıyla gönderildiyse true, hata oluştuysa false döner
   */
  async sendNotification(appointment: VisaAppointment): Promise<boolean> {
    try {
      await this.handleRateLimit();

      await this.bot.telegram.sendMessage(
        config.telegram.channelId,
        this.formatMessage(appointment),
        {
          parse_mode: "MarkdownV2",
          link_preview_options: {
            is_disabled: true,
          },
        }
      );

      this.messageCount++;
      return true;
    } catch (error) {
      if (this.isTelegramError(error)) {
        const retryAfter = error.response?.parameters?.retry_after;
        if (retryAfter) {
          const waitTime = retryAfter * 1000;
          console.log(
            `Telegram rate limit aşıldı. ${retryAfter} saniye bekleniyor...`
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          return this.sendNotification(appointment);
        }
      }
      console.error("Telegram mesajı gönderilirken hata oluştu:", error);
      return false;
    }
  }

  /**
   * Hata nesnesinin Telegram hatası olup olmadığını kontrol eder
   */
  private isTelegramError(error: unknown): error is TelegramError {
    return (
      error !== null &&
      typeof error === "object" &&
      "response" in error &&
      error.response !== null &&
      typeof error.response === "object" &&
      "parameters" in error.response
    );
  }

  /**
   * Servis kapatılırken interval'i temizle
   */
  cleanup(): void {
    if (this.resetInterval) {
      clearInterval(this.resetInterval);
    }
  }
}

export const telegramService = new TelegramService();
