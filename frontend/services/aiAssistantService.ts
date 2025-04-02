import axios from 'axios';

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Interfaces
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AssistantContext {
  hasAccess: boolean;
  userId: string;
  userRole: string;
  accessibleData: string[];
  timezone: string;
  metadata?: Record<string, any>;
}

export interface SendMessageRequest {
  userId: string;
  content: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

// In memory storage for message history
const messageHistoryStore: Record<string, Message[]> = {};

// Sample AI responses based on keywords in the message
const getAIResponse = (message: string, context: AssistantContext): string => {
  const lowerMessage = message.toLowerCase();
  
  // Check for scheduling/appointment related keywords
  if (lowerMessage.includes('schedule') || lowerMessage.includes('appointment') || lowerMessage.includes('book')) {
    if (context.userRole === 'patient') {
      return "I can help you schedule an appointment. Based on your therapy plan, I see you typically meet weekly. I have availability next Tuesday at 2:00 PM or Wednesday at 10:00 AM. Would either of those work for you?";
    } else {
      return "I can help manage your appointment schedule. Would you like to view upcoming appointments, schedule a new session, or check availability for a specific date?";
    }
  }
  
  // Check for billing/payment related keywords
  if (lowerMessage.includes('bill') || lowerMessage.includes('payment') || lowerMessage.includes('insurance') || lowerMessage.includes('cost')) {
    if (context.userRole === 'patient') {
      return "Your next payment of $75.00 is due on April 15th. Your insurance typically covers 80% of your session cost. Would you like me to show your payment history or help you set up automatic payments?";
    } else if (context.userRole === 'doctor') {
      return "I can help with billing information for your patients. Would you like to check payment status for a specific patient, create a superbill, or review your outstanding claims?";
    } else {
      return "I can provide information about billing and payments across the system. Would you like to see payment statistics, insurance claim status, or financial reports?";
    }
  }
  
  // Check for session history related keywords
  if (lowerMessage.includes('session') || lowerMessage.includes('history') || lowerMessage.includes('previous')) {
    if (context.userRole === 'patient') {
      return "Looking at your session history, you've had 8 sessions so far. Your last session was on March 25th where you discussed anxiety management techniques. Your therapist noted good progress with the breathing exercises. Would you like more details about a specific session?";
    } else if (context.userRole === 'doctor') {
      return "I can help you access session histories for your patients. Which patient's records would you like to review?";
    } else {
      return "As an administrator, you have access to all session records. Would you like to search by patient, therapist, date range, or session type?";
    }
  }
  
  // Check for emotional support or therapy-related keywords
  if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || lowerMessage.includes('stress') || lowerMessage.includes('worried')) {
    return "I understand you're feeling anxious. Many people experience anxiety, and it's important to acknowledge these feelings. Would you like to try a quick breathing exercise that many patients find helpful? Or I can share some information about your upcoming therapy session where you can discuss this further with your therapist.";
  }
  
  if (lowerMessage.includes('sad') || lowerMessage.includes('depress') || lowerMessage.includes('down')) {
    return "I'm sorry to hear you're feeling down. It's important to talk about these feelings with your therapist. Your next session is scheduled for April 5th, but if you need support sooner, I can help you schedule an earlier appointment or connect you with crisis resources if needed.";
  }
  
  // Default responses based on user role
  const patientResponses = [
    "How can I help with your therapy journey today? I can assist with scheduling, payments, or therapy resources.",
    "Is there anything specific about your treatment plan you'd like to discuss?",
    "Would you like me to make a note for your therapist about this for your next session?"
  ];
  
  const doctorResponses = [
    "How can I help you with patient management today? I can assist with scheduling, patient records, or billing.",
    "Would you like me to retrieve information about a specific patient or session?",
    "Is there anything else you need assistance with regarding your practice management?"
  ];
  
  const adminResponses = [
    "How can I help you with system management today? I can assist with user accounts, system settings, or analytics.",
    "Would you like me to generate reports or provide system statistics?",
    "Is there a specific administrative task you need assistance with?"
  ];
  
  const defaultResponses = [
    "I'm here to assist with your therapy experience. How can I help you today?",
    "Thank you for your message. What specific information are you looking for?",
    "I'm available to help with appointments, therapy resources, and general questions. What do you need?"
  ];
  
  // Select response based on user role
  let responses;
  if (context.userRole === 'patient') {
    responses = patientResponses;
  } else if (context.userRole === 'doctor') {
    responses = doctorResponses;
  } else if (context.userRole === 'admin') {
    responses = adminResponses;
  } else {
    responses = defaultResponses;
  }
  
  return responses[Math.floor(Math.random() * responses.length)];
};

// Service methods
const aiAssistantService = {
  // Get context information for the AI assistant
  getAssistantContext: async (userId: string): Promise<AssistantContext> => {
    try {
      // In a real app, this would be an API call
      // return axios.get(`${API_URL}/api/ai-assistant/context`, { params: { userId } })
      //   .then(response => response.data);

      // For now, return mock data based on user ID
      return new Promise((resolve) => {
        setTimeout(() => {
          let userRole, accessibleData;
          
          // Determine role from user ID pattern (in a real app, this would come from a user service)
          if (userId.startsWith('p')) {
            userRole = 'patient';
            accessibleData = ['appointments', 'billing', 'session_history'];
          } else if (userId.startsWith('d')) {
            userRole = 'doctor';
            accessibleData = ['appointments', 'patient_records', 'billing', 'session_history'];
          } else if (userId.startsWith('a')) {
            userRole = 'admin';
            accessibleData = ['all_appointments', 'user_management', 'system_settings', 'billing', 'analytics'];
          } else {
            userRole = 'unknown';
            accessibleData = ['limited'];
          }
          
          const context: AssistantContext = {
            hasAccess: true,
            userId,
            userRole,
            accessibleData,
            timezone: 'America/New_York',
            metadata: {
              lastLogin: new Date().toISOString(),
              sessionCount: 12,
              preferredCommunication: 'chat'
            }
          };
          
          resolve(context);
        }, 300); // Simulated delay
      });
    } catch (error) {
      console.error('Error fetching assistant context:', error);
      throw error;
    }
  },
  
  // Get message history for a user
  getMessageHistory: async (userId: string, limit: number = 50): Promise<Message[]> => {
    try {
      // In a real app, this would be an API call
      // return axios.get(`${API_URL}/api/ai-assistant/messages`, { params: { userId, limit } })
      //   .then(response => response.data);

      // For now, use in-memory store
      return new Promise((resolve) => {
        setTimeout(() => {
          const userMessages = messageHistoryStore[userId] || [];
          
          // If no messages, create an initial welcome message
          if (userMessages.length === 0) {
            const welcomeMessage: Message = {
              id: '1',
              content: "Hello! I'm your AI therapy assistant. How can I help you today?",
              sender: 'ai',
              timestamp: new Date().toISOString()
            };
            
            messageHistoryStore[userId] = [welcomeMessage];
            resolve([welcomeMessage]);
          } else {
            // Return most recent messages up to the limit
            resolve(userMessages.slice(-limit));
          }
        }, 300); // Simulated delay
      });
    } catch (error) {
      console.error('Error fetching message history:', error);
      throw error;
    }
  },
  
  // Send a message to the AI assistant
  sendMessage: async (request: SendMessageRequest): Promise<Message> => {
    try {
      // In a real app, this would be an API call
      // return axios.post(`${API_URL}/api/ai-assistant/messages`, request)
      //   .then(response => response.data);

      // For now, simulate AI response
      return new Promise(async (resolve) => {
        // First, store the user message
        const userMessage: Message = {
          id: `${Date.now()}-user`,
          content: request.content,
          sender: 'user',
          timestamp: new Date().toISOString(),
          metadata: request.metadata
        };
        
        if (!messageHistoryStore[request.userId]) {
          messageHistoryStore[request.userId] = [];
        }
        
        messageHistoryStore[request.userId].push(userMessage);
        
        // Get the context for generating a response
        const context = await aiAssistantService.getAssistantContext(request.userId);
        
        // Simulate processing delay
        setTimeout(() => {
          // Generate AI response
          const aiResponse = getAIResponse(request.content, context);
          
          // Create AI message
          const aiMessage: Message = {
            id: `${Date.now()}-ai`,
            content: aiResponse,
            sender: 'ai',
            timestamp: new Date().toISOString()
          };
          
          // Store AI response
          messageHistoryStore[request.userId].push(aiMessage);
          
          // Return the AI message
          resolve(aiMessage);
        }, 1000); // Simulated processing delay
      });
    } catch (error) {
      console.error('Error sending message to AI assistant:', error);
      throw error;
    }
  },
  
  // Clear message history for a user
  clearMessageHistory: async (userId: string): Promise<void> => {
    try {
      // In a real app, this would be an API call
      // return axios.delete(`${API_URL}/api/ai-assistant/messages`, { params: { userId } })
      //   .then(response => response.data);

      // For now, clear in-memory store
      return new Promise((resolve) => {
        setTimeout(() => {
          delete messageHistoryStore[userId];
          resolve();
        }, 300); // Simulated delay
      });
    } catch (error) {
      console.error('Error clearing message history:', error);
      throw error;
    }
  }
};

export default aiAssistantService;