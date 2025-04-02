// Appointment types
export interface Appointment {
  appointment_id: string;
  title: string;
  patient_id: string;
  therapist_id: string;
  start_time: string;
  end_time: string;
  notes?: string;
  status: 'scheduled' | 'canceled' | 'completed';
  patient_name?: string;
  therapist_name?: string;
  appointment_type?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: string;
  resourceId?: string;
  notes?: string;
  allDay: boolean;
}

// Mock appointments data
const MOCK_APPOINTMENTS: Appointment[] = [
  {
    appointment_id: "appt-001",
    patient_id: "patient1",
    patient_name: "Alex Garcia",
    therapist_id: "therapist1",
    therapist_name: "Dr. Sarah Johnson",
    start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    end_time: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
    title: "Initial Consultation",
    notes: "First session with patient",
    status: "scheduled",
    appointment_type: "initial"
  },
  {
    appointment_id: "appt-002",
    patient_id: "patient2",
    patient_name: "Jordan Smith",
    therapist_id: "therapist2",
    therapist_name: "Dr. Michael Lee",
    start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
    end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    title: "Follow-up Session",
    notes: "Review progress from last week",
    status: "scheduled",
    appointment_type: "followup"
  },
  {
    appointment_id: "appt-003",
    patient_id: "patient3",
    patient_name: "Taylor Brown",
    therapist_id: "therapist3",
    therapist_name: "Dr. Emily Chen",
    start_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    end_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    title: "Therapy Session",
    notes: "Addressing anxiety management techniques",
    status: "scheduled",
    appointment_type: "standard"
  }
];

let mockAppointmentsDb = [...MOCK_APPOINTMENTS];

// Fetch appointments based on role and ID - mock data version
export const fetchAppointments = async (type: string, id?: string): Promise<Appointment[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (type === 'therapist') {
    return mockAppointmentsDb.filter(appt => appt.therapist_id === id);
  } else if (type === 'patient') {
    return mockAppointmentsDb.filter(appt => appt.patient_id === id);
  } else if (type === 'all') {
    return mockAppointmentsDb;
  }
  
  return [];
}

// Create a new appointment - mock data version
export const createAppointment = async (appointment: Omit<Appointment, 'appointment_id'>) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newAppointment: Appointment = {
    ...appointment,
    appointment_id: `appt-${Date.now().toString(36)}`
  };
  
  mockAppointmentsDb.push(newAppointment);
  return { message: "Appointment created", appointment_id: newAppointment.appointment_id };
}

// Update appointment status (cancel or complete) - mock data version
export const updateAppointmentStatus = async (appointmentId: string, status: 'scheduled' | 'canceled' | 'completed') => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const appointmentIndex = mockAppointmentsDb.findIndex(
    appt => appt.appointment_id === appointmentId
  );
  
  if (appointmentIndex === -1) {
    throw new Error('Appointment not found');
  }
  
  mockAppointmentsDb[appointmentIndex].status = status;
  return { message: "Appointment updated", status };
}

// Convert API appointments to calendar events
export const appointmentsToEvents = (appointments: Appointment[]): CalendarEvent[] => {
  return appointments.map(appt => ({
    id: appt.appointment_id,
    title: appt.title || `${appt.patient_name || appt.patient_id} - ${appt.therapist_name || appt.therapist_id}`,
    start: new Date(appt.start_time),
    end: new Date(appt.end_time),
    status: appt.status,
    notes: appt.notes,
    allDay: false,
  }));
}