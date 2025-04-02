import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  fetchPatientDocuments, 
  deleteDocument, 
  uploadDocument, 
  Document 
} from '../../services/documentService';
import DocumentList from '../../components/documents/DocumentList';
import DocumentDetail from '../../components/documents/DocumentDetail';
import DocumentUpload from '../../components/documents/DocumentUpload';

export default function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [patientId, setPatientId] = useState<string>('');
  
  // For admin role: patient selection
  const [availablePatients, setAvailablePatients] = useState([
    { id: 'patient1', name: 'Alex Garcia' },
    { id: 'patient2', name: 'Jordan Smith' },
    { id: 'patient3', name: 'Taylor Brown' }
  ]);

  // Set the patient ID based on the user role
  useEffect(() => {
    if (!user) return;
    
    if (user.role === 'patient') {
      setPatientId(user.id);
    } else if (user.role === 'doctor') {
      // For doctors, default to their first patient
      setPatientId('patient1');
    } else if (user.role === 'admin' && !patientId) {
      // For admins, default to the first patient in the list
      setPatientId('patient1');
    }
  }, [user, patientId]);

  // Load documents whenever the patientId changes
  const loadDocuments = useCallback(async () => {
    if (!patientId) return;
    
    try {
      setIsLoading(true);
      const data = await fetchPatientDocuments(patientId);
      setDocuments(data);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc);
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await deleteDocument(docId);
      setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== docId));
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const handleUploadComplete = () => {
    setShowUploadModal(false);
    loadDocuments();
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold">Patient Documents</h1>
        
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          {/* Patient selector for admin/doctor */}
          {user && (user.role === 'admin' || user.role === 'doctor') && (
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="border rounded px-3 py-1.5"
            >
              {availablePatients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          )}
          
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Upload Document
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <DocumentList
          documents={documents}
          onViewDocument={handleViewDocument}
          onDeleteDocument={handleDeleteDocument}
          isLoading={isLoading}
        />
      </div>
      
      {/* Document detail modal */}
      {selectedDocument && (
        <DocumentDetail
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
      
      {/* Document upload modal */}
      {showUploadModal && (
        <DocumentUpload
          patientId={patientId}
          onUploadComplete={handleUploadComplete}
          onCancel={() => setShowUploadModal(false)}
        />
      )}
    </div>
  );
}