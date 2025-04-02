import axios from 'axios';

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types
export interface CallDetail {
  id: string;
  patientId: string;
  patientName: string;
  therapistId: string;
  therapistName: string;
  scheduledStartTime: string;
  scheduledEndTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  duration?: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  verified: boolean;
  aiStatus: 'pending' | 'active' | 'disabled';
  summary?: CallSummary;
  createdAt: string;
  updatedAt: string;
}

export interface CallSummary {
  callId: string;
  summaryText: string;
  keyPoints: string[];
  actionItems?: string[];
  aiAssisted: boolean;
  generatedAt: string;
}

export interface CallVerification {
  callId: string;
  patientId: string;
  verified: boolean;
  verificationMethod: string;
}

export interface CallStatusUpdate {
  callId: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  aiStatus: 'pending' | 'active' | 'disabled';
  updatedBy: string;
}

export interface MCPConfig {
  enableMCP: boolean;
  autoVerify: boolean;
  autoSummarize: boolean;
  accessLevel: 'full' | 'restricted' | 'minimal';
  maxSessionsToReview: number;
  triggerPhrases: string[];
}

export interface CreateCallParams {
  patientId: string;
  patientName: string;
  therapistId: string;
  therapistName: string;
  scheduledStartTime: string;
  scheduledEndTime?: string;
  status?: string;
}

// Call Manager Service
const callManagerService = {
  // Get active and upcoming calls
  getActiveCalls: async (statusFilter?: string): Promise<CallDetail[]> => {
    try {
      const params = statusFilter ? { status: statusFilter } : undefined;
      const response = await axios.get(`${API_URL}/api/call-manager/active-calls`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching active calls:', error);
      throw error;
    }
  },

  // Get call history
  getCallHistory: async (filters?: {
    patientId?: string;
    therapistId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<CallDetail[]> => {
    try {
      const response = await axios.get(`${API_URL}/api/call-manager/call-history`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching call history:', error);
      throw error;
    }
  },

  // Get call details
  getCallDetail: async (callId: string): Promise<CallDetail> => {
    try {
      const response = await axios.get(`${API_URL}/api/call-manager/calls/${callId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching call details for call ID ${callId}:`, error);
      throw error;
    }
  },

  // Verify a call
  verifyCall: async (verification: CallVerification): Promise<CallDetail> => {
    try {
      const response = await axios.post(
        `${API_URL}/api/call-manager/calls/${verification.callId}/verify`,
        verification
      );
      return response.data;
    } catch (error) {
      console.error('Error verifying call:', error);
      throw error;
    }
  },

  // Update call status
  updateCallStatus: async (statusUpdate: CallStatusUpdate): Promise<CallDetail> => {
    try {
      const response = await axios.post(
        `${API_URL}/api/call-manager/calls/${statusUpdate.callId}/status`,
        statusUpdate
      );
      return response.data;
    } catch (error) {
      console.error('Error updating call status:', error);
      throw error;
    }
  },

  // Join a call
  joinCall: async (callId: string): Promise<{ status: string; message: string }> => {
    try {
      const response = await axios.post(`${API_URL}/api/call-manager/calls/${callId}/join`);
      return response.data;
    } catch (error) {
      console.error(`Error joining call ${callId}:`, error);
      throw error;
    }
  },

  // Generate call summary
  generateCallSummary: async (callId: string): Promise<CallSummary> => {
    try {
      const response = await axios.post(`${API_URL}/api/call-manager/calls/${callId}/summary`);
      return response.data;
    } catch (error) {
      console.error(`Error generating summary for call ${callId}:`, error);
      throw error;
    }
  },

  // Get MCP configuration
  getMCPConfig: async (): Promise<MCPConfig> => {
    try {
      const response = await axios.get(`${API_URL}/api/call-manager/mcp-config`);
      return response.data;
    } catch (error) {
      console.error('Error fetching MCP configuration:', error);
      throw error;
    }
  },

  // Update MCP configuration
  updateMCPConfig: async (config: MCPConfig): Promise<MCPConfig> => {
    try {
      const response = await axios.post(`${API_URL}/api/call-manager/mcp-config`, config);
      return response.data;
    } catch (error) {
      console.error('Error updating MCP configuration:', error);
      throw error;
    }
  },

  // Create a new call
  createCall: async (callParams: CreateCallParams): Promise<CallDetail> => {
    try {
      const response = await axios.post(`${API_URL}/api/call-manager/create-call`, callParams);
      return response.data;
    } catch (error) {
      console.error('Error creating call:', error);
      throw error;
    }
  }
};

export default callManagerService;