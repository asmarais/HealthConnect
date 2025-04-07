import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

interface Appointment {
  time: string;
  patient: string;
  reason: string;
  phone: string;
  notes: string;
  accepted: boolean | 'rejected';
}

interface Patient {
  name: string;
  email: string;
  phone: string;
}

interface Notification {
  title: string;
  date: string;
  description: string;
}

@Component({
  selector: 'app-profile-d',
  templateUrl: './profile-d.component.html',
  styleUrls: ['./profile-d.component.css']
})
export class ProfileDComponent implements OnInit {
  @ViewChild('scheduleSection') scheduleSection!: ElementRef;
  @ViewChild('patientsSection') patientsSection!: ElementRef;

  doctor = {
    name: '',
    rating: '',
    joined: '',
    email: '',
    phone: ''
  };

  stats = {
    appointments: 25,
    patients: 48
  };

  viewMode: 'week' | 'day' = 'week';
  currentDay = 'Monday';
  scheduleDateRange = 'March 30 – April 3';
  timeSlots = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  schedule: { [key: string]: Appointment[] } = {
    Monday: [
      { time: '8:00 AM', patient: 'John Doe', reason: 'Check-up', phone: '+1 123 456 7890', notes: 'First visit', accepted: false },
      { time: '9:00 AM', patient: 'Sarah Smith', reason: 'Consultation', phone: '+1 234 567 8901', notes: 'Heart concerns', accepted: true },
      { time: '10:00 AM', patient: 'Michael Brown', reason: 'Follow-up', phone: '+1 345 678 9012', notes: 'Post-surgery', accepted: true },
      { time: '1:00 PM', patient: 'Emily Johnson', reason: 'Check-up', phone: '+1 456 789 0123', notes: 'Routine', accepted: false },
      { time: '2:00 PM', patient: 'David Lee', reason: 'Surgery Prep', phone: '+1 567 890 1234', notes: 'Scheduled for next week', accepted: true }
    ],
    Tuesday: [
      { time: '8:00 AM', patient: 'Anna Taylor', reason: 'Check-up', phone: '+1 678 901 2345', notes: 'Annual visit', accepted: true },
      { time: '9:00 AM', patient: 'James Wilson', reason: 'Consultation', phone: '+1 789 012 3456', notes: 'Chest pain', accepted: false }
    ],
    Wednesday: [],
    Thursday: [],
    Friday: []
  };

  patients: Patient[] = [
    { name: 'John Doe', email: 'john.doe@example.com', phone: '+1 123 456 7890' },
    { name: 'Sarah Smith', email: 'sarah.smith@example.com', phone: '+1 234 567 8901' },
    { name: 'Michael Brown', email: 'michael.brown@example.com', phone: '+1 345 678 9012' },
    { name: 'Emily Johnson', email: 'emily.johnson@example.com', phone: '+1 456 789 0123' },
    { name: 'David Lee', email: 'david.lee@example.com', phone: '+1 567 890 1234' },
    { name: 'Anna Taylor', email: 'anna.taylor@example.com', phone: '+1 678 901 2345' },
    { name: 'James Wilson', email: 'james.wilson@example.com', phone: '+1 789 012 3456' }
  ];

  notifications: Notification[] = [
    { title: 'New Patient Request', date: '2025-03-29', description: 'John Doe has requested an appointment for a check-up.' },
    { title: 'Reminder: Surgery', date: '2025-03-30', description: 'Scheduled surgery for Michael Brown at 2:00 PM.' },
    { title: 'Staff Meeting', date: '2025-04-01', description: 'Staff meeting scheduled at 9:00 AM to discuss new protocols.' }
  ];

  selectedAppointment: Appointment | null = null;
  searchQuery = '';
  sortDirection: 'asc' | 'desc' = 'desc';
  currentPage = 1;
  patientsPerPage = 5;
  filteredPatients: Patient[] = [];
  paginatedPatients: Patient[] = [];
  visibleAppointments: { [key: string]: boolean } = {};

  ngOnInit() {
    this.filteredPatients = [...this.patients];
    this.renderPatientsTable();
    // Set initial view to schedule
    this.setView('schedule');
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
  
      this.doctor = {
        name: `${user.nom} ${user.prenom}`,
        email: user.email,
        phone: user.numero_de_telephone,
        rating: 'A+', // You can update this if rating exists in user
        joined: this.formatDate(user.createdAt)
      };
    } else {
      console.warn('No doctor data found in localStorage.');
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
    return date.toLocaleDateString(undefined, options);
  }
  setView(viewId: string) {
    if (viewId === 'schedule') {
      this.scheduleSection.nativeElement.style.display = 'block';
      this.patientsSection.nativeElement.style.display = 'none';
    } else if (viewId === 'patients') {
      this.scheduleSection.nativeElement.style.display = 'none';
      this.patientsSection.nativeElement.style.display = 'block';
      this.renderPatientsTable();
    }
  }

  setViewMode(mode: 'week' | 'day') {
    this.viewMode = mode;
    if (mode === 'day') this.currentDay = this.days[0];
  }

  selectDay(day: string) {
    if (this.viewMode === 'day') this.currentDay = day;
  }

  getDaySlots(day: string): { appointment: Appointment | null }[] {
    const slots: { appointment: Appointment | null }[] = Array(this.timeSlots.length).fill(null).map(() => ({ appointment: null }));
    this.schedule[day]?.forEach(appointment => {
      const index = this.timeSlots.indexOf(appointment.time);
      if (index >= 0) slots[index].appointment = appointment;
    });
    return slots;
  }

  showTooltip(appointment: Appointment) {
    this.selectedAppointment = this.selectedAppointment === appointment ? null : appointment;
  }

  acceptAppointment(appointment: Appointment) {
    appointment.accepted = true;
    this.selectedAppointment = null;
    this.renderPatientsTable();
  }

  rejectAppointment(appointment: Appointment) {
    if (confirm(`Are you sure you want to reject ${appointment.patient}'s appointment?`)) {
      appointment.accepted = 'rejected';
      this.selectedAppointment = null;
      this.renderPatientsTable();
    }
  }

  editAppointment(appointment: Appointment) {
    alert(`Modify date for ${appointment.patient}'s appointment. (Placeholder action)`);
  }

  cancelAppointment(appointment: Appointment) {
    if (confirm(`Are you sure you want to cancel ${appointment.patient}'s appointment?`)) {
      appointment.accepted = 'rejected';
      this.selectedAppointment = null;
      this.renderPatientsTable();
    }
  }

  filterPatients() {
    this.filteredPatients = this.patients.filter(patient =>
      patient.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.currentPage = 1;
    this.renderPatientsTable();
  }

  toggleSort() {
    this.sortDirection = this.sortDirection === 'desc' ? 'asc' : 'desc';
    this.renderPatientsTable();
  }

  renderPatientsTable() {
    this.filteredPatients.sort((a, b) => {
      const aHasPending = this.hasPendingAppointments(a.name);
      const bHasPending = this.hasPendingAppointments(b.name);
      return this.sortDirection === 'desc'
        ? (bHasPending ? 1 : -1) - (aHasPending ? 1 : -1)
        : (aHasPending ? 1 : -1) - (bHasPending ? 1 : -1);
    });

    const start = (this.currentPage - 1) * this.patientsPerPage;
    const end = start + this.patientsPerPage;
    this.paginatedPatients = this.filteredPatients.slice(start, end);
  }

  getPatientAppointments(patientName: string): Appointment[] {
    const appointments: Appointment[] = [];
    Object.values(this.schedule).forEach(day => {
      day.forEach(appointment => {
        if (appointment.patient === patientName && appointment.accepted !== 'rejected') {
          appointments.push(appointment);
        }
      });
    });
    return appointments;
  }

  hasPendingAppointments(patientName: string): boolean {
    return this.getPatientAppointments(patientName).some(appointment => appointment.accepted === false);
  }

  toggleAppointments(patientName: string) {
    this.visibleAppointments[patientName] = !this.visibleAppointments[patientName];
  }

  getPageNumbers(): number[] {
    const pageCount = Math.ceil(this.filteredPatients.length / this.patientsPerPage);
    return Array(pageCount).fill(0).map((_, i) => i + 1);
  }

  setPage(page: number) {
    this.currentPage = page;
    this.renderPatientsTable();
  }
}
