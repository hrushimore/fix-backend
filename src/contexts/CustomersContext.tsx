import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { customerDb, initDatabase } from '@/lib/database';
import { customerApi } from '@/lib/api';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  gender: 'male' | 'female';
  visitCount: number;
  totalSpent: number;
  lastVisit: string;
  preferredServices: string[];
  notes?: string;
  photo: string;
}

interface CustomersContextType {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'visitCount' | 'totalSpent' | 'lastVisit'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
}

const CustomersContext = createContext<CustomersContextType | undefined>(undefined);

// Flag to track if we're using backend or browser storage
let useBackend = false;

export function CustomersProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Initialize database and load customers
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const dbType = await initDatabase();
        useBackend = dbType === 'backend';
        
        if (useBackend) {
          // Load from backend API
          const apiCustomers = await customerApi.getAll();
          // Transform backend data to frontend format
          const transformedCustomers = apiCustomers.map(customer => ({
            ...customer,
            id: customer.id.toString(),
            gender: customer.gender.toLowerCase(),
            lastVisit: customer.lastVisit || new Date().toISOString(),
            preferredServices: customer.preferredServices || [],
            notes: customer.notes || '',
            photo: customer.photo || ''
          }));
          setCustomers(transformedCustomers);
        } else {
          // Load from browser storage
          const dbCustomers = customerDb.getAll();
          setCustomers(dbCustomers);
        }
      } catch (error) {
        console.error('Error loading customers from database:', error);
        // Fallback to browser storage
        const dbCustomers = customerDb.getAll();
        setCustomers(dbCustomers);
      }
    };
    
    loadCustomers();
  }, []);

  const addCustomer = (customerData: Omit<Customer, 'id' | 'visitCount' | 'totalSpent' | 'lastVisit'>) => {
    try {
      if (useBackend) {
        // Create via API
        customerApi.create({
          ...customerData,
          visitCount: 0,
          totalSpent: 0.0,
          lastVisit: new Date().toISOString(),
          preferredServices: customerData.preferredServices || [],
          notes: customerData.notes || '',
          photo: customerData.photo || ''
        }).then(apiCustomer => {
          const transformedCustomer = {
            ...apiCustomer,
            id: apiCustomer.id.toString(),
            gender: apiCustomer.gender.toLowerCase(),
            lastVisit: apiCustomer.lastVisit || new Date().toISOString(),
            preferredServices: apiCustomer.preferredServices || [],
            notes: apiCustomer.notes || '',
            photo: apiCustomer.photo || ''
          };
          setCustomers(prev => [...prev, transformedCustomer]);
        }).catch(error => {
          console.error('Error creating customer via API:', error);
          // Fallback to browser storage
          const newCustomer = customerDb.create(customerData);
          setCustomers(prev => [...prev, newCustomer]);
        });
        
        // Return temporary customer for immediate UI update
        const tempCustomer = {
          ...customerData,
          id: `temp-${Date.now()}`,
          visitCount: 0,
          totalSpent: 0,
          lastVisit: new Date().toISOString()
        };
        return tempCustomer;
      } else {
        // Create via browser storage
        const newCustomer = customerDb.create(customerData);
        setCustomers(prev => [...prev, newCustomer]);
        return newCustomer;
      }
    } catch (error) {
      console.error('Error adding customer to database:', error);
      throw error;
    }
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    try {
      if (useBackend && !id.startsWith('temp-')) {
        // Update via API
        const numericId = parseInt(id);
        if (!isNaN(numericId)) {
          customerApi.update(numericId, {
            ...updates,
            gender: updates.gender?.toUpperCase()
          }).then(() => {
            setCustomers(prev => 
              prev.map(customer => 
                customer.id === id ? { ...customer, ...updates } : customer
              )
            );
          }).catch(error => {
            console.error('Error updating customer via API:', error);
            // Fallback to browser storage
            customerDb.update(id, updates);
            setCustomers(prev => 
              prev.map(customer => 
                customer.id === id ? { ...customer, ...updates } : customer
              )
            );
          });
        }
      } else {
        // Update via browser storage
        customerDb.update(id, updates);
        setCustomers(prev => 
          prev.map(customer => 
            customer.id === id ? { ...customer, ...updates } : customer
          )
        );
      }
    } catch (error) {
      console.error('Error updating customer in database:', error);
      throw error;
    }
  };

  const deleteCustomer = (id: string) => {
    try {
      if (useBackend && !id.startsWith('temp-')) {
        // Delete via API
        const numericId = parseInt(id);
        if (!isNaN(numericId)) {
          customerApi.delete(numericId).then(() => {
            setCustomers(prev => prev.filter(customer => customer.id !== id));
          }).catch(error => {
            console.error('Error deleting customer via API:', error);
            // Fallback to browser storage
            customerDb.delete(id);
            setCustomers(prev => prev.filter(customer => customer.id !== id));
          });
        }
      } else {
        // Delete via browser storage
        customerDb.delete(id);
        setCustomers(prev => prev.filter(customer => customer.id !== id));
      }
    } catch (error) {
      console.error('Error deleting customer from database:', error);
      throw error;
    }
  };

  return (
    <CustomersContext.Provider value={{ customers, addCustomer, updateCustomer, deleteCustomer }}>
      {children}
    </CustomersContext.Provider>
  );
}

export function useCustomers() {
  const context = useContext(CustomersContext);
  if (context === undefined) {
    throw new Error('useCustomers must be used within a CustomersProvider');
  }
  return context;
}
