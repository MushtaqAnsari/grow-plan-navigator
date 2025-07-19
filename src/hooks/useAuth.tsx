
import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  debugInfo?: {
    authState: string;
    sessionExists: boolean;
    userExists: boolean;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
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
        setLoading(false);
      }
    );

    // THEN check for existing session
    setAuthState('checking_session');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔐 Initial session check:', !!session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      setAuthState(session ? 'authenticated' : 'unauthenticated');
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
    console.log('🔐 Signing out');
    setAuthState('signing_out');
    await supabase.auth.signOut();
  };

  const debugInfo = {
    authState,
    sessionExists: !!session,
    userExists: !!user,
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, debugInfo }}>
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
