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

sendJson([
    'total_visits' => (int) $total,
    'live_users' => (int) $live,
    'devices' => $devices,
    'recent_feed' => $feed
]);
