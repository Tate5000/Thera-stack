import React, { useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMessages } from '../../context/MessageContext';
import MessageBubble from './MessageBubble';
import MessageComposer from './MessageComposer';

interface ConversationViewProps {
  conversationId: string;
}

const ConversationView: React.FC<ConversationViewProps> = ({ conversationId }) => {
  const { user } = useAuth();
  const {
    currentConversation,
    loadingMessages,
    error,
    fetchConversation,
    sendTextMessage,
    sendAttachment,
    removeMessage,
  } = useMessages();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversation when ID changes
  useEffect(() => {
    if (conversationId) {
      fetchConversation(conversationId);
    }
  }, [conversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages?.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (content: string) => {
    if (conversationId) {
      sendTextMessage(conversationId, content);
    }
  };

  const handleSendFile = (content: string, file: File) => {
    if (conversationId) {
      sendAttachment(conversationId, content, file);
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      removeMessage(messageId);
    }
  };

  // Get conversation title
  const getConversationTitle = () => {
    if (!currentConversation) return '';

    // If group chat with title, use that
    if (currentConversation.conversation.is_group && currentConversation.conversation.title) {
      return currentConversation.conversation.title;
    }

    // Otherwise use other participant name(s)
    const otherParticipants = currentConversation.conversation.participants.filter(
      (p) => p.id !== user?.id
    );

    if (otherParticipants.length === 0) {
      return 'Chat with yourself';
    }

    if (otherParticipants.length === 1) {
      return otherParticipants[0].name;
    }

    return `${otherParticipants[0].name} and ${otherParticipants.length - 1} others`;
  };

  // Get role tags for display
  const getParticipantRoleTags = () => {
    if (!currentConversation) return null;

    const participants = currentConversation.conversation.participants;
    if (participants.length <= 1) return null;

    // Get counts by role
    const roleCounts = participants.reduce((counts, p) => {
      counts[p.role] = (counts[p.role] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    return (
      <div className="flex space-x-1 mt-1">
        {Object.entries(roleCounts).map(([role, count]) => (
          <span
            key={role}
            className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            {role}: {count}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-3 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {getConversationTitle()}
          </h2>
          {getParticipantRoleTags()}
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {loadingMessages && !currentConversation ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400">Loading messages...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-red-500 dark:text-red-400">{error}</p>
          </div>
        ) : !currentConversation ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400">Select a conversation</p>
          </div>
        ) : currentConversation.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          currentConversation.messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isCurrentUser={message.sender_id === user?.id}
              showSenderName={currentConversation.conversation.is_group}
              onDelete={handleDeleteMessage}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message composer */}
      <MessageComposer
        onSendMessage={handleSendMessage}
        onSendFile={handleSendFile}
        disabled={!currentConversation}
      />
    </div>
  );
};

export default ConversationView;