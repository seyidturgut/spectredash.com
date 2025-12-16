<?php
require_once __DIR__ . '/config.php';

// Allow CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$site_id = $_GET['site_id'] ?? null;

if (!$site_id) {
    echo json_encode(['error' => 'Missing site_id']);
    exit;
}

$db = getDB();

// Fetch active goal definitions
$stmt = $db->prepare("SELECT id, goal_name, event_type, selector_type, selector_value FROM goal_definitions WHERE site_id = ? AND is_active = 1");
$stmt->bind_param("s", $site_id);
$stmt->execute();
$result = $stmt->get_result();

$goals = [];
while ($row = $result->fetch_assoc()) {
    $goals[] = [
        'id' => $row['id'],
        'name' => $row['goal_name'],
        'type' => $row['selector_type'], // css_class, css_id, text_contains, href_contains
        'value' => $row['selector_value'],
        'event' => $row['event_type'] ?? 'click'
    ];
}

// Generate Daily Salt for Privacy (Rotates every 24h)
$secret = 'AJANS_PRIVACY_SECRET_KEY_V1';
$daily_salt = hash('sha256', date('Y-m-d') . $secret);

echo json_encode([
    'site_id' => $site_id,
    'daily_salt' => $daily_salt,
    'goals' => $goals
]);
