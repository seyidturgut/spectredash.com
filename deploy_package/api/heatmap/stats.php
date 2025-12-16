<?php
require_once __DIR__ . '/../config.php';

// Get heatmap data for visualization
$site_id = $_GET['site_id'] ?? '';
$url = $_GET['url'] ?? '';
$type = $_GET['type'] ?? 'all'; // click, scroll, movement, or all

if (empty($site_id)) {
    sendJson(['error' => 'Missing site_id'], 400);
}

if (empty($url)) {
    sendJson(['error' => 'Missing url'], 400);
}

$db = getDB();

// Use LIKE for URL to be more robust (handle trailing slashes, http/https mismatches if needed)
$query = "
    SELECT 
        interaction_type,
        x_position,
        y_position,
        scroll_depth,
        viewport_width,
        viewport_height,
        element_tag,
        element_id,
        element_class,
        created_at
    FROM heatmap_data
    WHERE site_id = ? AND url LIKE ?
";

if ($type !== 'all') {
    $query .= " AND interaction_type = ?";
}

$query .= " ORDER BY created_at DESC LIMIT 5000";

$stmt = $db->prepare($query);
$urlParam = $url . '%'; // Match prefix

if ($type !== 'all') {
    $stmt->bind_param("sss", $site_id, $urlParam, $type);
} else {
    $stmt->bind_param("ss", $site_id, $urlParam);
}

$stmt->execute();
$result = $stmt->get_result();

$data = [
    'clicks' => [],
    'scrolls' => [],
    'movements' => []
];

while ($row = $result->fetch_assoc()) {
    $point = [
        'x' => (int) $row['x_position'],
        'y' => (int) $row['y_position'],
        'scroll_depth' => (int) $row['scroll_depth'],
        'viewport_width' => (int) $row['viewport_width'],
        'viewport_height' => (int) $row['viewport_height'],
        'element_tag' => $row['element_tag'],
        'element_id' => $row['element_id'],
        'element_class' => $row['element_class'],
        'timestamp' => $row['created_at']
    ];

    switch ($row['interaction_type']) {
        case 'click':
            $data['clicks'][] = $point;
            break;
        case 'scroll':
            $data['scrolls'][] = $point;
            break;
        case 'movement':
            $data['movements'][] = $point;
            break;
    }
}

sendJson($data);
