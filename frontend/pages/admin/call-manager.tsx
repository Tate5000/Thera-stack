import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AuthGuard from '../../components/auth/AuthGuard';
import RoleGuard from '../../components/auth/RoleGuard';
import { useAuth } from '../../context/AuthContext';
import callManagerService, { 
  CallDetail, 
  MCPConfig, 
  CallStatusUpdate,
  CallVerification
} from '../../services/callManagerService';

const AICallManagerPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for calls
  const [activeCalls, setActiveCalls] = useState<CallDetail[]>([]);
  const [scheduledCalls, setScheduledCalls] = useState<CallDetail[]>([]);
  const [recentCalls, setRecentCalls] = useState<CallDetail[]>([]);
  
  // MCP configuration settings
  const [mcpSettings, setMcpSettings] = useState<MCPConfig & { triggerPhrases: string[] | string }>({
    enableMCP: true,
    autoVerify: false,
    autoSummarize: true,
    accessLevel: 'restricted',
    maxSessionsToReview: 3,
    triggerPhrases: []
  });
  
  // Load active and scheduled calls
  const loadActiveCalls = async () => {
    try {
      setLoading(true);
      const calls = await callManagerService.getActiveCalls();
      
      // Separate in-progress and scheduled calls
      const active = calls.filter(call => call.status === 'in-progress');
      const scheduled = calls.filter(call => call.status === 'scheduled');
      
      setActiveCalls(active);
      setScheduledCalls(scheduled);
      setError(null);
    } catch (err) {
      console.error('Error loading calls:', err);
      setError('Failed to load active calls. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Load call history
  const loadCallHistory = async () => {
    try {
      setLoading(true);
      const history = await callManagerService.getCallHistory();
      setRecentCalls(history);
      setError(null);
    } catch (err) {
      console.error('Error loading call history:', err);
      setError('Failed to load call history. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Load MCP config
  const loadMCPConfig = async () => {
    try {
      setLoading(true);
      const config = await callManagerService.getMCPConfig();
      setMcpSettings({
        ...config,
        // Convert trigger phrases array to newline-separated string for textarea
        triggerPhrases: config.triggerPhrases
      });
      setError(null);
    } catch (err) {
      console.error('Error loading MCP config:', err);
      setError('Failed to load MCP configuration. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Load appropriate data when tab changes
  useEffect(() => {
    const loadData = async () => {
      if (activeTab === 'active') {
        await loadActiveCalls();
      } else if (activeTab === 'history') {
        await loadCallHistory();
      } else if (activeTab === 'settings') {
        await loadMCPConfig();
      }
    };
    
    loadData();
  }, [activeTab]);
  
  // MCP settings change handler
  const handleMCPSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    setMcpSettings({
      ...mcpSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Save MCP settings
  const handleSaveMCPSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Parse trigger phrases from string to array
      const triggerPhrasesArray = typeof mcpSettings.triggerPhrases === 'string' 
        ? mcpSettings.triggerPhrases.split('\n').filter(phrase => phrase.trim() !== '')
        : mcpSettings.triggerPhrases;
      
      const updatedConfig = await callManagerService.updateMCPConfig({
        enableMCP: mcpSettings.enableMCP,
        autoVerify: mcpSettings.autoVerify,
        autoSummarize: mcpSettings.autoSummarize,
        accessLevel: mcpSettings.accessLevel as 'full' | 'restricted' | 'minimal',
        maxSessionsToReview: mcpSettings.maxSessionsToReview,
        triggerPhrases: triggerPhrasesArray as string[]
      });
      
      setMcpSettings({
        ...updatedConfig,
        triggerPhrases: Array.isArray(updatedConfig.triggerPhrases) 
          ? updatedConfig.triggerPhrases.join('\n')
          : (updatedConfig.triggerPhrases as unknown as string)
      } as MCPConfig & { triggerPhrases: string[] | string });
      
      setSuccessMessage('MCP settings saved successfully!');
      setError(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error saving MCP settings:', err);
      setError('Failed to save MCP configuration. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle AI assistance for a call
  const toggleAIAssistance = async (callId: string, currentStatus: string) => {
    try {
      if (!user?.email) return;
      
      const statusUpdate: CallStatusUpdate = {
        callId,
        status: 'in-progress', // Keep current status
        aiStatus: currentStatus === 'active' ? 'disabled' : 'active',
        updatedBy: user.email
      };
      
      const updatedCall = await callManagerService.updateCallStatus(statusUpdate);
      
      // Update active calls list with new AI status
      setActiveCalls(activeCalls.map(call => 
        call.id === callId ? updatedCall : call
      ));
      
    } catch (err) {
      console.error('Error toggling AI assistance:', err);
      setError('Failed to update AI assistance. Please try again.');
    }
  };
  
  // Verify a patient for a call
  const verifyPatient = async (callId: string, patientId: string) => {
    try {
      const verification: CallVerification = {
        callId,
        patientId,
        verified: true,
        verificationMethod: 'manual'
      };
      
      const updatedCall = await callManagerService.verifyCall(verification);
      
      // Update the calls list
      setScheduledCalls(scheduledCalls.map(call => 
        call.id === callId ? updatedCall : call
      ));
      
    } catch (err) {
      console.error('Error verifying patient:', err);
      setError('Failed to verify patient. Please try again.');
    }
  };
  
  // Start a call (update status to in-progress)
  const startCall = async (callId: string) => {
    try {
      if (!user?.email) return;
      
      const statusUpdate: CallStatusUpdate = {
        callId,
        status: 'in-progress',
        aiStatus: 'active', // Default to active when starting a call
        updatedBy: user.email
      };
      
      const updatedCall = await callManagerService.updateCallStatus(statusUpdate);
      
      // Move call from scheduled to active
      setScheduledCalls(scheduledCalls.filter(call => call.id !== callId));
      setActiveCalls([...activeCalls, updatedCall]);
      
    } catch (err) {
      console.error('Error starting call:', err);
      setError('Failed to start call. Please try again.');
    }
  };
  
  // End a call (update status to completed)
  const endCall = async (callId: string) => {
    try {
      if (!user?.email) return;
      
      const statusUpdate: CallStatusUpdate = {
        callId,
        status: 'completed',
        aiStatus: 'disabled', // Disable AI when ending call
        updatedBy: user.email
      };
      
      await callManagerService.updateCallStatus(statusUpdate);
      
      // Remove call from active list
      setActiveCalls(activeCalls.filter(call => call.id !== callId));
      
      // Refresh call history if we're on that tab
      if (activeTab === 'history') {
        await loadCallHistory();
      }
      
    } catch (err) {
      console.error('Error ending call:', err);
      setError('Failed to end call. Please try again.');
    }
  };
  
  // View call details (would open modal in full implementation)
  const viewCallDetails = (callId: string) => {
    console.log('Viewing details for call:', callId);
    // In a real implementation, this would open a modal or navigate to a details page
  };
  
  // Join call
  const joinCall = async (callId: string) => {
    try {
      const result = await callManagerService.joinCall(callId);
      console.log('Join call result:', result);
      
      // In a real implementation, this would connect to the call
      alert(`Joined call ${callId} successfully. In a real implementation, this would open the call interface.`);
      
    } catch (err) {
      console.error('Error joining call:', err);
      setError('Failed to join call. Please try again.');
    }
  };
  
  // Generate summary for a call
  const generateSummary = async (callId: string) => {
    try {
      setLoading(true);
      const summary = await callManagerService.generateCallSummary(callId);
      
      // Update call history with new summary
      setRecentCalls(recentCalls.map(call => 
        call.id === callId ? { ...call, summary } : call
      ));
      
      setSuccessMessage('Summary generated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (err) {
      console.error('Error generating summary:', err);
      setError('Failed to generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const tabs = [
    { id: 'active', label: 'Active & Upcoming Calls' },
    { id: 'history', label: 'Call History' },
    { id: 'settings', label: 'MCP Settings' }
  ];
  
  return (
    <AuthGuard>
      <RoleGuard roles="admin" fallback={
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="mt-2">You need administrator privileges to access the AI Call Manager.</p>
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
              <h1 className="text-2xl font-bold">AI Call Manager</h1>
              <p className="text-gray-600">Model Context Protocol (MCP) for Therapy Sessions</p>
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
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              {error}
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
            
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  {/* Active & Upcoming Calls Tab */}
                  {activeTab === 'active' && (
                    <div>
                      <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-4">Active Calls</h2>
                        {activeCalls.length === 0 ? (
                          <p className="text-gray-500 italic">No active calls at the moment.</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Therapist</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MCP Status</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {activeCalls.map((call) => (
                                  <tr key={call.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{call.patientName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{call.therapistName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {new Date(call.actualStartTime || call.scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {call.scheduledEndTime ? 
                                        `${Math.round((new Date(call.scheduledEndTime).getTime() - new Date(call.scheduledStartTime).getTime()) / (1000 * 60))} min` : 
                                        '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        In Progress
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        call.aiStatus === 'active' 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {call.aiStatus === 'active' ? 'Active' : 'Disabled'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      <div className="flex space-x-2">
                                        <button 
                                          onClick={() => toggleAIAssistance(call.id, call.aiStatus)}
                                          className={`px-2 py-1 text-xs rounded ${
                                            call.aiStatus === 'active'
                                              ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                                          }`}
                                        >
                                          {call.aiStatus === 'active' ? 'Disable AI' : 'Enable AI'}
                                        </button>
                                        <button 
                                          onClick={() => joinCall(call.id)}
                                          className="px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs rounded"
                                        >
                                          Join Call
                                        </button>
                                        <button 
                                          onClick={() => endCall(call.id)}
                                          className="px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 text-xs rounded"
                                        >
                                          End Call
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h2 className="text-lg font-semibold mb-4">Upcoming Calls</h2>
                        {scheduledCalls.length === 0 ? (
                          <p className="text-gray-500 italic">No upcoming calls scheduled.</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Therapist</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Verified</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MCP Status</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {scheduledCalls.map((call) => (
                                  <tr key={call.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{call.patientName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{call.therapistName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {new Date(call.scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {call.scheduledEndTime ? 
                                        `${Math.round((new Date(call.scheduledEndTime).getTime() - new Date(call.scheduledStartTime).getTime()) / (1000 * 60))} min` : 
                                        '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        call.verified 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {call.verified ? 'Verified' : 'Pending'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {call.aiStatus.charAt(0).toUpperCase() + call.aiStatus.slice(1)}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      <div className="flex space-x-2">
                                        {!call.verified && (
                                          <button 
                                            onClick={() => verifyPatient(call.id, call.patientId)}
                                            className="px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 text-xs rounded"
                                          >
                                            Verify Patient
                                          </button>
                                        )}
                                        <button 
                                          onClick={() => startCall(call.id)}
                                          className="px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs rounded"
                                        >
                                          Start Call
                                        </button>
                                        <button 
                                          onClick={() => viewCallDetails(call.id)}
                                          className="px-2 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs rounded"
                                        >
                                          View Details
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Call History Tab */}
                  {activeTab === 'history' && (
                    <div>
                      <h2 className="text-lg font-semibold mb-4">Recent Call History</h2>
                      {recentCalls.length === 0 ? (
                        <p className="text-gray-500 italic">No call history available.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Therapist</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Assisted</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {recentCalls.map((call) => {
                                const callDate = new Date(call.scheduledStartTime);
                                const startTime = new Date(call.actualStartTime || call.scheduledStartTime);
                                const endTime = new Date(call.actualEndTime || call.scheduledEndTime || startTime);
                                const timeString = `${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                                
                                return (
                                  <tr key={call.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{call.patientName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{call.therapistName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {callDate.toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{timeString}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {call.duration ? `${call.duration} min` : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        call.aiStatus === 'active' 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {call.aiStatus === 'active' ? 'Yes' : 'No'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      <div className="flex space-x-2">
                                        {call.summary ? (
                                          <button 
                                            onClick={() => viewCallDetails(call.id)}
                                            className="px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs rounded"
                                          >
                                            View Summary
                                          </button>
                                        ) : (
                                          <button 
                                            onClick={() => generateSummary(call.id)}
                                            className="px-2 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 text-xs rounded"
                                          >
                                            Generate Summary
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* MCP Settings Tab */}
                  {activeTab === 'settings' && (
                    <div>
                      <h2 className="text-lg font-semibold mb-4">Model Context Protocol Settings</h2>
                      <form onSubmit={handleSaveMCPSettings}>
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                name="enableMCP"
                                id="enableMCP"
                                checked={mcpSettings.enableMCP}
                                onChange={handleMCPSettingsChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="enableMCP" className="ml-2 block text-sm text-gray-700">
                                Enable Model Context Protocol (MCP) for therapy calls
                              </label>
                            </div>
                            
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                name="autoVerify"
                                id="autoVerify"
                                checked={mcpSettings.autoVerify}
                                onChange={handleMCPSettingsChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="autoVerify" className="ml-2 block text-sm text-gray-700">
                                Automatically verify patient identity (otherwise requires manual verification)
                              </label>
                            </div>
                            
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                name="autoSummarize"
                                id="autoSummarize"
                                checked={mcpSettings.autoSummarize}
                                onChange={handleMCPSettingsChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="autoSummarize" className="ml-2 block text-sm text-gray-700">
                                Automatically generate call summaries after completion
                              </label>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                MCP Access Level
                              </label>
                              <select
                                name="accessLevel"
                                value={mcpSettings.accessLevel}
                                onChange={handleMCPSettingsChange}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="full">Full Access (All patient data)</option>
                                <option value="restricted">Restricted (Limited to specific data categories)</option>
                                <option value="minimal">Minimal (Business info and scheduling only)</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Max Previous Sessions to Review
                              </label>
                              <input
                                type="number"
                                name="maxSessionsToReview"
                                value={mcpSettings.maxSessionsToReview}
                                onChange={handleMCPSettingsChange}
                                min="0"
                                max="10"
                                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              AI Trigger Phrases (One per line)
                            </label>
                            <textarea
                              name="triggerPhrases"
                              value={typeof mcpSettings.triggerPhrases === 'string' 
                                ? mcpSettings.triggerPhrases 
                                : mcpSettings.triggerPhrases.join('\n')}
                              onChange={handleMCPSettingsChange}
                              rows={5}
                              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter trigger phrases, one per line..."
                            />
                            <p className="mt-1 text-sm text-gray-500">
                              These phrases will trigger the AI to provide assistance during calls
                            </p>
                          </div>
                          
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="text-md font-medium text-blue-800 mb-2">Data Categories Available to MCP</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="businessInfo"
                                  checked={true}
                                  disabled
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="businessInfo" className="ml-2 block text-sm text-gray-700">
                                  Business Information
                                </label>
                              </div>
                              <div className="flex items-center">
                                <input
                                  type="checkbox" 
                                  id="appointmentData"
                                  checked={true}
                                  disabled
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="appointmentData" className="ml-2 block text-sm text-gray-700">
                                  Calendar & Appointments
                                </label>
                              </div>
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="paymentData"
                                  checked={true}
                                  disabled
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="paymentData" className="ml-2 block text-sm text-gray-700">
                                  Payments & Billing
                                </label>
                              </div>
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="sessionHistory"
                                  checked={true}
                                  disabled
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="sessionHistory" className="ml-2 block text-sm text-gray-700">
                                  Session History & Transcripts
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-8 flex justify-end">
                          <button
                            type="submit"
                            disabled={loading}
                            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {loading ? 'Saving...' : 'Save MCP Settings'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
};

export default AICallManagerPage;