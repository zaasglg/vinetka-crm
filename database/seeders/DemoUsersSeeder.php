<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class DemoUsersSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Супер Администратор',
                'email' => 'superadmin@demo.com',
                'password' => Hash::make('password'),
                'role' => 'super_admin',
            ],
            [
                'name' => 'Администратор',
                'email' => 'admin@demo.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ],
            [
                'name' => 'Менеджер по продажам',
                'email' => 'sales@demo.com',
                'password' => Hash::make('password'),
                'role' => 'sales_manager',
            ],
            [
                'name' => 'Фотограф Алексей',
                'email' => 'photographer1@demo.com',
                'password' => Hash::make('password'),
                'role' => 'photographer',
            ],
            [
                'name' => 'Фотограф Мария',
                'email' => 'photographer2@demo.com',
                'password' => Hash::make('password'),
                'role' => 'photographer',
            ],
            [
                'name' => 'Редактор Дмитрий',
                'email' => 'editor1@demo.com',
                'password' => Hash::make('password'),
                'role' => 'editor',
            ],
            [
                'name' => 'Редактор Анна',
                'email' => 'editor2@demo.com',
                'password' => Hash::make('password'),
                'role' => 'editor',
            ],
            [
                'name' => 'Оператор печати',
                'email' => 'print@demo.com',
                'password' => Hash::make('password'),
                'role' => 'print_operator',
            ],
            [
                'name' => 'Клиент Иванов',
                'email' => 'client@demo.com',
                'password' => Hash::make('password'),
                'role' => 'client',
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }
    }
}
