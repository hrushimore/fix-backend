// API configuration and service functions for connecting to Spring Boot backend

const API_BASE_URL = 'http://localhost:8080/api';

// Generic API request function
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Handle empty responses
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Customer API
export const customerApi = {
  getAll: (params?: { search?: string; gender?: string; sortBy?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.gender) searchParams.append('gender', params.gender);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    
    const query = searchParams.toString();
    return apiRequest<any[]>(`/customers${query ? `?${query}` : ''}`);
  },
  
  getById: (id: number) => apiRequest<any>(`/customers/${id}`),
  
  create: (customer: any) => apiRequest<any>('/customers', {
    method: 'POST',
    body: JSON.stringify({
      ...customer,
      gender: customer.gender?.toUpperCase() || 'MALE'
    }),
  }),
  
  update: (id: number, customer: any) => apiRequest<any>(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...customer,
      gender: customer.gender?.toUpperCase() || 'MALE'
    }),
  }),
  
  delete: (id: number) => apiRequest<void>(`/customers/${id}`, {
    method: 'DELETE',
  }),
  
  getByPhone: (phone: string) => apiRequest<any>(`/customers/phone/${phone}`),
};

// Employee API
export const employeeApi = {
  getAll: (available?: boolean) => {
    const query = available !== undefined ? `?available=${available}` : '';
    return apiRequest<any[]>(`/employees${query}`);
  },
  
  getById: (id: number) => apiRequest<any>(`/employees/${id}`),
  
  create: (employee: any) => apiRequest<any>('/employees', {
    method: 'POST',
    body: JSON.stringify(employee),
  }),
  
  update: (id: number, employee: any) => apiRequest<any>(`/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(employee),
  }),
  
  delete: (id: number) => apiRequest<void>(`/employees/${id}`, {
    method: 'DELETE',
  }),
  
  updateAvailability: (id: number, available: boolean) => apiRequest<any>(`/employees/${id}/availability?available=${available}`, {
    method: 'PATCH',
  }),
  
  getByRole: (role: string) => apiRequest<any[]>(`/employees/role/${role}`),
};

// Service API
export const serviceApi = {
  getAll: (params?: { category?: string; search?: string; sortBy?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    
    const query = searchParams.toString();
    return apiRequest<any[]>(`/services${query ? `?${query}` : ''}`);
  },
  
  getById: (id: number) => apiRequest<any>(`/services/${id}`),
  
  create: (service: any) => apiRequest<any>('/services', {
    method: 'POST',
    body: JSON.stringify(service),
  }),
  
  update: (id: number, service: any) => apiRequest<any>(`/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(service),
  }),
  
  delete: (id: number) => apiRequest<void>(`/services/${id}`, {
    method: 'DELETE',
  }),
};

// Appointment API
export const appointmentApi = {
  getAll: (params?: { date?: string; employeeId?: number; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.date) searchParams.append('date', params.date);
    if (params?.employeeId) searchParams.append('employeeId', params.employeeId.toString());
    if (params?.status) searchParams.append('status', params.status);
    
    const query = searchParams.toString();
    return apiRequest<any[]>(`/appointments${query ? `?${query}` : ''}`);
  },
  
  getById: (id: number) => apiRequest<any>(`/appointments/${id}`),
  
  create: (appointment: any) => apiRequest<any>('/appointments', {
    method: 'POST',
    body: JSON.stringify({
      ...appointment,
      customer: { id: appointment.customerId },
      employee: { id: appointment.employeeId },
      services: appointment.serviceIds?.map((id: number) => ({ id })) || [],
      appointmentDate: appointment.date,
      appointmentTime: appointment.time,
    }),
  }),
  
  update: (id: number, appointment: any) => apiRequest<any>(`/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...appointment,
      customer: { id: appointment.customerId },
      employee: { id: appointment.employeeId },
      services: appointment.serviceIds?.map((id: number) => ({ id })) || [],
      appointmentDate: appointment.date,
      appointmentTime: appointment.time,
    }),
  }),
  
  delete: (id: number) => apiRequest<void>(`/appointments/${id}`, {
    method: 'DELETE',
  }),
  
  updateStatus: (id: number, status: string) => apiRequest<any>(`/appointments/${id}/status?status=${status}`, {
    method: 'PATCH',
  }),
  
  checkAvailability: (employeeId: number, date: string, time: string) => 
    apiRequest<boolean>(`/appointments/availability?employeeId=${employeeId}&date=${date}&time=${time}`),
};

// Tally API
export const tallyApi = {
  getAll: (params?: { date?: string; status?: string; paymentMethod?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.date) searchParams.append('date', params.date);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.paymentMethod) searchParams.append('paymentMethod', params.paymentMethod);
    
    const query = searchParams.toString();
    return apiRequest<any[]>(`/tally${query ? `?${query}` : ''}`);
  },
  
  getById: (id: number) => apiRequest<any>(`/tally/${id}`),
  
  create: (record: any) => apiRequest<any>('/tally', {
    method: 'POST',
    body: JSON.stringify({
      ...record,
      servicesJson: JSON.stringify(record.services),
      paymentMethod: record.paymentMethod?.toUpperCase() || 'CASH',
      paymentStatus: record.paymentStatus?.toUpperCase() || 'PENDING',
    }),
  }),
  
  update: (id: number, record: any) => apiRequest<any>(`/tally/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...record,
      servicesJson: JSON.stringify(record.services),
      paymentMethod: record.paymentMethod?.toUpperCase() || 'CASH',
      paymentStatus: record.paymentStatus?.toUpperCase() || 'PENDING',
    }),
  }),
  
  delete: (id: number) => apiRequest<void>(`/tally/${id}`, {
    method: 'DELETE',
  }),
  
  updatePaymentStatus: (id: number, status: string, upiTransactionId?: string) => {
    const params = new URLSearchParams({ status });
    if (upiTransactionId) params.append('upiTransactionId', upiTransactionId);
    
    return apiRequest<any>(`/tally/${id}/payment-status?${params.toString()}`, {
      method: 'PATCH',
    });
  },
  
  getTotalRevenue: (date: string) => apiRequest<number>(`/tally/revenue?date=${date}`),
};

// Health check
export const healthCheck = () => apiRequest<{ status: string }>('/health');