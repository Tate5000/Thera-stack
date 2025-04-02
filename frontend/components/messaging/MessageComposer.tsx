import React, { useState, useRef, ChangeEvent } from 'react';

interface MessageComposerProps {
  onSendMessage: (content: string) => void;
  onSendFile: (content: string, file: File) => void;
  disabled?: boolean;
}

const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  onSendFile,
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async () => {
    if (!message.trim() && !selectedFile) return;

    if (selectedFile) {
      // If we have a file, handle file upload
      setUploading(true);
      try {
        await onSendFile(message.trim(), selectedFile);
        setMessage('');
        setSelectedFile(null);
      } catch (error) {
        console.error('Error sending file:', error);
      } finally {
        setUploading(false);
      }
    } else {
      // Otherwise just send the text message
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Selected file preview */}
      {selectedFile && (
        <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md flex items-center justify-between">
          <div className="flex items-center">
            <span role="img" aria-label="file" className="mr-2">
              📎
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-xs">
              {selectedFile.name}
            </span>
          </div>
          <button
            type="button"
            onClick={removeSelectedFile}
            className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
          >
            ✕
          </button>
        </div>
      )}

      {/* Composer */}
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <textarea
            className="w-full p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={disabled || uploading}
          />
        </div>

        {/* File button */}
        <button
          type="button"
          onClick={triggerFileSelect}
          className="px-2 py-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
          disabled={disabled || uploading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
            />
          </svg>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </button>

        {/* Send button */}
        <button
          type="button"
          onClick={handleSendMessage}
          className={`px-4 py-2 rounded-md ${
            message.trim() || selectedFile
              ? 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
          disabled={(!message.trim() && !selectedFile) || disabled || uploading}
        >
          {uploading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Sending
            </span>
          ) : (
            <span>Send</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default MessageComposer;