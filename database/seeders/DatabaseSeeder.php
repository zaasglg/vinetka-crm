<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Core/demo seeders — run demo seeders when developer wants example data
        // Keep Test User for default minimal install
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Demo data: users for all roles and a set of orders
        $this->call([ 
            DemoUsersSeeder::class,
            OrderSeeder::class,
            // AdminUserSeeder::class, // uncomment if you want the admin@admin.com default too
        ]);
    }
}
