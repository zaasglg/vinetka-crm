<?php
require __DIR__ . '/../vendor/autoload.php';

use App\Models\User;
use App\Models\Order;

$users = User::all();
$orders = Order::all();

echo "\n=== USERS (id, email, role) ===\n";
foreach ($users as $u) {
    printf("%d | %s | %s\n", $u->id, $u->email, $u->role ?? 'n/a');
}

echo "\n=== ORDERS (id, name, photoshoot_dates, assigned_photographer_id, assigned_editor_id) ===\n";
foreach ($orders as $o) {
    $dates = json_encode($o->photoshoot_dates);
    printf("%d | %s | %s | %s | %s\n", $o->id, $o->name, $dates, $o->assigned_photographer_id ?? 'null', $o->assigned_editor_id ?? 'null');
}

echo "\nTotal users: " . $users->count() . "\n";
echo "Total orders: " . $orders->count() . "\n";
