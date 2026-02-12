'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProfileHeader from '@/components/ProfileHeader';
import UserPostsList from '@/components/UserPostsList';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { verifyAuth } from '@/lib/jwt';
import { toast } from 'sonner';

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
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
        fetchProfile(token);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        router.push('/login');
      }
    };

    checkAuth();
  }, [params.id, router]);

  const fetchProfile = async (token) => {
    try {
      const response = await fetch(`/api/users/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfileUser(data.user);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-48 w-full mb-6" />
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert variant="destructive">
            <AlertDescription>{error || 'User not found'}</AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileHeader user={profileUser} isOwnProfile={user?.userId === profileUser.id} />
        <div className="mt-8">
          <UserPostsList userId={params.id} />
        </div>
      </main>
    </div>
  );
}