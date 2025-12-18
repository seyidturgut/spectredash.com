<?php
require_once __DIR__ . '/config.php';

$db = getDB();

function addColumnIfNotExists($db, $table, $column, $definition)
{
    try {
        $check = $db->query("SHOW COLUMNS FROM `$table` LIKE '$column'");
        if ($check->num_rows === 0) {
            $sql = "ALTER TABLE `$table` ADD COLUMN `$column` $definition";
            if ($db->query($sql)) {
                echo "✅ Added column '$column' to table '$table'.\n";
            } else {
                echo "❌ Failed to add column '$column': " . $db->error . "\n";
            }
        } else {
            echo "ℹ️ Column '$column' already exists in '$table'. Skipping.\n";
        }
    } catch (Exception $e) {
        echo "❌ Error checking/adding column '$column': " . $e->getMessage() . "\n";
    }
}

echo "Starting Automatic Migration...\n";

// 1. Ensure Tables Exist
// We reuse init.php logic or just simplistic checks here if init.php isn't run. 
// Assuming init.php might not have been run or tables exist but are old.

// Users Table Columns
addColumnIfNotExists($db, 'users', 'company_name', 'VARCHAR(255) NULL');
addColumnIfNotExists($db, 'users', 'contact_name', 'VARCHAR(255) NULL');

// Sites Table Columns (Just in case)
addColumnIfNotExists($db, 'sites', 'site_id', 'VARCHAR(50) NOT NULL');
addColumnIfNotExists($db, 'sites', 'domain', 'VARCHAR(255) NOT NULL');
addColumnIfNotExists($db, 'sites', 'last_active_at', 'TIMESTAMP NULL');

echo "Migration Checks Complete.\n";
