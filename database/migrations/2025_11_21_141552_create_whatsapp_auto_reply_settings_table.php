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
        Schema::create('whatsapp_auto_reply_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('enabled')->default(false);
            $table->text('system_prompt')->nullable();
            $table->string('ai_model')->default('gpt-4o-mini');
            $table->integer('max_tokens')->default(500);
            $table->float('temperature')->default(0.7);
            $table->json('excluded_phones')->nullable(); // Телефоны, которые игнорируем
            $table->boolean('only_new_conversations')->default(true); // Отвечать только на новые чаты
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('whatsapp_auto_reply_settings');
    }
};
