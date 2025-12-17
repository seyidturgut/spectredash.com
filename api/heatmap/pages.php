<?php
require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = getJsonInput();
$action = $_GET['action'] ?? 'list'; // list, add, delete
$site_id = $_GET['site_id'] ?? $input['site_id'] ?? '';

if (empty($site_id)) {
    sendJson(['error' => 'Missing site_id'], 400);
}

$db = getDB();

if ($method === 'GET' && $action === 'list') {
    $stmt = $db->prepare("SELECT * FROM heatmap_pages WHERE site_id = ? ORDER BY created_at DESC");
    $stmt->bind_param("s", $site_id);
    $stmt->execute();
    $res = $stmt->get_result();
    sendJson(['pages' => $res->fetch_all(MYSQLI_ASSOC)]);
}

if ($method === 'POST' && $action === 'add') {
    $url = $input['url'] ?? '';
    $device = $input['device'] ?? 'Desktop';

    if (empty($url))
        sendJson(['error' => 'Missing URL'], 400);

    // 1. Create Directory
    $uploadDir = __DIR__ . '/../../uploads/screenshots/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // 2. Capture Screenshot (Using Service)
    // Using simple free service for shared host compatibility
    $width = ($device === 'Mobile') ? 375 : 1280;
    $height = 800; // Crop height

    // Using screenshotapi.net or similar would be better, but thum.io is instant for demo
    // Pro solution: Use a real node service. Here we rely on public gateway.
    $apiUrl = "https://image.thum.io/get/width/$width/crop/$height/noanimate/" . $url;

    $fileName = 'snap_' . md5($url . time()) . '.jpg';
    $filePath = $uploadDir . $fileName;

    // Fetch and Save
    $imageContent = @file_get_contents($apiUrl);
    if ($imageContent) {
        file_put_contents($filePath, $imageContent);
        $publicPath = '/uploads/screenshots/' . $fileName;

        // 3. Save to DB
        $stmt = $db->prepare("INSERT INTO heatmap_pages (site_id, url, device, screenshot_path) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $site_id, $url, $device, $publicPath);

        if ($stmt->execute()) {
            sendJson([
                'message' => 'Page added and screenshot captured',
                'page' => [
                    'id' => $stmt->insert_id,
                    'url' => $url,
                    'screenshot_path' => $publicPath
                ]
            ], 201);
        } else {
            sendJson(['error' => 'Database error: ' . $db->error], 500);
        }
    } else {
        sendJson(['error' => 'Failed to capture screenshot'], 502);
    }
}

if ($method === 'DELETE' && $action === 'delete') {
    $id = $_GET['id'] ?? 0;

    // Get path to delete file
    $stmt = $db->prepare("SELECT screenshot_path FROM heatmap_pages WHERE id = ? AND site_id = ?");
    $stmt->bind_param("is", $id, $site_id);
    $stmt->execute();
    $res = $stmt->get_result();

    if ($row = $res->fetch_assoc()) {
        $filesysPath = __DIR__ . '/../../' . ltrim($row['screenshot_path'], '/');
        if (file_exists($filesysPath))
            unlink($filesysPath);

        $del = $db->prepare("DELETE FROM heatmap_pages WHERE id = ?");
        $del->bind_param("i", $id);
        $del->execute();

        sendJson(['message' => 'Deleted']);
    } else {
        sendJson(['error' => 'Not found'], 404);
    }
}
