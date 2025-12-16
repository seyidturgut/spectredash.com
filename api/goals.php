<?php
require_once __DIR__ . '/config.php';

$input = getJsonInput();
$site_id = $input['site_id'] ?? '';
$session_id = $input['session_id'] ?? '';
$goal_name = $input['goal_name'] ?? '';
$goal_value = $input['goal_value'] ?? 0;
$metadata = $input['metadata'] ?? [];
$url = $input['url'] ?? '';
$page_title = $input['page_title'] ?? null;

// Validation
if (empty($site_id)) {
    sendJson(['error' => 'Missing site_id'], 400);
}

if (empty($goal_name)) {
    sendJson(['error' => 'Missing goal_name'], 400);
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

// Insert goal
$metadata_json = json_encode($metadata);
$stmt = $db->prepare("INSERT INTO goals (site_id, session_id, goal_name, goal_value, metadata, url, page_title) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sssdsss", $site_id, $session_id, $goal_name, $goal_value, $metadata_json, $url, $page_title);

if ($stmt->execute()) {
    sendJson([
        'message' => 'Goal tracked successfully',
        'goal_id' => $db->insert_id
    ], 201);
} else {
    sendJson(['error' => 'Failed to track goal'], 500);
}
