import React, { ReactNode } from 'react';
import { Role } from '../../types/auth';
import { useAuth } from '../../context/AuthContext';

interface RoleGuardProps {
  roles: Role | Role[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * A component that conditionally renders children based on user role
 */
const RoleGuard: React.FC<RoleGuardProps> = ({ 
  roles, 
  children,
  fallback
}) => {
  const { user } = useAuth();
  
  if (!user) {
    return fallback ? <>{fallback}</> : null;
  }
  
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  if (allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }
  
  // Render fallback if provided, otherwise nothing
  return fallback ? <>{fallback}</> : null;
};

export default RoleGuard;