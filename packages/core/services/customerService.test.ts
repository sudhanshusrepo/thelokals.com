
import { customerService } from './customerService';
import { UserProfile } from '../types';
import { supabase } from './supabase';

jest.mock('./supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({ 
        eq: jest.fn(() => ({ 
          single: jest.fn(), 
        })),
        single: jest.fn(),
      })),
      insert: jest.fn(() => ({ 
        select: jest.fn(() => ({ 
          single: jest.fn(), 
        })),
      })),
      update: jest.fn(() => ({ 
        eq: jest.fn(), 
      })),
    })),
  },
}));

describe('customerService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCustomer', () => {
    it('should create a new customer', async () => {
      const newCustomer: UserProfile = {
        id: '123',
        name: 'Test Customer',
        avatarUrl: 'http://example.com/avatar.png',
      };

      const singleMock = jest.fn().mockResolvedValue({ data: newCustomer, error: null });
      const selectMock = jest.fn(() => ({ single: singleMock }));
      const insertMock = jest.fn(() => ({ select: selectMock }));
      (supabase.from as jest.Mock).mockReturnValue({ insert: insertMock });

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

      const singleMock = jest.fn().mockResolvedValue({ data: mockCustomer, error: null });
      const eqMock = jest.fn(() => ({ single: singleMock }));
      const selectMock = jest.fn(() => ({ eq: eqMock }));
      (supabase.from as jest.Mock).mockReturnValue({ select: selectMock });

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

      const eqMock = jest.fn().mockResolvedValue({ error: null });
      const updateMock = jest.fn(() => ({ eq: eqMock }));
      (supabase.from as jest.Mock).mockReturnValue({ update: updateMock });

      await customerService.updateCustomerProfile(customerId, updates);

      expect(supabase.from).toHaveBeenCalledWith('customers');
      expect(updateMock).toHaveBeenCalledWith(updates);
      expect(eqMock).toHaveBeenCalledWith('id', customerId);
    });
  });
});
