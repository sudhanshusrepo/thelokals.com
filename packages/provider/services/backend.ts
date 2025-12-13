import { ProviderProfile } from '../types';
import { supabase } from '@thelocals/core';

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
          console.error('Error fetching draft:', error);
          return null;
        }
        return data as ProviderProfile;
      } catch (error) {
        console.error('Error in getDraft:', error);
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
        console.error('Error saving profile:', error);
      }
    },

    submitApplication: async (profile: ProviderProfile): Promise<{ data: any; error: any }> => {
      // 1. Submit application
      const { data, error } = await supabase.from('applications').insert({ ...profile, status: 'PENDING' });
      if (error) {
        return { data: null, error };
      }

      // 2. Auto-verify for now to allow immediate booking access
      const { error: profileError } = await supabase.from('profiles').update({
        registration_status: 'verified'
      }).eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (profileError) {
        console.error("Failed to auto-verify profile", profileError);
      }

      return { data, error: null };
    }
  },

  submitRegistration: async (profile: ProviderProfile): Promise<void> => {
    // Top level alias for db.submitApplication
    const { error } = await backend.db.submitApplication(profile);
    if (error) throw error;
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

  location: {
    update: async (lat: number, lng: number): Promise<void> => {
      const { error } = await supabase.rpc('update_provider_location', {
        p_lat: lat,
        p_lng: lng
      });
      if (error) {
        console.error('Location update failed:', error);
        throw new Error(error.message);
      }
    }
  },

  availability: {
    getSchedule: async (): Promise<any> => { return {}; },
    updateSchedule: async (schedule: any): Promise<void> => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('provider_availability')
        .upsert(
          schedule.map((slot: any) => ({
            provider_id: user?.id,
            day_of_week: slot.dayOfWeek,
            start_time: slot.startTime,
            end_time: slot.endTime,
            is_available: slot.isAvailable
          }))
        );

      if (error) throw error;
    },
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