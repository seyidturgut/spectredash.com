<?php
require_once __DIR__ . '/../config.php';

// Get event statistics
$site_id = $_GET['site_id'] ?? '';
$range = $_GET['range'] ?? '7d';
$category = $_GET['category'] ?? null;

if (empty($site_id)) {
    sendJson(['error' => 'Missing site_id'], 400);
}

// Calculate date range
$date_condition = getDateCondition($range);

$db = getDB();

// Build query with optional category filter
$query = "
    SELECT 
        event_name,
        event_category,
        event_label,
        MAX(url) as url,
        COUNT(*) as count,
        SUM(event_value) as total_value,
        MAX(created_at) as last_event
    FROM events
    WHERE site_id = ? AND created_at >= $date_condition
";

if ($category) {
    $query .= " AND event_category = ?";
}

$query .= " GROUP BY event_name, event_category, event_label ORDER BY count DESC LIMIT 50";

$stmt = $db->prepare($query);

if ($category) {
    $stmt->bind_param("ss", $site_id, $category);
} else {
    $stmt->bind_param("s", $site_id);
}

$stmt->execute();
$result = $stmt->get_result();

$events = [];
while ($row = $result->fetch_assoc()) {
    $events[] = [
        'event_name' => $row['event_name'],
        'event_category' => $row['event_category'],
        'event_label' => $row['event_label'],
        'count' => (int) $row['count'],
        'total_value' => (int) $row['total_value'],
        'url' => $row['url'],
        'last_event' => $row['last_event']
    ];
}

sendJson(['events' => $events]);

function getDateCondition($range)
{
    switch ($range) {
        case '24h':
            return "NOW() - INTERVAL 24 HOUR";
        case '7d':
            return "NOW() - INTERVAL 7 DAY";
        case '30d':
            return "NOW() - INTERVAL 30 DAY";
        case '90d':
            return "NOW() - INTERVAL 90 DAY";
        default:
            return "NOW() - INTERVAL 7 DAY";
    }
}
