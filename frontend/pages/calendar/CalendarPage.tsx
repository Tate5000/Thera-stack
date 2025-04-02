import { useEffect, useState, useCallback } from 'react'
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { 
  fetchAppointments, 
  createAppointment, 
  updateAppointmentStatus,
  appointmentsToEvents,
  CalendarEvent,
  Appointment 
} from '../../services/calendarService'
import { useAuth } from '../../context/AuthContext'
import AppointmentModal from '../../components/calendar/AppointmentModal'
import AppointmentDetails from '../../components/calendar/AppointmentDetails'
import { v4 as uuidv4 } from 'uuid'

const localizer = momentLocalizer(moment)

export default function CalendarPage() {
  const { user } = useAuth() // assume user has { role, id, name }
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<any>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Fetch appointments based on user role
  const loadAppointments = useCallback(async () => {
    try {
      setIsLoading(true)
      let appts: Appointment[] = []
      
      if (!user) return
      
      if (user.role === 'doctor') {
        appts = await fetchAppointments('therapist', user.id)
      } else if (user.role === 'patient') {
        appts = await fetchAppointments('patient', user.id)
      } else if (user.role === 'admin') {
        appts = await fetchAppointments('all')
      }

      setEvents(appointmentsToEvents(appts))
    } catch (error) {
      console.error('Failed to load appointments', error)
      // Add toast notification here
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  // Handle slot selection (creating new appointment)
  const handleSelectSlot = useCallback((slotInfo: any) => {
    if (!user) return
    if (user.role === 'patient' || user.role === 'admin') {
      setSelectedSlot(slotInfo)
      setShowCreateModal(true)
    }
  }, [user])

  // Handle event selection (viewing appointment details)
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event)
    setShowDetailsModal(true)
  }, [])

  // Create a new appointment
  const handleCreateAppointment = async (appointmentData: any) => {
    if (!user) return
    
    try {
      setIsLoading(true)
      
      const newAppointment = {
        title: appointmentData.title,
        patient_id: user.role === 'patient' ? user.id : appointmentData.patientId,
        patient_name: user.role === 'patient' ? user.name : appointmentData.patientName,
        therapist_id: appointmentData.therapistId,
        therapist_name: appointmentData.therapistName,
        start_time: appointmentData.startTime.toISOString(),
        end_time: appointmentData.endTime.toISOString(),
        notes: appointmentData.notes,
        status: 'scheduled' as const,
        appointment_type: appointmentData.appointmentType || 'standard'
      }
      
      await createAppointment(newAppointment)
      setShowCreateModal(false)
      await loadAppointments()
      // Add success toast notification here
    } catch (error) {
      console.error('Failed to create appointment', error)
      // Add error toast notification here
    } finally {
      setIsLoading(false)
    }
  }

  // Update appointment status (cancel or complete)
  const handleUpdateAppointmentStatus = async (appointmentId: string, status: 'scheduled' | 'canceled' | 'completed') => {
    try {
      setIsLoading(true)
      await updateAppointmentStatus(appointmentId, status)
      setShowDetailsModal(false)
      await loadAppointments()
      // Add success toast notification here
    } catch (error) {
      console.error('Failed to update appointment', error)
      // Add error toast notification here
    } finally {
      setIsLoading(false)
    }
  }

  // Calendar event styles based on status
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3174ad' // default color
    
    if (event.status === 'canceled') {
      backgroundColor = '#f44336' // red for canceled
    } else if (event.status === 'completed') {
      backgroundColor = '#4caf50' // green for completed
    }
    
    return { style: { backgroundColor } }
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Therapy Calendar</h1>
        {user && (user.role === 'patient' || user.role === 'admin') && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Schedule Appointment
          </button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <p>Loading appointments...</p>
        </div>
      ) : (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          defaultView={Views.WEEK}
          views={['month', 'week', 'day']}
          style={{ height: 600 }}
        />
      )}
      
      {/* Create Appointment Modal */}
      {showCreateModal && user && (
        <AppointmentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateAppointment}
          initialValues={{
            startTime: selectedSlot ? new Date(selectedSlot.start) : new Date(),
            endTime: selectedSlot ? new Date(selectedSlot.end) : new Date(Date.now() + 60 * 60 * 1000),
          }}
          userRole={user.role}
          userId={user.id}
          userName={user.name}
        />
      )}
      
      {/* View Appointment Details Modal */}
      {showDetailsModal && selectedEvent && user && (
        <AppointmentDetails
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          appointment={selectedEvent}
          onUpdateStatus={handleUpdateAppointmentStatus}
          userRole={user.role}
        />
      )}
    </div>
  )
}