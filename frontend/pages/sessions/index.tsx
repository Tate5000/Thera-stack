import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import AuthGuard from '../../components/auth/AuthGuard';
import PermissionGuard from '../../components/auth/PermissionGuard';
import { sessionService } from '../../services/sessionService';
import { TherapySession, SessionFilterCriteria, SessionStatus } from '../../types/sessions';
import { format } from 'date-fns';
import Link from 'next/link';

const SessionListPage: React.FC = () => {
  const router = useRouter();
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Current user info - in a real app, this would come from auth context
  const [currentUserId, setCurrentUserId] = useState('d1'); // Default to first doctor for demo
  const [userRole, setUserRole] = useState('doctor'); // 'doctor', 'patient', or 'admin'
  
  // Filter states
  const [filters, setFilters] = useState<SessionFilterCriteria>({
    status: 'all'
  });
  
  // Initialize filters based on user role
  useEffect(() => {
    if (userRole === 'doctor') {
      setFilters(prev => ({ ...prev, doctorId: currentUserId }));
    } else if (userRole === 'patient') {
      setFilters(prev => ({ ...prev, patientId: currentUserId }));
    } else if (userRole === 'admin') {
      // Admin has access to all sessions by default
      setFilters(prev => ({ ...prev, doctorId: undefined, patientId: undefined }));
    }
  }, [userRole, currentUserId]);
  
  // Fetch sessions with current filters
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Apply user role-specific filters
      const appliedFilters = { ...filters };
      
      // Filter by current user based on role
      if (userRole === 'doctor' && !appliedFilters.doctorId) {
        appliedFilters.doctorId = currentUserId;
      } else if (userRole === 'patient' && !appliedFilters.patientId) {
        appliedFilters.patientId = currentUserId;
      } 
      // Admin can see all sessions by default
      
      const data = await sessionService.getSessions(appliedFilters);
      setSessions(data);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load sessions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters, currentUserId, userRole]);
  
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);
  
  // Load user data (patients, doctors)
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const [patientsData, doctorsData] = await Promise.all([
          sessionService.getPatients(),
          sessionService.getDoctors()
        ]);
        
        setPatients(patientsData);
        setDoctors(doctorsData);
      } catch (err) {
        console.error('Error loading user data:', err);
      }
    };
    
    loadUsers();
  }, []);
  
  // Get user name by ID
  const getUserName = (id: string) => {
    const doctor = doctors.find(d => d.id === id);
    if (doctor) return doctor.name;
    
    const patient = patients.find(p => p.id === id);
    if (patient) return patient.name;
    
    // Check if it's an admin (would come from API in a real app)
    if (id === 'a1') return 'Admin Sarah';
    
    return 'Unknown User';
  };
  
  // Filter handlers
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleStatusFilterChange = (status: SessionStatus | 'all') => {
    setFilters(prev => ({ ...prev, status }));
  };
  
  const handleClearFilters = () => {
    const baseFilters: SessionFilterCriteria = { status: 'all' };
    
    // Keep role-specific filters
    if (userRole === 'doctor') {
      baseFilters.doctorId = currentUserId;
    } else if (userRole === 'patient') {
      baseFilters.patientId = currentUserId;
    }
    // Admin doesn't need any default filters
    
    setFilters(baseFilters);
  };
  
  // For demo purposes - switch between doctor and patient view
  const switchUserRole = () => {
    if (userRole === 'doctor') {
      setUserRole('patient');
      setCurrentUserId('p1');
    } else if (userRole === 'patient') {
      setUserRole('admin');
      setCurrentUserId('a1');
    } else {
      setUserRole('doctor');
      setCurrentUserId('d1');
    }
  };
  
  // Session status style
  const getStatusBadgeStyle = (status: SessionStatus) => {
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
  
  if (loading) {
    return (
      <AuthGuard>
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-6">Therapy Sessions</h1>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
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
              <h1 className="text-2xl font-bold">Therapy Sessions</h1>
              <p className="text-gray-600">
                {userRole === 'doctor' ? 'Manage and review your patient sessions' : 
                 userRole === 'patient' ? 'View your therapy sessions' : 
                 'Oversee and manage all therapy sessions'}
              </p>
            </div>
            
            <div className="flex space-x-2">
              {(userRole === 'doctor' || userRole === 'admin') && (
                <button
                  onClick={() => router.push('/sessions/create')}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Schedule New Session
                </button>
              )}
              
              {/* For demo only - switch between doctor/patient view */}
              <button
                onClick={switchUserRole}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Switch to {userRole === 'doctor' ? 'Patient' : userRole === 'patient' ? 'Admin' : 'Doctor'} View
              </button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleStatusFilterChange('all')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    filters.status === 'all'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleStatusFilterChange('scheduled')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    filters.status === 'scheduled'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Scheduled
                </button>
                <button
                  onClick={() => handleStatusFilterChange('in-progress')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    filters.status === 'in-progress'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => handleStatusFilterChange('completed')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    filters.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => handleStatusFilterChange('cancelled')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    filters.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Cancelled
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2">
                {userRole === 'admin' && (
                  <>
                    <select
                      name="doctorId"
                      value={filters.doctorId || ''}
                      onChange={handleFilterChange}
                      className="border border-gray-300 rounded-md px-3 py-1.5 bg-white text-sm"
                    >
                      <option value="">All Doctors</option>
                      {doctors.map(doctor => (
                        <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                      ))}
                    </select>
                    
                    <select
                      name="patientId"
                      value={filters.patientId || ''}
                      onChange={handleFilterChange}
                      className="border border-gray-300 rounded-md px-3 py-1.5 bg-white text-sm"
                    >
                      <option value="">All Patients</option>
                      {patients.map(patient => (
                        <option key={patient.id} value={patient.id}>{patient.name}</option>
                      ))}
                    </select>
                  </>
                )}
                
                {userRole === 'doctor' && (
                  <select
                    name="patientId"
                    value={filters.patientId || ''}
                    onChange={handleFilterChange}
                    className="border border-gray-300 rounded-md px-3 py-1.5 bg-white text-sm"
                  >
                    <option value="">All Patients</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>{patient.name}</option>
                    ))}
                  </select>
                )}
                
                <input
                  type="text"
                  name="search"
                  value={filters.search || ''}
                  onChange={handleFilterChange}
                  placeholder="Search sessions..."
                  className="border border-gray-300 rounded-md px-3 py-1.5 bg-white text-sm"
                />
                
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
          
          {/* Sessions List */}
          {sessions.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <h2 className="text-xl font-medium text-gray-800 mb-2">No sessions found</h2>
              <p className="text-gray-600 mb-4">
                {userRole === 'doctor' 
                  ? 'No therapy sessions match your current filters.'
                  : userRole === 'patient'
                  ? 'You don\'t have any scheduled therapy sessions.'
                  : 'No therapy sessions match your current filters.'}
              </p>
              {(userRole === 'doctor' || userRole === 'admin') && (
                <button
                  onClick={() => router.push('/sessions/create')}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Schedule New Session
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Session
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {userRole === 'doctor' ? 'Patient' : userRole === 'patient' ? 'Doctor' : 'Participants'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sessions.map(session => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{session.title}</div>
                        {session.notes && (
                          <div className="text-xs text-gray-500 truncate max-w-xs">{session.notes}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {userRole === 'doctor' 
                            ? getUserName(session.patientId)
                            : userRole === 'patient'
                            ? getUserName(session.doctorId)
                            : `${getUserName(session.doctorId)} & ${getUserName(session.patientId)}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(session.scheduledDate)}</div>
                        <div className="text-xs text-gray-500">{formatTime(session.startTime)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeStyle(session.status)}`}>
                          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/sessions/${session.id}`} className="text-blue-600 hover:text-blue-900 mr-3">
                          View
                        </Link>
                        
                        {(userRole === 'doctor' || userRole === 'admin') && session.status === 'scheduled' && (
                          <Link href={`/sessions/${session.id}/conduct`} className="text-green-600 hover:text-green-900 mr-3">
                            Conduct
                          </Link>
                        )}
                        
                        {(userRole === 'doctor' || userRole === 'admin') && session.status === 'scheduled' && (
                          <Link href={`/sessions/${session.id}/edit`} className="text-gray-600 hover:text-gray-900">
                            Edit
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </AuthGuard>
  );
};

export default SessionListPage;