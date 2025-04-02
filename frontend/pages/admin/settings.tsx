import React, { useState } from 'react';
import { useRouter } from 'next/router';
import AuthGuard from '../../components/auth/AuthGuard';
import RoleGuard from '../../components/auth/RoleGuard';
import { useAuth } from '../../context/AuthContext';

const AdminSettingsPage = () => {
  const router = useRouter();
  const { user, can } = useAuth();
  const [activeTab, setActiveTab] = useState('system');
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [settings, setSettings] = useState({
    // System
    siteName: 'TheraStack Therapy',
    companyName: 'TheraStack Inc.',
    timezone: 'America/New_York',
    enableUserRegistration: true,
    maintenanceMode: false,
    
    // AWS
    s3BucketPatient: 'therastack-patient-docs',
    s3BucketCompany: 'therastack-company-docs',
    dynamodbTable: 'therastack-calendar',
    
    // Email
    smtpServer: 'smtp.therastack.com',
    smtpPort: '587',
    emailSender: 'notifications@therastack.com',
    
    // Security
    sessionTimeout: '30',
    mfaRequired: false,
    passwordResetFrequency: '90',
    minPasswordLength: '8',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulated save
    setSuccessMessage('Settings saved successfully!');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  const tabs = [
    { id: 'system', label: 'System' },
    { id: 'aws', label: 'AWS Integration' },
    { id: 'email', label: 'Email' },
    { id: 'security', label: 'Security' }
  ];
  
  return (
    <AuthGuard>
      <RoleGuard roles="admin" fallback={
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="mt-2">You need administrator privileges to access system settings.</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      }>
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">System Settings</h1>
              <p className="text-gray-600">Configure your TheraStack platform</p>
            </div>
            <button 
              onClick={() => router.push('/admin')}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
          </div>
          
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
              {successMessage}
            </div>
          )}

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="flex border-b">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`px-4 py-3 font-medium text-sm focus:outline-none ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {/* System Settings */}
              {activeTab === 'system' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Site Name
                      </label>
                      <input
                        type="text"
                        name="siteName"
                        value={settings.siteName}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={settings.companyName}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Timezone
                      </label>
                      <select
                        name="timezone"
                        value={settings.timezone}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="enableUserRegistration"
                        id="enableUserRegistration"
                        checked={settings.enableUserRegistration}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="enableUserRegistration" className="ml-2 block text-sm text-gray-700">
                        Enable public user registration
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="maintenanceMode"
                        id="maintenanceMode"
                        checked={settings.maintenanceMode}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-700">
                        Enable maintenance mode (site will be unavailable to regular users)
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* AWS Settings */}
              {activeTab === 'aws' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Patient Documents S3 Bucket
                      </label>
                      <input
                        type="text"
                        name="s3BucketPatient"
                        value={settings.s3BucketPatient}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Documents S3 Bucket
                      </label>
                      <input
                        type="text"
                        name="s3BucketCompany"
                        value={settings.s3BucketCompany}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Calendar DynamoDB Table
                      </label>
                      <input
                        type="text"
                        name="dynamodbTable"
                        value={settings.dynamodbTable}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-500 bg-gray-50 p-3 rounded">
                    <p><strong>Note:</strong> AWS credentials are managed through environment variables and are not exposed in the UI for security reasons.</p>
                  </div>
                </div>
              )}

              {/* Email Settings */}
              {activeTab === 'email' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SMTP Server
                      </label>
                      <input
                        type="text"
                        name="smtpServer"
                        value={settings.smtpServer}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SMTP Port
                      </label>
                      <input
                        type="text"
                        name="smtpPort"
                        value={settings.smtpPort}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sender Email
                      </label>
                      <input
                        type="email"
                        name="emailSender"
                        value={settings.emailSender}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="mr-2 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                    >
                      Send Test Email
                    </button>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Session Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        name="sessionTimeout"
                        value={settings.sessionTimeout}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password Reset Frequency (days)
                      </label>
                      <input
                        type="number"
                        name="passwordResetFrequency"
                        value={settings.passwordResetFrequency}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Password Length
                      </label>
                      <input
                        type="number"
                        name="minPasswordLength"
                        value={settings.minPasswordLength}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="mfaRequired"
                        id="mfaRequired"
                        checked={settings.mfaRequired}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="mfaRequired" className="ml-2 block text-sm text-gray-700">
                        Require multi-factor authentication for all users
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => router.push('/admin')}
                  className="mr-2 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
};

export default AdminSettingsPage;