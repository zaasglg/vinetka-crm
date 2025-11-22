<?php

namespace Database\Seeders;

use App\Models\Attendance;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class AttendanceSeeder extends Seeder
{
    public function run(): void
    {
        $users = [4, 5, 6, 7]; // photographer1, photographer2, editor1, editor2
        $startDate = Carbon::now()->startOfMonth();
        $endDate = Carbon::now();

        for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
            if ($date->isWeekday()) { // Only weekdays
                foreach ($users as $userId) {
                    $checkIn = Carbon::createFromTime(rand(8, 10), rand(0, 59));
                    $checkOut = Carbon::createFromTime(rand(17, 19), rand(0, 59));

                    Attendance::create([
                        'user_id' => $userId,
                        'date' => $date->format('Y-m-d'),
                        'check_in' => $checkIn->format('H:i'),
                        'check_out' => $checkOut->format('H:i'),
                        'notes' => rand(0, 10) > 8 ? 'Опоздание' : null,
                    ]);
                }
            }
        }
    }
}
