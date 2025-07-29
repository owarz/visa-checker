# Değişiklik Günlüğü

## 1.0.2 - 29 Temmuz 2025

### Yeni Özellikler ve İyileştirmeler

- **Gelişmiş Kod Kalitesi ve Test Altyapısı:** Projeye ESLint ve Jest entegrasyonu yapıldı. Bu sayede kod kalitesi standartları belirlendi ve otomatik testler için sağlam bir temel oluşturuldu. Artık kodunuz daha tutarlı ve hatalara karşı daha dirençli.
- **Mimari Düzenleme:** Uygulamanın ana iş mantığını içeren `appointmentChecker` ve `cityExtractor` modülleri, `src/utils` klasöründen `src/core` klasörüne taşındı. Bu değişiklik, projenin yapısını daha anlaşılır hale getirerek ana işlevsellik ile yardımcı fonksiyonları birbirinden ayırıyor.

### Hata Düzeltmeleri

- **Zamanlanmış Görev Kararlılığı:** `src/index.ts` dosyasındaki kritik bir hata giderildi. Zamanlanmış görevlerin (cron job) ve ilk çalıştırmanın asenkron işlemleri doğru şekilde yönetmesi sağlandı. Bu düzeltme sayesinde, randevu kontrolü sırasında oluşabilecek hatalar artık uygulamanın çökmesine neden olmayacak, aksine güvenli bir şekilde yakalanıp raporlanacak.
- **Test Ortamı İyileştirmeleri:** Testlerin `TELEGRAM_BOT_TOKEN` gibi çevre değişkenleri eksik olduğunda `process.exit` çağrısı yapmasını engelleyecek şekilde test ortamı yapılandırıldı. Bu sayede testler artık izole ve kararlı bir şekilde çalışabiliyor.
