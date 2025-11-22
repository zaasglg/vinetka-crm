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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('city')->nullable();
            $table->string('custom_city')->nullable();
            $table->string('grade_level')->nullable();
            $table->string('album_type')->nullable();
            $table->string('spreads')->nullable();
            $table->json('locations')->nullable();
            $table->string('name')->nullable();
            $table->string('phone')->nullable();
            $table->text('comment')->nullable();
            $table->boolean('has_discount')->default(false);
            $table->decimal('total_price', 10, 2)->nullable();
            $table->string('status')->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
