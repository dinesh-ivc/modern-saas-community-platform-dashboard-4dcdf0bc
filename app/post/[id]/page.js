'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CommentList from '@/components/CommentList';
import CommentForm from '@/components/CommentForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ThumbsUp, MessageCircle, Eye, Calendar } from 'lucide-react';
import { verifyAuth } from '@/lib/jwt';
import { toast } from 'sonner';

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState(null);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const decoded = await verifyAuth(token);
        if (!decoded) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        setUser(decoded);
        fetchPost(token);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        router.push('/login');
      }
    };

    checkAuth();
  }, [params.id, router]);

  const fetchPost = async (token) => {
    try {
      const response = await fetch(`/api/posts/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }

      const data = await response.json();
      setPost(data.post);
      setComments(data.comments || []);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError(err.message);
      toast.error('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/posts/${params.id}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to like post');
      }

      const data = await response.json();
      setPost((prev) => ({ ...prev, likes_count: data.likes_count }));
      toast.success('Post liked!');
    } catch (err) {
      console.error('Error liking post:', err);
      toast.error('Failed to like post');
    }
  };

  const handleCommentAdded = (newComment) => {
    setComments((prev) => [newComment, ...prev]);
    toast.success('Comment added!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-32 w-full" />
        </main>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert variant="destructive">
            <AlertDescription>{error || 'Post not found'}</AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-4">{post.content}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>Posted by {post.author_name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 pt-4 border-t">
              <Button variant="outline" size="sm" onClick={handleLike}>
                <ThumbsUp className="h-4 w-4 mr-2" />
                {post.likes_count || 0} Likes
              </Button>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MessageCircle className="h-4 w-4" />
                <span>{comments.length} Comments</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Add a Comment</h2>
            <CommentForm postId={params.id} onCommentAdded={handleCommentAdded} />
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Comments ({comments.length})</h2>
            <CommentList comments={comments} />
          </div>
        </div>
      </main>
    </div>
  );
}