'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Users, MessageCircle, TrendingUp } from 'lucide-react';

export default function HeroSection({ user }) {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-8 text-white mb-8">
      <div className="max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">
          Welcome back, {user?.full_name?.split(' ')[0] || 'Member'}!
        </h1>
        <p className="text-lg mb-6 text-blue-100">
          Share your thoughts, connect with the community, and discover amazing content.
        </p>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => router.push('/create')}
          className="bg-white text-blue-600 hover:bg-blue-50"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Create New Post
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">Community</p>
              <p className="text-sm text-blue-100">Connect with members</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">Discussions</p>
              <p className="text-sm text-blue-100">Join conversations</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">Trending</p>
              <p className="text-sm text-blue-100">Popular content</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}