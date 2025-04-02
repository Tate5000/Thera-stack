import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import AuthGuard from '../../components/auth/AuthGuard';
import RoleGuard from '../../components/auth/RoleGuard';
import { User, Role } from '../../types/auth';
import { ROLES, PERMISSION_DESCRIPTIONS } from '../../services/authService';

const USERS_DATA = [
  {
    id: 'patient1',
    email: 'patient@example.com',
    name: 'Alex Garcia',
    role: 'patient',
    status: 'active'
  },
  {
    id: 'doctor1',
    email: 'doctor@therastack.com',
    name: 'Dr. Sarah Johnson',
    role: 'doctor',
    status: 'active'
  },
  {
    id: 'admin1',
    email: 'admin@therastack.com',
    name: 'Admin User',
    role: 'admin',
    status: 'active'
  }
];

const UserManagementPage = () => {
  const { user, can } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch users from an API
    setUsers(USERS_DATA);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="text-center p-8">Loading user data...</div>;
  }

  return (
    <AuthGuard>
      <RoleGuard roles="admin" fallback={
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="mt-2">You don't have permission to access this page.</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      }>
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">User Management</h1>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Add New User
            </button>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : user.role === 'doctor' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                      }`}>
                        {ROLES[user.role as Role].name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Deactivate</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Role Permissions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(ROLES).map(([roleKey, roleData]) => (
                <div key={roleKey} className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-2">{roleData.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">{roleData.description}</p>
                  
                  <h4 className="font-medium text-gray-700 mb-2">Permissions:</h4>
                  <ul className="text-sm space-y-1">
                    {roleData.permissions.map(permission => (
                      <li key={permission} className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{PERMISSION_DESCRIPTIONS[permission]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
};

export default UserManagementPage;