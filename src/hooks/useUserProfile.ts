
import { createClient } from '@/src/utils/supabase/client';
import { UserProfile } from '@/src/types';
import { useEffect, useState } from 'react';

// Custom hook to fetch the current user's profile with strict typing
export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function fetchProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        // In a real app, use Zod to validate 'data' matches UserProfile schema at runtime
        setProfile(data as UserProfile); 
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  return { profile, loading, error };
}
