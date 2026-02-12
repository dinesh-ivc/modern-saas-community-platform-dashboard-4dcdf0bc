'use client';

import { useEffect, useState } from 'react';
import PostCard from '@/components/PostCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function UserPostsList({ userId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserPosts();
  }, [userId]);

  const fetchUserPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/posts?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user posts');
      }

      const data = await response.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Error fetching user posts:', err);
      setError(err.message);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Posts</h2>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Posts</h2>
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No posts yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Posts ({posts.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}