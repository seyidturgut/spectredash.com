# 🚀 Deployment Talimatları

## Database Migration

Database migration'ı çalıştırmak için aşağıdaki adımları izleyin:

### Seçenek 1: cPanel File Manager (Önerilen)

1. cPanel'e giriş yapın
2. **File Manager** açın
3. `public_html/api/migrate.php` dosyasına gidin
4. Tarayıcınızda şu URL'yi açın:
   ```
   https://tembelhane.com/api/migrate.php
   ```
5. Ekranda migration sonuçlarını göreceksiniz

### Seçenek 2: phpMyAdmin

1. cPanel'de **phpMyAdmin** açın
2. Database'inizi seçin (`tembelha_db`)
3. **SQL** tab'ine gidin
4. `api/migrations/002_analytics_v2.sql` dosyasının içeriğini kopyalayın
5. SQL kutusuna yapıştırın ve **Go** butonuna tıklayın

### Seçenek 3: SSH (Eğer erişiminiz varsa)

```bash
cd /path/to/web
php api/migrate.php
```

---

## Migration Sonrası Kontrol

Migration başarılı olduysa şu tablolar oluşturulmuş olmalı:

- ✅ `goals` - Goal tracking
- ✅ `events` - Event tracking
- ✅ `heatmap_data` - Heatmap interactions
- ✅ `sessions` - Session tracking

Ve şu tablolar güncellenmiş olmalı:

- ✅ `ziyaretler` - Enhanced tracking fields
- ✅ `sites` - Security features

---

## Tracker Deployment

Tracker dosyası zaten hazır:
```
public/tracker/ajans-tracker.js
```

Bu dosya şu URL'den erişilebilir olmalı:
```
https://tembelhane.com/tracker/ajans-tracker.js
```

---

## Test Etme

### 1. Demo Sayfasını Açın

```
https://tembelhane.com/tracker/examples/html-example.html
```

Bu sayfa tüm özellikleri test etmenizi sağlar.

### 2. Kendi Sitenizde Test Edin

Herhangi bir HTML sayfasına ekleyin:

```html
<script src="https://tembelhane.com/tracker/ajans-tracker.js"></script>
<script>
  AjansTracker.init('TR-0001-A'); // Site ID'nizi buraya yazın
</script>
```

### 3. Dashboard'da Kontrol Edin

Admin panelinde yeni componentleri kullanın:
- `GoalAnalytics` - Goal tracking
- `EventAnalytics` - Event tracking
- `HeatmapViewer` - Heatmap visualization

---

## Müşterilere Entegrasyon

Müşterilerinize sadece şu kodu verin:

```html
<!-- Sayfanın </body> etiketinden önce ekleyin -->
<script src="https://tembelhane.com/tracker/ajans-tracker.js"></script>
<script>
  AjansTracker.init('THEIR-SITE-ID');
</script>
```

Site ID'yi admin panelinden alabilirler.

---

## Güvenlik Ayarları

### Domain Whitelist Ayarlama

1. Admin panelinde site ayarlarına gidin
2. `allowed_domains` alanına izin verilen domain'leri ekleyin:
   ```json
   ["https://example.com", "https://www.example.com"]
   ```

### Heatmap Ayarları

Site bazında heatmap'i açıp kapatabilirsiniz:
- `heatmap_enabled` = `true` (aktif)
- `heatmap_enabled` = `false` (kapalı)

### Rate Limiting

Site bazında rate limit ayarlayabilirsiniz:
- `rate_limit` = `100` (dakikada 100 istek)

---

## Sorun Giderme

### Migration çalışmıyor

- PHP version kontrolü yapın (minimum PHP 7.4)
- Database bağlantı bilgilerini kontrol edin (`api/config.php`)
- MySQL user'ın CREATE TABLE yetkisi olduğundan emin olun

### Tracker yüklenmiyor

- CORS ayarlarını kontrol edin
- `public/tracker/` klasörünün erişilebilir olduğundan emin olun
- Browser console'da hata var mı kontrol edin

### Data gelmiyor

- Site ID'nin doğru olduğundan emin olun
- Network tab'de API isteklerini kontrol edin
- Database'de yeni kayıtlar oluşuyor mu kontrol edin

---

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. Browser console'u kontrol edin
2. Network tab'de API isteklerini inceleyin
3. Database'de tablolar oluşmuş mu kontrol edin
4. Migration log'larını inceleyin

Başarılar! 🎉
