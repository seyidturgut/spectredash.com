<?php
require_once __DIR__ . '/../../config.php';

$id = $_GET['id'] ?? null;

if (!$id) {
    sendJson(['error' => 'Missing customer ID'], 400);
}

$input = getJsonInput();
$is_suspended = $input['is_suspended'] ?? false;

// Convert boolean to integer for MySQL
$is_suspended_int = $is_suspended ? 1 : 0;

$db = getDB();
$stmt = $db->prepare("UPDATE users SET is_suspended = ? WHERE id = ?");
$stmt->bind_param("ii", $is_suspended_int, $id);
$stmt->execute();

sendJson(['message' => 'Status updated successfully', 'is_suspended' => $is_suspended]);
