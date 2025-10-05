import { supabase } from '@/integrations/supabase/client';

export async function initializeAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    const { data, error } = await supabase.auth.signInAnonymously();
    
    if (error) {
      console.error('Anonymous auth failed:', error);
      return null;
    }
    
    console.log('Signed in anonymously:', data.user.id);
    return data.user;
  }
  
  console.log('Existing session found:', session.user.id);
  return session.user;
}

// Initialize immediately when module loads
initializeAuth();
