import { describe, it, expect, vi, afterEach } from 'vitest';
import { customerService } from './customerService';
import { UserProfile } from '../types';
import { supabase } from './supabase';

vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(),
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
  },
}));

describe('customerService', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createCustomer', () => {
    it('should create a new customer', async () => {
      const newCustomer: UserProfile = {
        id: '123',
        name: 'Test Customer',
        avatarUrl: 'http://example.com/avatar.png',
      };

      const singleMock = vi.fn().mockResolvedValue({ data: newCustomer, error: null });
      const selectMock = vi.fn(() => ({ single: singleMock }));
      const insertMock = vi.fn(() => ({ select: selectMock }));
      (supabase.from as any).mockReturnValue({ insert: insertMock });

      const customer = await customerService.createCustomer(newCustomer);

      expect(supabase.from).toHaveBeenCalledWith('customers');
      expect(insertMock).toHaveBeenCalledWith(newCustomer);
      expect(selectMock).toHaveBeenCalled();
      expect(singleMock).toHaveBeenCalled();
      expect(customer).toEqual(newCustomer);
    });
  });

  describe('getCustomerById', () => {
    it('should retrieve a customer by ID', async () => {
      const customerId = '123';
      const mockCustomer: UserProfile = {
        id: customerId,
        name: 'Test Customer',
        avatarUrl: 'http://example.com/avatar.png',
      };

      const singleMock = vi.fn().mockResolvedValue({ data: mockCustomer, error: null });
      const eqMock = vi.fn(() => ({ single: singleMock }));
      const selectMock = vi.fn(() => ({ eq: eqMock }));
      (supabase.from as any).mockReturnValue({ select: selectMock });

      const customer = await customerService.getCustomerById(customerId);

      expect(supabase.from).toHaveBeenCalledWith('customers');
      expect(selectMock).toHaveBeenCalledWith('*');
      expect(eqMock).toHaveBeenCalledWith('id', customerId);
      expect(singleMock).toHaveBeenCalled();
      expect(customer).toEqual(mockCustomer);
    });
  });

  describe('updateCustomerProfile', () => {
    it('should update a customer successfully', async () => {
      const customerId = '123';
      const updates = { name: 'Updated Customer' };

      const eqMock = vi.fn().mockResolvedValue({ error: null });
      const updateMock = vi.fn(() => ({ eq: eqMock }));
      (supabase.from as any).mockReturnValue({ update: updateMock });

      await customerService.updateCustomerProfile(customerId, updates);

      expect(supabase.from).toHaveBeenCalledWith('customers');
      expect(updateMock).toHaveBeenCalledWith(updates);
      expect(eqMock).toHaveBeenCalledWith('id', customerId);
    });
  });
});
