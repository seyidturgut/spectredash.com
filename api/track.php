<?php
require_once __DIR__ . '/config.php';

$input = getJsonInput();
$site_id = $input['site_id'] ?? '';
$url = $input['url'] ?? '';
$referrer = $input['referrer'] ?? '';
$device = $input['device'] ?? 'Desktop';

if (empty($site_id)) {
    sendJson(['error' => 'Missing site_id'], 400);
}

$db = getDB();
$stmt = $db->prepare("INSERT INTO ziyaretler (site_id, url, referrer, device) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $site_id, $url, $referrer, $device);
$stmt->execute();

$stmt = $db->prepare("UPDATE sites SET last_active_at = NOW() WHERE site_id = ?");
$stmt->bind_param("s", $site_id);
$stmt->execute();

sendJson(['message' => 'Visit tracked successfully'], 201);
