import React, { useState } from 'react';
import { Document } from '../../services/documentService';
import Link from 'next/link';

interface DocumentListProps {
  documents: Document[];
  onViewDocument: (doc: Document) => void;
  onDeleteDocument: (docId: string) => void;
  isLoading: boolean;
}

// Utility function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
};

const DocumentList: React.FC<DocumentListProps> = ({ 
  documents, 
  onViewDocument, 
  onDeleteDocument,
  isLoading 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Filter documents based on search term and type
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesType = filterType === 'all' || doc.type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Get document icon based on type
  const getDocumentIcon = (type: string, fileType: string) => {
    if (type === 'transcript') return '📝';
    if (type === 'assessment') return '📋';
    if (type === 'report') return '📊';
    if (type === 'note') return '📔';
    
    // By file type
    if (fileType === 'pdf') return '📄';
    if (fileType === 'csv') return '📈';
    if (fileType === 'txt') return '📃';
    
    return '📁';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Patient Documents</h2>
        
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search documents..."
            className="border dark:border-gray-600 rounded px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border dark:border-gray-600 rounded px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Types</option>
            <option value="transcript">Transcripts</option>
            <option value="assessment">Assessments</option>
            <option value="note">Notes</option>
            <option value="report">Reports</option>
            <option value="upload">Uploads</option>
          </select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <p className="text-gray-500 dark:text-gray-400">Loading documents...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {searchTerm || filterType !== 'all' 
            ? 'No documents match your search criteria'
            : 'No documents available'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Document</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Size</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">{getDocumentIcon(doc.type, doc.fileType)}</span>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{doc.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {doc.tags?.map((tag, index) => (
                            <span 
                              key={index} 
                              className="inline-block bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5 text-xs text-gray-800 dark:text-gray-200 mr-1 mb-1"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="uppercase text-xs font-medium text-gray-800 dark:text-gray-200">{doc.type}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(doc.uploadDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatFileSize(doc.fileSize)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onViewDocument(doc)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onDeleteDocument(doc.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DocumentList;