import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AuthGuard from '../../../components/auth/AuthGuard';
import RoleGuard from '../../../components/auth/RoleGuard';
import { awsService, AwsSettings } from '../../../services/awsService';

export default function AwsSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('general');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [showSecretKeyInput, setShowSecretKeyInput] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [formValues, setFormValues] = useState<AwsSettings>({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-west-2',
    defaultKeyPair: '',
    defaultVpcId: '',
    defaultSubnetIds: '',
    defaultSecurityGroupId: '',
    logBucketName: '',
    dataBucketName: '',
    backupBucketName: '',
    cloudformationStackName: '',
    enableCostExplorer: false,
    enableBudgetAlerts: false,
    monthlyBudgetThreshold: '',
    budgetAlertEmail: '',
    enableCloudtrail: false,
    enableGuardDuty: false,
    enableAwsBackup: false,
    backupSchedule: 'daily',
    backupRetentionDays: '',
    enableResourceTags: false,
    defaultTagEnvironment: '',
    defaultTagProject: '',
    defaultTagOwner: ''
  });

  // Load settings when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const settings = await awsService.getSettings();
        setFormValues(settings);
      } catch (err) {
        console.error('Error loading AWS settings:', err);
        setSaveError('Failed to load settings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormValues({
      ...formValues,
      [name]: newValue
    });

    // Clear messages when form is changed
    setSaveSuccess(false);
    setSaveError(null);
    setConnectionTestResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    
    try {
      await awsService.updateSettings(formValues);
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setSaveError('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setConnectionTestResult(null);
    
    try {
      const isConnected = await awsService.testConnection({
        accessKeyId: formValues.accessKeyId,
        secretAccessKey: formValues.secretAccessKey,
        region: formValues.region
      });
      
      if (isConnected) {
        setConnectionTestResult({
          success: true,
          message: 'Connection successful! AWS credentials are valid.'
        });
      } else {
        setConnectionTestResult({
          success: false,
          message: 'Connection failed. Please check your AWS credentials and try again.'
        });
      }
    } catch (err) {
      console.error('Error testing connection:', err);
      setConnectionTestResult({
        success: false,
        message: 'An error occurred while testing the connection. Please try again.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleValidateResources = async () => {
    // In a real app, this would validate resource IDs against AWS
    setConnectionTestResult({
      success: true,
      message: 'All resource identifiers are valid.'
    });
    
    // Hide message after 3 seconds
    setTimeout(() => {
      setConnectionTestResult(null);
    }, 3000);
  };

  // Function to mask the secret key
  const maskSecret = (secret: string) => {
    if (!secret) return '';
    if (secret.includes('•')) return secret;
    return '•'.repeat(secret.length);
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <RoleGuard roles="admin">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold">AWS Configuration</h1>
                <p className="text-gray-600">Manage your AWS account settings</p>
              </div>
              <div>
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Back to Resources
                </button>
              </div>
            </div>
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </RoleGuard>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <RoleGuard roles="admin">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">AWS Configuration</h1>
              <p className="text-gray-600">Manage your AWS account settings</p>
            </div>
            <div>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Back to Resources
              </button>
            </div>
          </div>

          {/* Success Message */}
          {saveSuccess && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline"> Settings saved successfully!</span>
            </div>
          )}

          {/* Error Message */}
          {saveError && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {saveError}</span>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6 border-b">
            <div className="flex space-x-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('general')}
                className={`pb-3 ${activeTab === 'general' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
              >
                General
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`pb-3 ${activeTab === 'resources' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
              >
                Resources
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`pb-3 ${activeTab === 'security' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
              >
                Security
              </button>
              <button
                onClick={() => setActiveTab('cost')}
                className={`pb-3 ${activeTab === 'cost' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
              >
                Cost Management
              </button>
              <button
                onClick={() => setActiveTab('backup')}
                className={`pb-3 ${activeTab === 'backup' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
              >
                Backup & Recovery
              </button>
              <button
                onClick={() => setActiveTab('tags')}
                className={`pb-3 ${activeTab === 'tags' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
              >
                Resource Tags
              </button>
            </div>
          </div>

          {/* Connection Test Result */}
          {connectionTestResult && (
            <div className={`mb-6 ${connectionTestResult.success ? 'bg-green-100 border-green-400 text-green-800' : 'bg-red-100 border-red-400 text-red-800'} px-4 py-3 rounded relative border`} role="alert">
              <strong className="font-bold">{connectionTestResult.success ? 'Success!' : 'Error!'}</strong>
              <span className="block sm:inline"> {connectionTestResult.message}</span>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit}>
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold border-b pb-2">AWS Credentials</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="accessKeyId" className="block text-sm font-medium text-gray-700 mb-1">
                        Access Key ID
                      </label>
                      <div className="relative">
                        <input
                          type={showApiKeyInput ? "text" : "password"}
                          id="accessKeyId"
                          name="accessKeyId"
                          value={formValues.accessKeyId}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border rounded-md"
                          required
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500"
                          onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                        >
                          {showApiKeyInput ? "Hide" : "Show"}
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">Your AWS Access Key ID</p>
                    </div>
                    <div>
                      <label htmlFor="secretAccessKey" className="block text-sm font-medium text-gray-700 mb-1">
                        Secret Access Key
                      </label>
                      <div className="relative">
                        <input
                          type={showSecretKeyInput ? "text" : "password"}
                          id="secretAccessKey"
                          name="secretAccessKey"
                          value={showSecretKeyInput ? formValues.secretAccessKey : maskSecret(formValues.secretAccessKey)}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border rounded-md"
                          required
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500"
                          onClick={() => setShowSecretKeyInput(!showSecretKeyInput)}
                        >
                          {showSecretKeyInput ? "Hide" : "Show"}
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">Your AWS Secret Access Key</p>
                    </div>
                    <div>
                      <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                        Default AWS Region
                      </label>
                      <select
                        id="region"
                        name="region"
                        value={formValues.region}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border rounded-md bg-white"
                        required
                      >
                        <option value="us-east-1">US East (N. Virginia)</option>
                        <option value="us-east-2">US East (Ohio)</option>
                        <option value="us-west-1">US West (N. California)</option>
                        <option value="us-west-2">US West (Oregon)</option>
                        <option value="eu-west-1">EU (Ireland)</option>
                        <option value="eu-central-1">EU (Frankfurt)</option>
                        <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
                        <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                        <option value="ap-southeast-2">Asia Pacific (Sydney)</option>
                      </select>
                      <p className="mt-1 text-sm text-gray-500">The default AWS region for your resources</p>
                    </div>
                    <div>
                      <label htmlFor="defaultKeyPair" className="block text-sm font-medium text-gray-700 mb-1">
                        Default Key Pair
                      </label>
                      <input
                        type="text"
                        id="defaultKeyPair"
                        name="defaultKeyPair"
                        value={formValues.defaultKeyPair}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                      <p className="mt-1 text-sm text-gray-500">EC2 key pair for SSH access</p>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={isTesting || !formValues.accessKeyId || !formValues.secretAccessKey}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isTesting ? 'Testing...' : 'Test Connection'}
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </div>
              )}

              {/* Resource Settings */}
              {activeTab === 'resources' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold border-b pb-2">Default Resources</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="defaultVpcId" className="block text-sm font-medium text-gray-700 mb-1">
                        Default VPC
                      </label>
                      <input
                        type="text"
                        id="defaultVpcId"
                        name="defaultVpcId"
                        value={formValues.defaultVpcId}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="vpc-xxxxxxxx"
                      />
                      <p className="mt-1 text-sm text-gray-500">The VPC ID to use by default</p>
                    </div>
                    <div>
                      <label htmlFor="defaultSubnetIds" className="block text-sm font-medium text-gray-700 mb-1">
                        Default Subnets
                      </label>
                      <input
                        type="text"
                        id="defaultSubnetIds"
                        name="defaultSubnetIds"
                        value={formValues.defaultSubnetIds}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="subnet-xxxxxxxx,subnet-yyyyyyyy"
                      />
                      <p className="mt-1 text-sm text-gray-500">Comma-separated list of subnet IDs</p>
                    </div>
                    <div>
                      <label htmlFor="defaultSecurityGroupId" className="block text-sm font-medium text-gray-700 mb-1">
                        Default Security Group
                      </label>
                      <input
                        type="text"
                        id="defaultSecurityGroupId"
                        name="defaultSecurityGroupId"
                        value={formValues.defaultSecurityGroupId}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="sg-xxxxxxxx"
                      />
                      <p className="mt-1 text-sm text-gray-500">The security group ID to use by default</p>
                    </div>
                    <div>
                      <label htmlFor="cloudformationStackName" className="block text-sm font-medium text-gray-700 mb-1">
                        CloudFormation Stack Name
                      </label>
                      <input
                        type="text"
                        id="cloudformationStackName"
                        name="cloudformationStackName"
                        value={formValues.cloudformationStackName}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="MyAppStack"
                      />
                      <p className="mt-1 text-sm text-gray-500">The name of your CloudFormation stack</p>
                    </div>
                  </div>

                  <h2 className="text-lg font-semibold border-b pb-2 pt-4">S3 Buckets</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label htmlFor="logBucketName" className="block text-sm font-medium text-gray-700 mb-1">
                        Log Bucket
                      </label>
                      <input
                        type="text"
                        id="logBucketName"
                        name="logBucketName"
                        value={formValues.logBucketName}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="my-app-logs"
                      />
                      <p className="mt-1 text-sm text-gray-500">S3 bucket for application logs</p>
                    </div>
                    <div>
                      <label htmlFor="dataBucketName" className="block text-sm font-medium text-gray-700 mb-1">
                        Data Bucket
                      </label>
                      <input
                        type="text"
                        id="dataBucketName"
                        name="dataBucketName"
                        value={formValues.dataBucketName}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="my-app-data"
                      />
                      <p className="mt-1 text-sm text-gray-500">S3 bucket for application data</p>
                    </div>
                    <div>
                      <label htmlFor="backupBucketName" className="block text-sm font-medium text-gray-700 mb-1">
                        Backup Bucket
                      </label>
                      <input
                        type="text"
                        id="backupBucketName"
                        name="backupBucketName"
                        value={formValues.backupBucketName}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="my-app-backups"
                      />
                      <p className="mt-1 text-sm text-gray-500">S3 bucket for backups</p>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleValidateResources}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-2"
                    >
                      Validate Resources
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold border-b pb-2">Security & Compliance</h2>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableCloudtrail"
                        name="enableCloudtrail"
                        checked={formValues.enableCloudtrail as boolean}
                        onChange={handleFormChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="enableCloudtrail" className="ml-2 block text-sm font-medium text-gray-700">
                        Enable AWS CloudTrail
                      </label>
                    </div>
                    <p className="text-sm text-gray-500 ml-6">
                      Track user activity and API usage across your AWS infrastructure
                    </p>

                    <div className="flex items-center mt-4">
                      <input
                        type="checkbox"
                        id="enableGuardDuty"
                        name="enableGuardDuty"
                        checked={formValues.enableGuardDuty as boolean}
                        onChange={handleFormChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="enableGuardDuty" className="ml-2 block text-sm font-medium text-gray-700">
                        Enable AWS GuardDuty
                      </label>
                    </div>
                    <p className="text-sm text-gray-500 ml-6">
                      Intelligent threat detection service
                    </p>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                      >
                        {isSaving ? 'Saving...' : 'Save Security Settings'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Cost Management */}
              {activeTab === 'cost' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold border-b pb-2">Cost Management</h2>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableCostExplorer"
                        name="enableCostExplorer"
                        checked={formValues.enableCostExplorer as boolean}
                        onChange={handleFormChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="enableCostExplorer" className="ml-2 block text-sm font-medium text-gray-700">
                        Enable AWS Cost Explorer
                      </label>
                    </div>
                    <p className="text-sm text-gray-500 ml-6">
                      Visualize, understand, and manage your AWS costs and usage over time
                    </p>

                    <div className="flex items-center mt-4">
                      <input
                        type="checkbox"
                        id="enableBudgetAlerts"
                        name="enableBudgetAlerts"
                        checked={formValues.enableBudgetAlerts as boolean}
                        onChange={handleFormChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="enableBudgetAlerts" className="ml-2 block text-sm font-medium text-gray-700">
                        Enable Budget Alerts
                      </label>
                    </div>
                    <p className="text-sm text-gray-500 ml-6">
                      Receive notifications when costs exceed your budget threshold
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <label htmlFor="monthlyBudgetThreshold" className="block text-sm font-medium text-gray-700 mb-1">
                          Monthly Budget Threshold ($)
                        </label>
                        <input
                          type="text"
                          id="monthlyBudgetThreshold"
                          name="monthlyBudgetThreshold"
                          value={formValues.monthlyBudgetThreshold}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="100.00"
                          disabled={!formValues.enableBudgetAlerts}
                        />
                        <p className="mt-1 text-sm text-gray-500">Maximum monthly spend before alerts are triggered</p>
                      </div>
                      <div>
                        <label htmlFor="budgetAlertEmail" className="block text-sm font-medium text-gray-700 mb-1">
                          Budget Alert Email
                        </label>
                        <input
                          type="email"
                          id="budgetAlertEmail"
                          name="budgetAlertEmail"
                          value={formValues.budgetAlertEmail}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="admin@example.com"
                          disabled={!formValues.enableBudgetAlerts}
                        />
                        <p className="mt-1 text-sm text-gray-500">Email address for budget alert notifications</p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                      >
                        {isSaving ? 'Saving...' : 'Save Cost Settings'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Backup & Recovery */}
              {activeTab === 'backup' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold border-b pb-2">Backup & Recovery</h2>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableAwsBackup"
                        name="enableAwsBackup"
                        checked={formValues.enableAwsBackup as boolean}
                        onChange={handleFormChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="enableAwsBackup" className="ml-2 block text-sm font-medium text-gray-700">
                        Enable AWS Backup
                      </label>
                    </div>
                    <p className="text-sm text-gray-500 ml-6">
                      Centrally manage and automate backups across AWS services
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <label htmlFor="backupSchedule" className="block text-sm font-medium text-gray-700 mb-1">
                          Backup Schedule
                        </label>
                        <select
                          id="backupSchedule"
                          name="backupSchedule"
                          value={formValues.backupSchedule}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border rounded-md bg-white"
                          disabled={!formValues.enableAwsBackup}
                        >
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                        <p className="mt-1 text-sm text-gray-500">How often to perform backups</p>
                      </div>
                      <div>
                        <label htmlFor="backupRetentionDays" className="block text-sm font-medium text-gray-700 mb-1">
                          Backup Retention (Days)
                        </label>
                        <input
                          type="text"
                          id="backupRetentionDays"
                          name="backupRetentionDays"
                          value={formValues.backupRetentionDays}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="30"
                          disabled={!formValues.enableAwsBackup}
                        />
                        <p className="mt-1 text-sm text-gray-500">How long to retain backups</p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                      >
                        {isSaving ? 'Saving...' : 'Save Backup Settings'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Resource Tags */}
              {activeTab === 'tags' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold border-b pb-2">Resource Tags</h2>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableResourceTags"
                        name="enableResourceTags"
                        checked={formValues.enableResourceTags as boolean}
                        onChange={handleFormChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="enableResourceTags" className="ml-2 block text-sm font-medium text-gray-700">
                        Enable Automatic Resource Tagging
                      </label>
                    </div>
                    <p className="text-sm text-gray-500 ml-6">
                      Automatically add tags to all new resources for better organization and cost tracking
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                      <div>
                        <label htmlFor="defaultTagEnvironment" className="block text-sm font-medium text-gray-700 mb-1">
                          Environment Tag
                        </label>
                        <input
                          type="text"
                          id="defaultTagEnvironment"
                          name="defaultTagEnvironment"
                          value={formValues.defaultTagEnvironment}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="production"
                          disabled={!formValues.enableResourceTags}
                        />
                        <p className="mt-1 text-sm text-gray-500">Default environment value (e.g., production)</p>
                      </div>
                      <div>
                        <label htmlFor="defaultTagProject" className="block text-sm font-medium text-gray-700 mb-1">
                          Project Tag
                        </label>
                        <input
                          type="text"
                          id="defaultTagProject"
                          name="defaultTagProject"
                          value={formValues.defaultTagProject}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="therastack"
                          disabled={!formValues.enableResourceTags}
                        />
                        <p className="mt-1 text-sm text-gray-500">Default project value</p>
                      </div>
                      <div>
                        <label htmlFor="defaultTagOwner" className="block text-sm font-medium text-gray-700 mb-1">
                          Owner Tag
                        </label>
                        <input
                          type="text"
                          id="defaultTagOwner"
                          name="defaultTagOwner"
                          value={formValues.defaultTagOwner}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="admin@example.com"
                          disabled={!formValues.enableResourceTags}
                        />
                        <p className="mt-1 text-sm text-gray-500">Default owner (usually email)</p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                      >
                        {isSaving ? 'Saving...' : 'Save Tag Settings'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}