/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter posts by user ID
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
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
 *         description: Post created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyAuth } from '@/lib/jwt';

export async function GET(request) {
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

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const supabase = createAdminClient();

    let query = supabase
      .from('posts')
      .select(`
        *,
        users!posts_user_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('Database query error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch posts' },
        { status: 500 }
      );
    }

    // Get comment counts for each post
    const postsWithCounts = await Promise.all(
      posts.map(async (post) => {
        const { count } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        return {
          ...post,
          author_name: post.users?.full_name || 'Unknown User',
          comments_count: count || 0,
        };
      })
    );

    return NextResponse.json(
      { success: true, posts: postsWithCounts },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/posts:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
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

    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    if (content.length > 10000) {
      return NextResponse.json(
        { success: false, error: 'Content must be less than 10,000 characters' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: post, error: insertError } = await supabase
      .from('posts')
      .insert([
        {
          user_id: decoded.userId,
          content: content.trim(),
          likes_count: 0,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create post' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, post },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/posts:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}