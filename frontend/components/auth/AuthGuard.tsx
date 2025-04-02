import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * A component that protects routes by requiring authentication
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isInitialized, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !isLoading && !isAuthenticated) {
      // Store the intended URL to redirect after login
      localStorage.setItem('auth_redirect', router.asPath);
      // Redirect to login page
      router.push('/login');
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

  // When authenticated, render children
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Fallback while redirecting
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-2 text-gray-600">Checking authentication...</p>
      </div>
    </div>
  );
};

export default AuthGuard;