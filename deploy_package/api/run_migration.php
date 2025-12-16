<?php
require_once __DIR__ . '/config.php';

$migration_file = __DIR__ . '/migrations/005_goal_definitions.sql';
if (!file_exists($migration_file)) {
    die("Migration file not found.");
}

$sql = file_get_contents($migration_file);
$db = getDB();

// Handle multiple statements
$statements = array_filter(array_map('trim', explode(';', $sql)));

foreach ($statements as $stmt) {
    if (empty($stmt))
        continue;
    if ($db->query($stmt)) {
        echo "✅ Success: " . substr($stmt, 0, 50) . "...\n";
    } else {
        echo "❌ Error: " . $db->error . " in " . substr($stmt, 0, 50) . "\n";
    }
}
echo "Migration Complete.\n";
