import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

interface DocumentUploadProps {
  patientId: string;
  onUploadComplete: () => void;
  onCancel: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ 
  patientId, 
  onUploadComplete,
  onCancel
}) => {
  const { user } = useAuth();
  const [fileName, setFileName] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState('upload');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name);
      
      // Auto-suggest document name if not set
      if (!documentName) {
        setDocumentName(file.name.split('.')[0]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fileName) {
      alert('Please select a file to upload');
      return;
    }
    
    try {
      setUploading(true);
      
      // Simulate upload progress
      const uploadTimer = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            clearInterval(uploadTimer);
            return 100;
          }
          return newProgress;
        });
      }, 300);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      clearInterval(uploadTimer);
      setProgress(100);
      
      setTimeout(() => {
        onUploadComplete();
      }, 500);
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold">Upload Document</h2>
            <button 
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Document Name</label>
              <input
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Document Type</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              >
                <option value="upload">General Upload</option>
                <option value="assessment">Assessment</option>
                <option value="note">Session Note</option>
                <option value="report">Progress Report</option>
                {user && user.role === 'admin' && (
                  <option value="transcript">Session Transcript</option>
                )}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., important, follow-up, review"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">File</label>
              <div className="flex items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.csv,.xlsx"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  disabled={uploading}
                >
                  Select File
                </button>
                <span className="ml-2 text-sm text-gray-600 truncate max-w-[200px]">
                  {fileName || 'No file selected'}
                </span>
              </div>
            </div>
            
            {uploading && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-center text-sm mt-1">{progress}% Uploaded</p>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border rounded"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                disabled={uploading || !fileName}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;