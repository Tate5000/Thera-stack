import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: (participantIds: string[], title?: string, isGroup?: boolean) => Promise<void>;
}

// Mock available users for demo purposes - would come from API in real app
const DEMO_USERS = [
  { id: 'admin1', name: 'Admin User', role: 'admin' },
  { id: 'doctor1', name: 'Dr. Sarah Johnson', role: 'doctor' },
  { id: 'patient1', name: 'Alex Garcia', role: 'patient' },
];

const NewConversationModal: React.FC<NewConversationModalProps> = ({
  isOpen,
  onClose,
  onCreateConversation,
}) => {
  const { user } = useAuth();
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [groupTitle, setGroupTitle] = useState('');
  const [isGroup, setIsGroup] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter out current user from available users
  const availableUsers = DEMO_USERS.filter((u) => u.id !== user?.id);

  const toggleUserSelection = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleCreateConversation = async () => {
    if (selectedUserIds.length === 0) {
      setError('Please select at least one participant');
      return;
    }

    if (isGroup && !groupTitle.trim()) {
      setError('Please enter a group name');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      await onCreateConversation(
        selectedUserIds,
        isGroup ? groupTitle.trim() : undefined,
        isGroup
      );
      handleClose();
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError('Failed to create conversation');
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setSelectedUserIds([]);
    setGroupTitle('');
    setIsGroup(false);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          New Conversation
        </h2>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md">
            {error}
          </div>
        )}

        {/* Group conversation toggle */}
        <div className="mb-4">
          <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={isGroup}
              onChange={(e) => setIsGroup(e.target.checked)}
              className="rounded text-blue-500 focus:ring-blue-500 dark:bg-gray-700"
            />
            <span>Create group conversation</span>
          </label>
        </div>

        {/* Group title */}
        {isGroup && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Group Name
            </label>
            <input
              type="text"
              value={groupTitle}
              onChange={(e) => setGroupTitle(e.target.value)}
              className="w-full px-3 py-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              placeholder="Enter group name"
            />
          </div>
        )}

        {/* User list */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Select Recipients
          </label>
          <div className="max-h-60 overflow-y-auto border dark:border-gray-600 rounded">
            {availableUsers.length === 0 ? (
              <p className="p-3 text-gray-500 dark:text-gray-400">No users available</p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {availableUsers.map((demoUser) => (
                  <li key={demoUser.id} className="p-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(demoUser.id)}
                        onChange={() => toggleUserSelection(demoUser.id)}
                        className="rounded text-blue-500 focus:ring-blue-500 dark:bg-gray-700"
                      />
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {demoUser.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {demoUser.role}
                        </p>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreateConversation}
            className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50"
            disabled={creating || selectedUserIds.length === 0 || (isGroup && !groupTitle.trim())}
          >
            {creating ? 'Creating...' : 'Start Conversation'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewConversationModal;