'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageCircle, Eye } from 'lucide-react';

export default function PostCard({ post }) {
  const router = useRouter();

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/post/${post.id}`)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
            {getInitials(post.author_name)}
          </div>
          <div>
            <p className="font-semibold">{post.author_name || 'Unknown User'}</p>
            <p className="text-sm text-gray-500">{formatDate(post.created_at)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-800 line-clamp-3">{post.content}</p>
      </CardContent>
      <CardFooter className="flex items-center gap-4 border-t pt-4">
        <Button variant="ghost" size="sm" className="gap-2">
          <ThumbsUp className="h-4 w-4" />
          <span>{post.likes_count || 0}</span>
        </Button>
        <Button variant="ghost" size="sm" className="gap-2">
          <MessageCircle className="h-4 w-4" />
          <span>{post.comments_count || 0}</span>
        </Button>
        <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
          <Eye className="h-4 w-4" />
          <span>View post</span>
        </div>
      </CardFooter>
    </Card>
  );
}