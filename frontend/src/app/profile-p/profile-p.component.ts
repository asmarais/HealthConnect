import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-profile-p',
  templateUrl: './profile-p.component.html',
  styleUrls: ['./profile-p.component.css']
})
export class ProfilePComponent implements OnInit {
  doctor: Doctor = {
    name: '',
    profilePic: '',
    rating: 'N/A',
    joined: '',
    email: '',
    phone: '',
    address: '',
    cin: '',
    socialSecurityNumber: '',
    allergies: '',
    score: 0
  };

  editedPatient: EditedPatient = {
    name: '',
    email: '',
    phone: '',
    address: '',
    cin: '',
    socialSecurityNumber: '',
    allergies: '',
    score: 0
  };

  announcements: Announcement[] = []; // Now dynamic, initialized as empty

  appointments: { [key: string]: Appointment[] } = {};
  currentDate = new Date();
  selectedDate: string = this.getTodayDateString();
  selectedAppointments: Appointment[] = [];
  daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  isEditModalOpen = false;
  patientId: number | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const userData = this.authService.getUserDataFromToken();
    console.log(userData);
    if (userData && userData.userId) {
      this.patientId = userData.userId; // Use dynamic ID instead of hardcoded 2
      this.fetchPatientDetails();
      this.fetchAppointments();
      this.updateEvents(this.selectedDate);
    } else {
      console.error('No valid user data found. Please log in.');
    }
  }

  private getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  fetchPatientDetails() {
    if (!this.patientId) return;

    this.http.get<PatientResponse>(`http://localhost:5000/api/patient/${this.patientId}`).subscribe({
      next: (response) => {
        this.doctor = {
          name: `${response.User.prenom} ${response.User.nom}`,
          profilePic: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150&h=150',
          rating: response.score ? `${response.score}/5` : 'N/A',
          joined: response.User.date_de_creation || 'Unknown',
          email: response.User.email,
          phone: response.User.numero_de_telephone,
          address: response.User.adresse || '',
          cin: response.User.cin || '',
          socialSecurityNumber: response.numero_securite_sociale || '',
          allergies: response.allergies || '',
          score: response.score || 0
        };
        this.editedPatient = { ...this.doctor };
      },
      error: (error) => {
        console.error('Error fetching patient details:', error);
        alert('Failed to load patient details');
      }
    });
  }

  fetchAppointments() {
    if (!this.patientId) return;

    this.http.get<AppointmentResponse[]>(`http://localhost:5000/api/rendezvous/patient/${this.patientId}`).subscribe({
      next: (appointments) => {
        this.appointments = {};
        this.announcements = []; // Reset announcements

        appointments.forEach(appt => {
          const dateObj = new Date(appt.date_debut);
          dateObj.setHours(dateObj.getHours() - 1); // Adjust for timezone if needed
          const date = dateObj.toISOString().split('T')[0];
          const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          // Add to appointments
          if (!this.appointments[date]) {
            this.appointments[date] = [];
          }
          this.appointments[date].push({
            time,
            reason: 'Consultation', // You can fetch `raison` from the API if available
            status: appt.statut
          });

          // Generate announcement based on appointment status
          let title: string;
          let description: string;
          let bgClass: string;

          switch (appt.statut) {
            case 'PENDING':
              title = 'Appointment Pending';
              description = `Your appointment on ${date} at ${time} is awaiting confirmation.`;
              bgClass = 'bg-yellow';
              break;
            case 'CONFIRMED':
              title = 'Upcoming Appointment';
              description = `You have a confirmed appointment on ${date} at ${time}.`;
              bgClass = 'bg-blue';
              break;
            case 'CANCELLED':
              title = 'Appointment Cancelled';
              description = `Your appointment on ${date} at ${time} has been cancelled.`;
              bgClass = 'bg-red';
              break;
            default:
              title = 'Appointment Update';
              description = `Status update for your appointment on ${date} at ${time}: ${appt.statut}.`;
              bgClass = 'bg-gray';
          }

          this.announcements.push({
            title,
            date,
            description,
            bgClass
          });
        });

        // Sort announcements by date (most recent first)
        this.announcements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.updateEvents(this.selectedDate);
      },
      error: (error) => {
        console.error('Error fetching appointments:', error);
      }
    });
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
    this.currentDate = new Date(this.currentDate);
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.currentDate = new Date(this.currentDate);
  }

  selectDay(day: number) {
    const dateStr = this.getDateString(day);
    this.selectedDate = dateStr;
    this.updateEvents(dateStr);
  }

  getDateString(day: number): string {
    return `${this.currentDate.getFullYear()}-${String(this.currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  hasAppointments(date: string): boolean {
    return !!this.appointments[date]?.length;
  }

  updateEvents(date: string) {
    this.selectedAppointments = this.appointments[date] || [];
  }

  openEditModal() {
    this.editedPatient = { ...this.doctor };
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
  }

  savePatient() {
    if (!this.editedPatient.name || !this.editedPatient.email || !this.editedPatient.phone) {
      alert('All fields are required');
      return;
    }

    const [prenom, ...nomParts] = this.editedPatient.name.split(' ');
    const nom = nomParts.join(' ');

    const userData = {
      nom: nom || '',
      prenom: prenom || '',
      email: this.editedPatient.email,
      numero_de_telephone: this.editedPatient.phone,
      adresse: this.editedPatient.address || '',
      cin: this.editedPatient.cin || ''
    };

    const patientData = {
      numero_securite_sociale: this.editedPatient.socialSecurityNumber || '',
      allergies: this.editedPatient.allergies || '',
      score: this.editedPatient.score || 0
    };

    this.http.put(`http://localhost:5000/api/user/${this.patientId}`, userData).subscribe({
      next: (userResponse) => {
        console.log('User update response:', userResponse);
        this.http.put(`http://localhost:5000/api/patient/${this.patientId}`, patientData).subscribe({
          next: (patientResponse) => {
            console.log('Patient update response:', patientResponse);
            this.doctor = {
              ...this.doctor,
              name: this.editedPatient.name,
              email: this.editedPatient.email,
              phone: this.editedPatient.phone,
              address: this.editedPatient.address,
              cin: this.editedPatient.cin,
              socialSecurityNumber: this.editedPatient.socialSecurityNumber,
              allergies: this.editedPatient.allergies,
              score: this.editedPatient.score
            };
            console.log("Patient and User updated successfully");
            this.closeEditModal();
            this.fetchPatientDetails();
          },
          error: (patientError) => {
            console.error('Error updating patient:', patientError);
            alert('Failed to update patient details: ' + (patientError.error?.message || 'Unknown error'));
          }
        });
      },
      error: (userError) => {
        console.error('Error updating user:', userError);
        alert('Failed to update user details: ' + (userError.error?.message || 'Unknown error'));
      }
    });
  }
}

// Interfaces
interface Doctor {
  name: string;
  profilePic: string;
  rating: string;
  joined: string;
  email: string;
  phone: string;
  address: string;
  cin: string;
  socialSecurityNumber: string;
  allergies: string;
  score: number;
}

interface EditedPatient {
  name: string;
  email: string;
  phone: string;
  address: string;
  cin: string;
  socialSecurityNumber: string;
  allergies: string;
  score: number;
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

interface PatientResponse {
  User: {
    prenom: string;
    nom: string;
    email: string;
    numero_de_telephone: string;
    date_de_creation?: string;
    adresse: string;
    cin: string;
  };
  score?: number;
  numero_securite_sociale: string;
  allergies: string;
}

interface AppointmentResponse {
  date_debut: string;
  statut: string;
}
