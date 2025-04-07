import { Component, OnInit } from '@angular/core';

interface Patient {
  name: string;
  profilePic: string;
  rating: string;
  joined: string;
  email: string;
  phone: string;
}

interface Announcement {
  title: string;
  date: string;
  description: string;
  bgClass: string;
}

interface Appointment {
  time: string;
  reason: string;
  status: string;
}

@Component({
  selector: 'app-profile-p',
  templateUrl: './profile-p.component.html',
  styleUrls: ['./profile-p.component.css']
})
export class ProfilePComponent implements OnInit {
  patient: Patient = {
    name: '',
    profilePic: '',
    rating: '',
    joined: '',
    email: '',
    phone: ''
  };

  announcements: Announcement[] = [
    { title: 'Upcoming Appointment Reminder', date: '2025-03-30', description: 'You have an appointment with Dr. Emily Carter on March 31st at 8:00 AM for a check-up.', bgClass: 'bg-blue' },
    { title: 'Lab Results Available', date: '2025-03-29', description: 'Your recent lab results are now available. Please contact the clinic for more details.', bgClass: 'bg-yellow' },
    { title: 'Prescription Refill Reminder', date: '2025-04-01', description: 'Your prescription is due for a refill. Schedule an appointment if needed.', bgClass: 'bg-blue' }
  ];

  appointments: { [key: string]: Appointment[] } = {
    '2025-03-30': [
      { time: '8:00 AM', reason: 'Check-up', status: 'Pending' },
      { time: '2:00 PM', reason: 'Surgery Prep', status: 'Accepted' }
    ],
    '2025-03-31': [
      { time: '8:00 AM', reason: 'Check-up', status: 'Accepted' },
      { time: '9:00 AM', reason: 'Consultation', status: 'Pending' }
    ],
    '2025-04-01': [
      { time: '10:00 AM', reason: 'Follow-up', status: 'Accepted' }
    ]
  };

  currentDate = new Date(2025, 2, 1); // March 2025
  selectedDate = '2025-03-30'; // Date par défaut
  selectedAppointments: Appointment[] = [];
  daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  ngOnInit() {
    this.updateEvents(this.selectedDate);
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
  
      this.patient = {
        name: `${user.nom} ${user.prenom}`,
        email: user.email,
        phone: user.numero_de_telephone,
        rating: '', // You can update this if rating exists in user
        profilePic:user.profilePic,
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
  get daysInMonth(): number[] {
    const days = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => i + 1);
  }

  get emptyDays(): any[] {
    const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1).getDay();
    return Array(firstDay === 0 ? 6 : firstDay - 1);
  }

  prevMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.currentDate = new Date(this.currentDate); // Force update
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.currentDate = new Date(this.currentDate); // Force update
  }

  selectDay(day: number) {
    const dateStr = this.getDateString(day);
    this.selectedDate = dateStr;
    this.updateEvents(dateStr);
  }

  getDateString(day: number): string {
    return `${this.currentDate.getFullYear()}-${String(this.currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  updateEvents(date: string) {
    this.selectedAppointments = this.appointments[date] || [];
  }
}
