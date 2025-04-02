import React, { ReactNode } from 'react';
import { Permission } from '../../types/auth';
import { useAuth } from '../../context/AuthContext';

interface PermissionGuardProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * A component that conditionally renders children based on user permissions
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback
}) => {
  const { can } = useAuth();
  
  if (can(permission)) {
    return <>{children}</>;
  }
  
  // Render fallback if provided, otherwise nothing
  return fallback ? <>{fallback}</> : null;
};

export default PermissionGuard;