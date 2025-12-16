# 🚀 Localhost PHP + React Setup

## Durum

✅ **Backend:** PHP (MAMP)  
✅ **Frontend:** React (Vite)  
✅ **Database:** MySQL (MAMP - port 8889)

## Yapılan Değişiklikler

1. ✅ Vite proxy ayarlandı - `/api` istekleri `http://localhost:8888`'e yönlendiriliyor
2. ✅ Proje MAMP htdocs'a symlink yapıldı: `/Applications/MAMP/htdocs/ajans`
3. ✅ Database migration SQL dosyası hazır: `api/migrations/002_analytics_v2.sql`

## Kurulum Adımları

### 1. MAMP'i Başlat
- Apache Port: **8888**
- MySQL Port: **8889**

### 2. Database Migration Çalıştır

**Seçenek A: phpMyAdmin**
1. `http://localhost:8888/phpMyAdmin` aç
2. `spectre` database'ini seç
3. SQL tab'ine git
4. `api/migrations/002_analytics_v2.sql` dosyasının içeriğini yapıştır
5. Go butonuna tıkla

**Seçenek B: Terminal**
```bash
mysql -u root -proot -h localhost --port=8889 spectre < api/migrations/002_analytics_v2.sql
```

### 3. API Test Et

Tarayıcıda aç:
```
http://localhost:8888/ajans/api/login.php
```

Şunu görmeli: `{"error":"Missing email or password"}`

### 4. Frontend'i Başlat (Zaten Çalışıyor)

```bash
npm run dev
```

Frontend: `http://localhost:5173`

### 5. Login Test Et

- URL: `http://localhost:5173`
- Email: `seyitturgut@gmail.com`
- Password: `Beyincik**94`

## Sorun Giderme

### "Connection failed" hatası
- MAMP'in çalıştığından emin ol
- MySQL port'unun 8889 olduğunu kontrol et
- `api/config.php` dosyasındaki database bilgilerini kontrol et

### API 404 hatası
- Symlink doğru mu kontrol et: `ls -la /Applications/MAMP/htdocs/ajans`
- MAMP Apache çalışıyor mu kontrol et

### CORS hatası
- `api/config.php` dosyasında CORS headers var, sorun olmamalı

## Test Checklist

- [ ] MAMP çalışıyor (Apache + MySQL)
- [ ] Database migration tamamlandı
- [ ] API test edildi (`/api/login.php`)
- [ ] Frontend çalışıyor (`npm run dev`)
- [ ] Login başarılı
- [ ] Dashboard açılıyor
- [ ] Yeni menüler görünüyor (Hedefler, Olaylar, Heatmap)

Başarılar! 🎉
