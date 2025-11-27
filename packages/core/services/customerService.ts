
import { supabase } from './supabase';
import { UserProfile } from '../types';

export const customerService = {
  async createCustomer(customerData: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('customers')
      .insert(customerData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getCustomerById(id: string): Promise<UserProfile | undefined> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Error fetching customer from DB:", error.message);
        throw error;
      }

      return data;
    } catch (e) {
      console.error("Customer service error", e);
      return undefined;
    }
  },

  async updateCustomerProfile(customerId: string, updates: Partial<UserProfile>) {
    const { error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', customerId);

    if (error) {
      console.error('Error updating customer profile:', error.message);
      throw error;
    }
  }
};
