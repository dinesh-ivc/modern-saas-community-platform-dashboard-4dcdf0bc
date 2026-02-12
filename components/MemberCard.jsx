'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

export default function MemberCard({ member }) {
  const router = useRouter();

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl mb-4">
            {getInitials(member.full_name)}
          </div>
          <h3 className="text-lg font-semibold mb-1">{member.full_name || 'Unknown User'}</h3>
          <p className="text-sm text-gray-500 mb-2">{member.email}</p>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
            {member.role || 'member'}
          </div>
          {member.bio && (
            <p className="text-sm text-gray-600 mt-3 line-clamp-2">{member.bio}</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push(`/profile/${member.id}`)}
        >
          <User className="h-4 w-4 mr-2" />
          View Profile
        </Button>
      </CardFooter>
    </Card>
  );
}