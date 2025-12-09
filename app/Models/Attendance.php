<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'check_in',
        'check_out',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getWorkHoursAttribute()
    {
        if (!$this->check_in || !$this->check_out) {
            return null;
        }

        // Parse time strings (format: H:i)
        $checkIn = \Carbon\Carbon::createFromFormat('H:i:s', $this->check_in);
        $checkOut = \Carbon\Carbon::createFromFormat('H:i:s', $this->check_out);
        
        return $checkOut->diffInMinutes($checkIn) / 60;
    }
}
