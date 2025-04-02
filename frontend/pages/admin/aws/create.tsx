import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AuthGuard from '../../../components/auth/AuthGuard';
import RoleGuard from '../../../components/auth/RoleGuard';
import { awsService, ResourceCreationParams } from '../../../services/awsService';

export default function CreateAwsResource() {
  const router = useRouter();
  const [resourceType, setResourceType] = useState('');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<{ [key: string]: any }>({
    resourceName: '',
    region: 'us-west-2',
    tagEnvironment: 'production',
    tagProject: 'therastack',
    // DynamoDB fields
    partitionKey: '',
    partitionKeyType: 'String',
    sortKey: '',
    sortKeyType: 'String',
    provisionedCapacity: false,
    // S3 fields
    publicAccess: false,
    versioning: false,
    lifecycleRule: '',
    // Lambda fields
    runtime: 'nodejs18.x',
    memorySize: '128',
    timeout: '30'
  });
  
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSavedSettings, setHasSavedSettings] = useState(false);
  const [savedSettings, setSavedSettings] = useState<any>({});

  // Load saved settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await awsService.getSettings();
        setSavedSettings(settings);
        setHasSavedSettings(true);
        
        // Update default region if settings exist
        if (settings.region) {
          setFormData(prev => ({ ...prev, region: settings.region }));
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      }
    };

    loadSettings();
  }, []);

  const handleResourceTypeSelect = (type: string) => {
    setResourceType(type);
    setStep(2);
    
    // Set default resource name based on type
    let defaultName = '';
    switch (type) {
      case 'dynamodb':
        defaultName = 'users-table';
        break;
      case 's3':
        defaultName = 'app-data';
        break;
      case 'lambda':
        defaultName = 'process-data-function';
        break;
      case 'ec2':
        defaultName = 'web-server';
        break;
      case 'cognito':
        defaultName = 'user-pool';
        break;
      case 'apigateway':
        defaultName = 'api';
        break;
    }
    
    setFormData(prev => ({
      ...prev,
      resourceName: defaultName
    }));
    
    // Set tag values from saved settings if they exist
    if (hasSavedSettings) {
      if (savedSettings.defaultTagEnvironment) {
        setFormData(prev => ({ ...prev, tagEnvironment: savedSettings.defaultTagEnvironment }));
      }
      if (savedSettings.defaultTagProject) {
        setFormData(prev => ({ ...prev, tagProject: savedSettings.defaultTagProject }));
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData({
      ...formData,
      [name]: newValue
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      // Create params object for the API
      const params: ResourceCreationParams = {
        resourceType,
        resourceName: formData.resourceName,
        region: formData.region,
        tagEnvironment: formData.tagEnvironment,
        tagProject: formData.tagProject
      };
      
      // Add resource-specific params
      switch (resourceType) {
        case 'dynamodb':
          params.partitionKey = formData.partitionKey;
          params.partitionKeyType = formData.partitionKeyType;
          params.sortKey = formData.sortKey;
          params.sortKeyType = formData.sortKeyType;
          params.provisionedCapacity = formData.provisionedCapacity;
          break;
          
        case 's3':
          params.publicAccess = formData.publicAccess;
          params.versioning = formData.versioning;
          params.lifecycleRule = formData.lifecycleRule;
          break;
          
        case 'lambda':
          params.runtime = formData.runtime;
          params.memorySize = formData.memorySize;
          params.timeout = formData.timeout;
          break;
      }
      
      // Call the API to create the resource
      await awsService.createResource(params);
      
      setShowSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/admin/aws');
      }, 2000);
    } catch (err) {
      console.error('Error creating resource:', err);
      setError('Failed to create resource. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const getResourceTypeName = () => {
    switch (resourceType) {
      case 'dynamodb': return 'DynamoDB Table';
      case 's3': return 'S3 Bucket';
      case 'lambda': return 'Lambda Function';
      case 'ec2': return 'EC2 Instance';
      case 'cognito': return 'Cognito User Pool';
      case 'apigateway': return 'API Gateway';
      default: return '';
    }
  };

  return (
    <AuthGuard>
      <RoleGuard roles="admin">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Create AWS Resource</h1>
              <p className="text-gray-600">Add a new resource to your cloud infrastructure</p>
            </div>
            <div>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Back
              </button>
            </div>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded relative mb-6" role="alert">
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline"> Your new {getResourceTypeName()} has been created. Redirecting...</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded relative mb-6" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <div className={`h-1 flex-1 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                2
              </div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs font-medium">Select Type</span>
              <span className="text-xs font-medium">Configure</span>
            </div>
          </div>

          {/* Step 1: Select Resource Type */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Select Resource Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'dynamodb', name: 'DynamoDB Table', icon: '🗄️', description: 'NoSQL database for document data' },
                  { id: 's3', name: 'S3 Bucket', icon: '💾', description: 'Object storage for files and media' },
                  { id: 'lambda', name: 'Lambda Function', icon: '⚡', description: 'Serverless function execution' },
                  { id: 'ec2', name: 'EC2 Instance', icon: '💻', description: 'Virtual server in the cloud' },
                  { id: 'cognito', name: 'Cognito User Pool', icon: '🔐', description: 'User authentication and authorization' },
                  { id: 'apigateway', name: 'API Gateway', icon: '🔄', description: 'Create and manage APIs' },
                ].map((item) => (
                  <div 
                    key={item.id}
                    className="border rounded-lg p-4 hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-colors duration-150"
                    onClick={() => handleResourceTypeSelect(item.id)}
                  >
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">{item.icon}</span>
                      <h3 className="font-medium">{item.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Configure Resource */}
          {step === 2 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">
                Configure {getResourceTypeName()}
              </h2>

              <form onSubmit={handleSubmit}>
                {/* Common Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="resourceName" className="block text-sm font-medium text-gray-700 mb-1">
                      Resource Name
                    </label>
                    <input
                      type="text"
                      id="resourceName"
                      name="resourceName"
                      value={formData.resourceName}
                      onChange={handleInputChange}
                      placeholder={`e.g., ${resourceType === 'dynamodb' ? 'users-table' : 
                                      resourceType === 's3' ? 'user-uploads' : 
                                      resourceType === 'lambda' ? 'process-data-function' : 
                                      resourceType === 'ec2' ? 'web-server' : 
                                      resourceType === 'cognito' ? 'user-pool' : 
                                      'api-gateway'}`}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                      AWS Region
                    </label>
                    <select
                      id="region"
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md bg-white"
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
                  </div>
                </div>

                {/* DynamoDB Specific Fields */}
                {resourceType === 'dynamodb' && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label htmlFor="partitionKey" className="block text-sm font-medium text-gray-700 mb-1">
                        Partition Key
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          id="partitionKey"
                          name="partitionKey"
                          value={formData.partitionKey}
                          onChange={handleInputChange}
                          placeholder="e.g., id"
                          className="w-full px-3 py-2 border rounded-md"
                          required
                        />
                        <select
                          id="partitionKeyType"
                          name="partitionKeyType"
                          value={formData.partitionKeyType}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-md bg-white"
                        >
                          <option value="String">String</option>
                          <option value="Number">Number</option>
                          <option value="Binary">Binary</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="sortKey" className="block text-sm font-medium text-gray-700 mb-1">
                        Sort Key (Optional)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          id="sortKey"
                          name="sortKey"
                          value={formData.sortKey}
                          onChange={handleInputChange}
                          placeholder="e.g., createdAt"
                          className="w-full px-3 py-2 border rounded-md"
                        />
                        <select
                          id="sortKeyType"
                          name="sortKeyType"
                          value={formData.sortKeyType}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-md bg-white"
                        >
                          <option value="String">String</option>
                          <option value="Number">Number</option>
                          <option value="Binary">Binary</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="provisionedCapacity"
                        name="provisionedCapacity"
                        checked={formData.provisionedCapacity}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="provisionedCapacity" className="ml-2 block text-sm font-medium text-gray-700">
                        Use Provisioned Capacity
                      </label>
                    </div>
                  </div>
                )}

                {/* S3 Specific Fields */}
                {resourceType === 's3' && (
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="publicAccess"
                        name="publicAccess"
                        checked={formData.publicAccess}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="publicAccess" className="ml-2 block text-sm font-medium text-gray-700">
                        Allow Public Access
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="versioning"
                        name="versioning"
                        checked={formData.versioning}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="versioning" className="ml-2 block text-sm font-medium text-gray-700">
                        Enable Versioning
                      </label>
                    </div>
                    <div>
                      <label htmlFor="lifecycleRule" className="block text-sm font-medium text-gray-700 mb-1">
                        Lifecycle Rule (Optional)
                      </label>
                      <select
                        id="lifecycleRule"
                        name="lifecycleRule"
                        value={formData.lifecycleRule}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md bg-white"
                      >
                        <option value="">None</option>
                        <option value="30">Archive after 30 days</option>
                        <option value="90">Archive after 90 days</option>
                        <option value="365">Archive after 1 year</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Lambda Specific Fields */}
                {resourceType === 'lambda' && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label htmlFor="runtime" className="block text-sm font-medium text-gray-700 mb-1">
                        Runtime
                      </label>
                      <select
                        id="runtime"
                        name="runtime"
                        value={formData.runtime}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md bg-white"
                      >
                        <option value="nodejs18.x">Node.js 18</option>
                        <option value="python3.9">Python 3.9</option>
                        <option value="java11">Java 11</option>
                        <option value="go1.x">Go 1.x</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="memorySize" className="block text-sm font-medium text-gray-700 mb-1">
                        Memory Size (MB)
                      </label>
                      <select
                        id="memorySize"
                        name="memorySize"
                        value={formData.memorySize}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md bg-white"
                      >
                        <option value="128">128 MB</option>
                        <option value="256">256 MB</option>
                        <option value="512">512 MB</option>
                        <option value="1024">1024 MB</option>
                        <option value="2048">2048 MB</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="timeout" className="block text-sm font-medium text-gray-700 mb-1">
                        Timeout (Seconds)
                      </label>
                      <input
                        type="number"
                        id="timeout"
                        name="timeout"
                        value={formData.timeout}
                        onChange={handleInputChange}
                        min="1"
                        max="900"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                  </div>
                )}

                {/* EC2 Specific Fields */}
                {resourceType === 'ec2' && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label htmlFor="instanceType" className="block text-sm font-medium text-gray-700 mb-1">
                        Instance Type
                      </label>
                      <select
                        id="instanceType"
                        name="instanceType"
                        value={formData.instanceType || 't2.micro'}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md bg-white"
                      >
                        <option value="t2.micro">t2.micro (1 vCPU, 1 GiB RAM)</option>
                        <option value="t2.small">t2.small (1 vCPU, 2 GiB RAM)</option>
                        <option value="t2.medium">t2.medium (2 vCPU, 4 GiB RAM)</option>
                        <option value="t2.large">t2.large (2 vCPU, 8 GiB RAM)</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="storageSize" className="block text-sm font-medium text-gray-700 mb-1">
                        Storage Size (GB)
                      </label>
                      <input
                        type="number"
                        id="storageSize"
                        name="storageSize"
                        value={formData.storageSize || '8'}
                        onChange={handleInputChange}
                        min="8"
                        max="1000"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                  </div>
                )}

                {/* Tags Section for All Resources */}
                <div className="mb-6">
                  <h3 className="text-md font-medium border-b pb-2 mb-3">Resource Tags</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="tagEnvironment" className="block text-sm font-medium text-gray-700 mb-1">
                        Environment
                      </label>
                      <input
                        type="text"
                        id="tagEnvironment"
                        name="tagEnvironment"
                        value={formData.tagEnvironment}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="tagProject" className="block text-sm font-medium text-gray-700 mb-1">
                        Project
                      </label>
                      <input
                        type="text"
                        id="tagProject"
                        name="tagProject"
                        value={formData.tagProject}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {isCreating ? 'Creating...' : 'Create Resource'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}