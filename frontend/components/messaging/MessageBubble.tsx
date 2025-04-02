import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Message } from '../../services/messageService';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  showSenderName?: boolean;
  onDelete?: (messageId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
  showSenderName = false,
  onDelete
}) => {
  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return '';
    }
  };

  // Format date if message is from a different day
  const formatMessageDate = (timestamp: string) => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // If same day, don't show date
    if (messageDate.toDateString() === today.toDateString()) {
      return null;
    }

    // If yesterday, show "Yesterday"
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    // Otherwise show full date
    return messageDate.toLocaleDateString();
  };

  // Get appropriate file icon based on file type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎬';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📑';
    return '📎';
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return '🛡️';
      case 'doctor':
        return '⚕️';
      case 'patient':
        return '🧑';
      default:
        return '👤';
    }
  };

  // Handle file download
  const handleFileDownload = (url: string, filename: string) => {
    // In a real app, this would download the file
    // For demo purposes, we'll just alert
    alert(`Downloading ${filename}...`);
  };

  return (
    <div className={`mb-4 ${isCurrentUser ? 'flex justify-end' : 'flex justify-start'}`}>
      <div className={`max-w-[75%] ${isCurrentUser ? 'order-1' : 'order-2'}`}>
        {/* Date header - show if needed */}
        {formatMessageDate(message.created_at) && (
          <div className="text-center my-4">
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
              {formatMessageDate(message.created_at)}
            </span>
          </div>
        )}

        {/* Sender name for group chats */}
        {showSenderName && !isCurrentUser && (
          <div className="ml-2 mb-1 flex items-center">
            <span className="mr-1">{getRoleIcon(message.sender_role)}</span>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {message.sender_name}
            </span>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`relative group ${
            isCurrentUser
              ? 'bg-blue-500 text-white rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-lg'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-sm rounded-tr-lg rounded-br-lg rounded-bl-lg'
          } px-3 py-2 shadow-sm`}
        >
          {/* Message content */}
          {message.is_deleted ? (
            <p className="italic text-gray-500 dark:text-gray-400 text-sm">
              This message was deleted
            </p>
          ) : (
            <>
              {/* Text content */}
              {message.content && <p className="whitespace-pre-wrap mb-1">{message.content}</p>}

              {/* File attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2">
                  {message.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className={`flex items-center p-2 rounded-md mt-1 ${
                        isCurrentUser
                          ? 'bg-blue-400 hover:bg-blue-600'
                          : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                      } cursor-pointer transition-colors`}
                      onClick={() => handleFileDownload(attachment.url, attachment.name)}
                    >
                      <span className="mr-2">{getFileIcon(attachment.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm truncate ${
                            isCurrentUser ? 'text-white' : 'text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {attachment.name}
                        </p>
                        <p
                          className={`text-xs ${
                            isCurrentUser
                              ? 'text-blue-100'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {(attachment.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <span
                        className={`text-sm ${
                          isCurrentUser ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        ↓
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Delete button (for user's own messages) */}
          {isCurrentUser && onDelete && !message.is_deleted && (
            <button
              onClick={() => onDelete(message.id)}
              className="absolute -right-8 top-0 p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}

          {/* Message timestamp */}
          <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
            {formatTime(message.created_at)}
            {message.read_at && isCurrentUser && (
              <span className="ml-1" title="Read">
                ✓
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;