import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  getConversations,
  getConversation,
  createConversation,
  sendMessage,
  sendFileMessage,
  deleteMessage,
  Conversation,
  Message,
  ConversationWithLatestMessage,
} from '../services/messageService';

interface MessageContextType {
  conversations: ConversationWithLatestMessage[];
  currentConversation: { conversation: Conversation; messages: Message[] } | null;
  loadingConversations: boolean;
  loadingMessages: boolean;
  error: string | null;
  fetchConversations: () => Promise<void>;
  fetchConversation: (conversationId: string) => Promise<void>;
  startConversation: (participantIds: string[], title?: string, isGroup?: boolean) => Promise<string>;
  sendTextMessage: (conversationId: string, content: string) => Promise<void>;
  sendAttachment: (conversationId: string, content: string, file: File) => Promise<void>;
  removeMessage: (messageId: string) => Promise<void>;
  getUnreadCount: () => number;
}

export const MessageContext = createContext<MessageContextType | null>(null);

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithLatestMessage[]>([]);
  const [currentConversation, setCurrentConversation] = useState<{ conversation: Conversation; messages: Message[] } | null>(null);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Fetch conversations when user changes
  useEffect(() => {
    if (user) {
      // Fetch initial data
      fetchConversations();
      
      // Set up polling for new messages (every 10 seconds)
      const interval = setInterval(() => {
        if (user && isAuthenticated) {
          fetchConversations(true);
          if (currentConversation) {
            fetchConversation(currentConversation.conversation.id, true);
          }
        }
      }, 10000);
      
      setPollingInterval(interval);
      
      return () => {
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
      };
    } else {
      // Clear data if user logs out
      setConversations([]);
      setCurrentConversation(null);
    }
  }, [user?.id, isAuthenticated]);
  
  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  const fetchConversations = async (silent = false) => {
    if (!user) return;
    
    if (!silent) {
      setLoadingConversations(true);
    }
    setError(null);
    
    try {
      const response = await getConversations();
      setConversations(response.conversations);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
    } finally {
      if (!silent) {
        setLoadingConversations(false);
      }
    }
  };

  const fetchConversation = async (conversationId: string, silent = false) => {
    if (!user) return;
    
    if (!silent) {
      setLoadingMessages(true);
    }
    setError(null);
    
    try {
      const response = await getConversation(conversationId);
      setCurrentConversation({
        conversation: response.conversation,
        messages: response.messages,
      });
    } catch (err) {
      console.error('Error fetching conversation:', err);
      setError('Failed to load conversation');
    } finally {
      if (!silent) {
        setLoadingMessages(false);
      }
    }
  };

  const startConversation = async (participantIds: string[], title?: string, isGroup = false) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoadingConversations(true);
    setError(null);
    
    try {
      const response = await createConversation(participantIds, title, isGroup);
      await fetchConversations(); // Refresh the list
      return response.conversation.id;
    } catch (err) {
      console.error('Error starting conversation:', err);
      setError('Failed to start conversation');
      throw err;
    } finally {
      setLoadingConversations(false);
    }
  };

  const sendTextMessage = async (conversationId: string, content: string) => {
    if (!user) return;
    
    setError(null);
    
    try {
      const response = await sendMessage(conversationId, content);
      
      // Update current conversation if this is the active one
      if (currentConversation && currentConversation.conversation.id === conversationId) {
        setCurrentConversation({
          ...currentConversation,
          messages: [...currentConversation.messages, response.message],
        });
      }
      
      // Update the conversations list with this latest message
      const updatedConversations = conversations.map(conv => {
        if (conv.conversation.id === conversationId) {
          return {
            ...conv,
            latest_message: response.message,
            conversation: {
              ...conv.conversation,
              last_message: content,
              updated_at: new Date().toISOString(),
            },
          };
        }
        return conv;
      });
      
      // Sort by most recent activity
      updatedConversations.sort((a, b) => {
        return new Date(b.conversation.updated_at).getTime() - new Date(a.conversation.updated_at).getTime();
      });
      
      setConversations(updatedConversations);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const sendAttachment = async (conversationId: string, content: string, file: File) => {
    if (!user) return;
    
    setError(null);
    
    try {
      const response = await sendFileMessage(conversationId, content, file);
      
      // Update current conversation if this is the active one
      if (currentConversation && currentConversation.conversation.id === conversationId) {
        setCurrentConversation({
          ...currentConversation,
          messages: [...currentConversation.messages, response.message],
        });
      }
      
      // Refresh the conversation list
      await fetchConversations(true);
    } catch (err) {
      console.error('Error sending file:', err);
      setError('Failed to send file');
    }
  };

  const removeMessage = async (messageId: string) => {
    if (!user) return;
    
    setError(null);
    
    try {
      await deleteMessage(messageId);
      
      // Update current conversation if affected
      if (currentConversation) {
        const messageIndex = currentConversation.messages.findIndex(m => m.id === messageId);
        
        if (messageIndex !== -1) {
          const updatedMessages = [...currentConversation.messages];
          updatedMessages[messageIndex] = {
            ...updatedMessages[messageIndex],
            is_deleted: true,
            content: 'This message was deleted',
          };
          
          setCurrentConversation({
            ...currentConversation,
            messages: updatedMessages,
          });
        }
      }
      
      // Refresh conversations to update latest messages if needed
      await fetchConversations(true);
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Failed to delete message');
    }
  };

  const getUnreadCount = () => {
    return conversations.reduce((count, conv) => count + conv.unread_count, 0);
  };

  const value = {
    conversations,
    currentConversation,
    loadingConversations,
    loadingMessages,
    error,
    fetchConversations,
    fetchConversation,
    startConversation,
    sendTextMessage,
    sendAttachment,
    removeMessage,
    getUnreadCount,
  };

  return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>;
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (context === null) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};