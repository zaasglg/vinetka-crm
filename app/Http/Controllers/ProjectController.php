<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectComment;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function show(Order $order)
    {
        $project = $order->project()->with(['comments.user', 'clientReview'])->first();
        
        if (!$project) {
            $project = Project::create([
                'order_id' => $order->id,
                'title' => "Проект: {$order->name} - {$order->grade_level}",
                'status' => 'in_progress',
            ]);
            $project->load(['comments.user', 'clientReview']);
        }

        return Inertia::render('Projects/Show', [
            'order' => $order->load(['photographer', 'editor']),
            'project' => $project,
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $data = [];
        
        if ($request->has('title')) {
            $data['title'] = $request->validate(['title' => 'string|max:255'])['title'];
        }
        
        if ($request->has('description')) {
            $data['description'] = $request->input('description');
        }
        
        if ($request->has('status')) {
            $data['status'] = $request->validate(['status' => 'in:in_progress,review,completed'])['status'];
        }
        
        if ($request->has('links')) {
            $validated = $request->validate([
                'links' => 'array',
                'links.*.type' => 'required|in:youtube,drive,other',
                'links.*.url' => 'required|url',
                'links.*.title' => 'nullable|string',
            ]);
            $data['links'] = $validated['links'];
        }

        $project->update($data);

        return redirect()->back()->with('success', 'Проект обновлён');
    }

    public function addComment(Request $request, Project $project)
    {
        $validated = $request->validate([
            'comment' => 'required|string',
            'type' => 'required|in:comment,remark',
        ]);

        ProjectComment::create([
            'project_id' => $project->id,
            'user_id' => auth()->id(),
            'comment' => $validated['comment'],
            'type' => $validated['type'],
        ]);

        return redirect()->back()->with('success', 'Комментарий добавлен');
    }

    public function resolveComment(ProjectComment $comment)
    {
        $comment->update(['is_resolved' => !$comment->is_resolved]);

        return redirect()->back();
    }

    public function deleteComment(ProjectComment $comment)
    {
        $comment->delete();

        return redirect()->back()->with('success', 'Комментарий удалён');
    }

    public function generatePublicLink(Project $project)
    {
        $token = bin2hex(random_bytes(32));
        $project->update(['public_token' => $token]);

        return redirect()->back()->with('success', 'Публичная ссылка создана');
    }

    public function publicView(string $token)
    {
        $project = Project::where('public_token', $token)
            ->with(['order.photographer', 'order.editor', 'clientReview'])
            ->firstOrFail();

        return Inertia::render('Projects/PublicView', [
            'project' => $project,
            'order' => $project->order,
        ]);
    }

    public function submitReview(Request $request, string $token)
    {
        $project = Project::where('public_token', $token)->firstOrFail();

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'client_name' => 'required|string|max:255',
        ]);

        $project->clientReview()->updateOrCreate(
            ['project_id' => $project->id],
            $validated
        );

        return redirect()->back()->with('success', 'Спасибо за вашу оценку!');
    }
}
