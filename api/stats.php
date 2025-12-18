<?php
// CRASH-DEBUFF: Turn off screen errors to prevent "Unexpected end of JSON"
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once __DIR__ . '/config.php';

// Prepare default response structure (Safe Mode)
$response = [
    'total_visits' => 0,
    'live_users' => 0,
    'average_duration' => '0dk 0sn',
    'devices' => [],
    'recent_feed' => [],
    'traffic_chart' => [],
    'debug_log' => [] // To capture errors without crashing
];

$site_id = $_GET['site_id'] ?? '';

if (empty($site_id)) {
    sendJson(['error' => 'Missing site_id'], 400);
}

$db = getDB();

// --- Date Filter Logic ---
$date_range = $_GET['date_range'] ?? 'Son 7 Gün';
$time_sql = "created_at >= NOW() - INTERVAL 7 DAY"; // Default

if ($date_range === 'Bugün') {
    $time_sql = "DATE(created_at) = CURDATE()";
} elseif ($date_range === 'Dün') {
    $time_sql = "DATE(created_at) = CURDATE() - INTERVAL 1 DAY";
} elseif ($date_range === 'Son 1 Ay') {
    $time_sql = "created_at >= NOW() - INTERVAL 30 DAY";
} elseif ($date_range === 'Son 3 Ay') {
    $time_sql = "created_at >= NOW() - INTERVAL 90 DAY";
}
// -------------------------

function safeQuery($db, $sql, $types, $params)
{
    try {
        $stmt = $db->prepare($sql);
        if (!$stmt) {
            return ['error' => $db->error];
        }
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        return $stmt->get_result();
    } catch (Exception $e) {
        return ['error' => $e->getMessage()];
    }
}

// 1. Total Visits
$res = safeQuery($db, "SELECT COUNT(*) as count FROM ziyaretler WHERE site_id = ? AND $time_sql", "s", [$site_id]);
if (is_array($res) && isset($res['error'])) {
    $response['debug_log'][] = "Visits Error: " . $res['error'];
} else {
    $row = $res->fetch_assoc();
    $response['total_visits'] = (int) ($row['count'] ?? 0);
}

// 2. Live Users
// Logic: Count unique session_ids from both page views (ziyaretler) and actions (events) in the last 5 minutes.
// This is more robust than relying on the 'sessions' table which might be out of sync.
$sql_live = "
SELECT COUNT(DISTINCT session_id) as count
FROM (
SELECT session_id FROM ziyaretler WHERE site_id = ? AND created_at >= NOW() - INTERVAL 5 MINUTE
UNION
SELECT session_id FROM events WHERE site_id = ? AND created_at >= NOW() - INTERVAL 5 MINUTE
) as active_pool
";

$res = safeQuery($db, $sql_live, "ss", [$site_id, $site_id]);

if (is_array($res) && isset($res['error'])) {
    // If the complex query fails (e.g. events table missing), fallback to simple ziyaretler count
    $res_fallback = safeQuery($db, "SELECT COUNT(DISTINCT session_id) as count FROM ziyaretler WHERE site_id = ? AND
created_at >= NOW() - INTERVAL 5 MINUTE", "s", [$site_id]);
    if (is_array($res_fallback) && isset($res_fallback['error'])) {
        $response['debug_log'][] = "Live Users Error (Fallback): " . $res_fallback['error'];
    } else {
        $row = $res_fallback->fetch_assoc();
        $response['live_users'] = (int) ($row['count'] ?? 0);
    }
} else {
    $row = $res->fetch_assoc();
    $response['live_users'] = (int) ($row['count'] ?? 0);
}

// 3. Average Duration (Robust & Capped)
$sql_duration = "
    SELECT AVG(session_duration) as avg_duration FROM (
        SELECT TIMESTAMPDIFF(SECOND, MIN(created_at), MAX(created_at)) as session_duration
        FROM (
            SELECT created_at, session_id FROM ziyaretler WHERE site_id = ? AND $time_sql
            UNION ALL
            SELECT created_at, session_id FROM events WHERE site_id = ? AND $time_sql
        ) as combined
        GROUP BY session_id
        HAVING session_duration > 5 AND session_duration < 3600 
    ) as durations
";

$res = safeQuery($db, $sql_duration, "ss", [$site_id, $site_id]);

if (is_array($res) && isset($res['error'])) {
    $response['debug_log'][] = "Duration Error: " . $res['error'];
} else {
    $row = $res->fetch_assoc();
    $avg = (int) ($row['avg_duration'] ?? 0);
    $response['average_duration'] = floor($avg / 60) . 'dk ' . ($avg % 60) . 'sn';
}

// 7. Popular Pages (Top 3)
$res = safeQuery($db, "SELECT url, MAX(page_title) as page_title, COUNT(*) as count FROM ziyaretler WHERE site_id = ? AND $time_sql GROUP BY url ORDER BY count DESC LIMIT 3", "s", [$site_id]);
if (!is_array($res) || !isset($res['error'])) {
    $response['popular_pages'] = $res->fetch_all(MYSQLI_ASSOC);
}

// 4. Devices
$res = safeQuery(
    $db,
    "SELECT device, COUNT(*) as count FROM ziyaretler WHERE site_id = ? AND $time_sql GROUP BY device",
    "s",
    [$site_id]
);
if (!is_array($res) || !isset($res['error'])) {
    $response['devices'] = $res->fetch_all(MYSQLI_ASSOC);
}

// 5. Recent Feed (Limit 10 for safety)
$res = safeQuery($db, "SELECT * FROM ziyaretler WHERE site_id = ? ORDER BY created_at DESC LIMIT 10", "s", [$site_id]);
if (!is_array($res) || !isset($res['error'])) {
    $response['recent_feed'] = $res->fetch_all(MYSQLI_ASSOC);
}

// 6. Goals Overview (Top 5)
$res = safeQuery($db, "SELECT goal_name, COUNT(*) as count FROM goals WHERE site_id = ? AND $time_sql GROUP BY goal_name ORDER BY count DESC LIMIT 5", "s", [$site_id]);
if (!is_array($res) || !isset($res['error'])) {
    $response['goals_overview'] = $res->fetch_all(MYSQLI_ASSOC);
}

// 9. Traffic Sources (Source / Medium)
$res = safeQuery($db, "SELECT utm_source, utm_medium, COUNT(*) as count FROM ziyaretler WHERE site_id = ? AND $time_sql GROUP BY utm_source, utm_medium ORDER BY count DESC LIMIT 10", "s", [$site_id]);
if (!is_array($res) || !isset($res['error'])) {
    $response['traffic_sources'] = $res->fetch_all(MYSQLI_ASSOC);
}

// 10. Top Search Terms
$res = safeQuery($db, "SELECT utm_term, COUNT(*) as count FROM ziyaretler WHERE site_id = ? AND $time_sql AND utm_term IS NOT NULL AND utm_term != '' GROUP BY utm_term ORDER BY count DESC LIMIT 10", "s", [$site_id]);
if (!is_array($res) || !isset($res['error'])) {
    $response['search_terms'] = $res->fetch_all(MYSQLI_ASSOC);
}

// 6. Traffic Chart
$days_tr = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']; // date('w') 0=Sunday

// Initialize chart with last 7 days (including today)
for ($i = 6; $i >= 0; $i--) {
    $ts = strtotime("-$i days");
    $date = date('Y-m-d', $ts);
    $day_index = (int) date('w', $ts);
    $day_name = $days_tr[$day_index];

    $response['traffic_chart'][] = [
        'name' => $day_name,
        'date' => $date, // Kept for matching
        'visits' => 0
    ];
}

$res = safeQuery($db, "
SELECT DATE(created_at) as date, COUNT(*) as count
FROM ziyaretler
WHERE site_id = ?
AND created_at >= DATE(NOW() - INTERVAL 7 DAY)
GROUP BY DATE(created_at)
", "s", [$site_id]);

if (!is_array($res) || !isset($res['error'])) {
    $data_map = [];
    while ($row = $res->fetch_assoc()) {
        $data_map[$row['date']] = $row['count'];
    }
    // Remap to chart
    foreach ($response['traffic_chart'] as &$point) {
        if (isset($data_map[$point['date']])) {
            $point['visits'] = (int) $data_map[$point['date']];
        }
    }
    // Clean up 'date' key if strictly needed, but React won't mind extra keys
}

// 8. Advanced Algorithmic Daily Summary (Smart & Human-like)
function generateAdvancedInsight($data)
{
    $visits = $data['total_visits'] ?? 0;
    $duration_str = $data['average_duration'] ?? '0dk 0sn';

    // Parse Duration
    preg_match('/(\d+)dk (\d+)sn/', $duration_str, $m);
    $total_sec = ((int) ($m[1] ?? 0) * 60) + (int) ($m[2] ?? 0);

    // Time Context
    $hour = (int) date('H');
    if ($hour < 12)
        $greeting = "Günaydın";
    elseif ($hour < 18)
        $greeting = "Tünaydın";
    else
        $greeting = "İyi akşamlar";

    $msgs = [];
    $emoji = "👋";

    // 1. Traffic Analysis
    if ($visits == 0) {
        $msgs[] = "Henüz veri akışı başlamadı. Dükkanı yeni açmış gibiyiz, sosyal medyada bir paylaşım yapmaya ne dersin?";
        $emoji = "☕";
    } elseif ($visits < 20) {
        $msgs[] = "Site bugün sakin bir seyir izliyor.";
        if ($total_sec > 30) {
            $msgs[] = "Gelen az sayıda ziyaretçi var ama neyse ki içerikle ilgileniyorlar.";
        } else {
            $msgs[] = "Ziyaretçi çekmek için yeni bir kampanya fena olmazdı.";
        }
    } elseif ($visits > 100) {
        $msgs[] = "Bugün site oldukça hareketli, harika gidiyorsun! 🚀";
        $emoji = "🔥";
    } else {
        $msgs[] = "Trafik akışı dengeli görünüyor.";
    }

    // 2. Engagement & UX Analysis (if traffic exists)
    if ($visits > 0) {
        // Duration Logic
        if ($total_sec < 10) {
            $msgs[] = "Ancak dikkatimi çeken bir şey var: Ziyaretçiler sitede çok az kalıyor (Ort. {$duration_str}).";
            $msgs[] = "Manşetleri veya giriş görselini daha çarpıcı yapmayı deneyebiliriz.";
            $emoji = "🤔";
        } elseif ($total_sec > 60) {
            $msgs[] = "Kullanıcılar içeriklerini sevmiş görünüyor, ortalama {$duration_str} vakit geçiriyorlar. Bu skor sektör standartlarının üzerinde! 🌟";
        }

        // Mobile Check
        if (!empty($data['devices'])) {
            $mobile_count = 0;
            $total_devices = 0;
            foreach ($data['devices'] as $d) {
                $total_devices += $d['count'];
                // Check for 'Mobil' which is what we store in db usually or from user agent mapping
                if (stripos($d['device'], 'Mobil') !== false || stripos($d['device'], 'Phone') !== false) {
                    $mobile_count += $d['count'];
                }
            }

            if ($total_devices > 10 && ($mobile_count / $total_devices) > 0.7) {
                $msgs[] = "Ziyaretçilerin büyük kısmı mobilden geliyor, menü ve butonların telefonda rahat kullanıldığından emin olmalısın.";
            }
        }

        // Popular Content Context
        if (!empty($data['popular_pages'])) {
            $top_page = $data['popular_pages'][0]['page_title'] ?? '';
            $top_url = $data['popular_pages'][0]['url'] ?? '';
            $display_name = $top_page ?: $top_url;

            if ($display_name && $display_name !== 'İsimsiz Sayfa' && $display_name !== '/') {
                // Clean up long titles
                $display_name = mb_substr($display_name, 0, 40) . (mb_strlen($display_name) > 40 ? '...' : '');
                $msgs[] = "Bugünün yıldızı kesinlikle \"{$display_name}\" sayfası, en çok orası ilgi görüyor.";
            }
        }
    }

    // Combine naturally
    return $emoji . " " . "{$greeting}! " . implode(" ", $msgs);
}

$response['daily_summary'] = generateAdvancedInsight($response);

// ALWAYS return JSON, even if empty. Never 500.
header('Content-Type: application/json');
echo json_encode($response);
exit;