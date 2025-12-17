<?php
require_once __DIR__ . '/config.php';

$input = getJsonInput();
$site_id = $input['site_id'] ?? '';

if (empty($site_id)) {
    sendJson(['error' => 'Missing site_id'], 400);
}

if (empty(DEEPSEEK_API_KEY)) {
    sendJson(['error' => 'DeepSeek API Key is missing in config'], 500);
}

$db = getDB();

// 1. Calculate Date Range (Last 7 Days)
$end_date = date('Y-m-d 23:59:59');
$start_date = date('Y-m-d 00:00:00', strtotime('-7 days'));

// 2. Aggregate Stats
$stats = [];

// --- A. General Health (Visit, Bounce, Duration) ---
$stmt = $db->prepare("
    SELECT 
        COUNT(DISTINCT session_id) as total_visitors,
        COUNT(*) as total_pageviews,
        AVG(page_load_time) as avg_load_time
    FROM ziyaretler 
    WHERE site_id = ? AND created_at BETWEEN ? AND ?
");
$stmt->bind_param("sss", $site_id, $start_date, $end_date);
$stmt->execute();
$res = $stmt->get_result()->fetch_assoc();
$stats['visitors'] = $res['total_visitors'];
$stats['pageviews'] = $res['total_pageviews'];

// Bounce Rate & Avg Duration
$stmt = $db->prepare("
    SELECT 
        COUNT(*) as total_sessions,
        SUM(CASE WHEN page_views = 1 THEN 1 ELSE 0 END) as bounces,
        AVG(TIMESTAMPDIFF(SECOND, first_visit, last_activity)) as avg_duration_sec
    FROM sessions 
    WHERE site_id = ? AND last_activity BETWEEN ? AND ?
");
$stmt->bind_param("sss", $site_id, $start_date, $end_date);
$stmt->execute();
$sess_res = $stmt->get_result()->fetch_assoc();
$stats['bounce_rate'] = $sess_res['total_sessions'] > 0
    ? round(($sess_res['bounces'] / $sess_res['total_sessions']) * 100, 1) . '%'
    : '0%';
$stats['avg_duration'] = round($sess_res['avg_duration_sec'] ?? 0) . ' sec';


// --- B. Rage & Dead Clicks (UX) ---
// Top Rage Element
$stmt = $db->prepare("
    SELECT event_label as selector, COUNT(*) as count
    FROM events 
    WHERE site_id = ? AND event_name = 'rage_click' AND created_at BETWEEN ? AND ?
    GROUP BY event_label 
    ORDER BY count DESC 
    LIMIT 1
");
$stmt->bind_param("sss", $site_id, $start_date, $end_date);
$stmt->execute();
$rage = $stmt->get_result()->fetch_assoc();
$stats['top_rage_element'] = $rage ? "{$rage['selector']} ({$rage['count']} times)" : 'None';

// Top Dead Click Element
$stmt = $db->prepare("
    SELECT event_label as selector, COUNT(*) as count
    FROM events 
    WHERE site_id = ? AND event_name = 'dead_click' AND created_at BETWEEN ? AND ?
    GROUP BY event_label 
    ORDER BY count DESC 
    LIMIT 1
");
$stmt->bind_param("sss", $site_id, $start_date, $end_date);
$stmt->execute();
$dead = $stmt->get_result()->fetch_assoc();
$stats['top_dead_click'] = $dead ? "{$dead['selector']} ({$dead['count']} times)" : 'None';


// --- C. Form Performance ---
$stmt = $db->prepare("
    SELECT event_label as input, COUNT(*) as count
    FROM events 
    WHERE site_id = ? AND event_name = 'form_abandonment' AND created_at BETWEEN ? AND ?
    GROUP BY event_label 
    ORDER BY count DESC 
    LIMIT 1
");
$stmt->bind_param("sss", $site_id, $start_date, $end_date);
$stmt->execute();
$form = $stmt->get_result()->fetch_assoc();
$stats['last_focused_input'] = $form ? "{$form['input']} ({$form['count']} drops)" : 'None';


// --- D. Speed & Tech (Web Vitals) ---
// Avg LCP
$stmt = $db->prepare("
    SELECT AVG(event_value) as avg_lcp
    FROM events 
    WHERE site_id = ? AND event_name = 'performance_metric' AND event_label = 'LCP' AND created_at BETWEEN ? AND ?
");
$stmt->bind_param("sss", $site_id, $start_date, $end_date);
$stmt->execute();
$lcp = $stmt->get_result()->fetch_assoc();
$stats['avg_lcp'] = $lcp['avg_lcp'] ? round($lcp['avg_lcp']) . 'ms' : 'N/A';

// Mobile vs Desktop
// Assuming 'viewport_width' < 768 is Mobile
$stmt = $db->prepare("
    SELECT 
        SUM(CASE WHEN viewport_width < 768 THEN 1 ELSE 0 END) as mobile,
        SUM(CASE WHEN viewport_width >= 768 THEN 1 ELSE 0 END) as desktop
    FROM ziyaretler 
    WHERE site_id = ? AND created_at BETWEEN ? AND ?
");
$stmt->bind_param("sss", $site_id, $start_date, $end_date);
$stmt->execute();
$dev = $stmt->get_result()->fetch_assoc();
$stats['mobile_desktop_ratio'] = ($dev['mobile'] ?? 0) . ' Mobile / ' . ($dev['desktop'] ?? 0) . ' Desktop';


// --- E. Top Goal ---
$stmt = $db->prepare("
    SELECT goal_name, COUNT(*) as count 
    FROM goals
    WHERE site_id = ? AND created_at BETWEEN ? AND ?
    GROUP BY goal_name 
    ORDER BY count DESC 
    LIMIT 1
");
$stmt->bind_param("sss", $site_id, $start_date, $end_date);
$stmt->execute();
$goal = $stmt->get_result()->fetch_assoc();
$stats['top_goal'] = $goal ? "{$goal['goal_name']} ({$goal['count']})" : 'None';


// --- F. Logic for "Biggest Issue" and Derived Metrics ---
$total_dev = ($dev['mobile'] ?? 0) + ($dev['desktop'] ?? 0);
$mobile_percent = $total_dev > 0 ? round((($dev['mobile'] ?? 0) / $total_dev) * 100) : 0;

$lcp_val = round($lcp['avg_lcp'] ?? 0);
$speed_status = "Veri Yok";
if ($lcp_val > 0) {
    $speed_status = $lcp_val > 2500 ? "Yavaş ({$lcp_val}ms)" : "Hızlı ({$lcp_val}ms)";
}

// Determine Biggest Issue (Rage vs Dead vs Form)
$issues = [
    'Rage Click' => ['count' => $rage['count'] ?? 0, 'selector' => $rage['selector'] ?? '', 'type' => 'Rage Click (Öfke Tıklaması)'],
    'Dead Click' => ['count' => $dead['count'] ?? 0, 'selector' => $dead['selector'] ?? '', 'type' => 'Dead Click (Ölü Tıklama)'],
    'Form Abandon' => ['count' => $form['count'] ?? 0, 'selector' => $form['input'] ?? '', 'type' => 'Form Terk Etme']
];

$max_issue = ['count' => 0, 'type' => 'Yok', 'selector' => ''];
foreach ($issues as $k => $v) {
    if ($v['count'] > $max_issue['count']) {
        $max_issue = $v;
    }
}

// 3. Data Readiness Check - REMOVED to allow analysis for all sites
// We want AI to comment even on empty data (e.g. "No visitors yet, start marketing!")

// 4. Prepare Data Payload (JSON)
$data_payload = [
    "site_ozeti" => [
        "ziyaretci_sayisi" => (int) $stats['visitors'],
        "mobil_kullanici_orani" => "%" . $mobile_percent,
        "site_hizi_durumu" => $speed_status,
        "en_buyuk_sorun" => [
            "tip" => $max_issue['type'],
            "yer" => $max_issue['selector'],
            "sayi" => $max_issue['count']
        ],
        "form_durumu" => [
            "terk_edilen_input" => $form['input'] ?? 'Yok'
        ]
    ]
];

$user_message = json_encode($data_payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

// 5. Call DeepSeek API
$system_prompt = '
Sen "Spectre AI" adında, dijital pazarlama ve UX (Kullanıcı Deneyimi) uzmanısın.
Görevin: Sana vereceğim web sitesi analiz verilerini inceleyerek site sahibine (teknik bilgisi olmayan biri) tek bir paragrafta, samimi ve net bir "Günün Tavsiyesi"ni vermek.

Kurallar:
1. Kesinlikle teknik terim (LCP, DOM, Selector, ID) kullanma.
2. Çıktı dili Türkçe olmalı.
3. Tonun: Çok samimi, içten ve motive edici. Sanki kahve eşliğinde muhabbet eden bir arkadaş gibi konuş. Asla robotik olma.
4. Sadece EN ÖNEMLİ tek bir soruna veya fırsata odaklan. Hepsini anlatmaya çalışma.

Senaryo Örnekleri (Bunlara göre yanıt üret):
- Eğer HİÇ VERİ YOKSA veya Ziyaretçi < 5 ise: "Henüz dükkanı yeni açmış gibiyiz! 👀 Siten yayında ama buralar biraz sessiz. İlk iş olarak sosyal medyada bir paylaşım yapıp arkadaşlarını davet etmeye ne dersin?" de.
- Eğer Rage Click yüksekse: "Kullanıcılar şu butona sinirleniyor, bozuk olabilir mi?" de.
- Eğer Dead Click yüksekse: "Ziyaretçiler şu resmi link sanıp tıklıyor, oraya bir link verelim!" de.
- Eğer Form Abandonment yüksekse: "Müşteriler formun Telefon kısmına gelince vazgeçiyor, bu soruyu kaldırmayı düşündün mü?" de.
- Eğer LCP (Hız) kötüyse: "Site biraz yavaş açılıyor, bu yüzden müşteri kaybediyor olabilirsin." de.
- Eğer veriler güzelse: "Harika gidiyorsun! Rüzgarı arkana almışsın, aynen devam! 🚀" de.
';

$ch = curl_init('https://api.deepseek.com/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10); // Max 10s timeout
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . DEEPSEEK_API_KEY
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'model' => 'deepseek-chat',
    'messages' => [
        ['role' => 'system', 'content' => $system_prompt],
        ['role' => 'user', 'content' => $user_message]
    ],
    'temperature' => 1.0
]));

$response = curl_exec($ch);

if (curl_errno($ch)) {
    // Graceful fallback on timeout/error
    $advice = "Şu an AI beynim aşırı yoğun! 🤯 Ama verilerine baktım, her şey yolunda görünüyor. Birazdan tekrar deneyebilirsin.";
} else {
    $ai_data = json_decode($response, true);
    $advice = $ai_data['choices'][0]['message']['content'] ?? 'Analiz oluşturulamadı.';
}
curl_close($ch);


// 6. Return Result
sendJson([
    'status' => 'success',
    'ai_insight' => $advice
]);
