'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Calendar } from 'lucide-react';

export default function ProfileHeader({ user, isOwnProfile }) {
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
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
            {getInitials(user.full_name)}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{user.full_name || 'Unknown User'}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatDate(user.created_at)}</span>
              </div>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                {user.role || 'member'}
              </div>
            </div>
            {user.bio && (
              <p className="text-gray-700 mb-4">{user.bio}</p>
            )}
            {isOwnProfile && (
              <Button variant="outline" size="sm">
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}