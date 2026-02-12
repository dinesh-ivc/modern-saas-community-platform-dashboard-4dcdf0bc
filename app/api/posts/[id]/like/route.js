/**
 * @swagger
 * /api/posts/{id}/like:
 *   post:
 *     summary: Like a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post liked successfully
 *       404:
 *         description: Post not found
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyAuth } from '@/lib/jwt';

export async function POST(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = await verifyAuth(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { id } = params;
    const supabase = createAdminClient();

    // Get current post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('likes_count')
      .eq('id', id)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Increment likes count
    const newLikesCount = (post.likes_count || 0) + 1;

    const { error: updateError } = await supabase
      .from('posts')
      .update({ likes_count: newLikesCount })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating likes:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update likes' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, likes_count: newLikesCount },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/posts/[id]/like:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}