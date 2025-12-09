<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'city',
        'custom_city',
        'grade_level',
        'institution_type',
        'album_type',
        'spreads',
        'locations',
        'name',
        'phone',
        'comment',
        'has_discount',
        'total_price',
        'status',
        'priority',
        'current_stage',
        'photoshoot_dates',
        'assigned_photographer_id',
        'assigned_editor_id',
        'payment_date',
        'delivery_date',
        'contract_path',
    ];

    protected $casts = [
        'locations' => 'array',
        'has_discount' => 'boolean',
        'total_price' => 'decimal:2',
        'photoshoot_dates' => 'array',
        'payment_date' => 'date',
        'delivery_date' => 'date',
    ];

    public function photographer()
    {
        return $this->belongsTo(User::class, 'assigned_photographer_id');
    }

    public function editor()
    {
        return $this->belongsTo(User::class, 'assigned_editor_id');
    }

    public function project()
    {
        return $this->hasOne(Project::class);
    }
}
