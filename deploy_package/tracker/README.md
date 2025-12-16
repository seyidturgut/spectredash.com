# Ajans Analytics Tracker

**Platform-bağımsız web analytics tracking kütüphanesi**

Version: 2.0.0

## 🚀 Hızlı Başlangıç

### 1. Tracker'ı Sitenize Ekleyin

```html
<!-- Sayfanızın </body> etiketinden önce ekleyin -->
<script src="https://tembelhane.com/tracker/ajans-tracker.js"></script>
<script>
  AjansTracker.init('TR-XXXX-Y');
</script>
```

Site ID'nizi admin panelinden alabilirsiniz.

---

## 📊 Özellikler

### ✅ Otomatik Tracking
- **Sayfa görüntülemeleri** - Otomatik olarak her sayfa yüklenişini takip eder
- **Session yönetimi** - Kullanıcı oturumlarını otomatik takip eder
- **Bot detection** - Bot trafiğini gerçek kullanıcılardan ayırır
- **Performance metrics** - Sayfa yüklenme sürelerini kaydeder
- **SPA desteği** - Single Page Application'larda URL değişimlerini takip eder

### 🎯 Goal Tracking (Hedef Takibi)

Conversion ve hedefleri takip edin:

```javascript
// Form gönderimi
AjansTracker.goal('form_submit', {
  value: 0,
  form_name: 'contact'
});

// Satın alma
AjansTracker.goal('purchase', {
  value: 299.99,
  product: 'Premium Plan',
  currency: 'TRY'
});

// Newsletter kayıt
AjansTracker.goal('newsletter_signup', {
  value: 0,
  source: 'homepage'
});
```

### 📌 Event Tracking (Olay Takibi)

Custom event'leri takip edin:

```javascript
// Buton tıklama
AjansTracker.event('button_click', {
  category: 'engagement',
  label: 'cta_button',
  value: 1
});

// Video izleme
AjansTracker.event('video_play', {
  category: 'media',
  label: 'product_demo',
  value: 0
});

// Dosya indirme
AjansTracker.event('download', {
  category: 'engagement',
  label: 'brochure.pdf',
  value: 1
});
```

### 🗺️ Heatmap Tracking

Otomatik olarak şunları kaydeder:
- **Click heatmap** - Kullanıcıların nereye tıkladığı
- **Scroll heatmap** - Sayfanın ne kadarının görüntülendiği
- **Mouse movement** - Fare hareketleri (sampled)

> **Not:** Heatmap tracking kullanıcıların %10'unda otomatik olarak aktif olur (performans için).

---

## ⚙️ Gelişmiş Konfigürasyon

```javascript
AjansTracker.init('TR-XXXX-Y', {
  apiEndpoint: 'https://custom-domain.com/api',
  sessionTimeout: 30 * 60 * 1000, // 30 dakika
  heatmapSampleRate: 0.2, // %20 kullanıcıda heatmap aktif
  mouseMoveThrottle: 500, // ms
  scrollThrottle: 300, // ms
  batchSize: 10,
  batchInterval: 5000 // 5 saniye
});
```

### Konfigürasyon Seçenekleri

| Seçenek | Varsayılan | Açıklama |
|---------|-----------|----------|
| `apiEndpoint` | `https://tembelhane.com/api` | API endpoint URL'i |
| `sessionTimeout` | `1800000` (30dk) | Session timeout süresi (ms) |
| `heatmapSampleRate` | `0.1` | Heatmap tracking oranı (0-1) |
| `mouseMoveThrottle` | `500` | Mouse movement throttle (ms) |
| `scrollThrottle` | `300` | Scroll tracking throttle (ms) |
| `batchSize` | `10` | Heatmap batch boyutu |
| `batchInterval` | `5000` | Heatmap gönderim aralığı (ms) |

---

## 🔧 API Referansı

### `AjansTracker.init(siteId, options)`

Tracker'ı başlatır.

**Parametreler:**
- `siteId` (string, required) - Site ID'niz
- `options` (object, optional) - Konfigürasyon seçenekleri

**Örnek:**
```javascript
AjansTracker.init('TR-0001-A');
```

### `AjansTracker.goal(goalName, data)`

Bir goal/conversion kaydeder.

**Parametreler:**
- `goalName` (string, required) - Goal adı
- `data` (object, optional) - Ek data
  - `value` (number) - Goal değeri (opsiyonel)
  - Diğer custom alanlar

**Örnek:**
```javascript
AjansTracker.goal('signup', {
  value: 0,
  plan: 'free',
  source: 'landing_page'
});
```

### `AjansTracker.event(eventName, data)`

Custom event kaydeder.

**Parametreler:**
- `eventName` (string, required) - Event adı
- `data` (object, optional) - Event data
  - `category` (string) - Event kategorisi (varsayılan: 'general')
  - `label` (string) - Event etiketi
  - `value` (number) - Event değeri (varsayılan: 0)

**Örnek:**
```javascript
AjansTracker.event('share', {
  category: 'social',
  label: 'facebook',
  value: 1
});
```

### `AjansTracker.getSessionId()`

Mevcut session ID'yi döndürür.

**Dönüş:** `string`

### `AjansTracker.isBot()`

Kullanıcının bot olup olmadığını kontrol eder.

**Dönüş:** `boolean`

---

## 💡 Kullanım Örnekleri

### HTML Website

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Welcome</h1>
  
  <button id="cta-button">Get Started</button>
  
  <form id="contact-form">
    <input type="email" name="email" required>
    <button type="submit">Subscribe</button>
  </form>

  <!-- Tracker -->
  <script src="https://tembelhane.com/tracker/ajans-tracker.js"></script>
  <script>
    // Initialize
    AjansTracker.init('TR-0001-A');
    
    // Track button click
    document.getElementById('cta-button').addEventListener('click', function() {
      AjansTracker.event('cta_click', {
        category: 'engagement',
        label: 'homepage_cta'
      });
    });
    
    // Track form submission
    document.getElementById('contact-form').addEventListener('submit', function(e) {
      e.preventDefault();
      
      AjansTracker.goal('newsletter_signup', {
        value: 0,
        source: 'homepage'
      });
      
      // Submit form...
    });
  </script>
</body>
</html>
```

### React Application

```jsx
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Initialize tracker
    if (window.AjansTracker) {
      window.AjansTracker.init('TR-0001-A');
    }
  }, []);

  const handlePurchase = (product, amount) => {
    // Track purchase goal
    window.AjansTracker?.goal('purchase', {
      value: amount,
      product: product.name,
      category: product.category
    });
  };

  const handleButtonClick = () => {
    // Track event
    window.AjansTracker?.event('button_click', {
      category: 'engagement',
      label: 'cta_button'
    });
  };

  return (
    <div>
      <button onClick={handleButtonClick}>Click Me</button>
    </div>
  );
}
```

### Vue.js Application

```vue
<template>
  <div>
    <button @click="trackClick">Click Me</button>
  </div>
</template>

<script>
export default {
  mounted() {
    // Initialize tracker
    if (window.AjansTracker) {
      window.AjansTracker.init('TR-0001-A');
    }
  },
  
  methods: {
    trackClick() {
      window.AjansTracker?.event('button_click', {
        category: 'engagement',
        label: 'vue_button'
      });
    }
  }
}
</script>
```

---

## 🔒 Güvenlik

### Bot Detection

Tracker otomatik olarak botları tespit eder:
- User-Agent analizi
- Headless browser tespiti
- Phantom/Selenium tespiti
- WebDriver flag kontrolü

Bot trafiği `is_bot: true` olarak işaretlenir ve dashboard'da filtrelenebilir.

### Domain Whitelist

Admin panelinden siteniz için izin verilen domain'leri belirleyebilirsiniz. Sadece whitelist'teki domain'lerden gelen istekler kabul edilir.

### Rate Limiting

Her site için dakikada maksimum 100 istek limiti vardır. Aşıldığında `429 Too Many Requests` hatası döner.

---

## 📈 Dashboard

Admin panelinde şunları görebilirsiniz:

- **Real-time ziyaretçiler**
- **Sayfa görüntülemeleri**
- **Goal completion rates**
- **Event analytics**
- **Heatmap visualization**
- **Session analytics**
- **Performance metrics**

---

## 🐛 Troubleshooting

### Tracker yüklenmiyor

1. Script URL'ini kontrol edin
2. Console'da hata var mı kontrol edin
3. CORS ayarlarını kontrol edin

### Data görünmüyor

1. Site ID'nin doğru olduğundan emin olun
2. Network tab'de API isteklerini kontrol edin
3. Bot olarak tespit edilmiş olabilirsiniz (geliştirme sırasında)

### Heatmap çalışmıyor

1. Site ayarlarında heatmap'in aktif olduğundan emin olun
2. Heatmap sadece %10 kullanıcıda aktiftir (sample rate)
3. Console'da hata mesajlarını kontrol edin

---

## 📞 Destek

Sorularınız için: [destek@ajans.com](mailto:destek@ajans.com)

---

## 📝 Changelog

### v2.0.0 (2025-12-16)
- ✅ WordPress bağımlılığı kaldırıldı
- ✅ Goal tracking eklendi
- ✅ Event tracking eklendi
- ✅ Heatmap tracking eklendi
- ✅ Session management eklendi
- ✅ Bot detection geliştirildi
- ✅ Performance metrics eklendi
- ✅ SPA support eklendi

### v1.2 (Previous)
- WordPress plugin versiyonu
