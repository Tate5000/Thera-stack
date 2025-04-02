import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AuthGuard from '../../../components/auth/AuthGuard';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import { sessionService } from '../../../services/sessionService';
import { patientDocumentService } from '../../../services/patientDocumentService';
import { TherapySession, TranscriptionRequest } from '../../../types/sessions';
import AudioRecorder from '../../../components/sessions/AudioRecorder';
import { format } from 'date-fns';

const SessionConductPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  // Session data
  const [session, setSession] = useState<TherapySession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // User data
  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [sessionInProgress, setSessionInProgress] = useState(false);
  
  // Transcript state
  const [transcript, setTranscript] = useState('');
  const [isSavingTranscript, setIsSavingTranscript] = useState(false);
  const [transcriptSuccess, setTranscriptSuccess] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);
  
  // Audio recording
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryGenerated, setSummaryGenerated] = useState(false);

  // Processing status
  const [processingStatus, setProcessingStatus] = useState<string>('');
  
  // Fetch session details
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const sessionData = await sessionService.getSessionById(id as string);
        
        if (!sessionData) {
          setError('Session not found');
          return;
        }
        
        // Check if session can be conducted
        if (sessionData.status !== 'scheduled' && sessionData.status !== 'in-progress') {
          setError(`Cannot conduct a session with status: ${sessionData.status}`);
          return;
        }
        
        setSession(sessionData);
        
        // If session is already in progress, set the state
        if (sessionData.status === 'in-progress') {
          setSessionInProgress(true);
        }
      } catch (err) {
        console.error('Error fetching session:', err);
        setError('Failed to load session details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessionData();
  }, [id]);
  
  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!session) return;
      
      try {
        const [patients, doctors] = await Promise.all([
          sessionService.getPatients(),
          sessionService.getDoctors()
        ]);
        
        const patient = patients.find(p => p.id === session.patientId);
        const doctor = doctors.find(d => d.id === session.doctorId);
        
        if (patient) setPatientName(patient.name);
        if (doctor) setDoctorName(doctor.name);
      } catch (err) {
        console.error('Error loading user data:', err);
      }
    };
    
    loadUserData();
  }, [session]);
  
  // Start session
  const handleStartSession = async () => {
    if (!session) return;
    
    try {
      const updatedSession = await sessionService.updateSession(session.id, {
        status: 'in-progress',
        startTime: new Date().toISOString()
      });
      
      setSession(updatedSession);
      setSessionInProgress(true);
    } catch (err) {
      console.error('Error starting session:', err);
      setError('Failed to start session');
    }
  };
  
  // Handle recording controls
  const handleStartRecording = () => {
    setIsRecording(true);
  };
  
  const handleStopRecording = () => {
    setIsRecording(false);
  };
  
  // Handle when recording is complete and we have the audio blob
  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
    
    // Create URL for preview
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
    
    console.log('Recording completed, audio blob size:', blob.size);
  };
  
  // Handle transcription of audio
  const handleTranscribeAudio = async () => {
    if (!audioBlob || !session) return;
    
    setIsTranscribing(true);
    setProcessingStatus('Transcribing audio recording...');
    
    try {
      // In a real app, this would send the audio to a backend service
      // For demo purposes, simulate a delay then use mock data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate response from transcription service based on session data
      let transcriptionText = '';
      if (session.title.toLowerCase().includes('anxiety')) {
        transcriptionText = `Dr. ${doctorName}: Hello, how have you been feeling since our last session?\n${patientName}: Better than last week. I tried the breathing exercises you suggested.\nDr. ${doctorName}: That's excellent progress. How did you find them?\n${patientName}: They helped when I felt anxious at work. It was easier to refocus.\nDr. ${doctorName}: I'm glad to hear that. What situations triggered anxiety this week?\n${patientName}: Mainly the presentation I had to give. But I used the techniques before and during.\nDr. ${doctorName}: And how did the presentation go?\n${patientName}: Actually, it went really well. My manager complimented me afterwards.\nDr. ${doctorName}: That's wonderful. How did that make you feel?\n${patientName}: Proud of myself. Like I'm making progress.\nDr. ${doctorName}: You absolutely should feel proud. Would you like to expand the techniques for this week?\n${patientName}: Yes, I'd like that.\nDr. ${doctorName}: Let's add a simple mindfulness exercise to your daily routine...`;
      } else if (session.title.toLowerCase().includes('depression')) {
        transcriptionText = `Dr. ${doctorName}: How have you been feeling this week?\n${patientName}: Still pretty low. I've been having trouble getting out of bed.\nDr. ${doctorName}: I understand that can be difficult. Have you been able to try any of the activities we discussed?\n${patientName}: I did manage to go for a short walk twice, like we talked about.\nDr. ${doctorName}: That's actually a significant step. How did you feel during or after those walks?\n${patientName}: A little better, I guess. At least for a short while.\nDr. ${doctorName}: Even temporary relief is valuable. Did you notice anything while you were outside?\n${patientName}: I noticed the trees are starting to bloom. I hadn't realized it was already that time of year.\nDr. ${doctorName}: That moment of connection is important. It suggests you're still able to observe and appreciate things around you.\n${patientName}: I hadn't thought of it that way.\nDr. ${doctorName}: For this week, could we try adding one more small activity to your routine?`;
      } else {
        transcriptionText = `Dr. ${doctorName}: Welcome to today's session. How have things been going for you?\n${patientName}: It's been a mixed week. Some good days, some challenging ones.\nDr. ${doctorName}: Could you tell me more about the challenging days?\n${patientName}: I had some conflict with a coworker that was stressful.\nDr. ${doctorName}: How did you handle that situation?\n${patientName}: I tried using the communication techniques we discussed. They helped somewhat.\nDr. ${doctorName}: That's good to hear. What parts worked well, and what was still difficult?\n${patientName}: Being clear about my needs worked well. Not getting defensive is still hard.\nDr. ${doctorName}: That's very insightful. Changing response patterns takes practice.\n${patientName}: I'd like to get better at that.\nDr. ${doctorName}: Let's work through some scenarios today that might help with that skill.`;
      }
      
      // Update transcript text
      setTranscript(transcriptionText);
      
      // Save the transcription to patient documents
      await patientDocumentService.uploadTranscription(
        session.patientId,
        session.doctorId,
        session.id,
        `Session Transcript - ${format(new Date(session.scheduledDate), 'MMM d, yyyy')}`,
        transcriptionText,
        audioBlob
      );
      
      setProcessingStatus('Transcription complete. Generating session summary...');
      
      // Now generate AI summary
      await generateSessionSummary(transcriptionText);
      
    } catch (err) {
      console.error('Error transcribing audio:', err);
      setTranscriptError('Failed to transcribe audio. Please try again or enter transcript manually.');
    } finally {
      setIsTranscribing(false);
    }
  };
  
  // Generate AI summary from transcript
  const generateSessionSummary = async (transcriptionText: string) => {
    if (!session) return;
    
    setIsGeneratingSummary(true);
    
    try {
      // In a real app, this would call an LLM API through a backend service
      // For demo purposes, simulate a delay then use mock data
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate summary content based on session title keywords
      let summaryContent = '';
      if (session.title.toLowerCase().includes('anxiety')) {
        summaryContent = `Patient reported positive progress with anxiety management techniques, specifically noting success with breathing exercises during a work presentation. The patient expressed feeling proud of their achievements and showed interest in expanding their coping strategies. Overall mood appears improved compared to the previous session.

Key Insights:
- Breathing exercises effectively reduced work anxiety
- Successfully managed anxiety during an important presentation
- Received positive feedback from manager, boosting confidence
- Shows motivation to expand coping techniques

Action Items:
- Continue practicing breathing exercises
- Add daily mindfulness practice to routine
- Monitor and record anxiety triggers
- Practice self-affirmation when achieving goals

Mood: Improved - positive and hopeful
Progress: Good progress since last session, showing practical application of techniques`;
      } else if (session.title.toLowerCase().includes('depression')) {
        summaryContent = `Patient continues to experience depressive symptoms but showed modest engagement with behavioral activation strategies, having completed two short walks as agreed in the previous session. There was a brief moment of connection with the environment (noticing blooming trees), indicating capacity for present-moment awareness despite low mood. Patient remains willing to gradually expand activities.

Key Insights:
- Successfully implemented minimal physical activity (two walks)
- Demonstrated ability to notice environmental details despite depression
- Still experiencing significant difficulty with morning activation
- Shows willingness to continue gradual behavioral activation approach

Action Items:
- Continue daily short walks, maintaining current frequency
- Add one additional small pleasurable activity to daily routine
- Create a simplified morning routine to reduce activation barriers
- Practice mindful observation during walks

Mood: Depressed but with moments of engagement
Progress: Minimal but meaningful progress with behavioral activation`;
      } else {
        summaryContent = `Session focused on interpersonal conflict management, particularly regarding workplace relationships. Patient demonstrated insight by recognizing improvement in expressing needs clearly but continued difficulty with defensive responses. Patient shows motivation to develop better communication skills and engaged collaboratively in scenario-based practice during the session.

Key Insights:
- Successfully implemented assertive communication techniques
- Identified defensive responses as a specific challenge area
- Demonstrated self-awareness about communication patterns
- Reports mixed week with both progress and challenges

Action Items:
- Practice pause-and-breathe technique when feeling defensive
- Use journaling to identify emotional triggers in conversations
- Rehearse communication scenarios using DEAR MAN framework
- Schedule one challenging conversation using new skills

Mood: Variable but generally stable
Progress: Steady progress with communication skills development`;
      }
      
      // Save summary to patient documents
      await patientDocumentService.uploadSessionSummary(
        session.patientId,
        session.doctorId,
        session.id,
        `Session Summary - ${format(new Date(session.scheduledDate), 'MMM d, yyyy')}`,
        summaryContent
      );
      
      setSummaryGenerated(true);
      setProcessingStatus('Session summary generated and saved to patient records.');
      
    } catch (err) {
      console.error('Error generating summary:', err);
      setTranscriptError('Failed to generate session summary. You can still save the transcript.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };
  
  // Save transcript and complete session
  const handleSaveTranscript = async () => {
    if (!session || !transcript.trim()) {
      setTranscriptError('Transcript cannot be empty');
      return;
    }
    
    setIsSavingTranscript(true);
    setTranscriptError(null);
    
    try {
      // Create transcription request
      const request: TranscriptionRequest = {
        sessionId: session.id,
        text: transcript,
        audioFile: audioBlob ? new File([audioBlob], 'session-recording.mp3', { type: 'audio/mp3' }) : undefined
      };
      
      // Save transcript to session service
      await sessionService.transcribeAudio(request);
      
      // If we haven't already saved to patient documents, do it now
      if (!summaryGenerated) {
        // Save transcript
        await patientDocumentService.uploadTranscription(
          session.patientId,
          session.doctorId,
          session.id,
          `Session Transcript - ${format(new Date(session.scheduledDate), 'MMM d, yyyy')}`,
          transcript,
          audioBlob || undefined
        );
        
        // Generate and save summary
        await generateSessionSummary(transcript);
      }
      
      setTranscriptSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        router.push(`/sessions/${session.id}`);
      }, 2000);
    } catch (err) {
      console.error('Error saving transcript:', err);
      setTranscriptError('Failed to save transcript');
    } finally {
      setIsSavingTranscript(false);
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  if (loading) {
    return (
      <AuthGuard>
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Conduct Session</h1>
              <Link href="/sessions" className="text-blue-600 hover:text-blue-800">
                Back to Sessions
              </Link>
            </div>
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </div>
      </AuthGuard>
    );
  }
  
  if (error || !session) {
    return (
      <AuthGuard>
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Conduct Session</h1>
              <Link href="/sessions" className="text-blue-600 hover:text-blue-800">
                Back to Sessions
              </Link>
            </div>
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error || 'Session not found'}</span>
            </div>
          </div>
      </AuthGuard>
    );
  }
  
  return (
    <AuthGuard>
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Conduct Therapy Session</h1>
              <p className="text-gray-600">
                {session.title} with {patientName}
              </p>
            </div>
            
            <Link href={`/sessions/${session.id}`} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
              Back to Session
            </Link>
          </div>
          
          {/* Session info */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg font-medium">Session Information</h2>
                  <span className={`mt-1 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    sessionInProgress ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {sessionInProgress ? 'In Progress' : 'Scheduled'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Patient</h3>
                  <p className="mt-1">{patientName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <p className="mt-1">{formatDate(session.scheduledDate)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Doctor</h3>
                  <p className="mt-1">{doctorName}</p>
                </div>
              </div>
              
              {session.notes && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Session Notes</h3>
                  <p className="text-gray-700 whitespace-pre-line">{session.notes}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Session recording controls */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-medium">Session Recording</h2>
            </div>
            <div className="p-6">
              {!sessionInProgress ? (
                <div className="flex flex-col items-center py-8">
                  <p className="text-gray-600 mb-4">Start the session to begin recording</p>
                  <button
                    onClick={handleStartSession}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Start Session
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center mb-4 md:mb-0">
                      <AudioRecorder 
                        isRecording={isRecording}
                        onRecordingComplete={handleRecordingComplete}
                        onRecordingStatusChange={setIsRecording}
                      />
                    </div>
                    
                    <div className="flex space-x-4">
                      {isRecording ? (
                        <button
                          onClick={handleStopRecording}
                          className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          Stop Recording
                        </button>
                      ) : (
                        <button
                          onClick={handleStartRecording}
                          className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                          disabled={!sessionInProgress}
                        >
                          {audioBlob ? 'Record Again' : 'Start Recording'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {audioBlob && (
                    <div className="mt-4">
                      <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                        <div className="flex items-center mb-3">
                          <svg className="w-6 h-6 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                          <span className="font-medium">Recording complete</span>
                          <span className="ml-2 text-sm text-gray-500">({(audioBlob.size / (1024 * 1024)).toFixed(2)} MB)</span>
                        </div>
                        
                        <div className="flex items-center">
                          {audioUrl && (
                            <audio controls className="w-full max-w-md">
                              <source src={audioUrl} type="audio/mp3" />
                              Your browser does not support the audio element.
                            </audio>
                          )}
                        </div>
                        
                        <div className="mt-3">
                          <button
                            onClick={handleTranscribeAudio}
                            disabled={isTranscribing || isGeneratingSummary}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
                          >
                            {isTranscribing ? 'Transcribing...' : isGeneratingSummary ? 'Generating Summary...' : 'Transcribe Recording'}
                          </button>
                          
                          {processingStatus && (
                            <div className="mt-2 text-sm text-gray-600">{processingStatus}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Transcript entry */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-medium">Session Transcript</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Enter the conversation transcript below. You can either type it directly or upload an audio recording for transcription.
              </p>
              
              <div className="mb-4">
                <label htmlFor="transcript" className="block text-sm font-medium text-gray-700 mb-2">
                  Conversation Transcript
                </label>
                <textarea
                  id="transcript"
                  rows={15}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Dr. Smith: How have you been feeling since our last session?
Patient: I've been doing better. The exercises you suggested have helped with my anxiety.
Dr. Smith: That's great to hear. Can you tell me more about what specifically helped?"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={isSavingTranscript}
                ></textarea>
              </div>
              
              {audioBlob && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    <span className="text-sm">Audio Recording - {(audioBlob.size / 1024).toFixed(2)} KB</span>
                  </div>
                </div>
              )}
              
              {transcriptError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
                  {transcriptError}
                </div>
              )}
              
              {summaryGenerated && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md border border-green-200">
                  <h3 className="font-semibold mb-1">Session Summary Generated!</h3>
                  <p>A transcript and AI-generated summary have been saved to the patient's documents.</p>
                </div>
              )}
              
              {transcriptSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md border border-green-200">
                  Transcript saved successfully! Redirecting to session details...
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  onClick={handleSaveTranscript}
                  disabled={isSavingTranscript || !sessionInProgress}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                >
                  {isSavingTranscript ? 'Saving...' : summaryGenerated ? 'Complete Session' : 'Save Transcript & Complete Session'}
                </button>
              </div>
            </div>
          </div>
        </div>
    </AuthGuard>
  );
};

export default SessionConductPage;