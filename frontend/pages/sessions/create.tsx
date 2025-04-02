import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AuthGuard from '../../components/auth/AuthGuard';
import PermissionGuard from '../../components/auth/PermissionGuard';
import { sessionService } from '../../services/sessionService';
import { TherapySession } from '../../types/sessions';
import { format, addHours, parseISO } from 'date-fns';

const CreateSessionPage: React.FC = () => {
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    patientId: '',
    scheduledDate: format(new Date(), 'yyyy-MM-dd'),
    scheduledTime: '09:00',
    duration: 60, // minutes
    title: '',
    notes: ''
  });
  
  // State for patients and session creation
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Current doctor ID (in a real app, would come from auth context)
  const [doctorId, setDoctorId] = useState('d1');
  
  // Load doctor's patients
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const doctorPatients = await sessionService.getDoctorPatients(doctorId);
        setPatients(doctorPatients);
        
        // Set first patient as default if available
        if (doctorPatients.length > 0 && !formData.patientId) {
          setFormData(prev => ({
            ...prev,
            patientId: doctorPatients[0].id
          }));
        }
      } catch (err) {
        console.error('Error loading patients:', err);
        setError('Failed to load patients');
      }
    };
    
    loadPatients();
  }, [doctorId]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.patientId) {
      setError('Please select a patient');
      return;
    }
    
    if (!formData.title) {
      setError('Please enter a session title');
      return;
    }
    
    if (!formData.scheduledDate) {
      setError('Please select a session date');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Format date and time
      const scheduledDateTime = `${formData.scheduledDate}T${formData.scheduledTime}:00`;
      const startTime = new Date(scheduledDateTime).toISOString();
      
      // Calculate end time based on duration
      const endTime = addHours(new Date(startTime), formData.duration / 60).toISOString();
      
      // Create session object
      const session: Omit<TherapySession, 'id' | 'createdAt' | 'updatedAt'> = {
        doctorId,
        patientId: formData.patientId,
        scheduledDate: formData.scheduledDate,
        startTime,
        title: formData.title,
        notes: formData.notes.trim() || undefined,
        status: 'scheduled'
      };
      
      // Create session
      const createdSession = await sessionService.createSession(session);
      
      // Show success message
      setSuccess(true);
      
      // Redirect to session details
      setTimeout(() => {
        router.push(`/sessions/${createdSession.id}`);
      }, 2000);
    } catch (err) {
      console.error('Error creating session:', err);
      setError('Failed to create session. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthGuard>
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Schedule New Session</h1>
            <Link href="/sessions" className="text-blue-600 hover:text-blue-800">
              Back to Sessions
            </Link>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
              <span className="block sm:inline">Session scheduled successfully! Redirecting...</span>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-1">
                    Patient
                  </label>
                  <select
                    id="patientId"
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md bg-white"
                    required
                  >
                    <option value="" disabled>Select a patient</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>{patient.name}</option>
                    ))}
                  </select>
                  {patients.length === 0 && (
                    <p className="mt-1 text-sm text-red-500">
                      No patients assigned to you. Please assign patients first.
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Session Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="e.g., Initial Assessment, Weekly Therapy Session"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    id="scheduledDate"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    id="scheduledTime"
                    name="scheduledTime"
                    value={formData.scheduledTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <select
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md bg-white"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                    <option value={120}>120 minutes</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Session Notes (optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Add any notes or preparation details for this session"
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <Link href="/sessions" className="px-4 py-2 border border-gray-300 rounded-md mr-2 hover:bg-gray-50">
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading || patients.length === 0}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                >
                  {loading ? 'Scheduling...' : 'Schedule Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
    </AuthGuard>
  );
};

export default CreateSessionPage;