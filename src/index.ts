import cron from 'node-cron';
import { config } from './config/environment';
import { cacheService } from './services/cache';
import { checkAppointments } from './core/appointmentChecker';

// Önbellek temizleme işlemini başlat
cacheService.startCleanupInterval();

// Zamanlanmış görevi başlat
cron.schedule(config.app.checkInterval, () => {
  void (async () => {
    try {
      await checkAppointments();
    } catch (error) {
      console.error('Zamanlanmış görev sırasında bir hata oluştu:', error);
    }
  })();
});

console.log(`Vize randevu kontrolü başlatıldı. Kontrol sıklığı: ${config.app.checkInterval}`);
console.log(`Hedef ülke: ${config.app.targetCountry}`);
console.log(`Hedef ülkeler: ${config.app.missionCountries.join(', ')}`);
if (config.app.targetCities.length > 0) {
  console.log(`Hedef şehirler: ${config.app.targetCities.join(', ')}`);
}

// İlk kontrolü yap
void (async () => {
  try {
    await checkAppointments();
  } catch (error) {
    console.error('İlk kontrol sırasında bir hata oluştu:', error);
  }
})();