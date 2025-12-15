<?php
require_once __DIR__ . '/config.php';

$db = getDB();

// Create tables if not exist
$tables = [
    "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'client',
        company_name VARCHAR(255),
        contact_name VARCHAR(255),
        is_suspended BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",

    "CREATE TABLE IF NOT EXISTS sites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        site_id VARCHAR(50) NOT NULL UNIQUE,
        domain VARCHAR(255) NOT NULL,
        last_active_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )",

    "CREATE TABLE IF NOT EXISTS ziyaretler (
        id INT AUTO_INCREMENT PRIMARY KEY,
        site_id VARCHAR(50) NOT NULL,
        url VARCHAR(255),
        referrer VARCHAR(255),
        device VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )"
];

foreach ($tables as $sql) {
    $db->query($sql);
}

// Seed admin if not exists
$adminEmail = 'seyitturgut@gmail.com';
$adminPassword = 'Beyincik**94';

$stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $adminEmail);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $hash = password_hash($adminPassword, PASSWORD_BCRYPT);
    $stmt = $db->prepare("INSERT INTO users (email, password_hash, role, contact_name, is_suspended) VALUES (?, ?, 'admin', 'Sistem Yöneticisi', 0)");
    $stmt->bind_param("ss", $adminEmail, $hash);
    $stmt->execute();
}

echo "Database initialized successfully!";
