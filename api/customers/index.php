<?php
require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // List all customers
    $db = getDB();
    $result = $db->query("
        SELECT 
            u.id, u.email, u.company_name, u.contact_name, u.created_at, u.is_suspended,
            s.site_id, s.domain, s.last_active_at
        FROM users u
        LEFT JOIN sites s ON u.id = s.user_id
        WHERE u.role = 'client'
        ORDER BY u.created_at DESC
    ");

    sendJson($result->fetch_all(MYSQLI_ASSOC));

} elseif ($method === 'POST') {
    // Create customer
    $input = getJsonInput();
    $company_name = $input['company_name'] ?? '';
    $contact_name = $input['contact_name'] ?? '';
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    $domain = $input['domain'] ?? '';

    if (empty($company_name) || empty($email) || empty($password) || empty($domain)) {
        sendJson(['error' => 'All fields are required'], 400);
    }

    $db = getDB();
    $db->begin_transaction();

    try {
        // Check if email exists
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            throw new Exception('This email is already registered');
        }

        // Create user
        $hash = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $db->prepare("INSERT INTO users (email, password_hash, role, company_name, contact_name) VALUES (?, ?, 'client', ?, ?)");
        $stmt->bind_param("ssss", $email, $hash, $company_name, $contact_name);
        $stmt->execute();
        $userId = $db->insert_id;

        // Generate site_id
        $site_id = 'TR-' . rand(1000, 9999) . '-' . chr(65 + rand(0, 25));

        // Create site
        $stmt = $db->prepare("INSERT INTO sites (user_id, site_id, domain) VALUES (?, ?, ?)");
        $stmt->bind_param("iss", $userId, $site_id, $domain);
        $stmt->execute();

        $db->commit();
        sendJson(['message' => 'Customer created successfully', 'site_id' => $site_id], 201);

    } catch (Exception $e) {
        $db->rollback();
        sendJson(['error' => $e->getMessage()], 400);
    }
}
