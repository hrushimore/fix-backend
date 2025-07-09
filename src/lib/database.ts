import { Customer } from '@/contexts/CustomersContext';
import { Employee } from '@/contexts/StaffContext';
import { TallyItem } from '@/contexts/TallyContext';
import { customerApi, employeeApi, serviceApi, appointmentApi, tallyApi } from './api';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Backend health check with better error handling
async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const response = await fetch('http://localhost:8080/api/customers', {
      method: 'HEAD', // Use HEAD to avoid downloading data
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('Backend health check timed out');
    } else {
      console.warn('Backend health check failed:', error.message);
    }
    return false;
  }
}

// Browser storage keys
const STORAGE_KEYS = {
  customers: 'salon_customers',
  employees: 'salon_employees',
  appointments: 'salon_appointments',
  tally: 'salon_tally',
  services: 'salon_services',
  products: 'salon_products'
};

// Browser storage utilities
const browserStorage = {
  get: (key: string) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  
  set: (key: string, data: any[]) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }
};

// Initialize database
export async function initDatabase() {
  if (isBrowser) {
    const isBackendHealthy = await checkBackendHealth();
    
    if (isBackendHealthy) {
      console.log('Connected to Spring Boot backend');
      console.log('✅ Backend Status: Online');
      return 'backend';
    } else {
      console.warn('❌ Backend Status: Offline - Falling back to browser storage');
      console.warn('To enable backend features:');
      console.warn('1. Navigate to the backend directory: cd backend');
      console.warn('2. Start the Spring Boot server: mvn spring-boot:run');
      console.warn('3. Ensure MySQL is running with the salon_management database');
      
      // Initialize browser storage with mock data if empty
      await initBrowserStorage();
      console.log('Browser storage initialized');
      return 'browser';
    }
  } else {
    // For server-side, we would initialize SQLite here
    console.log('Server-side database would be initialized here');
    return null;
  }
}

// Initialize browser storage with mock data
async function initBrowserStorage() {
  // Check if data already exists
  const existingCustomers = browserStorage.get(STORAGE_KEYS.customers);
  
  if (existingCustomers.length === 0) {
    console.log('📦 Initializing browser storage with mock data...');
    
    // Import mock data
    const { mockCustomers, mockEmployees, mockServices, mockProducts } = await import('../data/mockData');
    
    // Store mock data in localStorage
    browserStorage.set(STORAGE_KEYS.customers, mockCustomers);
    browserStorage.set(STORAGE_KEYS.employees, mockEmployees);
    browserStorage.set(STORAGE_KEYS.services, mockServices);
    browserStorage.set(STORAGE_KEYS.products, mockProducts);
    browserStorage.set(STORAGE_KEYS.appointments, []);
    browserStorage.set(STORAGE_KEYS.tally, []);
    
    console.log('✅ Mock data loaded into browser storage');
  } else {
    console.log('📦 Browser storage already initialized');
  }
}

// Customer operations
export const customerDb = {
  getAll: (): Customer[] => {
    if (isBrowser && typeof window !== 'undefined') {
      return browserStorage.get(STORAGE_KEYS.customers);
    }
    return [];
  },

  getById: (id: string): Customer | null => {
    if (isBrowser) {
      const customers = browserStorage.get(STORAGE_KEYS.customers);
      return customers.find((c: Customer) => c.id === id) || null;
    }
    return null;
  },

  create: (customer: Omit<Customer, 'id' | 'visitCount' | 'totalSpent' | 'lastVisit'>): Customer => {
    // Try backend first, fallback to browser storage
    try {
      // This will be handled by the context layer
      const id = `cust-${Date.now()}`;
      const now = new Date().toISOString();
      
      const newCustomer: Customer = {
        ...customer,
        id,
        visitCount: 0,
        totalSpent: 0,
        lastVisit: now
      };

      if (isBrowser) {
        const customers = browserStorage.get(STORAGE_KEYS.customers);
        customers.push(newCustomer);
        browserStorage.set(STORAGE_KEYS.customers, customers);
      }

      return newCustomer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  update: (id: string, updates: Partial<Customer>): void => {
    if (isBrowser) {
      const customers = browserStorage.get(STORAGE_KEYS.customers);
      const index = customers.findIndex((c: Customer) => c.id === id);
      if (index !== -1) {
        customers[index] = { ...customers[index], ...updates };
        browserStorage.set(STORAGE_KEYS.customers, customers);
      }
    }
  },

  delete: (id: string): void => {
    if (isBrowser) {
      const customers = browserStorage.get(STORAGE_KEYS.customers);
      const filtered = customers.filter((c: Customer) => c.id !== id);
      browserStorage.set(STORAGE_KEYS.customers, filtered);
    }
  }
};

// Employee operations
export const employeeDb = {
  getAll: (): Employee[] => {
    if (isBrowser && typeof window !== 'undefined') {
      return browserStorage.get(STORAGE_KEYS.employees);
    }
    return [];
  },

  create: (employee: Omit<Employee, 'id'>): Employee => {
    const id = `emp-${Date.now()}`;
    const newEmployee: Employee = { ...employee, id };

    if (isBrowser) {
      const employees = browserStorage.get(STORAGE_KEYS.employees);
      employees.push(newEmployee);
      browserStorage.set(STORAGE_KEYS.employees, employees);
    }

    return newEmployee;
  },

  update: (id: string, updates: Partial<Employee>): void => {
    if (isBrowser) {
      const employees = browserStorage.get(STORAGE_KEYS.employees);
      const index = employees.findIndex((e: Employee) => e.id === id);
      if (index !== -1) {
        employees[index] = { ...employees[index], ...updates };
        browserStorage.set(STORAGE_KEYS.employees, employees);
      }
    }
  },

  delete: (id: string): void => {
    if (isBrowser) {
      const employees = browserStorage.get(STORAGE_KEYS.employees);
      const filtered = employees.filter((e: Employee) => e.id !== id);
      browserStorage.set(STORAGE_KEYS.employees, filtered);
    }
  }
};

// Appointment operations
export const appointmentDb = {
  getAll: () => {
    if (isBrowser && typeof window !== 'undefined') {
      return browserStorage.get(STORAGE_KEYS.appointments);
    }
    return [];
  },

  create: (appointment: any) => {
    if (isBrowser) {
      const appointments = browserStorage.get(STORAGE_KEYS.appointments);
      appointments.push(appointment);
      browserStorage.set(STORAGE_KEYS.appointments, appointments);
    }
  },

  update: (id: string, updates: any) => {
    if (isBrowser) {
      const appointments = browserStorage.get(STORAGE_KEYS.appointments);
      const index = appointments.findIndex((a: any) => a.id === id);
      if (index !== -1) {
        appointments[index] = { ...appointments[index], ...updates };
        browserStorage.set(STORAGE_KEYS.appointments, appointments);
      }
    }
  }
};

// Tally operations
export const tallyDb = {
  getAll: (): TallyItem[] => {
    if (isBrowser && typeof window !== 'undefined') {
      return browserStorage.get(STORAGE_KEYS.tally);
    }
    return [];
  },

  create: (item: Omit<TallyItem, 'id' | 'paymentDate' | 'upiTransactionId'>): TallyItem => {
    const id = `tally-${Date.now()}`;
    const paymentDate = new Date().toISOString();
    
    const newItem: TallyItem = {
      ...item,
      id,
      paymentDate,
      upiTransactionId: undefined
    };

    if (isBrowser) {
      const tallyItems = browserStorage.get(STORAGE_KEYS.tally);
      tallyItems.push(newItem);
      browserStorage.set(STORAGE_KEYS.tally, tallyItems);
    }

    return newItem;
  },

  updatePaymentStatus: (id: string, status: 'completed' | 'failed' | 'cancelled', upiTransactionId?: string) => {
    if (isBrowser) {
      const tallyItems = browserStorage.get(STORAGE_KEYS.tally);
      const index = tallyItems.findIndex((item: TallyItem) => item.id === id);
      if (index !== -1) {
        tallyItems[index] = {
          ...tallyItems[index],
          paymentStatus: status,
          upiTransactionId: upiTransactionId || tallyItems[index].upiTransactionId
        };
        browserStorage.set(STORAGE_KEYS.tally, tallyItems);
      }
    }
  }
};

// Service operations
export const serviceDb = {
  getAll: () => {
    if (isBrowser && typeof window !== 'undefined') {
      return browserStorage.get(STORAGE_KEYS.services);
    }
    return [];
  },

  create: (service: any) => {
    if (isBrowser) {
      const services = browserStorage.get(STORAGE_KEYS.services);
      services.push(service);
      browserStorage.set(STORAGE_KEYS.services, services);
    }
  },

  update: (id: string, updates: any) => {
    if (isBrowser) {
      const services = browserStorage.get(STORAGE_KEYS.services);
      const index = services.findIndex((s: any) => s.id === id);
      if (index !== -1) {
        services[index] = { ...services[index], ...updates };
        browserStorage.set(STORAGE_KEYS.services, services);
      }
    }
  },

  delete: (id: string) => {
    if (isBrowser) {
      const services = browserStorage.get(STORAGE_KEYS.services);
      const filtered = services.filter((s: any) => s.id !== id);
      browserStorage.set(STORAGE_KEYS.services, filtered);
    }
  }
};

// Product operations
export const productDb = {
  getAll: () => {
    if (isBrowser && typeof window !== 'undefined') {
      return browserStorage.get(STORAGE_KEYS.products);
    }
    return [];
  },

  create: (product: any) => {
    if (isBrowser) {
      const products = browserStorage.get(STORAGE_KEYS.products);
      products.push(product);
      browserStorage.set(STORAGE_KEYS.products, products);
    }
  },

  update: (id: string, updates: any) => {
    if (isBrowser) {
      const products = browserStorage.get(STORAGE_KEYS.products);
      const index = products.findIndex((p: any) => p.id === id);
      if (index !== -1) {
        products[index] = { ...products[index], ...updates };
        browserStorage.set(STORAGE_KEYS.products, products);
      }
    }
  },

  delete: (id: string) => {
    if (isBrowser) {
      const products = browserStorage.get(STORAGE_KEYS.products);
      const filtered = products.filter((p: any) => p.id !== id);
      browserStorage.set(STORAGE_KEYS.products, filtered);
    }
  }
};