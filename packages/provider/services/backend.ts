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

    deleteDraft: async (): Promise<void> => {
      // Placeholder for delete draft logic
      return Promise.resolve();
    },

    saveProfile: async (profile: ProviderProfile): Promise<void> => {
      // Alias for saveDraft
      const { data, error } = await supabase.from('profiles').upsert(profile)
      if (error) {
        console.error('Error saving profile:', error);
      }
    },

    submitApplication: async (profile: ProviderProfile): Promise<{ data: any; error: any }> => {
      const { data, error } = await supabase.from('applications').insert({ ...profile, status: 'PENDING' })
      if (error) {
        return { data: null, error };
      }
      return { data, error: null };
    }
  },

  auth: {
    sendOtp: async (phone: string): Promise<void> => {
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+91${phone}`,
      });
      if (error) {
        throw new Error(error.message);
      }
    },

    verifyOtp: async (phone: string, token: string): Promise<void> => {
      const { error } = await supabase.auth.verifyOtp({
        phone: `+91${phone}`,
        token,
        type: 'sms'
      });
      if (error) {
        throw new Error(error.message);
      }
    }
  },

  storage: {
    upload: async (file: File, path?: string): Promise<string> => {
      const filePath = path || `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage.from('documents').upload(filePath, file)
      if (error) {
        throw new Error(error.message);
      }
      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath)
      return publicUrl;
    }
  }
};