<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'order_id',
        'title',
        'description',
        'status',
        'links',
        'public_token',
    ];

    protected $casts = [
        'links' => 'array',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function comments()
    {
        return $this->hasMany(ProjectComment::class)->with('user')->orderBy('created_at', 'desc');
    }

    public function clientReview()
    {
        return $this->hasOne(ClientReview::class);
    }
}
