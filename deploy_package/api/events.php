<?php
require_once __DIR__ . '/config.php';

$input = getJsonInput();
$site_id = $input['site_id'] ?? '';
$session_id = $input['session_id'] ?? '';
$event_name = $input['event_name'] ?? '';
$event_category = $input['event_category'] ?? 'general';
$event_label = $input['event_label'] ?? null;
$event_value = $input['event_value'] ?? 0;
$metadata = $input['metadata'] ?? [];
$url = $input['url'] ?? '';
$page_title = $input['page_title'] ?? null;

// Validation
if (empty($site_id)) {
    sendJson(['error' => 'Missing site_id'], 400);
}

if (empty($event_name)) {
    sendJson(['error' => 'Missing event_name'], 400);
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

// Insert event
$metadata_json = json_encode($metadata);
$stmt = $db->prepare("INSERT INTO events (site_id, session_id, event_name, event_category, event_label, event_value, metadata, url, page_title) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sssssisss", $site_id, $session_id, $event_name, $event_category, $event_label, $event_value, $metadata_json, $url, $page_title);

if ($stmt->execute()) {
    // CRITICAL: Update Session Activity (Heartbeat Support)
    if (!empty($session_id)) {
        $upd = $db->prepare("UPDATE sessions SET last_activity = NOW() WHERE session_id = ? AND site_id = ?");
        $upd->bind_param("ss", $session_id, $site_id);
        $upd->execute();
    }

    sendJson([
        'message' => 'Event tracked successfully',
        'event_id' => $db->insert_id
    ], 201);
} else {
    sendJson(['error' => 'Failed to track event'], 500);
}
