<?php
require_once __DIR__ . '/../config.php';

// Simple Admin Auth Check (In a real app, verify session/token)
// For now, we assume the frontend protects access, or we check for a valid session.

$input = getJsonInput();
$method = $_SERVER['REQUEST_METHOD'];

$db = getDB();

if ($method === 'GET') {
    // List goals for a site
    $site_id = $_GET['site_id'] ?? '';
    if (empty($site_id)) {
        sendJson(['error' => 'Missing site_id'], 400);
    }

    $stmt = $db->prepare("SELECT id, goal_name, event_type, selector_type, selector_value, default_value, is_active FROM goal_definitions WHERE site_id = ? ORDER BY id DESC");
    $stmt->bind_param("s", $site_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $goals = [];
    while ($row = $result->fetch_assoc()) {
        $goals[] = $row;
    }

    sendJson($goals);

} elseif ($method === 'POST') {
    // Create new goal
    $site_id = $input['site_id'] ?? '';
    $name = $input['name'] ?? '';
    $type = $input['type'] ?? 'css_class'; // css_class, css_id, text_contains, href_contains
    $value = $input['value'] ?? '';
    $event = $input['event'] ?? 'click';
    $default_value = $input['default_value'] ?? 0;

    if (empty($site_id) || empty($name) || empty($value)) {
        sendJson(['error' => 'Missing required fields'], 400);
    }

    $stmt = $db->prepare("INSERT INTO goal_definitions (site_id, goal_name, event_type, selector_type, selector_value, default_value, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)");
    $stmt->bind_param("sssssd", $site_id, $name, $event, $type, $value, $default_value);

    if ($stmt->execute()) {
        sendJson(['message' => 'Goal created', 'id' => $db->insert_id], 201);
    } else {
        sendJson(['error' => 'Failed to create goal'], 500);
    }

} elseif ($method === 'DELETE') {
    // Delete goal
    $id = $_GET['id'] ?? '';

    if (empty($id)) {
        sendJson(['error' => 'Missing ID'], 400);
    }

    $stmt = $db->prepare("DELETE FROM goal_definitions WHERE id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        sendJson(['message' => 'Goal deleted']);
    } else {
        sendJson(['error' => 'Failed to delete'], 500);
    }
}
