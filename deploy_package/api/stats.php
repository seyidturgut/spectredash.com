<?php
require_once __DIR__ . '/config.php';

$site_id = $_GET['site_id'] ?? '';

if (empty($site_id)) {
    sendJson(['error' => 'Missing site_id query parameter'], 400);
}

$db = getDB();

// Total visits
$query = "SELECT COUNT(*) as count FROM ziyaretler WHERE site_id = ?";
$stmt = $db->prepare($query);
if (!$stmt) {
    die(json_encode(['error' => 'Query Failed (Visits): ' . $db->error]));
}
$stmt->bind_param("s", $site_id);
$stmt->execute();
$total = $stmt->get_result()->fetch_assoc()['count'];

// Live users
$query = "SELECT COUNT(*) as count FROM sessions WHERE site_id = ? AND last_activity >= NOW() - INTERVAL 5 MINUTE";
$stmt = $db->prepare($query);
if (!$stmt) {
    die(json_encode(['error' => 'Query Failed (Live): ' . $db->error]));
}
$stmt->bind_param("s", $site_id);
$stmt->execute();
$live = $stmt->get_result()->fetch_assoc()['count'];

// Average Duration
$query = "
    SELECT AVG(TIMESTAMPDIFF(SECOND, created_at, last_activity)) as avg_duration 
    FROM sessions 
    WHERE site_id = ? 
    AND last_activity > created_at 
    AND created_at >= NOW() - INTERVAL 30 DAY
";
$stmt = $db->prepare($query);
if (!$stmt) {
    die(json_encode(['error' => 'Query Failed (Duration): ' . $db->error]));
}
$stmt->bind_param("s", $site_id);
$stmt->execute();
$avg_duration_seconds = (int) $stmt->get_result()->fetch_assoc()['avg_duration'];

// Fallback to 0 if null
if (!$avg_duration_seconds)
    $avg_duration_seconds = 0;

// Format as 'Xdk Ysn'
$avg_minutes = floor($avg_duration_seconds / 60);
$avg_seconds = $avg_duration_seconds % 60;
$average_duration_text = "{$avg_minutes}dk {$avg_seconds}sn";

// Intentionally left blank as I decided to split the taskdown
// Device breakdown
$stmt = $db->prepare("SELECT device, COUNT(*) as count FROM ziyaretler WHERE site_id = ? GROUP BY device");
if (!$stmt) {
    die(json_encode(['error' => 'Query Failed (Devices): ' . $db->error]));
}
$stmt->bind_param("s", $site_id);
$stmt->execute();
$devices = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

// Recent feed
$stmt = $db->prepare("SELECT * FROM ziyaretler WHERE site_id = ? ORDER BY created_at DESC LIMIT 20");
if (!$stmt) {
    die(json_encode(['error' => 'Query Failed (Feed): ' . $db->error]));
}
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
if (!$stmt) {
    die(json_encode(['error' => 'Query Failed (Chart): ' . $db->error]));
}
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
