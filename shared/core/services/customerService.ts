
import { supabase } from './supabase';
import { UserProfile } from '../types';
import { logger } from './logger';

/**
 * @module customerService
 * @description A service for managing customer data.
 */
export const customerService = {
  /**
   * Creates a new customer profile.
   * @param {Partial<UserProfile>} customerData - The data for the new customer.
   * @returns {Promise<UserProfile>} The newly created customer profile.
   * @throws {Error} If the customer creation fails.
   */
  async createCustomer(customerData: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('customers')
      .insert(customerData)
      .select()
      .single();

    if (error) {
      logger.error('Error creating customer', { error });
      throw error;
    }
    return data;
  },

  /**
   * Retrieves a customer profile by their ID.
   * @param {string} id - The ID of the customer to retrieve.
   * @returns {Promise<UserProfile | undefined>} The customer profile, or undefined if not found.
   * @throws {Error} If the database query fails.
   */
  async getCustomerById(id: string): Promise<UserProfile | undefined> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        logger.error("Error fetching customer from DB", { error });
        throw error;
      }

      return data;
    } catch (e) {
      logger.error("Customer service error", { error: e });
      return undefined;
    }
  },

  /**
   * Updates a customer's profile.
   * @param {string} customerId - The ID of the customer to update.
   * @param {Partial<UserProfile>} updates - An object containing the fields to update.
   * @throws {Error} If the database update fails.
   */
  async updateCustomerProfile(customerId: string, updates: Partial<UserProfile>) {
    const { error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', customerId);

    if (error) {
      logger.error('Error updating customer profile', { error });
      throw error;
    }
  }
};
