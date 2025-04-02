import axios from 'axios';

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Interfaces
export interface Payment {
  id: string;
  patientId: string;
  patientName: string;
  therapistId: string;
  therapistName: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'upcoming' | 'paid' | 'overdue';
  type: 'session' | 'package' | 'copay' | 'other';
  description: string;
  sessionDate?: string;
  sessionDates?: string[];
  insuranceCoverage?: number;
  patientResponsibility?: number;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'bank' | 'other';
  name: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
  createdAt: string;
}

export interface ProcessPaymentRequest {
  paymentId: string;
  paymentMethodId: string;
  amount: number;
}

// Mock data providers
const mockPayments: Payment[] = [
  {
    id: 'pay1',
    patientId: 'p1',
    patientName: 'Alice Johnson',
    therapistId: 'doctor1',
    therapistName: 'Dr. Sarah Johnson',
    amount: 150.00,
    dueDate: '2025-04-15',
    status: 'upcoming',
    type: 'session',
    description: 'Individual Therapy Session (45 min)',
    sessionDate: '2025-03-25',
    insuranceCoverage: 100.00,
    patientResponsibility: 50.00,
    createdAt: '2025-03-25T12:00:00Z',
    updatedAt: '2025-03-25T12:00:00Z'
  },
  {
    id: 'pay2',
    patientId: 'p2',
    patientName: 'Robert Smith',
    therapistId: 'doctor2',
    therapistName: 'Dr. Michael Lee',
    amount: 200.00,
    dueDate: '2025-04-10',
    status: 'upcoming',
    type: 'session',
    description: 'Initial Assessment (60 min)',
    sessionDate: '2025-03-28',
    insuranceCoverage: 150.00,
    patientResponsibility: 50.00,
    createdAt: '2025-03-28T14:30:00Z',
    updatedAt: '2025-03-28T14:30:00Z'
  },
  {
    id: 'pay3',
    patientId: 'p1',
    patientName: 'Alice Johnson',
    therapistId: 'doctor1',
    therapistName: 'Dr. Sarah Johnson',
    amount: 150.00,
    dueDate: '2025-03-20',
    paidDate: '2025-03-18',
    status: 'paid',
    type: 'session',
    description: 'Individual Therapy Session (45 min)',
    sessionDate: '2025-03-15',
    paymentMethod: 'Credit Card',
    transactionId: 'txn_12345',
    createdAt: '2025-03-15T10:15:00Z',
    updatedAt: '2025-03-18T09:30:00Z'
  }
];

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm1',
    userId: 'p1',
    type: 'card',
    name: 'Visa ending in 4242',
    last4: '4242',
    expMonth: 12,
    expYear: 2025,
    isDefault: true,
    createdAt: '2025-01-15T10:30:00Z'
  },
  {
    id: 'pm2',
    userId: 'p1',
    type: 'bank',
    name: 'Chase Checking Account',
    last4: '6789',
    isDefault: false,
    createdAt: '2025-02-20T14:45:00Z'
  }
];

// Service methods
const paymentService = {
  // Get all payments
  getPayments: async (filters?: {
    patientId?: string;
    therapistId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Payment[]> => {
    try {
      // In a real app, this would be an API call
      // return axios.get(`${API_URL}/api/payments`, { params: filters })
      //   .then(response => response.data);

      // For now, return mock data with filtering
      return new Promise((resolve) => {
        setTimeout(() => {
          let filtered = [...mockPayments];
          
          if (filters) {
            if (filters.patientId) {
              filtered = filtered.filter(payment => payment.patientId === filters.patientId);
            }
            
            if (filters.therapistId) {
              filtered = filtered.filter(payment => payment.therapistId === filters.therapistId);
            }
            
            if (filters.status) {
              filtered = filtered.filter(payment => payment.status === filters.status);
            }
            
            if (filters.startDate) {
              filtered = filtered.filter(payment => new Date(payment.dueDate) >= new Date(filters.startDate!));
            }
            
            if (filters.endDate) {
              filtered = filtered.filter(payment => new Date(payment.dueDate) <= new Date(filters.endDate!));
            }
          }
          
          resolve(filtered);
        }, 300); // Simulated delay
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },
  
  // Get specific payment by ID
  getPayment: async (id: string): Promise<Payment | null> => {
    try {
      // In a real app, this would be an API call
      // return axios.get(`${API_URL}/api/payments/${id}`)
      //   .then(response => response.data);

      // For now, return mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          const payment = mockPayments.find(payment => payment.id === id) || null;
          resolve(payment);
        }, 200); // Simulated delay
      });
    } catch (error) {
      console.error(`Error fetching payment ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new payment
  createPayment: async (payment: Omit<Payment, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Payment> => {
    try {
      // In a real app, this would be an API call
      // return axios.post(`${API_URL}/api/payments`, payment)
      //   .then(response => response.data);

      // For now, return mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          const now = new Date().toISOString();
          const dueDate = new Date(payment.dueDate);
          const today = new Date();
          
          // Determine status based on due date
          let status: 'upcoming' | 'paid' | 'overdue';
          if (payment.paidDate) {
            status = 'paid';
          } else if (dueDate < today) {
            status = 'overdue';
          } else {
            status = 'upcoming';
          }
          
          const newPayment: Payment = {
            ...payment as any, // Type assertion to avoid missing properties
            id: `pay${mockPayments.length + 1}`,
            status,
            createdAt: now,
            updatedAt: now
          };
          
          mockPayments.push(newPayment);
          resolve(newPayment);
        }, 500); // Simulated delay
      });
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },
  
  // Update payment
  updatePayment: async (id: string, updates: Partial<Payment>): Promise<Payment> => {
    try {
      // In a real app, this would be an API call
      // return axios.put(`${API_URL}/api/payments/${id}`, updates)
      //   .then(response => response.data);

      // For now, update mock data
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = mockPayments.findIndex(payment => payment.id === id);
          
          if (index === -1) {
            reject(new Error('Payment not found'));
          } else {
            const updatedPayment = {
              ...mockPayments[index],
              ...updates,
              updatedAt: new Date().toISOString()
            };
            
            mockPayments[index] = updatedPayment;
            resolve(updatedPayment);
          }
        }, 500); // Simulated delay
      });
    } catch (error) {
      console.error(`Error updating payment ${id}:`, error);
      throw error;
    }
  },
  
  // Process a payment
  processPayment: async (request: ProcessPaymentRequest): Promise<Payment> => {
    try {
      // In a real app, this would be an API call
      // return axios.post(`${API_URL}/api/payments/process`, request)
      //   .then(response => response.data);

      // For now, update mock data
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = mockPayments.findIndex(payment => payment.id === request.paymentId);
          
          if (index === -1) {
            reject(new Error('Payment not found'));
          } else {
            const paymentMethod = mockPaymentMethods.find(pm => pm.id === request.paymentMethodId);
            
            if (!paymentMethod) {
              reject(new Error('Payment method not found'));
              return;
            }
            
            const now = new Date().toISOString();
            
            const updatedPayment = {
              ...mockPayments[index],
              status: 'paid',
              paidDate: now.split('T')[0],
              paymentMethod: paymentMethod.name,
              transactionId: `txn_${Math.floor(10000 + Math.random() * 90000)}`,
              updatedAt: now
            };
            
            mockPayments[index] = updatedPayment;
            resolve(updatedPayment);
          }
        }, 1000); // Simulated delay
      });
    } catch (error) {
      console.error(`Error processing payment:`, error);
      throw error;
    }
  },
  
  // Get payment methods for a user
  getPaymentMethods: async (userId: string): Promise<PaymentMethod[]> => {
    try {
      // In a real app, this would be an API call
      // return axios.get(`${API_URL}/api/payment-methods`, { params: { userId } })
      //   .then(response => response.data);

      // For now, return mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          const userPaymentMethods = mockPaymentMethods.filter(pm => pm.userId === userId);
          resolve(userPaymentMethods);
        }, 300); // Simulated delay
      });
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  },
  
  // Add a new payment method
  addPaymentMethod: async (userId: string, method: Omit<PaymentMethod, 'id' | 'userId' | 'createdAt'>): Promise<PaymentMethod> => {
    try {
      // In a real app, this would be an API call
      // return axios.post(`${API_URL}/api/payment-methods`, { userId, ...method })
      //   .then(response => response.data);

      // For now, return mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          const newMethod: PaymentMethod = {
            ...method,
            id: `pm${mockPaymentMethods.length + 1}`,
            userId,
            createdAt: new Date().toISOString()
          };
          
          // If this is the default, update other payment methods
          if (newMethod.isDefault) {
            mockPaymentMethods.forEach(pm => {
              if (pm.userId === userId) {
                pm.isDefault = false;
              }
            });
          }
          
          mockPaymentMethods.push(newMethod);
          resolve(newMethod);
        }, 800); // Simulated delay
      });
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  },
  
  // Delete a payment method
  deletePaymentMethod: async (methodId: string): Promise<void> => {
    try {
      // In a real app, this would be an API call
      // return axios.delete(`${API_URL}/api/payment-methods/${methodId}`)
      //   .then(response => response.data);

      // For now, update mock data
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = mockPaymentMethods.findIndex(pm => pm.id === methodId);
          
          if (index === -1) {
            reject(new Error('Payment method not found'));
          } else {
            const deletedMethod = mockPaymentMethods.splice(index, 1)[0];
            
            // If this was the default, set a new default if available
            if (deletedMethod.isDefault) {
              const userMethods = mockPaymentMethods.filter(pm => pm.userId === deletedMethod.userId);
              if (userMethods.length > 0) {
                userMethods[0].isDefault = true;
              }
            }
            
            resolve();
          }
        }, 500); // Simulated delay
      });
    } catch (error) {
      console.error(`Error deleting payment method ${methodId}:`, error);
      throw error;
    }
  }
};

export default paymentService;