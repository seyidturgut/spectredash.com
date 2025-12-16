<?php
require_once __DIR__ . '/../config.php';

$id = $_GET['id'] ?? null;
$method = $_SERVER['REQUEST_METHOD'];

if (!$id) {
    sendJson(['error' => 'Missing customer ID'], 400);
}

if ($method === 'DELETE') {
    $db = getDB();
    $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    sendJson(['message' => 'Customer deleted successfully']);

} elseif ($method === 'PUT') {
    $input = getJsonInput();
    $company_name = $input['company_name'] ?? '';
    $contact_name = $input['contact_name'] ?? '';
    $email = $input['email'] ?? '';
    $domain = $input['domain'] ?? '';
    $password = $input['password'] ?? '';

    $db = getDB();
    $db->begin_transaction();

    try {
        // Update user
        if (!empty($password)) {
            $hash = password_hash($password, PASSWORD_BCRYPT);
            $stmt = $db->prepare("UPDATE users SET company_name = ?, contact_name = ?, email = ?, password_hash = ? WHERE id = ?");
            $stmt->bind_param("ssssi", $company_name, $contact_name, $email, $hash, $id);
        } else {
            $stmt = $db->prepare("UPDATE users SET company_name = ?, contact_name = ?, email = ? WHERE id = ?");
            $stmt->bind_param("sssi", $company_name, $contact_name, $email, $id);
        }
        $stmt->execute();

        // Update site domain
        $stmt = $db->prepare("UPDATE sites SET domain = ? WHERE user_id = ?");
        $stmt->bind_param("si", $domain, $id);
        $stmt->execute();

        $db->commit();
        sendJson(['message' => 'Customer updated successfully']);

    } catch (Exception $e) {
        $db->rollback();
        sendJson(['error' => 'Failed to update customer'], 500);
    }
}
