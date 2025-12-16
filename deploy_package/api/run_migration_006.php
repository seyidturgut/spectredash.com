<?php
require_once __DIR__ . '/config.php';
$db = getDB();
$sql = file_get_contents(__DIR__ . '/migrations/006_add_goal_value.sql');
if ($db->query($sql)) {
    echo "Migration 006 successful\n";
} else {
    echo "Migration failed: " . $db->error . "\n";
}
