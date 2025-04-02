import { User } from './auth';

export type SessionStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

export interface TherapySession {
  id: string;
  doctorId: string;
  patientId: string;
  scheduledDate: string; // ISO string format
  startTime: string; // ISO string format
  endTime?: string; // ISO string format
  status: SessionStatus;
  title: string;
  notes?: string; // Doctor's preparation notes
  record?: SessionRecord;
  summary?: SessionSummary;
  createdAt: string; // ISO string format
  updatedAt: string; // ISO string format
}

export interface SessionRecord {
  id: string;
  sessionId: string;
  recordingUrl?: string; // URL to audio recording if available
  transcriptUrl?: string; // URL to full transcript document if stored separately
  transcript: string; // Full text transcript
  duration: number; // In seconds
  recordedAt: string; // ISO string format
}

export interface SessionSummary {
  id: string;
  sessionId: string;
  summaryText: string; // AI-generated summary
  keyInsights: string[]; // Key points from the session
  actionItems: string[]; // Recommended actions
  mood: string; // Patient's emotional state assessment
  progress: string; // Assessment of progress
  concerns: string[]; // Issues that need attention
  generatedAt: string; // ISO string format
}

export interface PatientAssignment {
  id: string;
  doctorId: string;
  patientId: string;
  assignedDate: string; // ISO string format
  status: 'active' | 'inactive';
  notes?: string;
}

export interface SessionFilterCriteria {
  doctorId?: string;
  patientId?: string;
  status?: SessionStatus | 'all';
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface TranscriptionRequest {
  sessionId: string;
  audioFile?: File;
  text?: string; // Alternative to uploading a file - directly input text
}

export interface SummaryGenerationRequest {
  sessionId: string;
  transcriptId: string;
  customPrompt?: string; // Optional custom instructions for the AI
}