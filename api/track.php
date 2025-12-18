<?php
require_once __DIR__ . '/config.php';

$input = getJsonInput();
$site_id = $input['site_id'] ?? '';
$session_id = $input['session_id'] ?? '';
$url = $input['url'] ?? '';
$referrer = $input['referrer'] ?? '';
$device = $input['device'] ?? 'Desktop';
$is_bot = $input['is_bot'] ?? false;
$page_load_time = $input['page_load_time'] ?? null;

// --- GDPR/KVKK COMPLIANCE: IP ANONYMIZATION ---
// We mask the last octet of the IP address to ensure user anonymity.
// This ensures we do not store PII (Personally Identifiable Information).
$ip_address = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
if (strpos($ip_address, '.') !== false) {
    // IPv4: 192.168.1.123 -> 192.168.1.0
    $parts = explode('.', $ip_address);
    $parts[3] = '0';
    $anonymized_ip = implode('.', $parts);
} else {
    // IPv6: Keep first 3 blocks or standard anonymization
    $anonymized_ip = substr($ip_address, 0, strrpos($ip_address, ':')) . ':0000';
}
// Note: We currently DO NOT even store this anonymized IP in the database for maximum privacy.
// If we ever decide to store it for geo-location, we MUST use $anonymized_ip.
// ---------------------------------------------------

$page_title = $input['page_title'] ?? null;

// Validate and cap page_load_time
if ($page_load_time !== null) {
    // Convert to integer if it's a string
    $page_load_time = intval($page_load_time);
    // Cap at reasonable values (0 to 60 seconds = 60000ms)
    if ($page_load_time < 0 || $page_load_time > 60000) {
        $page_load_time = null;
    }
}

$viewport_width = $input['viewport_width'] ?? null;
$viewport_height = $input['viewport_height'] ?? null;

if (empty($site_id)) {
    sendJson(['error' => 'Missing site_id'], 400);
}

$db = getDB();

// Verify site exists
$stmt = $db->prepare("SELECT id FROM sites WHERE site_id = ?");
$stmt->bind_param("s", $site_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    sendJson(['error' => 'Invalid site_id'], 404);
}

// Basic UTM inputs
$utm_source = $input['utm_source'] ?? null;
$utm_medium = $input['utm_medium'] ?? null;
$utm_campaign = $input['utm_campaign'] ?? null;
$utm_term = $input['utm_term'] ?? null;
$utm_content = $input['utm_content'] ?? null;

// --- SMART SOURCE & KEYWORD EXTRACTION ---
if (empty($utm_source) && !empty($referrer)) {
    $host = parse_url($referrer, PHP_URL_HOST);

    // 1. Google (Keywords hidden)
    if (strpos($host, 'google') !== false) {
        $utm_source = 'google';
        $utm_medium = 'organic';
        // 'q=' is rarely available due to SSL encryption
    }
    // 2. Bing
    elseif (strpos($host, 'bing') !== false) {
        $utm_source = 'bing';
        $utm_medium = 'organic';
        parse_str(parse_url($referrer, PHP_URL_QUERY), $query);
        if (empty($utm_term) && !empty($query['q'])) {
            $utm_term = $query['q'];
        }
    }
    // 3. Yahoo
    elseif (strpos($host, 'yahoo') !== false) {
        $utm_source = 'yahoo';
        $utm_medium = 'organic';
        parse_str(parse_url($referrer, PHP_URL_QUERY), $query);
        if (empty($utm_term) && !empty($query['p'])) {
            $utm_term = $query['p'];
        }
    }
    // 4. Yandex
    elseif (strpos($host, 'yandex') !== false) {
        $utm_source = 'yandex';
        $utm_medium = 'organic';
        parse_str(parse_url($referrer, PHP_URL_QUERY), $query);
        if (empty($utm_term) && !empty($query['text'])) {
            $utm_term = $query['text'];
        }
    }
    // 5. Baidu
    elseif (strpos($host, 'baidu') !== false) {
        $utm_source = 'baidu';
        $utm_medium = 'organic';
        parse_str(parse_url($referrer, PHP_URL_QUERY), $query);
        if (empty($utm_term) && !empty($query['wd'])) {
            $utm_term = $query['wd'];
        }
    }
    // 6. Socials
    elseif (strpos($host, 'facebook.com') !== false || strpos($host, 'instagram.com') !== false || strpos($host, 't.co') !== false || strpos($host, 'linkedin.com') !== false) {
        $utm_source = $host; // e.g. l.instagram.com
        $utm_medium = 'social';
    }
    // 7. Direct / Referral
    else {
        $utm_source = $host;
        $utm_medium = 'referral';
    }
}

// Insert visit
$query = "INSERT INTO ziyaretler (site_id, session_id, url, page_title, referrer, device, is_bot, page_load_time, viewport_width, viewport_height, utm_source, utm_medium, utm_campaign, utm_term, utm_content) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
$stmt = $db->prepare($query);
if (!$stmt) {
    // Log error but don't crash client significantly, return 500 with message
    die(json_encode(['error' => 'Visit Insert Failed: ' . $db->error]));
}
$stmt->bind_param("ssssssiiiisssss", $site_id, $session_id, $url, $page_title, $referrer, $device, $is_bot, $page_load_time, $viewport_width, $viewport_height, $utm_source, $utm_medium, $utm_campaign, $utm_term, $utm_content);
$stmt->execute();

// Update site last active
$stmt = $db->prepare("UPDATE sites SET last_active_at = NOW() WHERE site_id = ?");
$stmt->bind_param("s", $site_id);
$stmt->execute();

// Update or create session
if (!empty($session_id)) {
    $query = "INSERT INTO sessions (site_id, session_id, page_views, is_bot, device) VALUES (?, ?, 1, ?, ?) ON DUPLICATE KEY UPDATE last_activity = NOW(), page_views = page_views + 1";
    $stmt = $db->prepare($query);
    if (!$stmt) {
        // Return error to help debug
        die(json_encode(['error' => 'Session Update Failed: ' . $db->error]));
    }
    $stmt->bind_param("ssis", $site_id, $session_id, $is_bot, $device);
    $stmt->execute();
}

sendJson(['message' => 'Visit tracked successfully'], 201);

