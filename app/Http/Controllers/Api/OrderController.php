<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $orders = Order::orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'city' => 'nullable|string|max:255',
            'custom_city' => 'nullable|string|max:255',
            'grade_level' => 'nullable|string|max:255',
            'album_type' => 'nullable|string|max:255',
            'spreads' => 'nullable|string|max:255',
            'locations' => 'nullable|array',
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'comment' => 'nullable|string',
            'has_discount' => 'boolean',
            'total_price' => 'nullable|numeric|min:0',
            'status' => 'nullable|string|in:pending,confirmed,in_progress,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $order = Order::create($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Заявка успешно создана',
            'data' => $order,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Order $order)
    {
        $validator = Validator::make($request->all(), [
            'city' => 'nullable|string|max:255',
            'custom_city' => 'nullable|string|max:255',
            'grade_level' => 'nullable|string|max:255',
            'album_type' => 'nullable|string|max:255',
            'spreads' => 'nullable|string|max:255',
            'locations' => 'nullable|array',
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'comment' => 'nullable|string',
            'has_discount' => 'boolean',
            'total_price' => 'nullable|numeric|min:0',
            'status' => 'nullable|string|in:pending,confirmed,in_progress,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $order->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Заявка успешно обновлена',
            'data' => $order,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        $order->delete();

        return response()->json([
            'success' => true,
            'message' => 'Заявка успешно удалена',
        ]);
    }
}
