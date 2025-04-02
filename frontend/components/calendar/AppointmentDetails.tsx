import { CalendarEvent } from '../../services/calendarService'
import moment from 'moment'

interface AppointmentDetailsProps {
  isOpen: boolean
  onClose: () => void
  appointment: CalendarEvent
  onUpdateStatus: (appointmentId: string, status: 'scheduled' | 'canceled' | 'completed') => void
  userRole: string
}

export default function AppointmentDetails({
  isOpen,
  onClose,
  appointment,
  onUpdateStatus,
  userRole
}: AppointmentDetailsProps) {
  if (!isOpen) return null
  
  const formatDate = (date: Date) => {
    return moment(date).format('MMMM D, YYYY [at] h:mm A')
  }
  
  const getStatusBadgeClass = (status: string) => {
    if (status === 'completed') return 'bg-green-100 text-green-800'
    if (status === 'canceled') return 'bg-red-100 text-red-800'
    return 'bg-blue-100 text-blue-800'
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{appointment.title}</h2>
          <span 
            className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(appointment.status)}`}
          >
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </span>
        </div>
        
        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Start Time</p>
            <p>{formatDate(appointment.start)}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">End Time</p>
            <p>{formatDate(appointment.end)}</p>
          </div>
          
          {appointment.notes && (
            <div>
              <p className="text-sm text-gray-500">Notes</p>
              <p className="whitespace-pre-line">{appointment.notes}</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Close
          </button>
          
          <div className="space-x-2">
            {/* Only show these buttons for relevant roles and if appointment isn't already canceled/completed */}
            {appointment.status === 'scheduled' && (
              <>
                {/* Both doctor and patient can cancel */}
                <button
                  type="button"
                  onClick={() => onUpdateStatus(appointment.id, 'canceled')}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Cancel
                </button>
                
                {/* Only doctors and admins can mark as completed */}
                {(userRole === 'doctor' || userRole === 'admin') && (
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(appointment.id, 'completed')}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Complete
                  </button>
                )}
              </>
            )}
            
            {/* Allow rescheduling canceled appointments */}
            {appointment.status === 'canceled' && (
              <button
                type="button"
                onClick={() => onUpdateStatus(appointment.id, 'scheduled')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Reschedule
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}