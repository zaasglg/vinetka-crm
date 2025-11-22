<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index()
    {
        $orders = Order::with(['photographer', 'editor'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Schedule/Index', [
            'orders' => $orders,
        ]);
    }
}
