
import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  debugInfo?: {
    authState: string;
    sessionExists: boolean;
    userExists: boolean;
    error?: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authState, setAuthState] = useState('initializing');

  useEffect(() => {
    console.log('🔐 Auth: Setting up auth state listener');
    setAuthState('setting_up_listener');

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 Auth event:', event, 'Session exists:', !!session);
        setAuthState(`event_${event}`);
        setSession(session);
        setUser(session?.user ?? null);
        setError(null); // Clear any previous errors on successful auth change
        setLoading(false);
      }
    );

    // THEN check for existing session
    setAuthState('checking_session');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('🔐 Initial session check:', !!session);
      if (error) {
        console.error('🔐 Session check error:', error);
        setError(`Failed to check authentication status: ${error.message}`);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      setAuthState(session ? 'authenticated' : 'unauthenticated');
    }).catch((err) => {
      console.error('🔐 Session check failed:', err);
      setError('Failed to verify your login status. Please refresh the page.');
      setLoading(false);
      setAuthState('error');
    });

    // Add timeout fallback
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('🔐 Auth timeout reached, setting loading to false');
        setLoading(false);
        setAuthState('timeout');
      }
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [loading]);

  const signOut = async () => {
    try {
      console.log('🔐 Signing out');
      setAuthState('signing_out');
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('🔐 Sign out error:', error);
        setError(`Failed to sign out: ${error.message}`);
      }
    } catch (err) {
      console.error('🔐 Sign out failed:', err);
      setError('Failed to sign out properly. Please clear your browser data.');
    }
  };

  const debugInfo = {
    authState,
    sessionExists: !!session,
    userExists: !!user,
    error: error || undefined,
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, error, signOut, debugInfo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
