import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';

interface GuestGuardProps {
  children: ReactNode;
}

/**
 * A component that prevents authenticated users from accessing guest-only pages
 */
const GuestGuard: React.FC<GuestGuardProps> = ({ children }) => {
  const { isAuthenticated, isInitialized, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !isLoading && isAuthenticated) {
      // Redirect authenticated users to home or redirect URL
      const redirectPath = localStorage.getItem('auth_redirect') || '/';
      router.push(redirectPath);
      
      // Clear redirect URL after use
      localStorage.removeItem('auth_redirect');
    }
  }, [isAuthenticated, isInitialized, isLoading, router]);

  // Show loading state
  if (isLoading || !isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // When not authenticated, render children
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Fallback while redirecting
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-2 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
};

export default GuestGuard;