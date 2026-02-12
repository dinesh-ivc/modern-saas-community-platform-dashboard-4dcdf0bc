'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function PostForm() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Please enter some content');
      return;
    }

    if (content.length > 10000) {
      toast.error('Content must be less than 10,000 characters');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      toast.success('Post created successfully!');
      router.push('/');
    } catch (err) {
      console.error('Error creating post:', err);
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>What's on your mind?</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Share your thoughts with the community..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            disabled={loading}
            className="resize-none"
          />
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {content.length} / 10,000 characters
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !content.trim()}>
                {loading ? 'Publishing...' : 'Publish Post'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}