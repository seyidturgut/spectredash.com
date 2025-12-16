<?php
require_once __DIR__ . '/config.php';

$site_id = $_GET['site_id'] ?? '';

if (empty($site_id)) {
    sendJson(['error' => 'Missing site_id query parameter'], 400);
}

$db = getDB();

// Total visits
$stmt = $db->prepare("SELECT COUNT(*) as count FROM ziyaretler WHERE site_id = ?");
$stmt->bind_param("s", $site_id);
$stmt->execute();
$total = $stmt->get_result()->fetch_assoc()['count'];

// Live users (last 5 minutes)
$stmt = $db->prepare("SELECT COUNT(*) as count FROM ziyaretler WHERE site_id = ? AND created_at >= NOW() - INTERVAL 5 MINUTE");
$stmt->bind_param("s", $site_id);
$stmt->execute();
$live = $stmt->get_result()->fetch_assoc()['count'];

// Average Duration (Session Duration)
// We estimate this by taking (MAX(time) - MIN(time)) for each distinct session
$stmt = $db->prepare("
    SELECT AVG(duration) as avg_duration FROM (
        SELECT TIMESTAMPDIFF(SECOND, MIN(created_at), MAX(created_at)) as duration
        FROM ziyaretler
        WHERE site_id = ?
        GROUP BY session_id
        HAVING duration > 0 -- Only count sessions with >1 pageview/action
    ) as sessions
");
$stmt->bind_param("s", $site_id);
$stmt->execute();
$avg_duration_seconds = (int) $stmt->get_result()->fetch_assoc()['avg_duration'];
// Format as 'Xdk Ysn'
$avg_minutes = floor($avg_duration_seconds / 60);
$avg_seconds = $avg_duration_seconds % 60;
$average_duration_text = "{$avg_minutes}dk {$avg_seconds}sn";

// Intentionally left blank as I decided to split the taskdown
// Device breakdown
$stmt = $db->prepare("SELECT device, COUNT(*) as count FROM ziyaretler WHERE site_id = ? GROUP BY device");
$stmt->bind_param("s", $site_id);
$stmt->execute();
$devices = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

// Recent feed
$stmt = $db->prepare("SELECT * FROM ziyaretler WHERE site_id = ? ORDER BY created_at DESC LIMIT 20");
$stmt->bind_param("s", $site_id);
$stmt->execute();
$feed = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

// Daily Stats (Last 7 days)
// We need to generate the last 7 days and fill in gaps
$daily_stats = [];
for ($i = 6; $i >= 0; $i--) {
    $date = date('Y-m-d', strtotime("-$i days"));
    $dayName = date('D', strtotime("-$i days")); // Mon, Tue...

    // Translate Day Names
    $trDays = [
        'Mon' => 'Pzt',
        'Tue' => 'Sal',
        'Wed' => 'Çar',
        'Thu' => 'Per',
        'Fri' => 'Cum',
        'Sat' => 'Cmt',
        'Sun' => 'Paz'
    ];
    $trName = $trDays[$dayName] ?? $dayName;

    $daily_stats[$date] = [
        'name' => $trName,
        'visits' => 0
    ];
}

$stmt = $db->prepare("
    SELECT DATE(created_at) as date, COUNT(*) as count 
    FROM ziyaretler 
    WHERE site_id = ? 
    AND created_at >= DATE(NOW() - INTERVAL 7 DAY)
    GROUP BY DATE(created_at)
");
$stmt->bind_param("s", $site_id);
$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    if (isset($daily_stats[$row['date']])) {
        $daily_stats[$row['date']]['visits'] = (int) $row['count'];
    }
}

// Convert associative array to indexed array for JSON
$chart_data = array_values($daily_stats);

sendJson([
    'total_visits' => (int) $total,
    'live_users' => (int) $live,
    'average_duration' => $average_duration_text,
    'devices' => $devices,
    'recent_feed' => $feed,
    'traffic_chart' => $chart_data
]);
