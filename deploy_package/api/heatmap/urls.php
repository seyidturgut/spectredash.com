<?php
require_once __DIR__ . '/../config.php';

// Get list of URLs with heatmap data
$site_id = $_GET['site_id'] ?? '';

if (empty($site_id)) {
    sendJson(['error' => 'Missing site_id'], 400);
}

$db = getDB();

$stmt = $db->prepare("
    SELECT url, MAX(page_title) as title, COUNT(*) as interaction_count
    FROM heatmap_data
    WHERE site_id = ?
    GROUP BY url
    ORDER BY interaction_count DESC
    LIMIT 50
");
$stmt->bind_param("s", $site_id);
$stmt->execute();
$result = $stmt->get_result();

$urls = [];
while ($row = $result->fetch_assoc()) {
    $urls[] = [
        'url' => $row['url'],
        'title' => $row['title'] ?? $row['url']
    ];
}

sendJson(['urls' => $urls]);
