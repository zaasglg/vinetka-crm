<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('current_stage')->default('new_request')->after('status');
            $table->json('workflow_history')->nullable()->after('current_stage');
            $table->foreignId('assigned_photographer_id')->nullable()->constrained('users')->after('workflow_history');
            $table->foreignId('assigned_editor_id')->nullable()->constrained('users')->after('assigned_photographer_id');
            $table->json('photoshoot_dates')->nullable()->after('assigned_editor_id');
            $table->date('deadline')->nullable()->after('photoshoot_dates');
            $table->decimal('paid_amount', 10, 2)->default(0)->after('total_price');
            $table->boolean('is_paid')->default(false)->after('paid_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'current_stage',
                'workflow_history',
                'assigned_photographer_id',
                'assigned_editor_id',
                'photoshoot_dates',
                'deadline',
                'paid_amount',
                'is_paid'
            ]);
        });
    }
};
