import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, AuthError } from '@supabase/supabase-js'

/**
 * Custom hook to manage Supabase authentication state
 * Provides current user and loading state
 */
export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return { user, loading, supabase }
}

/**
 * Hook for signing in with email and password
 */
export function useSupabaseSignIn() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)
  const supabase = createClient()

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)
    if (error) setError(error)
    return { data, error }
  }

  return { signIn, loading, error }
}

/**
 * Hook for signing up with email and password
 */
export function useSupabaseSignUp() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)
  const supabase = createClient()

  const signUp = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    setLoading(false)
    if (error) setError(error)
    return { data, error }
  }

  return { signUp, loading, error }
}

/**
 * Hook for signing out
 */
export function useSupabaseSignOut() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const signOut = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    setLoading(false)
    return { error }
  }

  return { signOut, loading }
}

