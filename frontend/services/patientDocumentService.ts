import { v4 as uuidv4 } from 'uuid';

// Document types
export type DocumentType = 'transcription' | 'summary' | 'report' | 'note' | 'assessment' | 'prescription';

export interface PatientDocument {
  id: string;
  patientId: string;
  doctorId: string;
  sessionId?: string;
  title: string;
  content: string;
  type: DocumentType;
  fileName?: string;
  fileUrl?: string;
  mimeType?: string;
  fileSize?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// Storage key for localStorage
const STORAGE_KEY = 'patient_documents';

// Helper functions
const getStoredDocuments = (): PatientDocument[] => {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }
  
  return JSON.parse(stored);
};

const storeDocuments = (documents: PatientDocument[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  }
};

// Service methods
export const patientDocumentService = {
  getAllDocuments: async (): Promise<PatientDocument[]> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    return getStoredDocuments();
  },
  
  getPatientDocuments: async (patientId: string): Promise<PatientDocument[]> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    
    const documents = getStoredDocuments();
    return documents.filter(doc => doc.patientId === patientId);
  },
  
  getSessionDocuments: async (sessionId: string): Promise<PatientDocument[]> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    
    const documents = getStoredDocuments();
    return documents.filter(doc => doc.sessionId === sessionId);
  },
  
  uploadTranscription: async (
    patientId: string,
    doctorId: string,
    sessionId: string,
    title: string,
    transcript: string,
    audioBlob?: Blob
  ): Promise<PatientDocument> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload delay
    
    let fileUrl, fileName, fileSize, mimeType;
    
    // If audio blob is provided, create a "simulated" file URL
    if (audioBlob) {
      fileName = `session-${sessionId}-recording.mp3`;
      fileUrl = URL.createObjectURL(audioBlob);
      fileSize = audioBlob.size;
      mimeType = audioBlob.type;
    }
    
    const now = new Date().toISOString();
    const newDocument: PatientDocument = {
      id: uuidv4(),
      patientId,
      doctorId,
      sessionId,
      title,
      content: transcript,
      type: 'transcription',
      fileName,
      fileUrl,
      fileSize,
      mimeType,
      tags: ['session', 'transcription'],
      createdAt: now,
      updatedAt: now
    };
    
    const documents = getStoredDocuments();
    const updatedDocuments = [...documents, newDocument];
    storeDocuments(updatedDocuments);
    
    return newDocument;
  },
  
  uploadSessionSummary: async (
    patientId: string,
    doctorId: string,
    sessionId: string,
    title: string,
    summary: string
  ): Promise<PatientDocument> => {
    await new Promise(resolve => setTimeout(resolve, 700)); // Simulate processing delay
    
    const now = new Date().toISOString();
    const newDocument: PatientDocument = {
      id: uuidv4(),
      patientId,
      doctorId,
      sessionId,
      title,
      content: summary,
      type: 'summary',
      tags: ['session', 'summary', 'ai-generated'],
      createdAt: now,
      updatedAt: now
    };
    
    const documents = getStoredDocuments();
    const updatedDocuments = [...documents, newDocument];
    storeDocuments(updatedDocuments);
    
    return newDocument;
  },
  
  deleteDocument: async (documentId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    const documents = getStoredDocuments();
    const updatedDocuments = documents.filter(doc => doc.id !== documentId);
    
    if (documents.length === updatedDocuments.length) {
      throw new Error('Document not found');
    }
    
    storeDocuments(updatedDocuments);
  }
};