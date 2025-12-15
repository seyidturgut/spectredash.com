<?php
require_once __DIR__ . '/../../config.php';

$parts = explode('/', trim($_SERVER['REQUEST_URI'], '/'));
$id = $parts[count($parts) - 2];

$input = getJsonInput();
$is_suspended = $input['is_suspended'] ?? false;

$db = getDB();
$stmt = $db->prepare("UPDATE users SET is_suspended = ? WHERE id = ?");
$stmt->bind_param("ii", $is_suspended, $id);
$stmt->execute();

sendJson(['message' => 'Status updated successfully']);
