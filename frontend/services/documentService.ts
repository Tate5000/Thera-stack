// Document types and mock data for the document management system

export interface Document {
  id: string;
  name: string;
  patientId: string;
  type: 'transcript' | 'note' | 'assessment' | 'upload' | 'report';
  uploadedBy: string;
  uploadDate: string;
  fileType: string;
  fileSize: number;
  url: string;
  content?: string;
  tags?: string[];
  aiSummary?: string;
  appointmentId?: string;
}

// Mock documents for demo purposes
const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'doc-001',
    name: 'Initial Assessment',
    patientId: 'patient1',
    type: 'assessment',
    uploadedBy: 'therapist1',
    uploadDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    fileType: 'pdf',
    fileSize: 256000,
    url: '/mock-docs/assessment.pdf',
    tags: ['initial', 'assessment', 'intake'],
    aiSummary: 'Patient shows signs of mild anxiety and work-related stress. Recommended weekly therapy sessions.'
  },
  {
    id: 'doc-002',
    name: 'Session Transcript - March 15, 2025',
    patientId: 'patient1',
    type: 'transcript',
    uploadedBy: 'system',
    uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    fileType: 'txt',
    fileSize: 45000,
    url: '/mock-docs/transcript.txt',
    content: 'Therapist: How have you been feeling this week?\nPatient: I\'ve been managing my stress better using the techniques we discussed...',
    appointmentId: 'appt-previous1',
    tags: ['session', 'transcript'],
    aiSummary: 'Patient reports improved stress management. Implemented mindfulness techniques with positive results.'
  },
  {
    id: 'doc-003',
    name: 'Progress Report',
    patientId: 'patient1',
    type: 'report',
    uploadedBy: 'therapist1',
    uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    fileType: 'pdf',
    fileSize: 128000,
    url: '/mock-docs/report.pdf',
    tags: ['progress', 'monthly'],
    aiSummary: 'Patient shows notable improvement over the last month. Anxiety symptoms reduced by approximately 30%.'
  },
  {
    id: 'doc-004',
    name: 'Mood Tracking Data',
    patientId: 'patient1',
    type: 'upload',
    uploadedBy: 'patient1',
    uploadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    fileType: 'csv',
    fileSize: 15000,
    url: '/mock-docs/mood-data.csv',
    tags: ['mood', 'tracking', 'data']
  }
];

// Additional documents for other patients
const MOCK_DOCUMENTS_OTHER: Document[] = [
  {
    id: 'doc-005',
    name: 'Initial Assessment',
    patientId: 'patient2',
    type: 'assessment',
    uploadedBy: 'therapist2',
    uploadDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    fileType: 'pdf',
    fileSize: 240000,
    url: '/mock-docs/assessment-p2.pdf',
    tags: ['initial', 'assessment', 'intake']
  },
  {
    id: 'doc-006',
    name: 'Medical Records',
    patientId: 'patient3',
    type: 'upload',
    uploadedBy: 'admin1',
    uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    fileType: 'pdf',
    fileSize: 3500000,
    url: '/mock-docs/medical-records.pdf',
    tags: ['medical', 'records', 'history']
  }
];

// Combine all mock documents
let mockDocumentsDb = [...MOCK_DOCUMENTS, ...MOCK_DOCUMENTS_OTHER];

// Fetch documents for a specific patient
export const fetchPatientDocuments = async (patientId: string): Promise<Document[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return mockDocumentsDb.filter(doc => doc.patientId === patientId);
};

// Fetch a specific document by ID
export const fetchDocumentById = async (documentId: string): Promise<Document | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return mockDocumentsDb.find(doc => doc.id === documentId) || null;
};

// Upload a new document
export const uploadDocument = async (document: Omit<Document, 'id'>): Promise<Document> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newDocument: Document = {
    ...document,
    id: `doc-${Date.now().toString(36)}`
  };
  
  mockDocumentsDb.push(newDocument);
  return newDocument;
};

// Delete a document
export const deleteDocument = async (documentId: string): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  mockDocumentsDb = mockDocumentsDb.filter(doc => doc.id !== documentId);
};

// Generate AI summary for a document
export const generateAiSummary = async (documentId: string): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const document = mockDocumentsDb.find(doc => doc.id === documentId);
  
  if (!document) {
    throw new Error('Document not found');
  }
  
  const summaries = [
    'Patient shows consistent progress with anxiety management techniques.',
    'Patient reports improved sleep quality and reduced stress levels over past week.',
    'Session focused on cognitive restructuring techniques for negative thought patterns.',
    'Patient demonstrates understanding and application of mindfulness exercises.',
    'Discussion centered on work-life balance strategies and boundary setting.'
  ];
  
  // Generate random summary for demo purposes
  const summary = summaries[Math.floor(Math.random() * summaries.length)];
  
  // Update document with AI summary
  const docIndex = mockDocumentsDb.findIndex(doc => doc.id === documentId);
  if (docIndex !== -1) {
    mockDocumentsDb[docIndex].aiSummary = summary;
  }
  
  return summary;
};