<?php
/**
 * Database Migration Runner
 * Run this file once to apply all migrations
 */

require_once __DIR__ . '/config.php';

echo "🚀 Starting database migration...\n\n";

$db = getDB();

// Read migration file
$migration_file = __DIR__ . '/migrations/002_analytics_v2.sql';

if (!file_exists($migration_file)) {
    die("❌ Migration file not found: $migration_file\n");
}

$sql = file_get_contents($migration_file);

// Split by semicolons to execute each statement separately
$statements = array_filter(
    array_map('trim', explode(';', $sql)),
    function ($stmt) {
        // Filter out comments and empty statements
        return !empty($stmt) &&
            !preg_match('/^--/', $stmt) &&
            !preg_match('/^\/\*/', $stmt);
    }
);

$success_count = 0;
$error_count = 0;

foreach ($statements as $statement) {
    if (empty(trim($statement)))
        continue;

    try {
        if ($db->query($statement)) {
            $success_count++;
            echo "✅ Executed successfully\n";
        } else {
            $error_count++;
            echo "❌ Error: " . $db->error . "\n";
        }
    } catch (Exception $e) {
        $error_count++;
        echo "❌ Exception: " . $e->getMessage() . "\n";
    }
}

echo "\n";
echo "📊 Migration Summary:\n";
echo "   ✅ Successful: $success_count\n";
echo "   ❌ Errors: $error_count\n";
echo "\n";

if ($error_count === 0) {
    echo "🎉 Migration completed successfully!\n";
} else {
    echo "⚠️  Migration completed with errors. Please check the output above.\n";
}

// Verify tables exist
echo "\n🔍 Verifying tables...\n";
$tables = ['goals', 'events', 'heatmap_data', 'sessions'];

foreach ($tables as $table) {
    $result = $db->query("SHOW TABLES LIKE '$table'");
    if ($result->num_rows > 0) {
        echo "   ✅ Table '$table' exists\n";
    } else {
        echo "   ❌ Table '$table' NOT found\n";
    }
}

echo "\n✨ Done!\n";
