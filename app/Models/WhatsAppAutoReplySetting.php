<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsAppAutoReplySetting extends Model
{
    /**
     * Explicit table name to match migration (avoid automatic pluralization issues)
     */
    protected $table = 'whatsapp_auto_reply_settings';
    protected $fillable = [
        'enabled',
        'system_prompt',
        'ai_model',
        'max_tokens',
        'temperature',
        'excluded_phones',
        'only_new_conversations',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'excluded_phones' => 'array',
        'only_new_conversations' => 'boolean',
        'temperature' => 'float',
        'max_tokens' => 'integer',
    ];

    public static function getSettings()
    {
        return self::first() ?? self::create([
            'enabled' => false,
            'system_prompt' => 'Ты - вежливый ассистент фотостудии Vinetka Pro. Отвечай кратко и по делу на вопросы клиентов о услугах фотосъемки, печати альбомов и обработке фотографий.',
            'ai_model' => 'gpt-4o-mini',
            'max_tokens' => 500,
            'temperature' => 0.7,
            'excluded_phones' => [],
            'only_new_conversations' => true,
        ]);
    }
}
