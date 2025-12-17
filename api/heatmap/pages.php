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
    // CHANGED: Use 'fullpage' and added 'wait/3' to ensure lazy loaded content appears
    $apiUrl = "https://image.thum.io/get/width/$width/fullpage/wait/3/noanimate/" . $url;

    $fileName = 'snap_' . md5($url . time()) . '.jpg';
    $filePath = $uploadDir . $fileName;

    // Fetch and Save using cURL (More robust than file_get_contents)
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt($ch, CURLOPT_TIMEOUT, 60); // Allow time for 'wait/3' + processing
    curl_setopt($ch, CURLOPT_USERAGENT, 'SpectreBot/1.0');

    // Disable SSL verify to avoid shared host certificate bundle issues
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);

    $imageContent = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($imageContent && $httpCode === 200) {
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
        $detail = $curlError ?: "HTTP Code $httpCode";
        sendJson(['error' => "Screenshot Failed: $detail"], 502);
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
