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
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.loadDashboardData();
    this.initializeCharts();
  }

  // Fonction pour obtenir les 7 derniers jours
  getLast7Days(): string[] {
    const dates = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toLocaleDateString());
    }
    return dates;
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

    // Initialize appointments variation chart with last 7 days
    const last7Days = this.getLast7Days();
    new Chart('appointmentsVariationChart', {
      type: 'line',
      data: {
        labels: last7Days,
        datasets: [{
          label: 'Rendez-vous par jour',
          data: Array(7).fill(0), // Initialiser avec 0 pour chaque jour
          borderColor: '#66BB6A',
          fill: false
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Nombre de rendez-vous'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        }
      }
    });
  }

  updateHoursChart(doctorId: string): void {
    if (!doctorId) return;

    this.http.get<any>(this.apiUrl.appointments).subscribe(
      (appointments) => {
        const doctorAppointments = appointments.filter((appt: any) => appt.medecin_id === parseInt(doctorId));
        const hoursByDate = doctorAppointments.reduce((acc: any, appt: any) => {
          const date = new Date(appt.date_debut).toLocaleDateString();
          acc[date] = (acc[date] || 0) + 1;
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
    const last7Days = this.getLast7Days();
    const appointmentsByDate = appointments.reduce((acc: any, appt: any) => {
      const date = new Date(appt.date_debut).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Préparer les données pour les 7 derniers jours
    const chartData = last7Days.map(date => appointmentsByDate[date] || 0);

    const chart = Chart.getChart('appointmentsVariationChart');
    if (chart) {
      chart.data.labels = last7Days;
      chart.data.datasets[0].data = chartData;
      chart.update();
    }
  }
}
