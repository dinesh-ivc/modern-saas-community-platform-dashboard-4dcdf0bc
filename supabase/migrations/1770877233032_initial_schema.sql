-- Create table: users
CREATE TABLE IF NOT EXISTS users (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
    email text UNIQUE NOT NULL,
    password text NOT NULL,
    full_name text NOT NULL,
    avatar_url text,
    bio text,
    role text DEFAULT 'member' NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email);
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Create table: posts
CREATE TABLE IF NOT EXISTS posts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    likes_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE  INDEX IF NOT EXISTS idx_posts_user_id ON posts (user_id);
CREATE  INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at);
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;

-- Create table: comments
CREATE TABLE IF NOT EXISTS comments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE  INDEX IF NOT EXISTS idx_comments_post_id ON comments (post_id);
CREATE  INDEX IF NOT EXISTS idx_comments_user_id ON comments (user_id);
CREATE  INDEX IF NOT EXISTS idx_comments_created_at ON comments (created_at);
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
