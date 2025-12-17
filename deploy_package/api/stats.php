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
$res = safeQuery($db, "SELECT COUNT(*) as count FROM ziyaretler WHERE site_id = ?", "s", [$site_id]);
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

// 3. Average Duration
$res = safeQuery($db, "
SELECT AVG(TIMESTAMPDIFF(SECOND, created_at, last_activity)) as avg_duration
FROM sessions
WHERE site_id = ?
AND last_activity > created_at
AND created_at >= NOW() - INTERVAL 30 DAY
", "s", [$site_id]);

if (is_array($res) && isset($res['error'])) {
$response['debug_log'][] = "Duration Error: " . $res['error'];
} else {
$row = $res->fetch_assoc();
$avg = (int) ($row['avg_duration'] ?? 0);
$response['average_duration'] = floor($avg / 60) . 'dk ' . ($avg % 60) . 'sn';
}

// 4. Devices
$res = safeQuery($db, "SELECT device, COUNT(*) as count FROM ziyaretler WHERE site_id = ? GROUP BY device", "s",
[$site_id]);
if (!is_array($res) || !isset($res['error'])) {
$response['devices'] = $res->fetch_all(MYSQLI_ASSOC);
}

// 5. Recent Feed (Limit 10 for safety)
$res = safeQuery($db, "SELECT * FROM ziyaretler WHERE site_id = ? ORDER BY created_at DESC LIMIT 10", "s", [$site_id]);
if (!is_array($res) || !isset($res['error'])) {
$response['recent_feed'] = $res->fetch_all(MYSQLI_ASSOC);
}

// 6. Traffic Chart
// Initialize empty chart
for ($i = 6; $i >= 0; $i--) {
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

// ALWAYS return JSON, even if empty. Never 500.
header('Content-Type: application/json');
echo json_encode($response);
exit;