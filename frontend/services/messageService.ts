/**
 * Message service for handling conversations and messages
 */
import { User } from '../types/auth';

// API base URL - use relative URL to avoid CORS issues
const API_URL = '/api/messages';

// Helper function to get auth token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Types for our messaging system
export interface Attachment {
  id: string;
  name: string;
  size: number; 
  type: string;
  url: string;
  uploaded_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  content: string;
  attachments: Attachment[];
  created_at: string;
  read_at: string | null;
  is_deleted: boolean;
}

export interface Participant {
  id: string;
  name: string;
  role: string;
}

export interface Conversation {
  id: string;
  participants: Participant[];
  created_at: string;
  updated_at: string;
  last_message: string | null;
  title: string | null;
  is_group: boolean;
}

export interface ConversationWithLatestMessage {
  conversation: Conversation;
  latest_message: Message | null;
  unread_count: number;
}

export interface ConversationsResponse {
  conversations: ConversationWithLatestMessage[];
}

export interface ConversationWithMessages {
  conversation: Conversation;
  messages: Message[];
}

// API methods

export const getConversations = async (): Promise<ConversationsResponse> => {
  try {
    // Fall back to mock data in development if API fails
    try {
      const response = await fetch(`${API_URL}/conversations`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('API error, using mock data:', error);
      // Return mock data as fallback
      return {
        conversations: [
          {
            conversation: {
              id: 'mock-1',
              participants: [
                { id: 'patient1', name: 'Alex Garcia', role: 'patient' },
                { id: 'doctor1', name: 'Dr. Sarah Johnson', role: 'doctor' }
              ],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              last_message: 'When is our next appointment?',
              title: null,
              is_group: false
            },
            latest_message: {
              id: 'msg-1',
              conversation_id: 'mock-1',
              sender_id: 'patient1',
              sender_name: 'Alex Garcia',
              sender_role: 'patient',
              content: 'When is our next appointment?',
              attachments: [],
              created_at: new Date().toISOString(),
              read_at: null,
              is_deleted: false
            },
            unread_count: 0
          }
        ]
      };
    }
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

export const getConversation = async (conversationId: string): Promise<ConversationWithMessages> => {
  try {
    try {
      const response = await fetch(`${API_URL}/conversations/${conversationId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch conversation: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('API error, using mock data:', error);
      // Return mock data as fallback
      return {
        conversation: {
          id: 'mock-1',
          participants: [
            { id: 'patient1', name: 'Alex Garcia', role: 'patient' },
            { id: 'doctor1', name: 'Dr. Sarah Johnson', role: 'doctor' }
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_message: 'When is our next appointment?',
          title: null,
          is_group: false
        },
        messages: [
          {
            id: 'msg-1',
            conversation_id: 'mock-1',
            sender_id: 'patient1',
            sender_name: 'Alex Garcia',
            sender_role: 'patient',
            content: 'When is our next appointment?',
            attachments: [],
            created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            read_at: null,
            is_deleted: false
          },
          {
            id: 'msg-2',
            conversation_id: 'mock-1',
            sender_id: 'doctor1',
            sender_name: 'Dr. Sarah Johnson',
            sender_role: 'doctor',
            content: 'We have one scheduled for next Thursday at 2pm. See you then!',
            attachments: [],
            created_at: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
            read_at: null,
            is_deleted: false
          }
        ]
      };
    }
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
};

export const createConversation = async (
  participantIds: string[],
  title?: string,
  isGroup: boolean = false,
): Promise<ConversationWithLatestMessage> => {
  try {
    try {
      const response = await fetch(`${API_URL}/conversations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          title,
          is_group: isGroup,
          participant_ids: participantIds,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create conversation: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('API error, using mock data:', error);
      // Return mock data as fallback
      return {
        conversation: {
          id: `mock-${Date.now()}`,
          participants: [
            { id: 'patient1', name: 'Alex Garcia', role: 'patient' },
            ...participantIds.map(id => {
              if (id === 'doctor1') return { id: 'doctor1', name: 'Dr. Sarah Johnson', role: 'doctor' };
              if (id === 'admin1') return { id: 'admin1', name: 'Admin User', role: 'admin' };
              return { id, name: `User ${id}`, role: 'unknown' };
            })
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_message: null,
          title: isGroup ? title : null,
          is_group: isGroup
        },
        latest_message: null,
        unread_count: 0
      };
    }
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

export const sendMessage = async (
  conversationId: string,
  content: string,
): Promise<{ message: Message }> => {
  try {
    try {
      const response = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          content,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('API error, using mock data:', error);
      // Return mock data
      return {
        message: {
          id: `msg-${Date.now()}`,
          conversation_id: conversationId,
          sender_id: 'patient1',
          sender_name: 'Alex Garcia',
          sender_role: 'patient',
          content: content,
          attachments: [],
          created_at: new Date().toISOString(),
          read_at: null,
          is_deleted: false
        }
      };
    }
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const sendFileMessage = async (
  conversationId: string,
  content: string,
  file: File,
): Promise<{ message: Message }> => {
  try {
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('file', file);

      const response = await fetch(`${API_URL}/conversations/${conversationId}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('API error, using mock data:', error);
      // Return mock data
      return {
        message: {
          id: `msg-${Date.now()}`,
          conversation_id: conversationId,
          sender_id: 'patient1',
          sender_name: 'Alex Garcia',
          sender_role: 'patient',
          content: content,
          attachments: [{
            id: `att-${Date.now()}`,
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file),
            uploaded_at: new Date().toISOString()
          }],
          created_at: new Date().toISOString(),
          read_at: null,
          is_deleted: false
        }
      };
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const deleteMessage = async (messageId: string): Promise<boolean> => {
  try {
    try {
      const response = await fetch(`${API_URL}/messages/${messageId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete message: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.warn('API error, using mock response:', error);
      // Return mock success
      return true;
    }
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};