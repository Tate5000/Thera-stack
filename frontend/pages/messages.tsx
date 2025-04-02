import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useMessages } from '../context/MessageContext';
import ConversationList from '../components/messaging/ConversationList';
import ConversationView from '../components/messaging/ConversationView';
import NewConversationModal from '../components/messaging/NewConversationModal';

const MessagesPage: NextPage = () => {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuth();
  const { startConversation } = useMessages();
  
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  
  // Redirect to login if not authenticated
  if (isInitialized && !isAuthenticated) {
    router.push('/login');
    return null;
  }
  
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };
  
  const handleCreateConversation = async (
    participantIds: string[],
    title?: string,
    isGroup?: boolean
  ) => {
    try {
      const newConversationId = await startConversation(participantIds, title, isGroup);
      setSelectedConversationId(newConversationId);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Messages</h1>
        <button
          onClick={() => setIsNewConversationModalOpen(true)}
          className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          New Conversation
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversation List */}
        <div className="md:col-span-1 h-full border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
          <ConversationList
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversationId}
          />
        </div>
        
        {/* Conversation View */}
        <div className="md:col-span-2 h-full border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
          {selectedConversationId ? (
            <ConversationView conversationId={selectedConversationId} />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Select a conversation or start a new one
                </p>
                <button
                  onClick={() => setIsNewConversationModalOpen(true)}
                  className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700"
                >
                  Start New Conversation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={isNewConversationModalOpen}
        onClose={() => setIsNewConversationModalOpen(false)}
        onCreateConversation={handleCreateConversation}
      />
    </div>
  );
};

export default MessagesPage;