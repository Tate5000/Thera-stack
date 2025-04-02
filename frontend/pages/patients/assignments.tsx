import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AuthGuard from '../../components/auth/AuthGuard';
import PermissionGuard from '../../components/auth/PermissionGuard';
import { sessionService } from '../../services/sessionService';
import { PatientAssignment } from '../../types/sessions';
import { format } from 'date-fns';

const PatientAssignmentsPage: React.FC = () => {
  const router = useRouter();
  
  // Current doctor ID (in a real app, would come from auth context)
  const [doctorId, setDoctorId] = useState('d1');
  
  // Assignments and patients
  const [assignments, setAssignments] = useState<PatientAssignment[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [allPatients, setAllPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // For new assignment
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPatientId, setNewPatientId] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Fetch assignments and patients
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get assignments for current doctor
        const assignmentsData = await sessionService.getPatientAssignments(doctorId);
        setAssignments(assignmentsData);
        
        // Get all patients
        const allPatientsData = await sessionService.getPatients();
        setAllPatients(allPatientsData);
        
        // Create combined list with patient details
        const patientsList = assignmentsData
          .filter(a => a.status === 'active')
          .map(assignment => {
            const patient = allPatientsData.find(p => p.id === assignment.patientId);
            return patient ? { ...patient, assignmentId: assignment.id, notes: assignment.notes } : null;
          })
          .filter(Boolean);
        
        setPatients(patientsList);
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setError('Failed to load patient assignments');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [doctorId]);
  
  // Handle adding new patient
  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPatientId) {
      setError('Please select a patient');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const assignment = {
        doctorId,
        patientId: newPatientId,
        status: 'active' as const,
        notes: newNotes.trim() || undefined
      };
      
      const newAssignment = await sessionService.createPatientAssignment(assignment);
      
      // Add patient to list
      const patient = allPatients.find(p => p.id === newPatientId);
      if (patient) {
        setPatients(prev => [...prev, { ...patient, assignmentId: newAssignment.id, notes: newAssignment.notes }]);
      }
      
      // Update assignments list
      setAssignments(prev => [...prev, newAssignment]);
      
      // Reset form
      setNewPatientId('');
      setNewNotes('');
      setShowAddForm(false);
      
      // Show success message
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error adding patient:', err);
      setError('Failed to add patient');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle removing a patient
  const handleRemovePatient = async (assignmentId: string) => {
    if (!window.confirm('Are you sure you want to remove this patient from your case load?')) {
      return;
    }
    
    try {
      await sessionService.updatePatientAssignment(assignmentId, { status: 'inactive' });
      
      // Update patients list
      setPatients(prev => prev.filter(p => p.assignmentId !== assignmentId));
      
      // Update assignments list
      setAssignments(prev => 
        prev.map(a => a.id === assignmentId ? { ...a, status: 'inactive' } : a)
      );
    } catch (err) {
      console.error('Error removing patient:', err);
      setError('Failed to remove patient');
    }
  };
  
  // Get available patients (not already assigned)
  const getAvailablePatients = () => {
    const assignedPatientIds = assignments
      .filter(a => a.status === 'active')
      .map(a => a.patientId);
    
    return allPatients.filter(patient => !assignedPatientIds.includes(patient.id));
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
          <h1 className="text-2xl font-bold mb-6">Patient Assignments</h1>
          <div className="flex justify-center py-12">
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
            <h1 className="text-2xl font-bold">Patient Assignments</h1>
            <p className="text-gray-600">Manage your assigned patients</p>
          </div>
            
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Patient
              </button>
            )}
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
              <span className="block sm:inline">Patient added successfully!</span>
            </div>
          )}
          
          {/* Add Patient Form */}
          {showAddForm && (
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-medium">Add New Patient</h2>
              </div>
              <div className="p-6">
                <form onSubmit={handleAddPatient}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-1">
                        Patient
                      </label>
                      <select
                        id="patientId"
                        value={newPatientId}
                        onChange={(e) => setNewPatientId(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md bg-white"
                        required
                      >
                        <option value="" disabled>Select a patient</option>
                        {getAvailablePatients().map(patient => (
                          <option key={patient.id} value={patient.id}>{patient.name}</option>
                        ))}
                      </select>
                      {getAvailablePatients().length === 0 && (
                        <p className="mt-1 text-sm text-gray-500">All patients are already assigned.</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                        Notes (optional)
                      </label>
                      <input
                        type="text"
                        id="notes"
                        value={newNotes}
                        onChange={(e) => setNewNotes(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="e.g., Weekly sessions for anxiety"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 mr-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !newPatientId}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                    >
                      {isSubmitting ? 'Adding...' : 'Add Patient'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Patient List */}
          {patients.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <h2 className="text-xl font-medium text-gray-800 mb-2">No patients assigned</h2>
              <p className="text-gray-600 mb-4">
                You don't have any patients assigned to you yet.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Patient
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{patient.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">{patient.notes || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/sessions?patientId=${patient.id}`} className="text-blue-600 hover:text-blue-900 mr-3">
                          Sessions
                        </Link>
                        <button
                          onClick={() => handleRemovePatient(patient.assignmentId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
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

export default PatientAssignmentsPage;