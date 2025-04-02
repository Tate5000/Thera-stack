import { v4 as uuidv4 } from 'uuid';
import { 
  TherapySession, 
  SessionRecord, 
  SessionSummary, 
  SessionStatus, 
  PatientAssignment,
  SessionFilterCriteria,
  TranscriptionRequest,
  SummaryGenerationRequest
} from '../types/sessions';

// Storage keys for localStorage
const STORAGE_KEYS = {
  SESSIONS: 'therapy_sessions',
  RECORDS: 'session_records',
  SUMMARIES: 'session_summaries',
  ASSIGNMENTS: 'patient_assignments'
};

// Mock users (would come from authService in a real app)
const MOCK_PATIENTS = [
  { id: 'p1', name: 'Alice Johnson', email: 'alice@example.com', role: 'patient' },
  { id: 'p2', name: 'Bob Smith', email: 'bob@example.com', role: 'patient' },
  { id: 'p3', name: 'Carol Davis', email: 'carol@example.com', role: 'patient' },
  { id: 'p4', name: 'Dave Wilson', email: 'dave@example.com', role: 'patient' },
];

const MOCK_DOCTORS = [
  { id: 'd1', name: 'Dr. Emma Brown', email: 'emma@example.com', role: 'doctor' },
  { id: 'd2', name: 'Dr. Frank Miller', email: 'frank@example.com', role: 'doctor' },
];

const MOCK_ADMINS = [
  { id: 'a1', name: 'Admin Sarah', email: 'admin@example.com', role: 'admin' },
];

// Helper functions for localStorage
const getStoredSessions = (): TherapySession[] => {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  if (!stored) {
    // Initialize with sample data if empty
    const sampleSessions = generateSampleSessions();
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sampleSessions));
    return sampleSessions;
  }
  
  return JSON.parse(stored);
};

const getStoredRecords = (): SessionRecord[] => {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEYS.RECORDS);
  if (!stored) {
    // Initialize with sample data if empty
    const sampleRecords = generateSampleRecords();
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(sampleRecords));
    return sampleRecords;
  }
  
  return JSON.parse(stored);
};

const getStoredSummaries = (): SessionSummary[] => {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEYS.SUMMARIES);
  if (!stored) {
    // Initialize with sample data if empty
    const sampleSummaries = generateSampleSummaries();
    localStorage.setItem(STORAGE_KEYS.SUMMARIES, JSON.stringify(sampleSummaries));
    return sampleSummaries;
  }
  
  return JSON.parse(stored);
};

const getStoredAssignments = (): PatientAssignment[] => {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
  if (!stored) {
    // Initialize with sample data if empty
    const sampleAssignments = generateSampleAssignments();
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(sampleAssignments));
    return sampleAssignments;
  }
  
  return JSON.parse(stored);
};

const storeSessions = (sessions: TherapySession[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }
};

const storeRecords = (records: SessionRecord[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  }
};

const storeSummaries = (summaries: SessionSummary[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.SUMMARIES, JSON.stringify(summaries));
  }
};

const storeAssignments = (assignments: PatientAssignment[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
  }
};

// Generate sample data
const generateSampleSessions = (): TherapySession[] => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return [
    {
      id: 's1',
      doctorId: 'd1',
      patientId: 'p1',
      scheduledDate: yesterday.toISOString().split('T')[0],
      startTime: `${yesterday.toISOString().split('T')[0]}T14:00:00Z`,
      endTime: `${yesterday.toISOString().split('T')[0]}T15:00:00Z`,
      status: 'completed',
      title: 'Weekly Therapy Session',
      notes: 'Focus on anxiety management techniques',
      createdAt: new Date(yesterday.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: yesterday.toISOString()
    },
    {
      id: 's2',
      doctorId: 'd1',
      patientId: 'p2',
      scheduledDate: now.toISOString().split('T')[0],
      startTime: `${now.toISOString().split('T')[0]}T10:00:00Z`,
      endTime: `${now.toISOString().split('T')[0]}T11:00:00Z`,
      status: 'completed',
      title: 'Initial Assessment',
      notes: 'First session - establish baseline and goals',
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: 's3',
      doctorId: 'd2',
      patientId: 'p3',
      scheduledDate: now.toISOString().split('T')[0],
      startTime: `${now.toISOString().split('T')[0]}T15:00:00Z`,
      status: 'scheduled',
      title: 'Depression Therapy Session',
      notes: 'Review homework from last week',
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: 's4',
      doctorId: 'd1',
      patientId: 'p1',
      scheduledDate: tomorrow.toISOString().split('T')[0],
      startTime: `${tomorrow.toISOString().split('T')[0]}T13:00:00Z`,
      status: 'scheduled',
      title: 'Follow-up Session',
      notes: 'Continue anxiety management techniques',
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString()
    }
  ];
};

const generateSampleRecords = (): SessionRecord[] => {
  return [
    {
      id: 'r1',
      sessionId: 's1',
      transcript: `
Dr. Brown: Hello Alice, how have you been this week?
Alice: Better than last week. I tried the breathing exercises.
Dr. Brown: That's excellent progress. How did you find them?
Alice: They helped when I felt anxious at work. It was easier to refocus.
Dr. Brown: I'm glad to hear that. What situations triggered anxiety this week?
Alice: Mainly the presentation I had to give. But I used the techniques before and during.
Dr. Brown: And how did the presentation go?
Alice: Actually, it went really well. My manager complimented me afterwards.
Dr. Brown: That's wonderful. How did that make you feel?
Alice: Proud of myself. Like I'm making progress.
Dr. Brown: You absolutely should feel proud. Would you like to expand the techniques for this week?
Alice: Yes, I'd like that.
Dr. Brown: Let's add a simple mindfulness exercise to your daily routine...`,
      duration: 3600,
      recordedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'r2',
      sessionId: 's2',
      transcript: `
Dr. Brown: Welcome Bob, thanks for coming in today. How are you feeling?
Bob: A bit nervous, I've never done therapy before.
Dr. Brown: That's completely normal. Today we'll just get to know each other and talk about what brought you here.
Bob: Okay, that sounds good.
Dr. Brown: So, could you tell me what made you decide to seek therapy?
Bob: I've been feeling really down lately. It's hard to get motivated for anything.
Dr. Brown: How long have you been experiencing these feelings?
Bob: A few months, but it's gotten worse in the last few weeks.
Dr. Brown: Are there any particular events or changes in your life during this time?
Bob: I moved to a new city for work, and I don't know many people here.
Dr. Brown: That's a significant change. How has your sleep been?
Bob: Not great. I have trouble falling asleep, and sometimes I wake up early and can't get back to sleep.
Dr. Brown: And your appetite?
Bob: It's decreased. Sometimes I don't eat all day.
Dr. Brown: Thank you for sharing that. I think we can work together to help you feel better...`,
      duration: 3600,
      recordedAt: new Date().toISOString()
    }
  ];
};

const generateSampleSummaries = (): SessionSummary[] => {
  return [
    {
      id: 'sum1',
      sessionId: 's1',
      summaryText: 'Alice reported positive progress with anxiety management techniques, specifically noting success with breathing exercises during a work presentation. She expressed feeling proud of her achievements and showed interest in expanding her coping strategies. Her overall mood appears improved compared to the previous session.',
      keyInsights: [
        'Breathing exercises effectively reduced work anxiety',
        'Successfully managed anxiety during an important presentation',
        'Received positive feedback from manager',
        'Shows motivation to expand coping techniques'
      ],
      actionItems: [
        'Continue practicing breathing exercises',
        'Add daily mindfulness practice',
        'Monitor and record anxiety triggers',
        'Practice self-affirmation when achieving goals'
      ],
      mood: 'Improved - positive and hopeful',
      progress: 'Good progress since last session, showing practical application of techniques',
      concerns: [],
      generatedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'sum2',
      sessionId: 's2',
      summaryText: 'Initial assessment with Bob revealed symptoms consistent with adjustment disorder with depressed mood, likely triggered by recent relocation and social isolation. Patient reports low motivation, sleep disturbances, and decreased appetite for several months, worsening in recent weeks. He shows insight into his condition and willingness to engage in therapy.',
      keyInsights: [
        'Recent move to new city as primary stressor',
        'Symptoms include depressed mood, lack of motivation',
        'Sleep disturbances - both falling and staying asleep',
        'Decreased appetite and possible irregular eating',
        'Social isolation in new environment'
      ],
      actionItems: [
        'Begin basic sleep hygiene practices',
        'Establish regular meal schedule',
        'Identify potential social connections in new city',
        'Daily mood tracking to establish baseline',
        'Consider referral for medication evaluation if symptoms persist'
      ],
      mood: 'Depressed but receptive to intervention',
      progress: 'Initial session - baseline established',
      concerns: [
        'Monitor for worsening depression symptoms',
        'Assess suicide risk in follow-up sessions',
        'Evaluate need for nutritional support if appetite does not improve'
      ],
      generatedAt: new Date().toISOString()
    }
  ];
};

const generateSampleAssignments = (): PatientAssignment[] => {
  const now = new Date();
  const lastMonth = new Date(now);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  return [
    {
      id: 'a1',
      doctorId: 'd1',
      patientId: 'p1',
      assignedDate: lastMonth.toISOString(),
      status: 'active',
      notes: 'Weekly sessions for anxiety'
    },
    {
      id: 'a2',
      doctorId: 'd1',
      patientId: 'p2',
      assignedDate: lastMonth.toISOString(),
      status: 'active',
      notes: 'New patient - depression'
    },
    {
      id: 'a3',
      doctorId: 'd2',
      patientId: 'p3',
      assignedDate: lastMonth.toISOString(),
      status: 'active'
    },
    {
      id: 'a4',
      doctorId: 'd2',
      patientId: 'p4',
      assignedDate: new Date(lastMonth.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'inactive',
      notes: 'Transferred to specialist'
    }
  ];
};

// Implementation of AI summarization
const generateAISummary = async (transcript: string): Promise<Omit<SessionSummary, 'id' | 'sessionId' | 'generatedAt'>> => {
  // In a real app, this would call an AI service like OpenAI
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
  
  const sessionType = transcript.includes('anxiety') ? 'anxiety' : 
                     transcript.includes('depression') ? 'depression' : 'therapy';
  
  // Simple pattern matching for demo purposes
  if (sessionType === 'anxiety') {
    return {
      summaryText: 'Patient reported using anxiety management techniques successfully in real-world situations. Breathing exercises were particularly helpful during stressful work events. Patient shows improvement since last session and exhibits positive attitude toward continuing treatment.',
      keyInsights: [
        'Successfully applied breathing techniques',
        'Managed work-related anxiety effectively',
        'Shows improved confidence in abilities',
        'Received external validation of progress'
      ],
      actionItems: [
        'Continue breathing exercises',
        'Add mindfulness practice to routine',
        'Practice in increasingly challenging situations',
        'Track anxiety triggers and responses'
      ],
      mood: 'Improved - positive and motivated',
      progress: 'Significant improvement with practical application of techniques',
      concerns: []
    };
  } else if (sessionType === 'depression') {
    return {
      summaryText: 'Patient presents with symptoms consistent with depression, likely exacerbated by recent life changes and isolation. Sleep disturbances and appetite changes are present. Patient shows awareness of their condition and willingness to engage in treatment.',
      keyInsights: [
        'Environmental factors contributing to mood',
        'Sleep and appetite disturbances present',
        'Social isolation as key factor',
        'Patient receptive to intervention'
      ],
      actionItems: [
        'Establish sleep hygiene routine',
        'Create regular eating schedule',
        'Begin behavioral activation techniques',
        'Explore opportunities for social connection',
        'Daily mood tracking'
      ],
      mood: 'Depressed but cooperative',
      progress: 'Baseline established for treatment',
      concerns: [
        'Monitor for worsening symptoms',
        'Assess need for medication referral',
        'Follow up on physical symptoms'
      ]
    };
  } else {
    return {
      summaryText: 'Therapy session focused on exploring current challenges and coping strategies. Patient engaged well in the session and expressed motivation to implement suggested techniques.',
      keyInsights: [
        'Good therapeutic engagement',
        'Identified key stressors',
        'Open to developing new coping strategies',
        'Shows insight into personal patterns'
      ],
      actionItems: [
        'Practice identified coping skills',
        'Monitor mood and triggers',
        'Establish regular self-care routine',
        'Review progress next session'
      ],
      mood: 'Stable',
      progress: 'Making expected progress',
      concerns: []
    };
  }
};

// Service methods
export const sessionService = {
  // Session management
  getSessions: async (filters?: SessionFilterCriteria): Promise<TherapySession[]> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    
    let sessions = getStoredSessions();
    
    // Apply filters if provided
    if (filters) {
      if (filters.doctorId) {
        sessions = sessions.filter(session => session.doctorId === filters.doctorId);
      }
      
      if (filters.patientId) {
        sessions = sessions.filter(session => session.patientId === filters.patientId);
      }
      
      if (filters.status && filters.status !== 'all') {
        sessions = sessions.filter(session => session.status === filters.status);
      }
      
      if (filters.startDate) {
        sessions = sessions.filter(session => session.scheduledDate >= filters.startDate!);
      }
      
      if (filters.endDate) {
        sessions = sessions.filter(session => session.scheduledDate <= filters.endDate!);
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        sessions = sessions.filter(session => 
          session.title.toLowerCase().includes(searchLower) || 
          (session.notes && session.notes.toLowerCase().includes(searchLower))
        );
      }
    }
    
    // Sort by scheduled date (newest first)
    return sessions.sort((a, b) => 
      new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
    );
  },
  
  getSessionById: async (id: string): Promise<TherapySession | null> => {
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay
    
    const sessions = getStoredSessions();
    const session = sessions.find(s => s.id === id);
    
    if (!session) return null;
    
    // Get associated record and summary if they exist
    const records = getStoredRecords();
    const summaries = getStoredSummaries();
    
    const record = records.find(r => r.sessionId === id);
    const summary = summaries.find(s => s.sessionId === id);
    
    // Return full session with record and summary
    return {
      ...session,
      record,
      summary
    };
  },
  
  createSession: async (session: Omit<TherapySession, 'id' | 'createdAt' | 'updatedAt'>): Promise<TherapySession> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    const now = new Date().toISOString();
    const newSession: TherapySession = {
      ...session,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    
    const sessions = getStoredSessions();
    const updatedSessions = [...sessions, newSession];
    storeSessions(updatedSessions);
    
    return newSession;
  },
  
  updateSession: async (id: string, updates: Partial<TherapySession>): Promise<TherapySession> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    const sessions = getStoredSessions();
    const sessionIndex = sessions.findIndex(s => s.id === id);
    
    if (sessionIndex === -1) {
      throw new Error('Session not found');
    }
    
    const updatedSession = {
      ...sessions[sessionIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    sessions[sessionIndex] = updatedSession;
    storeSessions(sessions);
    
    return updatedSession;
  },
  
  deleteSession: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    const sessions = getStoredSessions();
    const updatedSessions = sessions.filter(s => s.id !== id);
    
    if (sessions.length === updatedSessions.length) {
      throw new Error('Session not found');
    }
    
    storeSessions(updatedSessions);
    
    // Also delete associated records and summaries
    const records = getStoredRecords();
    const updatedRecords = records.filter(r => r.sessionId !== id);
    storeRecords(updatedRecords);
    
    const summaries = getStoredSummaries();
    const updatedSummaries = summaries.filter(s => s.sessionId !== id);
    storeSummaries(updatedSummaries);
  },
  
  // Session record management
  getSessionRecord: async (sessionId: string): Promise<SessionRecord | null> => {
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay
    
    const records = getStoredRecords();
    return records.find(r => r.sessionId === sessionId) || null;
  },
  
  createSessionRecord: async (record: Omit<SessionRecord, 'id' | 'recordedAt'>): Promise<SessionRecord> => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
    
    const newRecord: SessionRecord = {
      ...record,
      id: uuidv4(),
      recordedAt: new Date().toISOString()
    };
    
    const records = getStoredRecords();
    const updatedRecords = [...records, newRecord];
    storeRecords(updatedRecords);
    
    // Update session status to completed
    const sessions = getStoredSessions();
    const sessionIndex = sessions.findIndex(s => s.id === record.sessionId);
    
    if (sessionIndex !== -1) {
      sessions[sessionIndex] = {
        ...sessions[sessionIndex],
        status: 'completed',
        endTime: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      storeSessions(sessions);
    }
    
    return newRecord;
  },
  
  // Session summary management
  generateSessionSummary: async (sessionId: string): Promise<SessionSummary> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    
    // Get the session record for the transcript
    const records = getStoredRecords();
    const record = records.find(r => r.sessionId === sessionId);
    
    if (!record) {
      throw new Error('Session record not found - cannot generate summary');
    }
    
    // Use AI to generate summary (simulated)
    const summaryContent = await generateAISummary(record.transcript);
    
    const newSummary: SessionSummary = {
      id: uuidv4(),
      sessionId,
      ...summaryContent,
      generatedAt: new Date().toISOString()
    };
    
    // Save the summary
    const summaries = getStoredSummaries();
    const updatedSummaries = [...summaries, newSummary];
    storeSummaries(updatedSummaries);
    
    return newSummary;
  },
  
  // Transcription service
  transcribeAudio: async (request: TranscriptionRequest): Promise<SessionRecord> => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
    
    let transcript = '';
    
    // If text is provided directly, use it
    if (request.text) {
      transcript = request.text;
    } 
    // In a real app, we would use speech-to-text for the audio file
    else if (request.audioFile) {
      transcript = "This is a simulated transcript from an audio file. In a real application, this would contain the actual transcribed content from the uploaded audio file.";
    } else {
      throw new Error('Either audio file or text must be provided for transcription');
    }
    
    // Create the session record
    const newRecord: SessionRecord = {
      id: uuidv4(),
      sessionId: request.sessionId,
      transcript,
      duration: 3600, // Default to 1 hour
      recordedAt: new Date().toISOString()
    };
    
    const records = getStoredRecords();
    const updatedRecords = [...records, newRecord];
    storeRecords(updatedRecords);
    
    // Update session status
    const sessions = getStoredSessions();
    const sessionIndex = sessions.findIndex(s => s.id === request.sessionId);
    
    if (sessionIndex !== -1) {
      sessions[sessionIndex] = {
        ...sessions[sessionIndex],
        status: 'completed',
        endTime: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      storeSessions(sessions);
    }
    
    return newRecord;
  },
  
  // Patient assignment management
  getPatientAssignments: async (doctorId?: string, patientId?: string): Promise<PatientAssignment[]> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    
    let assignments = getStoredAssignments();
    
    if (doctorId) {
      assignments = assignments.filter(a => a.doctorId === doctorId);
    }
    
    if (patientId) {
      assignments = assignments.filter(a => a.patientId === patientId);
    }
    
    return assignments;
  },
  
  createPatientAssignment: async (assignment: Omit<PatientAssignment, 'id' | 'assignedDate'>): Promise<PatientAssignment> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    const newAssignment: PatientAssignment = {
      ...assignment,
      id: uuidv4(),
      assignedDate: new Date().toISOString()
    };
    
    const assignments = getStoredAssignments();
    const updatedAssignments = [...assignments, newAssignment];
    storeAssignments(updatedAssignments);
    
    return newAssignment;
  },
  
  updatePatientAssignment: async (id: string, updates: Partial<PatientAssignment>): Promise<PatientAssignment> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    const assignments = getStoredAssignments();
    const assignmentIndex = assignments.findIndex(a => a.id === id);
    
    if (assignmentIndex === -1) {
      throw new Error('Assignment not found');
    }
    
    const updatedAssignment = {
      ...assignments[assignmentIndex],
      ...updates
    };
    
    assignments[assignmentIndex] = updatedAssignment;
    storeAssignments(assignments);
    
    return updatedAssignment;
  },
  
  // User information (mock - would normally be from user service)
  getPatients: async (): Promise<any[]> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    return MOCK_PATIENTS;
  },
  
  getDoctors: async (): Promise<any[]> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    return MOCK_DOCTORS;
  },
  
  getDoctorPatients: async (doctorId: string): Promise<any[]> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    
    const assignments = getStoredAssignments();
    const activeAssignments = assignments.filter(a => a.doctorId === doctorId && a.status === 'active');
    
    // Get patient details for each active assignment
    return activeAssignments.map(assignment => {
      const patient = MOCK_PATIENTS.find(p => p.id === assignment.patientId);
      return patient ? { ...patient, assignmentId: assignment.id } : null;
    }).filter(Boolean);
  }
};