import { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface AppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  initialValues: {
    startTime: Date
    endTime: Date
  }
  userRole: string
  userId: string
  userName: string
}

// Mock data for demo purposes - replace with API calls in production
const MOCK_THERAPISTS = [
  { id: 'therapist1', name: 'Dr. Sarah Johnson' },
  { id: 'therapist2', name: 'Dr. Michael Lee' },
  { id: 'therapist3', name: 'Dr. Emily Chen' }
]

const MOCK_PATIENTS = [
  { id: 'patient1', name: 'Alex Garcia' },
  { id: 'patient2', name: 'Jordan Smith' },
  { id: 'patient3', name: 'Taylor Brown' }
]

const APPOINTMENT_TYPES = [
  { value: 'initial', label: 'Initial Consultation' },
  { value: 'standard', label: 'Standard Session' },
  { value: 'followup', label: 'Follow-up Session' },
  { value: 'emergency', label: 'Emergency Session' }
]

export default function AppointmentModal({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  userRole,
  userId,
  userName
}: AppointmentModalProps) {
  const [title, setTitle] = useState('Therapy Session')
  const [startTime, setStartTime] = useState(initialValues.startTime)
  const [endTime, setEndTime] = useState(initialValues.endTime)
  const [therapistId, setTherapistId] = useState('')
  const [patientId, setPatientId] = useState('')
  const [notes, setNotes] = useState('')
  const [appointmentType, setAppointmentType] = useState('standard')
  
  // Set default patient/therapist based on user role
  useEffect(() => {
    if (userRole === 'patient') {
      setPatientId(userId)
      if (MOCK_THERAPISTS.length > 0) {
        setTherapistId(MOCK_THERAPISTS[0].id)
      }
    } else if (userRole === 'admin' && MOCK_PATIENTS.length > 0 && MOCK_THERAPISTS.length > 0) {
      setPatientId(MOCK_PATIENTS[0].id)
      setTherapistId(MOCK_THERAPISTS[0].id)
    }
  }, [userRole, userId])
  
  // Update end time when start time changes
  useEffect(() => {
    // Default to 1 hour sessions
    const newEndTime = new Date(startTime)
    newEndTime.setHours(startTime.getHours() + 1)
    setEndTime(newEndTime)
  }, [startTime])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // If the user is a patient, we already know their ID
    const patientName = userRole === 'patient' 
      ? userName 
      : MOCK_PATIENTS.find(p => p.id === patientId)?.name || ''
      
    const therapistName = MOCK_THERAPISTS.find(t => t.id === therapistId)?.name || ''
    
    onSubmit({
      title,
      patientId,
      patientName,
      therapistId,
      therapistName,
      startTime,
      endTime,
      notes,
      appointmentType
    })
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md transition-colors">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Schedule New Appointment</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          
          {userRole === 'admin' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">Patient</label>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              >
                <option value="">Select Patient</option>
                {MOCK_PATIENTS.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">Therapist</label>
            <select
              value={therapistId}
              onChange={(e) => setTherapistId(e.target.value)}
              className="w-full px-3 py-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            >
              <option value="">Select Therapist</option>
              {MOCK_THERAPISTS.map(therapist => (
                <option key={therapist.id} value={therapist.id}>
                  {therapist.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">Appointment Type</label>
            <select
              value={appointmentType}
              onChange={(e) => setAppointmentType(e.target.value)}
              className="w-full px-3 py-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            >
              {APPOINTMENT_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">Start Time</label>
              <DatePicker
                selected={startTime}
                onChange={(date: Date) => setStartTime(date)}
                showTimeSelect
                dateFormat="MMMM d, yyyy h:mm aa"
                className="w-full px-3 py-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                minDate={new Date()}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">End Time</label>
              <DatePicker
                selected={endTime}
                onChange={(date: Date) => setEndTime(date)}
                showTimeSelect
                dateFormat="MMMM d, yyyy h:mm aa"
                className="w-full px-3 py-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                minDate={startTime}
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
            >
              Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}