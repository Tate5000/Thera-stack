import React, { useState } from 'react';
import { Document, generateAiSummary } from '../../services/documentService';

interface DocumentDetailProps {
  document: Document | null;
  onClose: () => void;
}

const DocumentDetail: React.FC<DocumentDetailProps> = ({ document, onClose }) => {
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summary, setSummary] = useState<string | undefined>(document?.aiSummary);

  if (!document) return null;

  const handleGenerateSummary = async () => {
    try {
      setIsGeneratingSummary(true);
      const newSummary = await generateAiSummary(document.id);
      setSummary(newSummary);
    } catch (error) {
      console.error('Failed to generate summary:', error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Format date for display
  const formattedDate = new Date(document.uploadDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Render content based on document type
  const renderDocumentContent = () => {
    if (document.type === 'transcript' && document.content) {
      return (
        <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Transcript Content</h3>
          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 dark:text-gray-300">{document.content}</pre>
        </div>
      );
    }

    // For other document types (PDF, etc.) we'd normally render an iframe or viewer
    // For demo purposes, we'll just show a placeholder
    return (
      <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-8 rounded-md flex flex-col items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Document preview not available in demo mode</p>
        <button className="mt-4 px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors">
          Download {document.fileType.toUpperCase()}
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transition-colors">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">{document.name}</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="col-span-2">
              {renderDocumentContent()}
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Document Details</h3>
              <div className="text-sm">
                <p className="mb-1"><span className="font-medium text-gray-800 dark:text-gray-200">Type:</span> <span className="text-gray-700 dark:text-gray-300">{document.type.charAt(0).toUpperCase() + document.type.slice(1)}</span></p>
                <p className="mb-1"><span className="font-medium text-gray-800 dark:text-gray-200">Upload Date:</span> <span className="text-gray-700 dark:text-gray-300">{formattedDate}</span></p>
                <p className="mb-1">
                  <span className="font-medium text-gray-800 dark:text-gray-200">Uploaded By:</span>{' '}
                  <span className="text-gray-700 dark:text-gray-300">
                    {document.uploadedBy === 'system' 
                      ? 'System (Auto Generated)' 
                      : document.uploadedBy.includes('patient') 
                        ? 'Patient' 
                        : document.uploadedBy.includes('therapist') 
                          ? 'Therapist' 
                          : document.uploadedBy}
                  </span>
                </p>
                <p className="mb-3"><span className="font-medium text-gray-800 dark:text-gray-200">File Size:</span> <span className="text-gray-700 dark:text-gray-300">{(document.fileSize / 1024).toFixed(1)} KB</span></p>
                
                <div className="mb-3">
                  <span className="font-medium text-gray-800 dark:text-gray-200">Tags:</span>
                  <div className="mt-1">
                    {document.tags?.map((tag, index) => (
                      <span 
                        key={index} 
                        className="inline-block bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5 text-xs text-gray-800 dark:text-gray-200 mr-1 mb-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">AI Summary</h3>
                  {!summary && (
                    <button
                      onClick={handleGenerateSummary}
                      disabled={isGeneratingSummary}
                      className="text-sm px-2 py-1 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800 transition-colors"
                    >
                      {isGeneratingSummary ? 'Generating...' : 'Generate Summary'}
                    </button>
                  )}
                </div>
                
                {isGeneratingSummary ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">AI is analyzing the document...</p>
                  </div>
                ) : summary ? (
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">{summary}</p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">No AI summary available. Click "Generate Summary" to analyze this document.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;