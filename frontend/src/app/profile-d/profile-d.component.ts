import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-profile-d',
  templateUrl: './profile-d.component.html',
  styleUrls: ['./profile-d.component.css']
})
export class ProfileDComponent implements OnInit {
  @ViewChild('scheduleSection') scheduleSection!: ElementRef;
  @ViewChild('patientsSection') patientsSection!: ElementRef;

  doctorId: number | null = null;
  doctor = {
    name: '',
    rating: 'N/A',
    joined: '',
    email: '',
    phone: '',
    specialite: '',
    datedebut: '',
    datefin: '',
    image_url: '',
    adresse: '',
    cin: ''
  };

  editedDoctor = {
    name: '',
    rating: '',
    joined: '',
    email: '',
    phone: '',
    specialite: '',
    datedebut: '',
    datefin: '',
    image_url: '',
    adresse: '',
    cin: ''
  };

  stats = {
    appointments: 0,
    patients: 0
  };

  viewMode: 'week' | 'day' = 'week';
  currentDay = 'Monday';
  scheduleDateRange = 'April 7 – April 11, 2025';
  timeSlots = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  schedule: { [key: string]: any[] } = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: []
  };

  patients: any[] = [];
  notifications: any[] = [];
  selectedAppointment: any = null;
  searchQuery = '';
  sortDirection: 'asc' | 'desc' = 'desc';
  currentPage = 1;
  patientsPerPage = 5;
  filteredPatients: any[] = [];
  paginatedPatients: any[] = [];
  visibleAppointments: { [key: string]: boolean } = {};
  isEditModalOpen = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const userData = this.authService.getUserDataFromToken();
    console.log(userData);
    if (userData && userData.userId) {
      this.doctorId = userData.userId;
      this.fetchDoctorData();
      this.fetchAppointments();
    } else {
      console.error('No valid user data found. Please log in.');
    }
  }

  fetchDoctorData() {
    if (!this.doctorId) return;

    this.http.get(`http://localhost:5000/api/doctor/${this.doctorId}`).subscribe(
      (response: any) => {
        const doctorData = response.doctor || response;
        this.doctor = {
          name: `${doctorData.User.prenom} ${doctorData.User.nom}`,
          rating: doctorData.rating || 'N/A',
          joined: doctorData.joined_at || doctorData.User.date_de_creation || 'Unknown',
          email: doctorData.User.email,
          phone: doctorData.User.numero_de_telephone,
          specialite: doctorData.specialite || '',
          datedebut: doctorData.datedebut || '',
          datefin: doctorData.datefin || '',
          image_url: doctorData.image_url || '',
          adresse: doctorData.User.adresse || '',
          cin: doctorData.User.cin || ''
        };
        this.editedDoctor = { ...this.doctor }; // Initialize editedDoctor with current data
      },
      (error) => {
        console.error('Error fetching doctor data:', error);
      }
    );
  }

  fetchAppointments() {
    if (!this.doctorId) return;

    this.http.get(`http://localhost:5000/api/rendezvous/doctor/${this.doctorId}`).subscribe(
      (appointments: any) => {
        const patientMap = new Map<number, any>();
        const scheduleData: { [key: string]: any[] } = {
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: []
        };
        const notificationData: any[] = [];

        appointments.forEach((appt: any) => {
          const startDate = new Date(appt.date_debut);
          const dayOfWeek = startDate.getDay();
          const dayName = this.days[dayOfWeek - 1] || 'Monday';
          const time = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const dateStr = startDate.toISOString().split('T')[0];

          const appointment = {
            id: appt.id,
            time: this.closestTimeSlot(time),
            patient: `Patient ${appt.patient_id}`,
            patient_id: appt.patient_id,
            reason: appt.raison || 'Consultation',
            phone: '',
            notes: appt.statut === 'PENDING' ? 'Awaiting confirmation' : 'Confirmed',
            accepted: appt.statut === 'CONFIRMED' ? true : false
          };

          scheduleData[dayName].push(appointment);

          notificationData.push({
            title: appt.statut === 'PENDING' ? 'New Patient Request' : 'Appointment Reminder',
            date: dateStr,
            description: appt.statut === 'PENDING'
              ? `Patient ${appt.patient_id} has requested an appointment at ${time}`
              : `Consultation scheduled at ${time} with Patient ${appt.patient_id}`
          });

          if (!patientMap.has(appt.patient_id)) {
            patientMap.set(appt.patient_id, {
              name: `Patient ${appt.patient_id}`,
              email: '',
              phone: ''
            });
          }
        });

        this.schedule = scheduleData;
        this.stats.appointments = appointments.length;
        this.notifications = notificationData.sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        const patientIds = Array.from(patientMap.keys());
        const patientPromises = patientIds.map(id =>
          this.http.get(`http://localhost:5000/api/patient/${id}`).toPromise()
        );

        Promise.all(patientPromises).then((patientResponses: any[]) => {
          patientResponses.forEach((patientData: any, index: number) => {
            const patientId = patientIds[index];
            const fullName = `${patientData.User.prenom} ${patientData.User.nom}`;
            patientMap.set(patientId, {
              name: fullName,
              email: patientData.User.email,
              phone: patientData.User.numero_de_telephone
            });

            Object.values(this.schedule).forEach(day => {
              day.forEach(appointment => {
                if (appointment.patient_id === patientId) {
                  appointment.patient = fullName;
                  appointment.phone = patientData.User.numero_de_telephone;
                }
              });
            });

            this.notifications.forEach(notification => {
              if (notification.description.includes(`Patient ${patientId}`)) {
                notification.description = notification.description.replace(
                  `Patient ${patientId}`,
                  fullName
                );
              }
            });
          });

          this.patients = Array.from(patientMap.values());
          this.stats.patients = patientMap.size;
          this.filteredPatients = [...this.patients];
          this.renderPatientsTable();
          this.setView('schedule');
        }).catch(error => {
          console.error('Error fetching patient details:', error);
          this.patients = Array.from(patientMap.values());
          this.stats.patients = patientMap.size;
          this.filteredPatients = [...this.patients];
          this.renderPatientsTable();
          this.setView('schedule');
        });
      },
      (error) => {
        console.error('Error fetching appointments:', error);
      }
    );
  }

  closestTimeSlot(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    let closestSlot = this.timeSlots[0];
    let minDiff = Infinity;

    this.timeSlots.forEach(slot => {
      const [slotHours, slotMinutes] = slot.split(':').map((part, i) => {
        if (i === 0) return parseInt(part);
        return parseInt(part.slice(0, 2)) + (part.includes('PM') && part !== '12:00 PM' ? 12 * 60 : 0);
      });
      const slotTotalMinutes = slotHours * 60 + slotMinutes;
      const diff = Math.abs(slotTotalMinutes - totalMinutes);
      if (diff < minDiff) {
        minDiff = diff;
        closestSlot = slot;
      }
    });

    return closestSlot;
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

  getDaySlots(day: string): any[] {
    const slots: any[] = Array(this.timeSlots.length).fill(null).map(() => ({ appointment: null }));
    this.schedule[day]?.forEach(appointment => {
      const index = this.timeSlots.indexOf(appointment.time);
      if (index >= 0) slots[index].appointment = appointment;
    });
    return slots;
  }

  openModal(appointment: any) {
    this.selectedAppointment = appointment;
  }

  closeModal() {
    this.selectedAppointment = null;
  }

  cancelAppointment(appointment: any) {
    if (confirm(`Are you sure you want to cancel ${appointment.patient}'s appointment?`)) {
      const appointmentId = appointment.id;

      if (!appointmentId) {
        console.error('Appointment ID is missing');
        alert('Cannot cancel appointment: Missing ID');
        return;
      }

      this.http.put(`http://localhost:5000/api/rendezvous/cancel/${appointmentId}`, {}).subscribe(
        (response: any) => {
          console.log('Appointment canceled successfully:', response);
          this.closeModal();
          this.fetchAppointments();
        },
        (error) => {
          console.error('Error canceling appointment:', error);
          alert('Failed to cancel the appointment. Please try again.');
        }
      );
    }
  }

  // Edit Doctor Functionality
  openEditModal() {
    this.editedDoctor = { ...this.doctor };
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
  }

  saveDoctor() {
    if (!this.editedDoctor.name || !this.editedDoctor.email || !this.editedDoctor.phone) {
      alert('Name, email, and phone are required');
      return;
    }

    const [prenom, ...nomParts] = this.editedDoctor.name.split(' ');
    const nom = nomParts.join(' ');

    const userData = {
      nom: nom || '',
      prenom: prenom || '',
      email: this.editedDoctor.email,
      numero_de_telephone: this.editedDoctor.phone,
      adresse: this.editedDoctor.adresse || '',
      cin: this.editedDoctor.cin || ''
    };

    const doctorData = {
      specialite: this.editedDoctor.specialite || '',
      datedebut: this.editedDoctor.datedebut || '',
      datefin: this.editedDoctor.datefin || '',
      image_url: this.editedDoctor.image_url || '',
      rating: this.editedDoctor.rating || null
    };

    // Update User first
    this.http.put(`http://localhost:5000/api/user/${this.doctorId}`, userData).subscribe({
      next: (userResponse) => {
        console.log('User update response:', userResponse);
        // Then update Doctor
        this.http.put(`http://localhost:5000/api/doctor/${this.doctorId}`, doctorData).subscribe({
          next: (doctorResponse) => {
            console.log('Doctor update response:', doctorResponse);
            this.doctor = {
              ...this.doctor,
              name: this.editedDoctor.name,
              email: this.editedDoctor.email,
              phone: this.editedDoctor.phone,
              specialite: this.editedDoctor.specialite,
              datedebut: this.editedDoctor.datedebut,
              datefin: this.editedDoctor.datefin,
              image_url: this.editedDoctor.image_url,
              rating: this.editedDoctor.rating,
              adresse: this.editedDoctor.adresse,
              cin: this.editedDoctor.cin
            };
            console.log("Doctor updated successfully");
            this.closeEditModal();
            this.fetchDoctorData(); // Refresh to ensure UI matches backend
          },
          error: (doctorError) => {
            console.error('Error updating doctor:', doctorError);
            alert('Failed to update doctor details: ' + (doctorError.error?.message || 'Unknown error'));
          }
        });
      },
      error: (userError) => {
        console.error('Error updating user:', userError);
        alert('Failed to update user details: ' + (userError.error?.message || 'Unknown error'));
      }
    });
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

  getPatientAppointments(patientName: string): any[] {
    const appointments: any[] = [];
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
