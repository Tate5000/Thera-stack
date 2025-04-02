import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import AuthGuard from '../../../components/auth/AuthGuard';
import RoleGuard from '../../../components/auth/RoleGuard';
import { awsService, AwsResource } from '../../../services/awsService';

export default function AwsManagement() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [activeView, setActiveView] = useState('grid');
  
  // Filters and search state
  const [regionFilter, setRegionFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Resources and loading states
  const [resources, setResources] = useState<AwsResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Cost summary state
  const [costSummary, setCostSummary] = useState({
    current: 0,
    previous: 0,
    projected: 0,
    topService: { name: '', cost: 0 }
  });
  
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const awsRegions = [
    { value: 'us-east-1', label: 'US East (N. Virginia)' },
    { value: 'us-east-2', label: 'US East (Ohio)' },
    { value: 'us-west-1', label: 'US West (N. California)' },
    { value: 'us-west-2', label: 'US West (Oregon)' },
    { value: 'eu-west-1', label: 'EU (Ireland)' },
    { value: 'eu-central-1', label: 'EU (Frankfurt)' },
    { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
    { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
    { value: 'ap-southeast-2', label: 'Asia Pacific (Sydney)' },
  ];

  // Fetch resources with applied filters
  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const filters: {
        region?: string;
        type?: string;
        status?: string;
        search?: string;
      } = {};
      
      if (regionFilter) filters.region = regionFilter;
      if (typeFilter) filters.type = typeFilter;
      if (statusFilter) filters.status = statusFilter;
      if (searchQuery) filters.search = searchQuery;
      
      // Apply tab-specific filters
      if (activeTab !== 'overview') {
        switch (activeTab) {
          case 'compute':
            filters.type = 'EC2';
            break;
          case 'storage':
            filters.type = 'S3';
            break;
          case 'database':
            filters.type = 'DynamoDB';
            break;
          case 'networking':
            filters.type = 'API Gateway';
            break;
          case 'security':
            filters.type = 'Cognito';
            break;
          case 'monitoring':
            filters.type = 'CloudWatch';
            break;
        }
      }
      
      const data = await awsService.getResources(Object.keys(filters).length > 0 ? filters : undefined);
      setResources(data);
    } catch (err) {
      setError('Failed to load resources. Please try again.');
      console.error('Error fetching resources:', err);
    } finally {
      setIsLoading(false);
    }
  }, [regionFilter, typeFilter, statusFilter, searchQuery, activeTab]);

  // Fetch cost summary
  const fetchCostSummary = useCallback(async () => {
    try {
      const data = await awsService.getCostSummary();
      setCostSummary(data);
    } catch (err) {
      console.error('Error fetching cost summary:', err);
    }
  }, []);

  // Load resources and cost summary on component mount and when filters change
  useEffect(() => {
    fetchResources();
    if (activeTab === 'overview') {
      fetchCostSummary();
    }
  }, [fetchResources, fetchCostSummary, activeTab]);

  // Handle resource deletion
  const handleDeleteClick = (resourceId: string) => {
    setResourceToDelete(resourceId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!resourceToDelete) return;
    
    setIsDeleting(true);
    
    try {
      await awsService.deleteResource(resourceToDelete);
      setDeleteSuccess(true);
      setShowDeleteConfirm(false);
      
      // Refresh resource list after deletion
      fetchResources();
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setDeleteSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error deleting resource:', err);
      setError('Failed to delete resource. Please try again.');
    } finally {
      setIsDeleting(false);
      setResourceToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setResourceToDelete(null);
  };

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'DynamoDB': return '🗄️';
      case 'S3': return '💾';
      case 'Lambda': return '⚡';
      case 'Cognito': return '🔐';
      case 'API Gateway': return '🔄';
      case 'CloudWatch': return '⏱️';
      case 'EC2': return '💻';
      case 'RDS': return '🏢';
      default: return '☁️';
    }
  };

  return (
    <AuthGuard>
      <RoleGuard roles="admin">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">AWS Resource Management</h1>
              <p className="text-gray-600">Manage your cloud infrastructure</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => router.push('/admin/aws/create')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add New Resource
              </button>
              <button
                onClick={() => router.push('/admin/aws/settings')}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                AWS Settings
              </button>
            </div>
          </div>

          {/* Delete Success Message */}
          {deleteSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded relative mb-6" role="alert">
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline"> Resource has been deleted.</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded relative mb-6" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete this resource? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleDeleteCancel}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6 border-b">
            <div className="flex space-x-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('compute')}
                className={`pb-3 ${activeTab === 'compute' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
              >
                Compute
              </button>
              <button
                onClick={() => setActiveTab('storage')}
                className={`pb-3 ${activeTab === 'storage' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
              >
                Storage
              </button>
              <button
                onClick={() => setActiveTab('database')}
                className={`pb-3 ${activeTab === 'database' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
              >
                Database
              </button>
              <button
                onClick={() => setActiveTab('networking')}
                className={`pb-3 ${activeTab === 'networking' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
              >
                Networking
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`pb-3 ${activeTab === 'security' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
              >
                Security
              </button>
              <button
                onClick={() => setActiveTab('monitoring')}
                className={`pb-3 ${activeTab === 'monitoring' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
              >
                Monitoring
              </button>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
              <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-3">
                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                  <select
                    id="region"
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1.5 bg-white text-sm"
                  >
                    <option value="">All Regions</option>
                    {awsRegions.map((region) => (
                      <option key={region.value} value={region.value}>{region.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                  <select
                    id="service"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1.5 bg-white text-sm"
                  >
                    <option value="">All Services</option>
                    <option value="DynamoDB">DynamoDB</option>
                    <option value="S3">S3</option>
                    <option value="Lambda">Lambda</option>
                    <option value="EC2">EC2</option>
                    <option value="Cognito">Cognito</option>
                    <option value="API Gateway">API Gateway</option>
                    <option value="CloudWatch">CloudWatch</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    id="status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1.5 bg-white text-sm"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div>
                  <input
                    type="text"
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1.5 bg-white text-sm w-full md:w-auto"
                  />
                </div>
                <div className="flex rounded-md shadow-sm" role="group">
                  <button
                    type="button"
                    onClick={() => setActiveView('grid')}
                    className={`inline-flex items-center px-3 py-1.5 text-sm font-medium ${
                      activeView === 'grid'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    } border border-gray-300 rounded-l-md`}
                  >
                    Grid
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView('table')}
                    className={`inline-flex items-center px-3 py-1.5 text-sm font-medium ${
                      activeView === 'table'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    } border border-gray-300 border-l-0 rounded-r-md`}
                  >
                    Table
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Cost Overview */}
          {!isLoading && activeTab === 'overview' && (
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <h2 className="text-lg font-semibold mb-4">Monthly Cost Overview</h2>
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="w-full md:w-2/3 pr-0 md:pr-6">
                  <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                    {/* This would be a chart component in a real app */}
                    <div className="text-center">
                      <p className="text-gray-500">Cost Breakdown by Service</p>
                      <p className="text-sm text-gray-400">(Placeholder for chart)</p>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-1/3 mt-4 md:mt-0">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Current Month Spend</h3>
                      <p className="text-2xl font-bold">${costSummary.current.toFixed(2)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Previous Month</h3>
                      <p className="text-lg">${costSummary.previous.toFixed(2)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Projected</h3>
                      <p className="text-lg">${costSummary.projected.toFixed(2)}</p>
                    </div>
                    <hr />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Top Service</h3>
                      <p className="text-lg">{costSummary.topService.name} (${costSummary.topService.cost.toFixed(2)})</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No Results Message */}
          {!isLoading && resources.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 mb-6 text-center">
              <p className="text-gray-500 text-lg">No resources found matching your criteria.</p>
              <button 
                onClick={() => {
                  setRegionFilter('');
                  setTypeFilter('');
                  setStatusFilter('');
                  setSearchQuery('');
                  setActiveTab('overview');
                }}
                className="mt-3 text-blue-600 hover:text-blue-800"
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Resources List View */}
          {!isLoading && resources.length > 0 && activeView === 'table' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {resources.map((resource) => (
                      <tr key={resource.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 text-xl mr-2">
                              {getServiceIcon(resource.type)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{resource.name}</div>
                              <div className="text-xs text-gray-500">{resource.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{resource.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{resource.region}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(resource.status)}`}>
                            {resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{resource.lastUpdated}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${resource.metrics?.cost?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => router.push(`/admin/aws/resource/${resource.id}`)}
                            className="text-blue-600 hover:text-blue-900 mr-2"
                          >
                            Manage
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(resource.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Resources Grid View */}
          {!isLoading && resources.length > 0 && activeView === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((resource) => (
                <div key={resource.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">{getServiceIcon(resource.type)}</span>
                      <h3 className="font-medium">{resource.name}</h3>
                    </div>
                    <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusColor(resource.status)}`}>
                      {resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mb-3">{resource.id}</div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <span className="block text-xs text-gray-500">Type</span>
                      <span className="font-medium">{resource.type}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500">Region</span>
                      <span className="font-medium">{resource.region}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500">Last Updated</span>
                      <span className="font-medium">{resource.lastUpdated}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500">Monthly Cost</span>
                      <span className="font-medium">${resource.metrics?.cost?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-2 border-t">
                    <button 
                      onClick={() => router.push(`/admin/aws/resource/${resource.id}`)}
                      className="px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                    >
                      Manage
                    </button>
                    <button 
                      onClick={() => router.push(`/admin/aws/resource/${resource.id}`)}
                      className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
                    >
                      Details
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(resource.id)}
                      className="px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}