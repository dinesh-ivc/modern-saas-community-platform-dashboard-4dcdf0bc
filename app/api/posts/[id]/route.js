/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get a single post
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
 *         description: Success
 *       404:
 *         description: Post not found
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyAuth } from '@/lib/jwt';

export async function GET(request, { params }) {
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

    // Get post with author details
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select(`
        *,
        users!posts_user_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq('id', id)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Get comments for the post
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select(`
        *,
        users!comments_user_id_fkey (
          id,
          full_name
        )
      `)
      .eq('post_id', id)
      .order('created_at', { ascending: false });

    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
    }

    const formattedComments = (comments || []).map((comment) => ({
      ...comment,
      author_name: comment.users?.full_name || 'Unknown User',
    }));

    return NextResponse.json(
      {
        success: true,
        post: {
          ...post,
          author_name: post.users?.full_name || 'Unknown User',
        },
        comments: formattedComments,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/posts/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}