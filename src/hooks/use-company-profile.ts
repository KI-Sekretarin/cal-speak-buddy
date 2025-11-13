import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CompanyProfile } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';

export function useCompanyProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: 'Fehler',
        description: 'Profil konnte nicht geladen werden.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<CompanyProfile>) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id);

      if (error) throw error;

      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      
      toast({
        title: 'Erfolgreich gespeichert',
        description: 'Ihre Änderungen wurden gespeichert.',
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Fehler',
        description: 'Änderungen konnten nicht gespeichert werden.',
        variant: 'destructive',
      });
      return { success: false, error };
    } finally {
      setSaving(false);
    }
  };

  return {
    profile,
    loading,
    saving,
    updateProfile,
    reloadProfile: loadProfile,
  };
}
