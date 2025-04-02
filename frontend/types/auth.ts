// Type definitions for authentication and authorization

export type Role = 'patient' | 'doctor' | 'admin';

export type Permission =
  // Profile permissions
  | 'view_own_profile'
  | 'view_all_profiles'
  | 'edit_all_profiles'
  
  // Appointment permissions
  | 'view_own_appointments'
  | 'view_assigned_patients'
  | 'view_all_appointments'
  | 'create_own_appointments'
  | 'create_all_appointments'
  | 'delete_all_appointments'
  | 'complete_appointments'
  
  // Document permissions
  | 'view_own_documents'
  | 'view_patient_documents'
  | 'view_all_documents'
  | 'upload_own_documents'
  | 'upload_patient_documents'
  | 'upload_all_documents'
  | 'delete_own_documents'
  | 'delete_all_documents'
  | 'generate_ai_summaries'
  | 'create_patient_notes'
  
  // User management permissions
  | 'view_own_therapists'
  | 'manage_users'
  | 'manage_roles'
  | 'manage_permissions'
  
  // System permissions
  | 'system_configuration';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  permissions: Permission[];
  metadata: Record<string, any>;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}