import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AuthGuard from '../../../components/auth/AuthGuard';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import { sessionService } from '../../../services/sessionService';
import { TherapySession, SessionRecord, SessionSummary } from '../../../types/sessions';
import { format } from 'date-fns';

const SessionDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [session, setSession] = useState<TherapySession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Current user role and ID for permission checks
  const [userRole, setUserRole] = useState('doctor'); // doctor, patient, admin
  const [currentUserId, setCurrentUserId] = useState('d1');
  
  // For generating summaries
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summarySuccess, setSummarySuccess] = useState(false);
  
  // Fetch session data
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
        
        setSession(sessionData);
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
  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  
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
  
  // Demo switch user role for testing
  const switchUserRole = () => {
    if (userRole === 'doctor') {
      setUserRole('patient');
      setCurrentUserId('p1');
    } else {
      setUserRole('doctor');
      setCurrentUserId('d1');
    }
  };
  
  // Generate summary
  const handleGenerateSummary = async () => {
    if (!session || !session.record) return;
    
    setIsGeneratingSummary(true);
    setSummaryError(null);
    setSummarySuccess(false);
    
    try {
      const summary = await sessionService.generateSessionSummary(session.id);
      
      // Update session with new summary
      setSession(prev => {
        if (!prev) return null;
        return { ...prev, summary };
      });
      
      setSummarySuccess(true);
      setTimeout(() => setSummarySuccess(false), 3000);
    } catch (err) {
      console.error('Error generating summary:', err);
      setSummaryError('Failed to generate session summary');
    } finally {
      setIsGeneratingSummary(false);
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
  
  // Format time
  const formatTime = (timeString: string) => {
    try {
      return format(new Date(timeString), 'h:mm a');
    } catch (e) {
      return timeString;
    }
  };
  
  // Generate time range string
  const getTimeRange = (session: TherapySession) => {
    const startTime = formatTime(session.startTime);
    
    if (session.endTime) {
      const endTime = formatTime(session.endTime);
      return `${startTime} - ${endTime}`;
    }
    
    return startTime;
  };
  
  // Get status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (loading) {
    return (
      <AuthGuard>
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Session Details</h1>
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
              <h1 className="text-2xl font-bold">Session Details</h1>
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
              <h1 className="text-2xl font-bold">{session.title}</h1>
              <p className="text-gray-600">
                Session with {userRole === 'doctor' ? patientName : doctorName}
              </p>
            </div>
            
            <div className="flex space-x-3">
              {/* For demo only */}
              <button
                onClick={switchUserRole}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
              >
                Switch to {userRole === 'doctor' ? 'Patient' : 'Doctor'} View
              </button>
              
              <Link href="/sessions" className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                Back to Sessions
              </Link>
            </div>
          </div>
          
          {/* Session info panel */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg font-medium">Session Information</h2>
                  <span className={`mt-1 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeStyle(session.status)}`}>
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  </span>
                </div>
                
                {/* Actions */}
                <div className="flex space-x-2">
                  {userRole === 'doctor' && session.status === 'scheduled' && (
                    <>
                      <Link href={`/sessions/${session.id}/edit`} className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
                        Edit Session
                      </Link>
                      <Link href={`/sessions/${session.id}/conduct`} className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600">
                        Start Session
                      </Link>
                    </>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Doctor</h3>
                  <p className="mt-1">{doctorName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Patient</h3>
                  <p className="mt-1">{patientName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <p className="mt-1">{formatDate(session.scheduledDate)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Time</h3>
                  <p className="mt-1">{getTimeRange(session)}</p>
                </div>
              </div>
              
              {session.notes && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-500">Session Notes</h3>
                  <p className="mt-1 text-gray-700 whitespace-pre-line">{session.notes}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Session transcript */}
          {session.record && (
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-medium">Session Transcript</h2>
              </div>
              <div className="p-6">
                <pre className="whitespace-pre-line text-gray-700 font-sans text-sm bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
                  {session.record.transcript}
                </pre>
              </div>
            </div>
          )}
          
          {/* Session summary */}
          {session.status === 'completed' && (
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-medium">Session Summary</h2>
                
                {userRole === 'doctor' && !session.summary && session.record && (
                  <button
                    onClick={handleGenerateSummary}
                    disabled={isGeneratingSummary}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-blue-300"
                  >
                    {isGeneratingSummary ? 'Generating...' : 'Generate Summary'}
                  </button>
                )}
              </div>
              
              {summaryError && (
                <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                  <p>{summaryError}</p>
                </div>
              )}
              
              {summarySuccess && (
                <div className="p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
                  <p>Summary generated successfully</p>
                </div>
              )}
              
              {session.summary ? (
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Summary</h3>
                    <p className="text-gray-700">{session.summary.summaryText}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Key Insights</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {session.summary.keyInsights.map((insight, index) => (
                          <li key={index} className="text-gray-700">{insight}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Action Items</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {session.summary.actionItems.map((item, index) => (
                          <li key={index} className="text-gray-700">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 border-t pt-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Mood</h3>
                      <p>{session.summary.mood}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Progress</h3>
                      <p>{session.summary.progress}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Generated</h3>
                      <p>{formatDate(session.summary.generatedAt)}</p>
                    </div>
                  </div>
                  
                  {session.summary.concerns && session.summary.concerns.length > 0 && (
                    <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                      <h3 className="text-sm font-medium text-yellow-800 mb-2">Areas of Concern</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {session.summary.concerns.map((concern, index) => (
                          <li key={index} className="text-yellow-800">{concern}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  {session.record ? (
                    isGeneratingSummary ? (
                      <div className="flex flex-col items-center justify-center py-6">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                        <p>Generating session summary using AI...</p>
                        <p className="text-xs mt-2">This may take a moment</p>
                      </div>
                    ) : (
                      <p>No summary has been generated for this session yet.</p>
                    )
                  ) : (
                    <p>Session transcript is required to generate a summary.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
    </AuthGuard>
  );
};

export default SessionDetailPage;