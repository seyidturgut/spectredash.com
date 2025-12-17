<?php
// Prevent 500 by catching fatal errors
register_shutdown_function(function () {
    $error = error_get_last();
    if ($error && ($error['type'] === E_ERROR || $error['type'] === E_PARSE || $error['type'] === E_COMPILE_ERROR)) {
        http_response_code(500);
        echo json_encode(['error' => 'Fatal Error: ' . $error['message'] . ' in ' . $error['file'] . ':' . $error['line']]);
        exit;
    }
});

require_once __DIR__ . '/config.php';

try {
    $input = getJsonInput();
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';

    if (empty($email) || empty($password)) {
        sendJson(['error' => 'Missing email or password'], 400);
    }

    $db = getDB();
    if (!$db) {
        throw new Exception("Database connection failed");
    }

    $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $db->error);
    }

    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        sendJson(['error' => 'Invalid credentials'], 401);
    }

    $user = $result->fetch_assoc();

    if (!empty($user['is_suspended'])) {
        sendJson(['error' => 'Hesabınız askıya alınmıştır. Yöneticiyle iletişime geçin.'], 403);
    }

    if (!password_verify($password, $user['password_hash'])) {
        sendJson(['error' => 'Invalid credentials'], 401);
    }

    // Check if site_id column exists in the row
    $site_id = isset($user['site_id']) ? $user['site_id'] : null;

    // If site_id is missing (common, as creation logic uses sites.user_id), fetch it from sites table
    if (empty($site_id) && $user['role'] === 'client') {
        try {
            $stmt_site = $db->prepare("SELECT site_id FROM sites WHERE user_id = ? LIMIT 1");
            if ($stmt_site) {
                $stmt_site->bind_param("i", $user['id']);
                $stmt_site->execute();
                $res_site = $stmt_site->get_result();
                if ($row_site = $res_site->fetch_assoc()) {
                    $site_id = $row_site['site_id'];
                }
            }
        } catch (Exception $e) {
            // Silently fail if column doesn't exist, though it should based on creation logic
            error_log("Site Lookup Failed: " . $e->getMessage());
        }
    }

    sendJson([
        'message' => 'Login successful',
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'company_name' => $user['company_name'] ?? '',
            'contact_name' => $user['contact_name'] ?? '',
            'site_id' => $site_id,
            'is_suspended' => (bool) ($user['is_suspended'] ?? false)
        ]
    ]);

} catch (Exception $e) {
    sendJson(['error' => 'Login Error: ' . $e->getMessage()], 500);
}
