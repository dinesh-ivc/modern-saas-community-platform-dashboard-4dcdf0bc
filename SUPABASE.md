# Supabase Integration Guide

This scaffold comes with a complete Supabase integration for authentication and database operations.

## Table of Contents

- [Setup](#setup)
- [Authentication](#authentication)
- [Database Operations](#database-operations)
- [Real-time Subscriptions](#real-time-subscriptions)
- [File Storage](#file-storage)
- [Edge Functions](#edge-functions)
- [Best Practices](#best-practices)

## Setup

### 1. Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in your project details
4. Wait for the project to be provisioned

### 2. Get Your Credentials

1. Go to Project Settings > API
2. Copy the following:
   - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
   - Anon/Public Key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **Service Role Key** (`SUPABASE_SERVICE_ROLE_KEY`) - ⚠️ Keep this secret!

### 3. Configure Environment Variables

Create a `.env.local` file in the root of your project:

```env
# Public keys (safe to expose to browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Service Role Key (SERVER-SIDE ONLY - never expose to browser!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

⚠️ **Security Note**: The `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security (RLS) and should NEVER be exposed to the browser. Next.js automatically hides environment variables that don't start with `NEXT_PUBLIC_`, so this key is safe to use in server-side code.

### 4. Install Dependencies

The required dependencies are already in `package.json`:

```bash
npm install
```

## Authentication

### Client Components

Use the provided hooks for authentication in client components:

```typescript
'use client'
import { useSupabaseAuth, useSupabaseSignIn, useSupabaseSignUp, useSupabaseSignOut } from '@/hooks/use-supabase-auth'

export function MyComponent() {
  const { user, loading } = useSupabaseAuth()
  const { signIn, loading: signInLoading, error } = useSupabaseSignIn()
  const { signUp } = useSupabaseSignUp()
  const { signOut } = useSupabaseSignOut()

  const handleSignIn = async () => {
    const { data, error } = await signIn('email@example.com', 'password')
    if (!error) {
      // User signed in successfully
    }
  }

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not authenticated</div>
  
  return <div>Welcome, {user.email}</div>
}
```

### Server Components

Access user information in server components:

```typescript
import { createClient } from '@/lib/supabase/server'

export default async function ServerComponent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Not authenticated</div>
  }

  return <div>Welcome, {user.email}</div>
}
```

### Server Actions

Use Supabase in server actions:

```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('profiles')
    .update({ name: formData.get('name') })
    .eq('id', user.id)

  if (error) throw error

  revalidatePath('/profile')
}
```

### Route Handlers

#### User-Authenticated API Routes (with RLS)

Use the regular server client when you want to respect RLS:

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // This respects RLS - only returns data the user can access
  const { data, error } = await supabase
    .from('your_table')
    .select('*')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
```

#### Admin API Routes (bypassing RLS)

Use the admin client when you need full database access:

```typescript
import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createAdminClient()
  
  // This bypasses RLS - can access all data
  const { data, error } = await supabase
    .from('your_table')
    .select('*')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

// Example: Admin operation to update any user's data
export async function PATCH(request: Request) {
  const supabase = createAdminClient()
  const { userId, updates } = await request.json()
  
  // Can update any user's data (bypasses RLS)
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
```

### Authentication Providers

Configure OAuth providers in Supabase Dashboard > Authentication > Providers:

- Google
- GitHub
- Facebook
- And many more...

Sign in with OAuth:

```typescript
const { signIn } = useSupabaseSignIn()

const handleOAuthSignIn = async (provider: 'google' | 'github') => {
  const supabase = createClient()
  await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback`
    }
  })
}
```

## Database Operations

### Understanding Supabase Clients

This scaffold provides two types of Supabase clients:

#### 1. **Public Client** (`createClient()` from `@/lib/supabase/client`)
- Uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Respects Row Level Security (RLS)
- Used in client components and browser
- Safe to expose to users

#### 2. **Server Client** (`createClient()` from `@/lib/supabase/server`)
- Uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` with user context
- Respects RLS based on authenticated user
- Used in Server Components, Server Actions, and API Routes
- User-authenticated operations

#### 3. **Admin Client** (`createAdminClient()` from `@/lib/supabase/server`)
- Uses `SUPABASE_SERVICE_ROLE_KEY`
- **Bypasses RLS** - has full database access
- **SERVER-SIDE ONLY** - never use in client components
- Use for admin operations, system-level tasks, or when you need to bypass RLS

### When to Use Each Client

| Use Case | Client | Example |
|----------|--------|---------|
| User authentication (login/signup) | Public Client | Client components |
| User reads their own data | Server Client | Server Components with user context |
| Admin operations | Admin Client | API routes that need full access |
| System-level CRUD | Admin Client | Background jobs, migrations |
| Operations bypassing RLS | Admin Client | Updating any user's data |

### Basic CRUD Operations

#### Client-Side (with RLS)

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Create
const { data, error } = await supabase
  .from('posts')
  .insert({ title: 'Hello World', content: 'My first post' })
  .select()

// Read
const { data, error } = await supabase
  .from('posts')
  .select('*')

// Update
const { data, error } = await supabase
  .from('posts')
  .update({ title: 'Updated Title' })
  .eq('id', postId)
  .select()

// Delete
const { data, error } = await supabase
  .from('posts')
  .delete()
  .eq('id', postId)
```

#### Server-Side (with RLS - user context)

```typescript
import { createClient } from '@/lib/supabase/server'

export default async function ServerComponent() {
  const supabase = await createClient()
  
  // This respects RLS - only returns posts the user can access
  const { data, error } = await supabase
    .from('posts')
    .select('*')
}
```

#### Server-Side (bypassing RLS - admin operations)

```typescript
import { createAdminClient } from '@/lib/supabase/server'

// In API Route or Server Action
export async function GET() {
  const supabase = createAdminClient()
  
  // This bypasses RLS - can access all posts
  const { data, error } = await supabase
    .from('posts')
    .select('*')
  
  return Response.json({ data })
}
```

### Advanced Queries

```typescript
// Filtering
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('status', 'published')
  .gte('created_at', '2024-01-01')
  .order('created_at', { ascending: false })
  .limit(10)

// Joins
const { data } = await supabase
  .from('posts')
  .select(`
    *,
    author:profiles(name, avatar_url),
    comments(content, created_at)
  `)

// Count
const { count } = await supabase
  .from('posts')
  .select('*', { count: 'exact', head: true })
```

### Row Level Security (RLS)

Always enable RLS for your tables:

```sql
-- Enable RLS
alter table posts enable row level security;

-- Allow users to read all posts
create policy "Posts are viewable by everyone"
  on posts for select
  using (true);

-- Allow users to insert their own posts
create policy "Users can create posts"
  on posts for insert
  with check (auth.uid() = user_id);

-- Allow users to update their own posts
create policy "Users can update own posts"
  on posts for update
  using (auth.uid() = user_id);

-- Allow users to delete their own posts
create policy "Users can delete own posts"
  on posts for delete
  using (auth.uid() = user_id);
```

## Real-time Subscriptions

Subscribe to database changes in real-time:

```typescript
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function RealtimeComponent() {
  const [posts, setPosts] = useState([])
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch
    const fetchPosts = async () => {
      const { data } = await supabase.from('posts').select('*')
      setPosts(data || [])
    }
    fetchPosts()

    // Subscribe to changes
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // 'INSERT' | 'UPDATE' | 'DELETE'
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPosts((prev) => [payload.new, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setPosts((prev) =>
              prev.map((post) =>
                post.id === payload.new.id ? payload.new : post
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setPosts((prev) =>
              prev.filter((post) => post.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div>
      {posts.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  )
}
```

## File Storage

### Upload Files

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

const uploadFile = async (file: File) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random()}.${fileExt}`
  const filePath = `${userId}/${fileName}`

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file)

  if (error) throw error

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  return publicUrl
}
```

### Download Files

```typescript
const { data, error } = await supabase.storage
  .from('avatars')
  .download('public/avatar1.png')
```

### Delete Files

```typescript
const { data, error } = await supabase.storage
  .from('avatars')
  .remove(['public/avatar1.png'])
```

### List Files

```typescript
const { data, error } = await supabase.storage
  .from('avatars')
  .list('public', {
    limit: 100,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' }
  })
```

## Edge Functions

Supabase Edge Functions run on Deno and can be called from your Next.js app:

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

const { data, error } = await supabase.functions.invoke('my-function', {
  body: { name: 'Functions' }
})
```

## Best Practices

### 1. Always Use Row Level Security

Never disable RLS in production. Always create appropriate policies.

### 2. Use Server Components When Possible

Server Components are more secure and performant for data fetching.

### 3. Handle Errors Properly

```typescript
const { data, error } = await supabase.from('posts').select('*')
if (error) {
  console.error('Error fetching posts:', error)
  // Handle error appropriately
}
```

### 4. Use TypeScript Types

Generate TypeScript types from your database:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/database.types.ts
```

Then use them:

```typescript
import { Database } from '@/lib/supabase/database.types'

const supabase = createClient<Database>()
```

### 5. Optimize Queries

- Use `select()` to only fetch needed columns
- Use pagination for large datasets
- Use indexes on frequently queried columns

### 6. Clean Up Subscriptions

Always unsubscribe from real-time channels:

```typescript
useEffect(() => {
  const channel = supabase.channel('changes')
  // ... set up subscription

  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

### 7. Use Environment Variables

Never commit your Supabase keys to version control. Always use `.env.local`.

### 8. Implement Rate Limiting

Use Supabase's built-in rate limiting or implement your own.

### 9. Monitor Usage

Keep an eye on your Supabase dashboard for usage and performance metrics.

### 10. Backup Your Database

Regularly backup your database from the Supabase dashboard.

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Examples](https://github.com/supabase/supabase/tree/master/examples)
- [Supabase Discord](https://discord.supabase.com/)

## Support

For issues specific to this scaffold, please contact your development team.
For Supabase-specific issues, refer to the [Supabase Documentation](https://supabase.com/docs) or [Community](https://github.com/supabase/supabase/discussions).

