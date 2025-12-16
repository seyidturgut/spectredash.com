// Turkish labels and explanations for analytics dashboard

export const EVENT_LABELS: Record<string, string> = {
    'button_click': 'Butona Tıklama',
    'scroll_depth': 'Sayfa Kaydırma',
    'video_play': 'Video Oynatma',
    'download': 'Dosya İndirme',
    'form_submit': 'Form Gönderimi',
    'link_click': 'Bağlantıya Tıklama',
    'page_view': 'Sayfa Görüntüleme',
    'test_event': 'Test Olayı',
    'performance_metric': 'Performans Analizi',
    'form_abandonment': 'Yarım Bırakılan Form',
    'rage_click': 'Sinirli Tıklama (Rage Click)',
    'dead_click': 'Ölü Tıklama (Dead Click)',
    'script_error': 'Javascript Hatası'
};

export const CATEGORY_LABELS: Record<string, string> = {
    'engagement': 'Etkileşim',
    'media': 'Medya',
    'social': 'Sosyal',
    'general': 'Genel',
    'test': 'Test'
};

export const GOAL_LABELS: Record<string, string> = {
    'purchase': 'Satın Alma',
    'newsletter_signup': 'Bültene Kayıt',
    'contact_form': 'İletişim Formu',
    'download': 'İndirme',
    'test_goal': 'Test Hedefi'
};

export const METRIC_EXPLANATIONS: Record<string, string> = {
    'total_conversions': 'Hedefe ulaşan toplam kullanıcı sayısı',
    'total_value': 'Tüm dönüşümlerden elde edilen toplam değer',
    'avg_value': 'Her dönüşümün ortalama değeri',
    'event_count': 'Bu olayın gerçekleşme sayısı',
    'total_events': 'Toplam olay sayısı',
    'unique_users': 'Bu olayı gerçekleştiren benzersiz kullanıcı sayısı',
    'click_count': 'Toplam tıklama sayısı',
    'scroll_depth': 'Kullanıcıların sayfada ne kadar aşağı kaydırdığı',
    'heatmap_data': 'Kullanıcıların sayfa üzerindeki etkileşim haritası'
};

export const HEATMAP_TYPE_LABELS: Record<string, string> = {
    'click': 'Tıklamalar',
    'scroll': 'Kaydırma',
    'movement': 'Fare Hareketleri'
};

export const DATE_RANGE_LABELS: Record<string, string> = {
    '24h': 'Son 24 Saat',
    '7d': 'Son 7 Gün',
    '30d': 'Son 30 Gün',
    '90d': 'Son 90 Gün'
};

// Helper functions
export function getEventLabel(eventName: string): string {
    return EVENT_LABELS[eventName] || eventName;
}

export function getCategoryLabel(category: string): string {
    return CATEGORY_LABELS[category] || category;
}

export function getGoalLabel(goalName: string): string {
    return GOAL_LABELS[goalName] || goalName;
}

export function getHeatmapTypeLabel(type: string): string {
    return HEATMAP_TYPE_LABELS[type] || type;
}

export function getDateRangeLabel(range: string): string {
    return DATE_RANGE_LABELS[range] || range;
}

export function formatNumber(num: number): string {
    return new Intl.NumberFormat('tr-TR').format(num);
}

export function formatCurrency(amount: number, currency: string = 'TRY'): string {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

export function formatPercentage(value: number): string {
    return `%${value.toFixed(1)}`;
}

export function getPageTitle(url: string): string {
    try {
        const urlObj = new URL(url);
        const path = urlObj.pathname;
        if (path === '/' || path === '') return '🏠 Ana Sayfa';
        const parts = path.split('/').filter(Boolean);
        const lastPart = parts[parts.length - 1];
        if (!lastPart) return '📄 ' + path;
        return `📄 ${lastPart.replace(/-/g, ' ').replace(/\.html?$/i, '')}`;
    } catch {
        return url;
    }
}
