<?php
error_reporting(E_ALL);
ini_set('display_errors', 0); // MUST be 0 for JSON APIs
ini_set('log_errors', 1);

// Database Configuration

// 1. Try to load local/server config if exists (Ignored by Git)
if (file_exists(__DIR__ . '/db_config.php')) {
    require_once __DIR__ . '/db_config.php';
    date_default_timezone_set('Europe/Istanbul'); // Ensure alignment with user region
}

// 2. Fallback / Default Constants (if not defined in db_config.php)
if (!defined('DB_HOST'))
    define('DB_HOST', 'localhost');
if (!defined('DB_USER'))
    define('DB_USER', 'root');
if (!defined('DB_PASS'))
    define('DB_PASS', '');
if (!defined('DB_NAME'))
    define('DB_NAME', 'spectre');

// AI Configuration
if (!defined('DEEPSEEK_API_KEY'))
    define('DEEPSEEK_API_KEY', '');

// Create connection
function getDB()
{
    static $conn = null;
    if ($conn === null) {
        try {
            // Suppress warnings to handle them via try-catch/connect_error
            $driver = new mysqli_driver();
            $driver->report_mode = MYSQLI_REPORT_OFF;

            $conn = @new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

            if ($conn->connect_error) {
                throw new Exception($conn->connect_error);
            }
            $conn->set_charset('utf8mb4');
        } catch (Exception $e) {
            error_log("Database Connection Failed: " . $e->getMessage());
            // Return JSON error and stop
            http_response_code(500);
            die(json_encode(['error' => 'Database connection failed (Check credentials): ' . $e->getMessage()]));
        }
    }
    return $conn;
}

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Helper: Get JSON input
function getJsonInput()
{
    return json_decode(file_get_contents('php://input'), true) ?: [];
}

// Helper: Send JSON response
function sendJson($data, $code = 200)
{
    http_response_code($code);
    echo json_encode($data);
    exit;
}
