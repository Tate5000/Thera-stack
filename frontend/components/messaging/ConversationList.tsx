import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMessages } from '../../context/MessageContext';
import { ConversationWithLatestMessage } from '../../services/messageService';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId: string | null;
}

const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  selectedConversationId,
}) => {
  const { user } = useAuth();
  const { conversations, loadingConversations, error } = useMessages();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter conversations by search term
  const filteredConversations = conversations.filter((conv) => {
    const searchLower = searchTerm.toLowerCase();
    
    // Search in conversation title
    if (conv.conversation.title && conv.conversation.title.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in participant names
    const hasMatchingParticipant = conv.conversation.participants.some(
      (p) => p.name.toLowerCase().includes(searchLower)
    );
    
    if (hasMatchingParticipant) {
      return true;
    }
    
    // Search in last message
    if (
      conv.conversation.last_message &&
      conv.conversation.last_message.toLowerCase().includes(searchLower)
    ) {
      return true;
    }
    
    return false;
  });

  // Get conversation display name
  const getConversationName = (conversation: ConversationWithLatestMessage) => {
    // If group chat with title, use that
    if (conversation.conversation.is_group && conversation.conversation.title) {
      return conversation.conversation.title;
    }
    
    // Otherwise, use the other participant's name
    const otherParticipants = conversation.conversation.participants.filter(
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

  // Get avatar for conversation (would use real images in production)
  const getAvatar = (conversation: ConversationWithLatestMessage) => {
    // If group, use group icon
    if (conversation.conversation.is_group) {
      return (
        <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
          <span className="text-lg">👥</span>
        </div>
      );
    }
    
    // Otherwise, use the other participant's avatar
    const otherParticipant = conversation.conversation.participants.find(
      (p) => p.id !== user?.id
    );
    
    if (!otherParticipant) {
      return (
        <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
          <span className="text-lg">👤</span>
        </div>
      );
    }
    
    // Get avatar based on role
    let avatar = '👤';
    if (otherParticipant.role === 'admin') avatar = '🛡️';
    if (otherParticipant.role === 'doctor') avatar = '⚕️';
    if (otherParticipant.role === 'patient') avatar = '🧑';
    
    return (
      <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
        <span className="text-lg">{avatar}</span>
      </div>
    );
  };

  // Format time
  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-gray-800 overflow-hidden">
      {/* Search */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          placeholder="Search conversations..."
          className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loadingConversations && conversations.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-500 dark:text-gray-400">Loading conversations...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-red-500 dark:text-red-400">{error}</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm 
                ? 'No conversations match your search' 
                : 'No conversations yet'}
            </p>
          </div>
        ) : (
          <ul>
            {filteredConversations.map((conv) => (
              <li
                key={conv.conversation.id}
                className={`p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                  selectedConversationId === conv.conversation.id
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : ''
                }`}
                onClick={() => onSelectConversation(conv.conversation.id)}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  {getAvatar(conv)}

                  {/* Conversation details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {getConversationName(conv)}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatTime(conv.conversation.updated_at)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {conv.latest_message?.content || conv.conversation.last_message || 'No messages yet'}
                      </p>
                      {conv.unread_count > 0 && (
                        <span className="ml-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ConversationList;