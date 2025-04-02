import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import GuestGuard from '../components/auth/GuestGuard';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login, loginSSO, isLoading, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setErrorMessage('Please enter email and password');
      return;
    }
    
    try {
      await login(email, password);
      
      // Redirect happens via GuestGuard
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('An unexpected error occurred');
    }
  };

  const handleSSOLogin = async (provider: 'google' | 'microsoft' | 'apple') => {
    try {
      await loginSSO(provider);
      
      // Redirect happens via GuestGuard
    } catch (error) {
      console.error(`${provider} login error:`, error);
      setErrorMessage(`${provider} login failed`);
    }
  };

  // Show any auth errors from context
  const displayError = errorMessage || error;

  // Example user credentials for convenience
  const userCredentials = [
    { role: 'Patient', email: 'patient@example.com', password: 'password' },
    { role: 'Doctor', email: 'doctor@therastack.com', password: 'password' },
    { role: 'Admin', email: 'admin@therastack.com', password: 'password' }
  ];

  return (
    <GuestGuard>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to TheraStack
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Access your therapy portal
            </p>
          </div>
          
          {/* Demo credentials */}
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Demo Credentials</h3>
            <div className="space-y-1 text-xs">
              {userCredentials.map((cred, index) => (
                <div key={index} className="flex flex-col md:flex-row md:justify-between mb-2">
                  <span className="font-medium">{cred.role}:</span>
                  <button 
                    onClick={() => {
                      setEmail(cred.email);
                      setPassword(cred.password);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-xs mt-1 md:mt-0"
                  >
                    Use {cred.email}
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-600">Click on an email to auto-fill the login form. Password is "password" for all accounts.</p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <input type="hidden" name="remember" value="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            {displayError && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {displayError}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>


            <div className="mt-6 grid grid-cols-3 gap-3">
              <button
                onClick={() => handleSSOLogin('google')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Sign in with Google</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"></path>
                </svg>
              </button>

              <button
                onClick={() => handleSSOLogin('microsoft')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Sign in with Microsoft</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M11.4,24H0V12.6h11.4V24z M24,24H12.6V12.6H24V24z M11.4,11.4H0V0h11.4V11.4z M24,11.4H12.6V0H24V11.4z"></path>
                </svg>
              </button>

              <button
                onClick={() => handleSSOLogin('apple')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Sign in with Apple</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M14.5,0h-1c-1.9,0-3.5,0-4.9,0.1C6.9,0.2,5.5,0.5,4.5,1.4C3.4,2.3,2.7,3.7,2.5,5.4c-0.2,1.7-0.2,3.6-0.2,6v1.1 c0,2.4,0,4.3,0.2,6c0.2,1.7,0.9,3.1,2,4C5.5,23.5,6.9,23.8,8.6,23.9c1.4,0.1,3,0.1,4.9,0.1h1c1.9,0,3.5,0,4.9-0.1 c1.7-0.1,3.1-0.4,4.1-1.3c1.1-0.9,1.8-2.3,2-4c0.2-1.7,0.2-3.6,0.2-6v-1.1c0-2.4,0-4.3-0.2-6c-0.2-1.7-0.9-3.1-2-4 c-1-0.9-2.4-1.2-4.1-1.3C18,0,16.4,0,14.5,0z M12,6.5c1.7,0.1,2.6-0.1,3.3-0.7C15.9,5.1,16,4.1,16,3h2c0,1.5-0.3,3-1.3,4.2 C15.6,8.5,14.2,8.8,12,8.7V6.5z M12,18l-3.2-3.2l1.6-1.3L12,15.2l5.2-4.9l1.6,1.3L12,18z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </GuestGuard>
  );
}