// Authentication and authorization service

import { User, Role, Permission } from '../types/auth';

// Mock users with their roles and permissions
const MOCK_USERS: User[] = [
  // Patient users
  {
    id: 'patient1',
    email: 'patient@example.com',
    name: 'Alex Garcia',
    role: 'patient',
    permissions: [
      'view_own_profile',
      'view_own_appointments',
      'create_own_appointments',
      'view_own_documents',
      'upload_own_documents',
      'delete_own_documents',
      'view_own_therapists'
    ],
    metadata: {
      patientId: 'patient1',
      therapistId: 'doctor1'
    }
  },
  {
    id: 'patient2',
    email: 'jordan@example.com',
    name: 'Jordan Smith',
    role: 'patient',
    permissions: [
      'view_own_profile',
      'view_own_appointments',
      'create_own_appointments',
      'view_own_documents',
      'upload_own_documents',
      'delete_own_documents',
      'view_own_therapists'
    ],
    metadata: {
      patientId: 'patient2',
      therapistId: 'doctor2'
    }
  },
  
  // Doctor/Therapist users
  {
    id: 'doctor1',
    email: 'doctor@therastack.com',
    name: 'Dr. Sarah Johnson',
    role: 'doctor',
    permissions: [
      'view_own_profile',
      'view_own_appointments',
      'view_assigned_patients',
      'view_patient_documents',
      'upload_patient_documents',
      'create_patient_notes',
      'complete_appointments',
      'generate_ai_summaries'
    ],
    metadata: {
      specialty: 'Anxiety & Depression',
      patients: ['patient1', 'patient3']
    }
  },
  {
    id: 'doctor2',
    email: 'michael@therastack.com',
    name: 'Dr. Michael Lee',
    role: 'doctor',
    permissions: [
      'view_own_profile',
      'view_own_appointments',
      'view_assigned_patients',
      'view_patient_documents',
      'upload_patient_documents',
      'create_patient_notes',
      'complete_appointments',
      'generate_ai_summaries'
    ],
    metadata: {
      specialty: 'Trauma & PTSD',
      patients: ['patient2']
    }
  },
  
  // Admin users
  {
    id: 'admin1',
    email: 'admin@therastack.com',
    name: 'Admin User',
    role: 'admin',
    permissions: [
      'view_own_profile',
      'view_all_profiles',
      'edit_all_profiles',
      'view_all_appointments',
      'create_all_appointments',
      'delete_all_appointments',
      'view_all_documents',
      'upload_all_documents',
      'delete_all_documents',
      'manage_users',
      'manage_roles',
      'manage_permissions',
      'system_configuration'
    ],
    metadata: {
      adminLevel: 'super'
    }
  }
];

// Role definitions with associated permissions
export const ROLES: Record<Role, { name: string; description: string; permissions: Permission[] }> = {
  patient: {
    name: 'Patient',
    description: 'Regular patient user with access to their own data and appointments',
    permissions: [
      'view_own_profile',
      'view_own_appointments',
      'create_own_appointments', 
      'view_own_documents',
      'upload_own_documents',
      'delete_own_documents',
      'view_own_therapists'
    ]
  },
  doctor: {
    name: 'Doctor/Therapist',
    description: 'Medical professional with access to assigned patients',
    permissions: [
      'view_own_profile',
      'view_own_appointments',
      'view_assigned_patients',
      'view_patient_documents',
      'upload_patient_documents',
      'create_patient_notes',
      'complete_appointments',
      'generate_ai_summaries'
    ]
  },
  admin: {
    name: 'Administrator',
    description: 'System administrator with full access',
    permissions: [
      'view_all_profiles',
      'edit_all_profiles',
      'view_all_appointments',
      'create_all_appointments',
      'delete_all_appointments',
      'view_all_documents',
      'upload_all_documents',
      'delete_all_documents',
      'manage_users',
      'manage_roles',
      'manage_permissions',
      'system_configuration'
    ]
  }
};

// Permission descriptions
export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  // Profile permissions
  view_own_profile: 'View your own profile information',
  view_all_profiles: 'View all user profiles',
  edit_all_profiles: 'Edit all user profiles',
  
  // Appointment permissions
  view_own_appointments: 'View your own appointments',
  view_assigned_patients: 'View appointments for assigned patients',
  view_all_appointments: 'View all appointments in the system',
  create_own_appointments: 'Create appointments for yourself',
  create_all_appointments: 'Create appointments for any user',
  delete_all_appointments: 'Delete any appointment',
  complete_appointments: 'Mark appointments as completed',
  
  // Document permissions
  view_own_documents: 'View your own documents',
  view_patient_documents: 'View documents for assigned patients',
  view_all_documents: 'View all documents in the system',
  upload_own_documents: 'Upload your own documents',
  upload_patient_documents: 'Upload documents for patients',
  upload_all_documents: 'Upload documents for any user',
  delete_own_documents: 'Delete your own documents',
  delete_all_documents: 'Delete any document in the system',
  generate_ai_summaries: 'Generate AI summaries of documents',
  create_patient_notes: 'Create notes for patients',
  
  // User management
  view_own_therapists: 'View your assigned therapists',
  manage_users: 'Create, edit, and disable user accounts',
  manage_roles: 'Assign and manage user roles',
  manage_permissions: 'Configure system permissions',
  
  // System
  system_configuration: 'Modify system-wide settings'
};

// Simulates authentication with credentials
export const loginWithCredentials = async (
  email: string,
  password: string
): Promise<{ user: User; token: string } | null> => {
  // In a real app, you would verify credentials against your backend
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
  
  const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (user) {
    // In a real app, you would get a JWT or other token from your backend
    return {
      user,
      token: `mock-jwt-token-${user.id}-${Date.now()}`
    };
  }
  
  return null;
};

// Simulates SSO authentication
export const loginWithSSO = async (provider: 'google' | 'microsoft' | 'apple'): Promise<{ user: User; token: string } | null> => {
  // In a real app, this would redirect to the OAuth provider and return after authentication
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulated delay
  
  // For demo purposes, use a single demo account for SSO
  const user = MOCK_USERS.find(u => u.role === 'patient' && u.id === 'patient1');
  
  if (user) {
    return {
      user,
      token: `mock-jwt-token-${provider}-${user.id}-${Date.now()}`
    };
  }
  
  return null;
};

// Gets the current session (would check token validity in a real app)
export const getCurrentSession = async (): Promise<{ user: User; token: string } | null> => {
  // In a real app, you would validate the token from localStorage/cookies
  const token = localStorage.getItem('auth_token');
  const userId = localStorage.getItem('user_id');
  
  if (token && userId) {
    const user = MOCK_USERS.find(u => u.id === userId);
    
    if (user) {
      return {
        user,
        token
      };
    }
  }
  
  return null;
};

// Logs out the current user
export const logout = async (): Promise<void> => {
  // Clear local storage/cookies
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_id');
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulated delay
};

// Checks if a user has a specific permission
export const hasPermission = (user: User, permission: Permission): boolean => {
  return user.permissions.includes(permission);
};

// Ensures a user has all the permissions required for their role
export const ensureUserHasRolePermissions = (user: User): User => {
  const roleName = user.role;
  const rolePermissions = ROLES[roleName].permissions;
  
  // Create a new set of permissions that includes all the role's standard permissions
  // while preserving any custom permissions the user might have
  const updatedPermissions = Array.from(new Set([
    ...user.permissions,
    ...rolePermissions
  ]));
  
  return {
    ...user,
    permissions: updatedPermissions
  };
};

// Checks if the current user can access specific patient data
export const canAccessPatientData = (
  user: User,
  patientId: string
): boolean => {
  // Admins can access all patient data
  if (user.role === 'admin') {
    return true;
  }
  
  // Patients can only access their own data
  if (user.role === 'patient') {
    return user.id === patientId || user.metadata.patientId === patientId;
  }
  
  // Doctors can access data for their assigned patients
  if (user.role === 'doctor' && user.metadata.patients) {
    return (user.metadata.patients as string[]).includes(patientId);
  }
  
  return false;
};