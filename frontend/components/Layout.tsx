import React, { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import RoleGuard from './auth/RoleGuard'
import PermissionGuard from './auth/PermissionGuard'
import ThemeToggle from './ThemeToggle'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter()
  const { user, isAuthenticated, logout, isInitialized } = useAuth()
  const { theme } = useTheme()
  
  // Check login state to determine what to show
  const isGuestRoute = router.pathname === '/login' || router.pathname === '/register'
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-blue-600 dark:bg-gray-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            TheraStack
          </Link>
          
          {!isGuestRoute && (
            <div className="flex items-center space-x-6">
              <nav>
                <ul className="flex space-x-4">
                  <li>
                    <Link href="/" className={router.pathname === '/' ? 'font-bold' : ''}>
                      Home
                    </Link>
                  </li>
                  
                  {/* Calendar - accessible by all roles */}
                  <li>
                    <Link href="/calendar" className={router.pathname.startsWith('/calendar') ? 'font-bold' : ''}>
                      Calendar
                    </Link>
                  </li>
                  
                  {/* Documents - accessible by all roles */}
                  <li>
                    <Link href="/documents" className={router.pathname.startsWith('/documents') ? 'font-bold' : ''}>
                      Documents
                    </Link>
                  </li>
                  
                  {/* Therapy Sessions - accessible by all roles */}
                  <li>
                    <Link href="/sessions" className={router.pathname.startsWith('/sessions') ? 'font-bold' : ''}>
                      Therapy Sessions
                    </Link>
                  </li>
                  
                  {/* Messages - accessible by all roles */}
                  <li>
                    <Link href="/messages" className={router.pathname.startsWith('/messages') ? 'font-bold' : ''}>
                      Messages
                    </Link>
                  </li>
                  
                  {/* Billing - accessible by doctors and admins */}
                  {user && isAuthenticated && (user.role === 'doctor' || user.role === 'admin') && (
                    <li>
                      <Link href="/billing" className={router.pathname.startsWith('/billing') ? 'font-bold' : ''}>
                        Superbilling
                      </Link>
                    </li>
                  )}
                  
                  {/* Payments - accessible by all roles */}
                  <li>
                    <Link href="/payments" className={router.pathname.startsWith('/payments') ? 'font-bold' : ''}>
                      Payments
                    </Link>
                  </li>
                  
                  {/* Settings - accessible by all roles */}
                  <li>
                    <Link href="/settings" className={router.pathname.startsWith('/settings') ? 'font-bold' : ''}>
                      Settings
                    </Link>
                  </li>
                  
                  {/* Admin section - accessible by admin only */}
                  {user && isAuthenticated && (
                    <RoleGuard roles="admin">
                      <li className="relative group">
                        <button 
                          className={`flex items-center ${router.pathname.startsWith('/admin') ? 'font-bold' : ''}`}
                        >
                          Admin
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-2 z-10 hidden group-hover:block">
                          <Link 
                            href="/admin" 
                            className={`block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700 ${router.pathname === '/admin' ? 'bg-blue-50 dark:bg-gray-700' : ''}`}
                          >
                            Dashboard
                          </Link>
                          <Link 
                            href="/admin/users" 
                            className={`block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700 ${router.pathname === '/admin/users' ? 'bg-blue-50 dark:bg-gray-700' : ''}`}
                          >
                            User Management
                          </Link>
                          <Link 
                            href="/admin/settings" 
                            className={`block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700 ${router.pathname === '/admin/settings' ? 'bg-blue-50 dark:bg-gray-700' : ''}`}
                          >
                            System Settings
                          </Link>
                        </div>
                      </li>
                    </RoleGuard>
                  )}
                </ul>
              </nav>
              
              <div className="flex items-center">
                {/* Theme Toggle Button */}
                <ThemeToggle />
              </div>
              
              {user && isAuthenticated && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm capitalize">{user.role}</span>
                  <span className="text-sm">|</span>
                  <span>{user.name}</span>
                  
                  <div className="ml-4 relative">
                    <button 
                      onClick={async () => {
                        await logout();
                        router.push('/login');
                      }}
                      className="px-3 py-1 bg-blue-700 dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-700 rounded text-sm"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
              
              {(!user || !isAuthenticated) && !isGuestRoute && isInitialized && (
                <div className="flex space-x-2">
                  <Link href="/login" className="px-3 py-1 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-900 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p>&copy; 2025 TheraStack. All rights reserved.</p>
            </div>
            
            <div className="flex space-x-4">
              <Link href="/terms" className="hover:underline">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:underline">
                Privacy Policy
              </Link>
              <Link href="/contact" className="hover:underline">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}