import { ProviderProfile } from '../types';
import { supabase } from '@core/services/supabase';

const STORAGE_KEY = 'thelocals_provider_draft';

export const backend = {
  db: {
    saveDraft: async (profile: ProviderProfile): Promise<void> => {
      const { data, error } = await supabase.from('profiles').upsert(profile)
      if (error) {
        console.error('Error saving draft:', error);
      }
    },

    getDraft: async (): Promise<ProviderProfile | null> => {
      const { data, error } = await supabase.from('profiles').select('*').single()
      if (error) {
        return null;
      }
      return data as ProviderProfile;
    },

    submitApplication: async (profile: ProviderProfile): Promise<{ data: any; error: any }> => {
      const { data, error } = await supabase.from('applications').insert({ ...profile, status: 'PENDING' })
      if (error) {
        return { data: null, error };
      }
      return { data, error: null };
    }
  },

  storage: {
    upload: async (file: File, path: string): Promise<{ url: string | null; error: any }> => {
      const { data, error } = await supabase.storage.from('documents').upload(path, file)
      if (error) {
        return { url: null, error };
      }
      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path)
      return { url: publicUrl, error: null };
    }
  }
};