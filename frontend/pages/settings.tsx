import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthGuard from '../components/auth/AuthGuard';
import RoleGuard from '../components/auth/RoleGuard';
import PermissionGuard from '../components/auth/PermissionGuard';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  if (!user) {
    return null; // This shouldn't happen due to AuthGuard, but added as a safeguard
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-1/4">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
                <div className="mt-1 inline-block px-2 py-1 text-xs capitalize bg-blue-100 text-blue-800 rounded-full">
                  {user.role}
                </div>
              </div>
              
              <nav className="p-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-3 py-2 rounded ${
                    activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Profile Settings
                </button>
                
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-left px-3 py-2 rounded ${
                    activeTab === 'security' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Security
                </button>
                
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full text-left px-3 py-2 rounded ${
                    activeTab === 'notifications' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Notifications
                </button>
                
                <RoleGuard roles={['admin']}>
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`w-full text-left px-3 py-2 rounded ${
                      activeTab === 'users' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    User Management
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('system')}
                    className={`w-full text-left px-3 py-2 rounded ${
                      activeTab === 'system' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    System Settings
                  </button>
                </RoleGuard>
                
                <div className="border-t my-2"></div>
                
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 rounded text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </nav>
            </div>
          </div>

          {/* Main content */}
          <div className="w-full md:w-3/4">
            <div className="bg-white rounded-lg shadow p-6">
              {activeTab === 'profile' && <ProfileSettings user={user} />}
              {activeTab === 'security' && <SecuritySettings />}
              {activeTab === 'notifications' && <NotificationSettings />}
              
              <RoleGuard roles={['admin']}>
                {activeTab === 'users' && <UserManagement />}
                {activeTab === 'system' && <SystemSettings />}
              </RoleGuard>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

// Profile Settings Component
const ProfileSettings = ({ user }: { user: any }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            defaultValue={user.name}
            className="w-full px-3 py-2 border rounded"
            readOnly={user.role !== 'admin' && !user.permissions.includes('edit_all_profiles')}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            defaultValue={user.email}
            className="w-full px-3 py-2 border rounded"
            readOnly
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <input
            type="text"
            defaultValue={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            className="w-full px-3 py-2 border rounded"
            readOnly
          />
        </div>
        
        <PermissionGuard
          permission="edit_all_profiles"
          fallback={
            <div className="mt-4 text-sm text-gray-500">
              Contact an administrator to change your profile information.
            </div>
          }
        >
          <div className="mt-4">
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Save Changes
            </button>
          </div>
        </PermissionGuard>
      </div>
    </div>
  );
};

// Security Settings Component
const SecuritySettings = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-2">Change Password</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input type="password" className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input type="password" className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Update Password
              </button>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
          <div className="flex items-center justify-between p-4 border rounded">
            <div>
              <p className="font-medium">Two-Factor Authentication is currently disabled</p>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <button className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
              Enable
            </button>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Connected Accounts</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center">
                <div className="mr-3">G</div>
                <div>
                  <p className="font-medium">Google</p>
                  <p className="text-sm text-gray-500">Not connected</p>
                </div>
              </div>
              <button className="px-3 py-1 border rounded hover:bg-gray-50">
                Connect
              </button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center">
                <div className="mr-3">M</div>
                <div>
                  <p className="font-medium">Microsoft</p>
                  <p className="text-sm text-gray-500">Not connected</p>
                </div>
              </div>
              <button className="px-3 py-1 border rounded hover:bg-gray-50">
                Connect
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notification Settings Component
const NotificationSettings = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 border rounded">
          <div>
            <p className="font-medium">Email Notifications</p>
            <p className="text-sm text-gray-500">Receive email notifications for appointments and messages</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between p-3 border rounded">
          <div>
            <p className="font-medium">Browser Notifications</p>
            <p className="text-sm text-gray-500">Receive in-app notifications for important updates</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between p-3 border rounded">
          <div>
            <p className="font-medium">SMS Notifications</p>
            <p className="text-sm text-gray-500">Receive text message reminders for upcoming appointments</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="mt-4">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

// User Management Component - Admin Only
const UserManagement = () => {
  const mockUsers = [
    { id: 'patient1', name: 'Alex Garcia', email: 'alex@example.com', role: 'patient', status: 'Active' },
    { id: 'patient2', name: 'Jordan Smith', email: 'jordan@example.com', role: 'patient', status: 'Active' },
    { id: 'therapist1', name: 'Dr. Sarah Johnson', email: 'sarah@therastack.com', role: 'doctor', status: 'Active' },
    { id: 'admin1', name: 'Admin User', email: 'admin@therastack.com', role: 'admin', status: 'Active' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">User Management</h2>
        <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
          Add New User
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {user.status}
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
    </div>
  );
};

// System Settings Component - Admin Only
const SystemSettings = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">System Settings</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-2">Site Configuration</h3>
          <div className="space-y-4 p-4 border rounded">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <input
                type="text"
                defaultValue="TheraStack"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
              <input
                type="email"
                defaultValue="support@therastack.com"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <select className="w-full px-3 py-2 border rounded">
                <option>America/New_York</option>
                <option>America/Chicago</option>
                <option>America/Denver</option>
                <option>America/Los_Angeles</option>
              </select>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">SSO Configuration</h3>
          <div className="space-y-4 p-4 border rounded">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium">Google SSO</p>
                <p className="text-sm text-gray-500">Allow users to sign in with Google</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium">Microsoft SSO</p>
                <p className="text-sm text-gray-500">Allow users to sign in with Microsoft</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Apple SSO</p>
                <p className="text-sm text-gray-500">Allow users to sign in with Apple</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Role Management</h3>
          <div className="space-y-2 p-4 border rounded">
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">Patient</p>
                <p className="text-sm text-gray-500">Regular patient user with access to their own data and appointments</p>
              </div>
              <button className="px-3 py-1 border rounded hover:bg-gray-50">
                Edit Permissions
              </button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">Doctor/Therapist</p>
                <p className="text-sm text-gray-500">Medical professional with access to assigned patients</p>
              </div>
              <button className="px-3 py-1 border rounded hover:bg-gray-50">
                Edit Permissions
              </button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">Administrator</p>
                <p className="text-sm text-gray-500">System administrator with full access</p>
              </div>
              <button className="px-3 py-1 border rounded hover:bg-gray-50">
                Edit Permissions
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};