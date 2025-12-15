<?php
require_once __DIR__ . '/config.php';

$input = getJsonInput();
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

if (empty($email) || empty($password)) {
    sendJson(['error' => 'Missing email or password'], 400);
}

$db = getDB();
$stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    sendJson(['error' => 'Invalid credentials'], 401);
}

$user = $result->fetch_assoc();

if ($user['is_suspended']) {
    sendJson(['error' => 'Hesabınız askıya alınmıştır. Yöneticiyle iletişime geçin.'], 403);
}

if (!password_verify($password, $user['password_hash'])) {
    sendJson(['error' => 'Invalid credentials'], 401);
}

$site_id = null;
if ($user['role'] === 'client') {
    $stmt = $db->prepare("SELECT site_id FROM sites WHERE user_id = ? LIMIT 1");
    $stmt->bind_param("i", $user['id']);
    $stmt->execute();
    $siteResult = $stmt->get_result();
    if ($siteResult->num_rows > 0) {
        $site_id = $siteResult->fetch_assoc()['site_id'];
    }
}

sendJson([
    'message' => 'Login successful',
    'user' => [
        'id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'],
        'company_name' => $user['company_name'],
        'contact_name' => $user['contact_name'],
        'site_id' => $site_id,
        'is_suspended' => (bool) $user['is_suspended']
    ]
]);
