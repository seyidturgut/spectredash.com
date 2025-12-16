<?php
require_once __DIR__ . '/config.php';

$input = getJsonInput();
$site_id = $input['site_id'] ?? '';
$session_id = $input['session_id'] ?? '';
$url = $input['url'] ?? '';
$page_title = $input['page_title'] ?? null;
$viewport_width = $input['viewport_width'] ?? 0;
$viewport_height = $input['viewport_height'] ?? 0;
$clicks = $input['clicks'] ?? [];
$scrolls = $input['scrolls'] ?? [];
$movements = $input['movements'] ?? [];

// Validation
if (empty($site_id)) {
    sendJson(['error' => 'Missing site_id'], 400);
}

if (empty($url)) {
    sendJson(['error' => 'Missing url'], 400);
}

// Verify site exists
$db = getDB();
$stmt = $db->prepare("SELECT id FROM sites WHERE site_id = ?");
$stmt->bind_param("s", $site_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    sendJson(['error' => 'Invalid site_id'], 404);
}


// Prepare batch insert
$stmt = $db->prepare("INSERT INTO heatmap_data (site_id, session_id, url, page_title, interaction_type, x_position, y_position, scroll_depth, viewport_width, viewport_height, element_tag, element_id, element_class) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");


$inserted = 0;

// Insert clicks
foreach ($clicks as $click) {
    $type = 'click';
    $x = $click['x'] ?? 0;
    $y = $click['y'] ?? 0;
    $scroll_depth = null;
    $element_tag = $click['element'] ?? null;
    $element_id = $click['elementId'] ?? null;
    $element_class = $click['elementClass'] ?? null;

    $stmt->bind_param("sssssiiiissss", $site_id, $session_id, $url, $page_title, $type, $x, $y, $scroll_depth, $viewport_width, $viewport_height, $element_tag, $element_id, $element_class);
    $stmt->execute();
    $inserted++;
}

// Insert scrolls
foreach ($scrolls as $scroll) {
    $type = 'scroll';
    $x = null;
    $y = null;
    $scroll_depth = $scroll['depth'] ?? 0;
    $element_tag = null;
    $element_id = null;
    $element_class = null;

    $stmt->bind_param("sssssiiiissss", $site_id, $session_id, $url, $page_title, $type, $x, $y, $scroll_depth, $viewport_width, $viewport_height, $element_tag, $element_id, $element_class);
    $stmt->execute();
    $inserted++;
}

// Insert movements (limit to prevent excessive data)
$movement_limit = 50;
$movements = array_slice($movements, 0, $movement_limit);

foreach ($movements as $movement) {
    $type = 'movement';
    $x = $movement['x'] ?? 0;
    $y = $movement['y'] ?? 0;
    $scroll_depth = null;
    $element_tag = null;
    $element_id = null;
    $element_class = null;

    $stmt->bind_param("sssssiiiissss", $site_id, $session_id, $url, $page_title, $type, $x, $y, $scroll_depth, $viewport_width, $viewport_height, $element_tag, $element_id, $element_class);
    $stmt->execute();
    $inserted++;
}

sendJson([
    'message' => 'Heatmap data recorded successfully',
    'inserted' => $inserted
], 201);
