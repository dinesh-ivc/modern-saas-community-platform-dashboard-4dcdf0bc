'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function CommentForm({ postId, onCommentAdded }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      const data = await response.json();
      setContent('');
      if (onCommentAdded) {
        onCommentAdded(data.comment);
      }
      toast.success('Comment posted!');
    } catch (err) {
      console.error('Error posting comment:', err);
      toast.error('Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Write a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            disabled={loading}
            className="resize-none"
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={loading || !content.trim()}>
              {loading ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}