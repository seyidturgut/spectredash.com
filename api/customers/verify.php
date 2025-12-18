<?php
require_once __DIR__ . '/../config.php';

$id = $_GET['id'] ?? null;

if (!$id) {
    sendJson(['error' => 'Missing customer ID'], 400);
}

$db = getDB();
$stmt = $db->prepare("SELECT site_id, domain FROM sites WHERE user_id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    sendJson(['error' => 'Site not found for this customer'], 404);
}

$row = $result->fetch_assoc();
$site_id = $row['site_id'];
$domain = $row['domain'];

$targetUrl = (strpos($domain, 'http') === 0) ? $domain : 'https://' . $domain;

// Simple check with file_get_contents
$html = @file_get_contents($targetUrl);

if ($html === false) {
    sendJson(['error' => 'Doğrulama başarısız: Siteye erişilemedi veya zaman aşımı.'], 500);
}

if (strpos($html, $site_id) !== false) {
    $stmt = $db->prepare("UPDATE sites SET last_active_at = NOW() WHERE site_id = ?");
    $stmt->bind_param("s", $site_id);
    $stmt->execute();
    sendJson(['message' => 'Doğrulama Başarılı! Site aktif.', 'success' => true]);
} else {
    sendJson(['error' => "Site ID ($site_id) $domain üzerinde bulunamadı.", 'success' => false], 400);
}
