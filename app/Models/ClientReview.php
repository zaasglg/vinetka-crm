<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClientReview extends Model
{
    protected $fillable = [
        'project_id',
        'rating',
        'comment',
        'client_name',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
