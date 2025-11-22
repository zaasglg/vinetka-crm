<?php

namespace Database\Seeders;

use App\Models\Order;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $orders = [
            [
                'city' => 'Алматы',
                'custom_city' => null,
                'grade_level' => '11 класс',
                'album_type' => 'Премиум',
                'spreads' => '20',
                'locations' => ['Парк Первого Президента', 'Центральный стадион'],
                'name' => 'Айгуль Сериковна',
                'phone' => '+7 777 123 4567',
                'comment' => 'Хотелось бы съемку на закате',
                'has_discount' => false,
                'total_price' => 150000.00,
                'status' => 'in_progress',
                'current_stage' => 'photoshoot_scheduled',
                'photoshoot_dates' => ['2025-11-25', '2025-11-26'],
                'assigned_photographer_id' => 4,
            ],
            [
                'city' => 'Астана',
                'custom_city' => null,
                'grade_level' => '9 класс',
                'album_type' => 'Стандарт',
                'spreads' => '15',
                'locations' => ['Байтерек', 'EXPO'],
                'name' => 'Ербол Нурланович',
                'phone' => '+7 701 234 5678',
                'comment' => null,
                'has_discount' => true,
                'total_price' => 85000.00,
                'status' => 'in_progress',
                'current_stage' => 'editing',
                'photoshoot_dates' => ['2025-11-28'],
                'assigned_photographer_id' => 5,
                'assigned_editor_id' => 6,
            ],
            [
                'city' => 'Шымкент',
                'custom_city' => null,
                'grade_level' => '11 класс',
                'album_type' => 'VIP',
                'spreads' => '30',
                'locations' => ['Дендропарк', 'Площадь Ордабасы'],
                'name' => 'Жанар Камалова',
                'phone' => '+7 708 345 6789',
                'comment' => 'Нужна дополнительная съемка в студии',
                'has_discount' => false,
                'total_price' => 220000.00,
                'status' => 'in_progress',
                'current_stage' => 'printing',
                'photoshoot_dates' => ['2025-11-22', '2025-11-23'],
                'assigned_photographer_id' => 4,
                'assigned_editor_id' => 7,
            ],
            [
                'city' => 'Караганда',
                'custom_city' => null,
                'grade_level' => '10 класс',
                'album_type' => 'Стандарт',
                'spreads' => '12',
                'locations' => ['Центральный парк'],
                'name' => 'Асель Токтарова',
                'phone' => '+7 775 456 7890',
                'comment' => 'Съемка только в будни',
                'has_discount' => true,
                'total_price' => 65000.00,
                'status' => 'pending',
                'current_stage' => 'new_request',
                'photoshoot_dates' => ['2025-12-01'],
            ],
            [
                'city' => 'Другой',
                'custom_city' => 'Актобе',
                'grade_level' => '11 класс',
                'album_type' => 'Премиум',
                'spreads' => '18',
                'locations' => ['Городской парк', 'Набережная'],
                'name' => 'Даулет Бекназаров',
                'phone' => '+7 702 567 8901',
                'comment' => null,
                'has_discount' => false,
                'total_price' => 135000.00,
                'status' => 'completed',
                'current_stage' => 'completed',
                'photoshoot_dates' => ['2025-11-20'],
                'assigned_photographer_id' => 5,
                'assigned_editor_id' => 6,
            ],
        ];

        foreach ($orders as $order) {
            Order::create($order);
        }
    }
}
