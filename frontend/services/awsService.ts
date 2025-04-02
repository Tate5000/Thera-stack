import axios from 'axios';

// Define types for AWS resources and settings
export interface AwsResource {
  id: string;
  name: string;
  type: string;
  region: string;
  status: 'active' | 'inactive' | 'warning' | 'error';
  lastUpdated: string;
  metrics?: {
    cpu?: number;
    memory?: number;
    storage?: number;
    cost?: number;
  };
  tags?: Record<string, string>;
}

export interface AwsSettings {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  defaultKeyPair: string;
  defaultVpcId: string;
  defaultSubnetIds: string;
  defaultSecurityGroupId: string;
  logBucketName: string;
  dataBucketName: string;
  backupBucketName: string;
  cloudformationStackName: string;
  enableCostExplorer: boolean;
  enableBudgetAlerts: boolean;
  monthlyBudgetThreshold: string;
  budgetAlertEmail: string;
  enableCloudtrail: boolean;
  enableGuardDuty: boolean;
  enableAwsBackup: boolean;
  backupSchedule: string;
  backupRetentionDays: string;
  enableResourceTags: boolean;
  defaultTagEnvironment: string;
  defaultTagProject: string;
  defaultTagOwner: string;
}

export interface ResourceCreationParams {
  resourceType: string;
  resourceName: string;
  region: string;
  [key: string]: any; // Additional parameters specific to resource type
}

// For demo, mock data with localStorage persistence
const STORAGE_KEYS = {
  RESOURCES: 'aws_resources',
  SETTINGS: 'aws_settings'
};

// Default mock resources
const defaultResources: AwsResource[] = [
  {
    id: 'ddb-appointments',
    name: 'Appointments Table',
    type: 'DynamoDB',
    region: 'us-west-2',
    status: 'active',
    lastUpdated: '2023-03-30',
    metrics: {
      storage: 1.2,
      cost: 0.53
    },
    tags: {
      Environment: 'Production',
      Service: 'Calendar'
    }
  },
  {
    id: 's3-patient-docs',
    name: 'Patient Documents',
    type: 'S3',
    region: 'us-west-2',
    status: 'active',
    lastUpdated: '2023-03-29',
    metrics: {
      storage: 15.7,
      cost: 0.38
    },
    tags: {
      Environment: 'Production',
      Service: 'Documents'
    }
  },
  {
    id: 's3-company-docs',
    name: 'Company Documents',
    type: 'S3',
    region: 'us-west-2',
    status: 'active',
    lastUpdated: '2023-03-28',
    metrics: {
      storage: 5.3,
      cost: 0.12
    },
    tags: {
      Environment: 'Production',
      Service: 'Documents'
    }
  },
  {
    id: 'lambda-transcriptions',
    name: 'Transcription Processor',
    type: 'Lambda',
    region: 'us-west-2',
    status: 'active',
    lastUpdated: '2023-03-25',
    metrics: {
      cpu: 12.5,
      memory: 42.8,
      cost: 0.09
    },
    tags: {
      Environment: 'Production',
      Service: 'AI'
    }
  },
  {
    id: 'lambda-summarization',
    name: 'Document Summarizer',
    type: 'Lambda',
    region: 'us-west-2',
    status: 'active',
    lastUpdated: '2023-03-27',
    metrics: {
      cpu: 35.2,
      memory: 68.1,
      cost: 0.17
    },
    tags: {
      Environment: 'Production',
      Service: 'AI'
    }
  },
  {
    id: 'cognito-userpool',
    name: 'User Authentication',
    type: 'Cognito',
    region: 'us-west-2',
    status: 'active',
    lastUpdated: '2023-03-20',
    metrics: {
      cost: 0.00
    },
    tags: {
      Environment: 'Production',
      Service: 'Auth'
    }
  },
  {
    id: 'apigw-main',
    name: 'Main API Gateway',
    type: 'API Gateway',
    region: 'us-west-2',
    status: 'active',
    lastUpdated: '2023-03-18',
    metrics: {
      cost: 0.25
    },
    tags: {
      Environment: 'Production',
      Service: 'API'
    }
  },
  {
    id: 'cloudwatch-alerts',
    name: 'System Alerts',
    type: 'CloudWatch',
    region: 'us-west-2',
    status: 'warning',
    lastUpdated: '2023-03-15',
    metrics: {
      cost: 0.15
    },
    tags: {
      Environment: 'Production',
      Service: 'Monitoring'
    }
  }
];

// Default settings
const defaultSettings: AwsSettings = {
  accessKeyId: '',
  secretAccessKey: '',
  region: 'us-west-2',
  defaultKeyPair: 'therastack-keypair',
  defaultVpcId: 'vpc-12345678',
  defaultSubnetIds: 'subnet-12345678,subnet-87654321',
  defaultSecurityGroupId: 'sg-12345678',
  logBucketName: 'therastack-logs',
  dataBucketName: 'therastack-data',
  backupBucketName: 'therastack-backups',
  cloudformationStackName: 'TheraStack-Production',
  enableCostExplorer: true,
  enableBudgetAlerts: true,
  monthlyBudgetThreshold: '100.00',
  budgetAlertEmail: 'admin@therastack.com',
  enableCloudtrail: true,
  enableGuardDuty: true,
  enableAwsBackup: true,
  backupSchedule: 'daily',
  backupRetentionDays: '30',
  enableResourceTags: true,
  defaultTagEnvironment: 'production',
  defaultTagProject: 'therastack',
  defaultTagOwner: 'admin@therastack.com'
};

// Helper functions for localStorage
const getStoredResources = (): AwsResource[] => {
  if (typeof window === 'undefined') return defaultResources;
  
  const stored = localStorage.getItem(STORAGE_KEYS.RESOURCES);
  return stored ? JSON.parse(stored) : defaultResources;
};

const getStoredSettings = (): AwsSettings => {
  if (typeof window === 'undefined') return defaultSettings;
  
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return stored ? JSON.parse(stored) : defaultSettings;
};

const storeResources = (resources: AwsResource[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(resources));
  }
};

const storeSettings = (settings: AwsSettings): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }
};

// Main service functions
export const awsService = {
  // Resource management
  getResources: async (filters?: { region?: string, type?: string, status?: string, search?: string }): Promise<AwsResource[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let resources = getStoredResources();
    
    // Apply filters if provided
    if (filters) {
      if (filters.region) {
        resources = resources.filter(r => r.region === filters.region);
      }
      
      if (filters.type) {
        resources = resources.filter(r => r.type === filters.type);
      }
      
      if (filters.status) {
        resources = resources.filter(r => r.status === filters.status);
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        resources = resources.filter(r => 
          r.name.toLowerCase().includes(searchLower) || 
          r.id.toLowerCase().includes(searchLower)
        );
      }
    }
    
    return resources;
  },
  
  getResourceById: async (id: string): Promise<AwsResource | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const resources = getStoredResources();
    return resources.find(r => r.id === id) || null;
  },
  
  createResource: async (params: ResourceCreationParams): Promise<AwsResource> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const { resourceType, resourceName, region, ...otherParams } = params;
    
    // Generate a resource ID based on type and name
    const resourceId = `${resourceType.toLowerCase()}-${resourceName.toLowerCase().replace(/\s+/g, '-')}`;
    
    const newResource: AwsResource = {
      id: resourceId,
      name: resourceName,
      type: resourceType === 'dynamodb' ? 'DynamoDB' : 
           resourceType === 's3' ? 'S3' : 
           resourceType === 'lambda' ? 'Lambda' : 
           resourceType === 'ec2' ? 'EC2' : 
           resourceType === 'cognito' ? 'Cognito' : 
           'API Gateway',
      region,
      status: 'active',
      lastUpdated: new Date().toISOString().split('T')[0],
      tags: {
        Environment: otherParams.tagEnvironment || 'production',
        Project: otherParams.tagProject || 'therastack'
      }
    };
    
    // Add resource-specific metrics
    switch (resourceType) {
      case 'dynamodb':
        newResource.metrics = { storage: 0.1, cost: 0.02 };
        break;
      case 's3':
        newResource.metrics = { storage: 0.1, cost: 0.01 };
        break;
      case 'lambda':
        newResource.metrics = { cpu: 0, memory: 0, cost: 0.01 };
        break;
      case 'ec2':
        newResource.metrics = { cpu: 0, memory: 0, cost: 0.10 };
        break;
      default:
        newResource.metrics = { cost: 0.01 };
    }
    
    // Save to localStorage
    const resources = getStoredResources();
    const updatedResources = [...resources, newResource];
    storeResources(updatedResources);
    
    return newResource;
  },
  
  deleteResource: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const resources = getStoredResources();
    const updatedResources = resources.filter(r => r.id !== id);
    storeResources(updatedResources);
  },
  
  // Settings management
  getSettings: async (): Promise<AwsSettings> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return getStoredSettings();
  },
  
  updateSettings: async (settings: AwsSettings): Promise<AwsSettings> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Store the updated settings
    storeSettings(settings);
    return settings;
  },
  
  testConnection: async (credentials: { accessKeyId: string, secretAccessKey: string, region: string }): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // In a real app, this would make an API call to test AWS credentials
    // For demo purposes, we'll consider the connection successful if credentials are non-empty
    return Boolean(credentials.accessKeyId && credentials.secretAccessKey && credentials.region);
  },
  
  // Cost management
  getCostSummary: async (): Promise<{ 
    current: number, 
    previous: number, 
    projected: number,
    topService: { name: string, cost: number } 
  }> => {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Calculate total cost from resources
    const resources = getStoredResources();
    const totalCost = resources.reduce((sum, resource) => sum + (resource.metrics?.cost || 0), 0);
    
    // Find top service by cost
    const servicesCost: Record<string, number> = {};
    resources.forEach(resource => {
      if (!servicesCost[resource.type]) {
        servicesCost[resource.type] = 0;
      }
      servicesCost[resource.type] += resource.metrics?.cost || 0;
    });
    
    let topServiceName = '';
    let topServiceCost = 0;
    
    Object.entries(servicesCost).forEach(([service, cost]) => {
      if (cost > topServiceCost) {
        topServiceName = service;
        topServiceCost = cost;
      }
    });
    
    return {
      current: parseFloat(totalCost.toFixed(2)),
      previous: parseFloat((totalCost * 0.95).toFixed(2)),
      projected: parseFloat((totalCost * 1.08).toFixed(2)),
      topService: {
        name: topServiceName,
        cost: parseFloat(topServiceCost.toFixed(2))
      }
    };
  }
};