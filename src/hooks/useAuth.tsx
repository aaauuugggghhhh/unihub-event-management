import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isRegisteredForEvent: (eventId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  const updateUserWithRegistrations = async (supabaseUser: User) => {
    const { data: registrations } = await supabase
      .from('event_registrations')
      .select('event_id')
      .eq('user_id', supabaseUser.id);
    
    setUser({
      ...supabaseUser,
      registeredEvents: registrations?.map(r => r.event_id) || []
    });
  };

  const isRegisteredForEvent = (eventId: string): boolean => {
    return user?.registeredEvents?.includes(eventId) || false;
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        updateUserWithRegistrations(session.user as User);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        updateUserWithRegistrations(session.user as User);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        if (error.message.includes('provider is not enabled')) {
          toast({
            title: 'Authentication Error',
            description: 'Google sign-in is not configured. Please contact the administrator.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error signing in',
            description: 'There was a problem signing in with Google. Please try again.',
            variant: 'destructive',
          });
        }
        console.error('Error signing in with Google:', error);
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast({
        title: 'Error signing in',
        description: 'There was a problem signing in with Google. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: 'Signed out successfully',
        description: 'You have been signed out of your account.',
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error signing out',
        description: 'There was a problem signing out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const value = {
    user,
    signInWithGoogle,
    signOut,
    isRegisteredForEvent,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
