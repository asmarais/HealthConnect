import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Doctor {
  user_id: number;
  specialite: string;
  datedebut: string;
  datefin: string;
  User: {
    nom: string;
    prenom: string;
  };
}

interface Appointment {
  id: number;
  date_debut: string;
  date_fin: string;
  medecin_id: number;
}

interface AvailabilitySlot {
  start: string;
  end: string;
  doctorId: number;
  doctorName: string;
  specialty: string;
  day: string;
}

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {
  doctors: Doctor[] = [];
  appointments: Appointment[] = [];
  availabilityByDay: { [key: string]: AvailabilitySlot[] } = {
    sun: [], mon: [], tue: [], wed: [], thu: [], fri: [], sat: []
  };
  days = [
    { id: 'sun', label: 'Sun', date: '2/6', fullDate: '2025-06-02' },
    { id: 'mon', label: 'Mon', date: '3/6', fullDate: '2025-06-03' },
    { id: 'tue', label: 'Tue', date: '4/6', fullDate: '2025-06-04' },
    { id: 'wed', label: 'Wed', date: '5/6', fullDate: '2025-06-05' },
    { id: 'thu', label: 'Thu', date: '6/6', fullDate: '2025-06-06' },
    { id: 'fri', label: 'Fri', date: '7/6', fullDate: '2025-06-07' },
    { id: 'sat', label: 'Sat', date: '8/6', fullDate: '2025-06-08' }
  ];
  patient: {usert_id:string; name: string; email: any; phone: any; profilePic: any; } | undefined;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadDoctors();
  }

  loadDoctors() {
    this.http.get<{ doctors: Doctor[] }>('http://localhost:5000/api/doctor')
      .subscribe({
        next: (response) => {
          this.doctors = response.doctors;
          this.loadAppointments();
        },
        error: (error) => console.error('Erreur chargement docteurs', error)
      });
  }

  loadAppointments() {
    this.http.get<Appointment[]>('http://localhost:5000/api/rendezvous')
      .subscribe({
        next: (response) => {
          // Ajuster les dates des rendez-vous pour correspondre à juin 2025 (pour l'exemple)
          this.appointments = response.map(app => {
            const originalStart = new Date(app.date_debut);
            const originalEnd = new Date(app.date_fin);
            // On remplace la date par une date en juin (par exemple, 6 juin pour correspondre à "Thu")
            const newStart = new Date(`2025-06-06T${originalStart.toISOString().slice(11, 19)}Z`);
            const newEnd = new Date(`2025-06-06T${originalEnd.toISOString().slice(11, 19)}Z`);
            return {
              ...app,
              date_debut: newStart.toISOString(),
              date_fin: newEnd.toISOString()
            };
          });
          this.calculateAvailability();
        },
        error: (error) => console.error('Erreur chargement RDV', error)
      });
  }

  calculateAvailability() {
    this.availabilityByDay = { sun: [], mon: [], tue: [], wed: [], thu: [], fri: [], sat: [] };

    this.doctors.forEach(doctor => {
      const startTime = doctor.datedebut.split(':');
      const endTime = doctor.datefin.split(':');

      this.days.forEach(day => {
        const date = new Date(day.fullDate);
        let currentTime = new Date(date);
        currentTime.setHours(parseInt(startTime[0]), parseInt(startTime[1]), 0, 0);
        const endDateTime = new Date(date);
        endDateTime.setHours(parseInt(endTime[0]), parseInt(endTime[1]), 0, 0);

        const doctorAppointments = this.appointments
          .filter(app => 
            app.medecin_id === doctor.user_id &&
            new Date(app.date_debut).toDateString() === date.toDateString()
          )
          .sort((a, b) => new Date(a.date_debut).getTime() - new Date(b.date_debut).getTime());

        let lastEndTime = currentTime;

        if (doctorAppointments.length === 0) {
          this.availabilityByDay[day.id].push({
            start: currentTime.toTimeString().slice(0, 5),
            end: endDateTime.toTimeString().slice(0, 5),
            doctorId: doctor.user_id,
            doctorName: `${doctor.User.prenom} ${doctor.User.nom}`,
            specialty: doctor.specialite,
            day: day.id
          });
        } else {
          doctorAppointments.forEach((app, idx) => {
            const appStart = new Date(app.date_debut);
            const appEnd = new Date(app.date_fin);

            // Ajouter la disponibilité avant le rendez-vous
            if (lastEndTime < appStart) {
              this.availabilityByDay[day.id].push({
                start: lastEndTime.toTimeString().slice(0, 5),
                end: appStart.toTimeString().slice(0, 5),
                doctorId: doctor.user_id,
                doctorName: `${doctor.User.prenom} ${doctor.User.nom}`,
                specialty: doctor.specialite,
                day: day.id
              });
            }

            lastEndTime = appEnd;

            // Ajouter la disponibilité après le dernier rendez-vous
            if (idx === doctorAppointments.length - 1 && appEnd < endDateTime) {
              this.availabilityByDay[day.id].push({
                start: appEnd.toTimeString().slice(0, 5),
                end: endDateTime.toTimeString().slice(0, 5),
                doctorId: doctor.user_id,
                doctorName: `${doctor.User.prenom} ${doctor.User.nom}`,
                specialty: doctor.specialite,
                day: day.id
              });
            }
          });
        }
      });
    });
  }

  bookAppointment(slot: AvailabilitySlot) {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
  
      this.patient = {
        usert_id : user.user_id,
        name: `${user.nom} ${user.prenom}`,
        email: user.email,
        phone: user.numero_de_telephone,
        profilePic:user.profilePic,
      };
    } else {
      console.warn('No patient data found in localStorage.');
    }
    const appointmentData = {
      
      patient_id: this.patient?.usert_id,
      medecin_id: slot.doctorId,
      date_debut: `2025-06-${slot.day === 'sun' ? '02' : '0' + (this.days.findIndex(d => d.id === slot.day) + 2)}T${slot.start}:00Z`,
      date_fin: `2025-06-${slot.day === 'sun' ? '02' : '0' + (this.days.findIndex(d => d.id === slot.day) + 2)}T${slot.end}:00Z`,
      statut: 'CONFIRMED'
    };

    this.http.post('http://localhost:5000/api/rendezvous', appointmentData)
      .subscribe({
        next: () => {
          this.loadAppointments();
        },
        error: (error) => console.error('Erreur création RDV', error)
      });
  }
}