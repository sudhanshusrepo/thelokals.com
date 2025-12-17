import { ProviderProfile, Application, AvailabilitySchedule } from '../types';
import { supabase } from '@thelocals/core';
import { logger } from '@thelocals/core/services/logger';
import { PostgrestError } from '@supabase/supabase-js';

const STORAGE_KEY = 'thelocals_provider_draft';

export const backend = {
  db: {
    saveDraft: async (profile: ProviderProfile): Promise<void> => {
      const { data, error } = await supabase.from('profiles').upsert(profile)
      if (error) {
        logger.error('Error saving draft:', error);
      }
    },

    getDraft: async (): Promise<ProviderProfile | null> => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return null;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          logger.error('Error fetching draft:', error);
          return null;
        }
        return data as ProviderProfile;
      } catch (error) {
        logger.error('Error in getDraft:', error);
        return null;
      }
    },

    deleteDraft: async (): Promise<void> => {
      // Placeholder for delete draft logic
      return Promise.resolve();
    },

    clearDraft: async (): Promise<void> => {
      // Alias for deleteDraft
      return Promise.resolve();
    },

    saveProfile: async (profile: ProviderProfile): Promise<void> => {
      // Alias for saveDraft
      const { data, error } = await supabase.from('profiles').upsert(profile)
      if (error) {
        logger.error('Error saving profile:', error);
      }
    },



    submitApplication: async (profile: ProviderProfile): Promise<{ data: Application | null; error: PostgrestError | null }> => {
      // 1. Submit application
      const { data, error } = await supabase.from('applications').insert({ ...profile, status: 'PENDING' }).select().single();

      if (error) {
        return { data: null, error };
      }

      // ... (rest of function)

      return { data: data as Application, error: null };
    }
  },

  // ...

  availability: {
    getSchedule: async (): Promise<AvailabilitySchedule> => { return {}; },
    updateSchedule: async (schedule: AvailabilitySchedule): Promise<void> => { }
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
