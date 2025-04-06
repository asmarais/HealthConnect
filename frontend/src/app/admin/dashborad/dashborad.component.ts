// dashborad.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-dashborad',
  templateUrl: './dashborad.component.html',
  styleUrls: ['./dashborad.component.css']
})
export class DashboradComponent implements OnInit {
  private apiUrl = {
    doctors: 'http://localhost:5000/api/doctor',
    patients: 'http://localhost:5000/api/patient',
    appointments: 'http://localhost:5000/api/rendezvous'
  };

  totalAppointments: number = 0;
  totalPatients: number = 0;
  totalDoctors: number = 0;
  doctors: any[] = [];

  constructor(private http: HttpClient) {
    Chart.register(...registerables); // Register Chart.js components
  }

  ngOnInit(): void {
    this.loadDashboardData();
    this.initializeCharts();
  }

  loadDashboardData(): void {
    // Get total doctors
    this.http.get<any>(this.apiUrl.doctors).subscribe(
      (response) => {
        this.totalDoctors = response.doctors.filter((doc: any) => doc.status === 'APPROVED').length;
        this.doctors = response.doctors.filter((doc: any) => doc.status === 'APPROVED');
        this.updateDoctorSelect();
      },
      (error) => console.error('Error fetching doctors:', error)
    );

    // Get total patients
    this.http.get<any>(this.apiUrl.patients).subscribe(
      (response) => {
        this.totalPatients = response.length;
      },
      (error) => console.error('Error fetching patients:', error)
    );

    // Get total appointments
    this.http.get<any>(this.apiUrl.appointments).subscribe(
      (response) => {
        this.totalAppointments = response.length;
        this.updateAppointmentsChart(response);
      },
      (error) => console.error('Error fetching appointments:', error)
    );
  }

  updateDoctorSelect(): void {
    const select = document.getElementById('doctorSelect') as HTMLSelectElement;
    select.innerHTML = '<option value="">Sélectionner un médecin</option>';
    this.doctors.forEach(doctor => {
      const option = document.createElement('option');
      option.value = doctor.user_id;
      option.text = `${doctor.User.prenom} ${doctor.User.nom}`;
      select.appendChild(option);
    });

    select.addEventListener('change', (event) => {
      const doctorId = (event.target as HTMLSelectElement).value;
      this.updateHoursChart(doctorId);
    });
  }

  initializeCharts(): void {
    // Initialize empty hours chart
    new Chart('hoursChart', {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Heures de travail',
          data: [],
          backgroundColor: '#42A5F5'
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    // Initialize empty appointments variation chart
    new Chart('appointmentsVariationChart', {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Rendez-vous par jour',
          data: [],
          borderColor: '#66BB6A',
          fill: false
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  updateHoursChart(doctorId: string): void {
    if (!doctorId) return;

    this.http.get<any>(this.apiUrl.appointments).subscribe(
      (appointments) => {
        const doctorAppointments = appointments.filter((appt: any) => appt.doctor_id === parseInt(doctorId));
        const hoursByDate = doctorAppointments.reduce((acc: any, appt: any) => {
          const date = new Date(appt.date).toLocaleDateString();
          acc[date] = (acc[date] || 0) + 1; // Assuming 1 hour per appointment
          return acc;
        }, {});

        const chart = Chart.getChart('hoursChart');
        if (chart) {
          chart.data.labels = Object.keys(hoursByDate);
          chart.data.datasets[0].data = Object.values(hoursByDate);
          chart.update();
        }
      }
    );
  }

  updateAppointmentsChart(appointments: any[]): void {
    const appointmentsByDate = appointments.reduce((acc: any, appt: any) => {
      const date = new Date(appt.date).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const chart = Chart.getChart('appointmentsVariationChart');
    if (chart) {
      chart.data.labels = Object.keys(appointmentsByDate);
      chart.data.datasets[0].data = Object.values(appointmentsByDate);
      chart.update();
    }
  }
}
