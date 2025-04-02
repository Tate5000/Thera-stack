import axios from 'axios';

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Interfaces
export interface Superbill {
  id: string;
  patientId: string;
  patientName: string;
  therapistId: string;
  therapistName: string;
  sessionDate: string;
  cptCodes: string[];
  diagnosisCodes: string[];
  amount: number;
  insuranceProvider: string;
  status: 'pending' | 'submitted' | 'paid' | 'denied';
  submittedDate?: string;
  claimNumber?: string;
  paidDate?: string;
  paidAmount?: number;
  deniedReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsuranceProvider {
  id: string;
  name: string;
  payer_id: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

export interface BillingCodeInfo {
  code: string;
  description: string;
  type: 'cpt' | 'icd';
  defaultRate?: number;
}

// Mock data providers - in a real app, these would be API endpoints
const mockSuperbills: Superbill[] = [
  {
    id: 'sb1',
    patientId: 'p1',
    patientName: 'Alice Johnson',
    therapistId: 'doctor1',
    therapistName: 'Dr. Sarah Johnson',
    sessionDate: '2025-03-20',
    cptCodes: ['90834', '90837'],
    diagnosisCodes: ['F41.1', 'F32.9'],
    amount: 150.00,
    insuranceProvider: 'Blue Cross',
    status: 'pending',
    createdAt: '2025-03-21T10:30:00Z',
    updatedAt: '2025-03-21T10:30:00Z'
  },
  {
    id: 'sb2',
    patientId: 'p2',
    patientName: 'Robert Smith',
    therapistId: 'doctor2',
    therapistName: 'Dr. Michael Lee',
    sessionDate: '2025-03-19',
    cptCodes: ['90791'],
    diagnosisCodes: ['F43.1'],
    amount: 200.00,
    insuranceProvider: 'Aetna',
    status: 'submitted',
    submittedDate: '2025-03-20',
    claimNumber: 'CLM-20250320-1234',
    createdAt: '2025-03-19T14:20:00Z',
    updatedAt: '2025-03-20T09:15:00Z'
  },
  {
    id: 'sb3',
    patientId: 'p3',
    patientName: 'Emily Davis',
    therapistId: 'doctor1',
    therapistName: 'Dr. Sarah Johnson',
    sessionDate: '2025-03-18',
    cptCodes: ['90834'],
    diagnosisCodes: ['F40.10'],
    amount: 125.00,
    insuranceProvider: 'UnitedHealthcare',
    status: 'paid',
    submittedDate: '2025-03-19',
    claimNumber: 'CLM-20250319-5678',
    paidDate: '2025-03-25',
    paidAmount: 100.00,
    createdAt: '2025-03-18T16:45:00Z',
    updatedAt: '2025-03-25T11:20:00Z'
  }
];

const mockInsuranceProviders: InsuranceProvider[] = [
  {
    id: 'ins1',
    name: 'Blue Cross Blue Shield',
    payer_id: 'BCBS123',
    address: '123 Insurance Way, Chicago, IL 60601',
    phone: '800-555-1234',
    email: 'claims@bcbs.com',
    website: 'https://www.bcbs.com'
  },
  {
    id: 'ins2',
    name: 'Aetna',
    payer_id: 'AETNA456',
    address: '456 Health Blvd, Hartford, CT 06103',
    phone: '800-555-2345',
    email: 'claims@aetna.com',
    website: 'https://www.aetna.com'
  },
  {
    id: 'ins3',
    name: 'UnitedHealthcare',
    payer_id: 'UHC789',
    address: '789 Medical Drive, Minneapolis, MN 55439',
    phone: '800-555-3456',
    email: 'claims@uhc.com',
    website: 'https://www.uhc.com'
  }
];

const mockBillingCodes: Record<string, BillingCodeInfo> = {
  // CPT Codes
  '90791': { code: '90791', description: 'Psychiatric diagnostic evaluation', type: 'cpt', defaultRate: 200.00 },
  '90832': { code: '90832', description: 'Psychotherapy, 30 minutes', type: 'cpt', defaultRate: 75.00 },
  '90834': { code: '90834', description: 'Psychotherapy, 45 minutes', type: 'cpt', defaultRate: 125.00 },
  '90837': { code: '90837', description: 'Psychotherapy, 60 minutes', type: 'cpt', defaultRate: 175.00 },
  '90853': { code: '90853', description: 'Group psychotherapy', type: 'cpt', defaultRate: 50.00 },
  
  // ICD-10 Codes
  'F32.9': { code: 'F32.9', description: 'Major depressive disorder, single episode, unspecified', type: 'icd' },
  'F41.1': { code: 'F41.1', description: 'Generalized anxiety disorder', type: 'icd' },
  'F43.1': { code: 'F43.1', description: 'Post-traumatic stress disorder', type: 'icd' },
  'F40.10': { code: 'F40.10', description: 'Social anxiety disorder, unspecified', type: 'icd' },
  'F33.1': { code: 'F33.1', description: 'Major depressive disorder, recurrent, moderate', type: 'icd' }
};

// Service methods
const billingService = {
  // Get all superbills
  getSuperbills: async (filters?: {
    patientId?: string;
    therapistId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Superbill[]> => {
    try {
      // In a real app, this would be an API call
      // return axios.get(`${API_URL}/api/billing/superbills`, { params: filters })
      //   .then(response => response.data);

      // For now, return mock data with filtering
      return new Promise((resolve) => {
        setTimeout(() => {
          let filtered = [...mockSuperbills];
          
          if (filters) {
            if (filters.patientId) {
              filtered = filtered.filter(bill => bill.patientId === filters.patientId);
            }
            
            if (filters.therapistId) {
              filtered = filtered.filter(bill => bill.therapistId === filters.therapistId);
            }
            
            if (filters.status) {
              filtered = filtered.filter(bill => bill.status === filters.status);
            }
            
            if (filters.startDate) {
              filtered = filtered.filter(bill => new Date(bill.sessionDate) >= new Date(filters.startDate!));
            }
            
            if (filters.endDate) {
              filtered = filtered.filter(bill => new Date(bill.sessionDate) <= new Date(filters.endDate!));
            }
          }
          
          resolve(filtered);
        }, 300); // Simulated delay
      });
    } catch (error) {
      console.error('Error fetching superbills:', error);
      throw error;
    }
  },
  
  // Get specific superbill by ID
  getSuperbill: async (id: string): Promise<Superbill | null> => {
    try {
      // In a real app, this would be an API call
      // return axios.get(`${API_URL}/api/billing/superbills/${id}`)
      //   .then(response => response.data);

      // For now, return mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          const bill = mockSuperbills.find(bill => bill.id === id) || null;
          resolve(bill);
        }, 200); // Simulated delay
      });
    } catch (error) {
      console.error(`Error fetching superbill ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new superbill
  createSuperbill: async (superbill: Omit<Superbill, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Superbill> => {
    try {
      // In a real app, this would be an API call
      // return axios.post(`${API_URL}/api/billing/superbills`, superbill)
      //   .then(response => response.data);

      // For now, return mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          const now = new Date().toISOString();
          const newSuperbill: Superbill = {
            ...superbill as any, // Type assertion to avoid missing properties
            id: `sb${mockSuperbills.length + 1}`,
            status: 'pending',
            createdAt: now,
            updatedAt: now
          };
          
          mockSuperbills.push(newSuperbill);
          resolve(newSuperbill);
        }, 500); // Simulated delay
      });
    } catch (error) {
      console.error('Error creating superbill:', error);
      throw error;
    }
  },
  
  // Update superbill
  updateSuperbill: async (id: string, updates: Partial<Superbill>): Promise<Superbill> => {
    try {
      // In a real app, this would be an API call
      // return axios.put(`${API_URL}/api/billing/superbills/${id}`, updates)
      //   .then(response => response.data);

      // For now, update mock data
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = mockSuperbills.findIndex(bill => bill.id === id);
          
          if (index === -1) {
            reject(new Error('Superbill not found'));
          } else {
            const updatedSuperbill = {
              ...mockSuperbills[index],
              ...updates,
              updatedAt: new Date().toISOString()
            };
            
            mockSuperbills[index] = updatedSuperbill;
            resolve(updatedSuperbill);
          }
        }, 500); // Simulated delay
      });
    } catch (error) {
      console.error(`Error updating superbill ${id}:`, error);
      throw error;
    }
  },
  
  // Submit superbill to insurance
  submitSuperbill: async (id: string): Promise<Superbill> => {
    try {
      // In a real app, this would be an API call
      // return axios.post(`${API_URL}/api/billing/superbills/${id}/submit`)
      //   .then(response => response.data);

      // For now, update mock data
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = mockSuperbills.findIndex(bill => bill.id === id);
          
          if (index === -1) {
            reject(new Error('Superbill not found'));
          } else {
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            
            const updatedSuperbill = {
              ...mockSuperbills[index],
              status: 'submitted',
              submittedDate: today,
              claimNumber: `CLM-${today.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
              updatedAt: now.toISOString()
            };
            
            mockSuperbills[index] = updatedSuperbill;
            resolve(updatedSuperbill);
          }
        }, 800); // Simulated delay
      });
    } catch (error) {
      console.error(`Error submitting superbill ${id}:`, error);
      throw error;
    }
  },
  
  // Get insurance providers
  getInsuranceProviders: async (): Promise<InsuranceProvider[]> => {
    try {
      // In a real app, this would be an API call
      // return axios.get(`${API_URL}/api/billing/insurance-providers`)
      //   .then(response => response.data);

      // For now, return mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockInsuranceProviders);
        }, 300); // Simulated delay
      });
    } catch (error) {
      console.error('Error fetching insurance providers:', error);
      throw error;
    }
  },
  
  // Get billing codes (CPT & ICD)
  getBillingCodes: async (type?: 'cpt' | 'icd'): Promise<BillingCodeInfo[]> => {
    try {
      // In a real app, this would be an API call
      // return axios.get(`${API_URL}/api/billing/codes`, { params: { type } })
      //   .then(response => response.data);

      // For now, return mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          const codes = Object.values(mockBillingCodes);
          
          if (type) {
            resolve(codes.filter(code => code.type === type));
          } else {
            resolve(codes);
          }
        }, 200); // Simulated delay
      });
    } catch (error) {
      console.error('Error fetching billing codes:', error);
      throw error;
    }
  },
  
  // Get billing code details
  getBillingCode: async (code: string): Promise<BillingCodeInfo | null> => {
    try {
      // In a real app, this would be an API call
      // return axios.get(`${API_URL}/api/billing/codes/${code}`)
      //   .then(response => response.data);

      // For now, return mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockBillingCodes[code] || null);
        }, 100); // Simulated delay
      });
    } catch (error) {
      console.error(`Error fetching billing code ${code}:`, error);
      throw error;
    }
  }
};

export default billingService;