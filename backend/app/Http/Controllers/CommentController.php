<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CommentController extends Controller
{
    // READ: Mengambil semua komentar
    public function index()
    {
        return response()->json([
            'data' => Comment::latest()->limit(50)->get(),
        ]);
    }

    // CREATE: Menambahkan komentar
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'    => 'required|string|max:60',
            'comment' => 'required|string|max:500',
            'photo'   => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $path = $request->hasFile('photo')
            ? $request->file('photo')->store('avatars', 'public')
            : null;

        $comment = Comment::create([
            'name'       => $data['name'],
            'comment'    => $data['comment'],
            'photo_path' => $path,
        ]);

        return response()->json($comment, 201);
    }

    // UPDATE: Memperbarui komentar
    public function update(Request $request, $id)
    {
        $comment = Comment::findOrFail($id);

        $data = $request->validate([
            'name'    => 'required|string|max:60',
            'comment' => 'required|string|max:500',
            'photo'   => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        if ($request->hasFile('photo')) {
            if ($comment->photo_path) {
                Storage::disk('public')->delete($comment->photo_path);
            }

            $data['photo_path'] = $request->file('photo')
                ->store('avatars', 'public');
        }

        unset($data['photo']);

        $comment->update($data);

        return response()->json([
            'message' => 'Komentar berhasil diupdate',
            'data' => $comment->fresh(),
        ], 200);
    }

    // DELETE: Menghapus komentar
    public function destroy($id)
    {
        $comment = Comment::findOrFail($id);

        if ($comment->photo_path) {
            Storage::disk('public')->delete($comment->photo_path);
        }

        $comment->delete();

        return response()->json([
            'message' => 'Komentar berhasil dihapus'
        ], 200);
    }
}
