/**
 * @swagger
 * /api/posts/{id}/comments:
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created
 *       400:
 *         description: Invalid input
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
    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { success: false, error: 'Comment must be less than 2,000 characters' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verify post exists
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', id)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Create comment
    const { data: comment, error: insertError } = await supabase
      .from('comments')
      .insert([
        {
          post_id: id,
          user_id: decoded.userId,
          content: content.trim(),
          created_at: new Date().toISOString(),
        },
      ])
      .select(`
        *,
        users!comments_user_id_fkey (
          full_name
        )
      `)
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create comment' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        comment: {
          ...comment,
          author_name: comment.users?.full_name || 'Unknown User',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/posts/[id]/comments:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}