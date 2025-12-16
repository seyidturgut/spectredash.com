<?php
require_once __DIR__ . '/../config.php';

// Handle different request methods
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Get goal statistics
    $site_id = $_GET['site_id'] ?? '';
    $range = $_GET['range'] ?? '7d';

    if (empty($site_id)) {
        sendJson(['error' => 'Missing site_id'], 400);
    }

    // Calculate date range
    $date_condition = getDateCondition($range);

    $db = getDB();

    // Get goal statistics grouped by goal_name
    $stmt = $db->prepare("
        SELECT 
            goal_name,
            COUNT(*) as count,
            SUM(goal_value) as total_value,
            AVG(goal_value) as avg_value,
            MAX(created_at) as last_conversion
        FROM goals
        WHERE site_id = ? AND created_at >= $date_condition
        GROUP BY goal_name
        ORDER BY count DESC
    ");
    $stmt->bind_param("s", $site_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $goals = [];
    while ($row = $result->fetch_assoc()) {
        $goals[] = [
            'goal_name' => $row['goal_name'],
            'count' => (int) $row['count'],
            'total_value' => (float) $row['total_value'],
            'avg_value' => (float) $row['avg_value'],
            'last_conversion' => $row['last_conversion']
        ];
    }

    sendJson(['goals' => $goals]);

} else {
    // POST method is handled in goals.php
    require_once __DIR__ . '/goals.php';
}

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
