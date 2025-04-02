import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AuthGuard from '../../components/auth/AuthGuard';
import RoleGuard from '../../components/auth/RoleGuard';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Short timeout to ensure auth state is loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const cards = [
    {
      title: 'Users',
      stat: '237',
      description: 'Total users registered',
      icon: '👤',
      color: 'bg-blue-500',
      link: '/admin/users'
    },
    {
      title: 'Appointments',
      stat: '1,234',
      description: 'Sessions scheduled',
      icon: '📆',
      color: 'bg-green-500',
      link: '/admin/appointments'
    },
    {
      title: 'AI Call Manager',
      stat: '2',
      description: 'Active therapy calls',
      icon: '🤖',
      color: 'bg-purple-500',
      link: '/admin/call-manager'
    },
    {
      title: 'Documents',
      stat: '5,432',
      description: 'Files stored',
      icon: '📄',
      color: 'bg-amber-500',
      link: '/admin/documents'
    },
    {
      title: 'AWS Resources',
      stat: '12',
      description: 'Services configured',
      icon: '☁️',
      color: 'bg-orange-500',
      link: '/admin/aws'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <RoleGuard roles="admin" fallback={
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="mt-2">You need administrator privileges to access this page.</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      }>
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your TheraStack platform</p>
            {user && (
              <div className="mt-2 text-sm text-blue-600">
                Logged in as {user.name} ({user.role})
              </div>
            )}
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {cards.map((card, index) => (
              <Link href={card.link} key={index}>
                <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold">{card.title}</h2>
                    <span className={`${card.color} text-white p-2 rounded-lg text-xl`}>
                      {card.icon}
                    </span>
                  </div>
                  <p className="text-3xl font-bold">{card.stat}</p>
                  <p className="text-gray-500 text-sm">{card.description}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => router.push('/admin/users')}
                className="flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded"
              >
                <span className="mr-2">👤</span> Manage Users
              </button>
              <button
                onClick={() => router.push('/admin/call-manager')}
                className="flex items-center justify-center bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium py-2 px-4 rounded"
              >
                <span className="mr-2">🤖</span> AI Call Manager
              </button>
              <button
                onClick={() => router.push('/admin/settings')}
                className="flex items-center justify-center bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2 px-4 rounded"
              >
                <span className="mr-2">⚙️</span> Configure Settings
              </button>
              <button
                onClick={() => router.push('/admin/aws')}
                className="flex items-center justify-center bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium py-2 px-4 rounded"
              >
                <span className="mr-2">☁️</span> Manage AWS Resources
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Recent System Activity</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    { event: 'MCP Assistance', user: 'ai.assistant@therastack.com', time: 'Just now', details: 'AI assisted with insurance claim for Jane Smith' },
                    { event: 'User Login', user: 'admin@therastack.com', time: '2 minutes ago', details: 'Login from 192.168.1.1' },
                    { event: 'Settings Changed', user: 'admin@therastack.com', time: '1 hour ago', details: 'Updated MCP configuration settings' },
                    { event: 'New User', user: 'doctor@therastack.com', time: '3 hours ago', details: 'Created new therapist account' },
                    { event: 'System Update', user: 'system', time: '1 day ago', details: 'Application updated to v1.2.1' },
                    { event: 'Backup Completed', user: 'system', time: '1 day ago', details: 'Full system backup to S3' }
                  ].map((activity, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{activity.event}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.user}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}