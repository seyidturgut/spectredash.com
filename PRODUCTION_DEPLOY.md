# 🚀 Production Deployment Guide

## Localhost'tan Production'a Geçiş

### 1. Database Configuration

**`api/config.php` dosyasını güncelle:**

```php
// Production database credentials
define('DB_HOST', 'localhost');
define('DB_USER', 'tembelha_dbuser');
define('DB_PASS', 'Sifreniz123!');
define('DB_NAME', 'tembelha_db');
```

### 2. Tracker Configuration

**`public/tracker/ajans-tracker.js` dosyasını güncelle:**

```javascript
const CONFIG = {
    apiEndpoint: '/api', // Production'da relative path kullan
    // ... diğer ayarlar
};
```

**Not:** Production'da da relative path (`/api`) kullanabilirsin çünkü tracker ve API aynı domain'de.

### 3. Database Migration

Production database'de migration'ı çalıştır:

**Seçenek 1: phpMyAdmin**
1. `api/migrations/002_analytics_v2.sql` dosyasını aç
2. Her `ALTER TABLE` komutunu tek tek çalıştır
3. Yeni tabloları oluştur (`goals`, `events`, `heatmap_data`, `sessions`)

**Seçenek 2: Migration Script**
```bash
# Production'da
php api/migrate.php
```

### 4. Git Push

```bash
git add .
git commit -m "Add standalone analytics platform with goals, events, and heatmap tracking"
git push origin main
```

### 5. cPanel Deployment

`.cpanel.yml` zaten mevcut, otomatik deploy edilecek.

### 6. Production Test

1. **Tracker'ı test et:**
   - Bir müşteri sitesine tracker'ı ekle
   - `<script src="https://tembelhane.com/tracker/ajans-tracker.js"></script>`
   - `AjansTracker.init('SITE-ID');`

2. **Dashboard'da kontrol et:**
   - Login ol
   - Hedefler/Olaylar/Heatmap menülerine bak
   - Data görünüyor mu?

## ✅ Checklist

- [ ] `api/config.php` production credentials
- [ ] Database migration çalıştırıldı
- [ ] Git push yapıldı
- [ ] Tracker bir test sitesine eklendi
- [ ] Dashboard'da data görünüyor

## 🎯 Önemli Notlar

- **Localhost vs Production:** Tek fark database credentials
- **Tracker:** Production'da da `/api` relative path kullanıyor
- **Dashboard:** Değişiklik gerektirmiyor
- **Migration:** Sadece bir kez çalıştırılmalı

Başarılar! 🚀
