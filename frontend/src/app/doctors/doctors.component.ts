import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

interface Doctor {
  user_id: number;
  specialite: string;
  status: string;
  datedebut: string;
  datefin: string;
  image_url: string;
  User: {
    user_id: number;
    nom: string;
    prenom: string;
    email: string;
    numero_de_telephone: string;
    adresse: string;
    date_de_creation: string;
    role: string;
    cin: string;
  }
}

interface Department {
  id: string;
  name: string;
}

@Component({
  selector: 'app-doctors',
  templateUrl: './doctors.component.html',
  styleUrls: ['./doctors.component.css']
})
export class DoctorsComponent implements OnInit {
  doctor: Doctor | null = null;
  doctors: Doctor[] = []; // All fetched doctors
  filteredDoctors: Doctor[] = []; // Filtered doctors for display
  selectedSpecialty: string = '';
  selectedDepartment: string = '';
  departments: Department[] = [
    { id: '1', name: 'Rehabilitation Center' },
    { id: '2', name: 'Latest Equipments' },
    { id: '3', name: 'Medical Counseling' },
    { id: '4', name: 'Emergency Services' },
    { id: '5', name: 'Dental Implant' },
    { id: '6', name: 'Cardiology' },
    { id: '7', name: 'Neurology' },
    { id: '8', name: 'Medicine' },
    { id: '9', name: 'Pediatric' },
    { id: '10', name: 'Gastrology' },
    { id: '11', name: 'Laboratory Tests' },
    { id: '12', name: 'Mediclinic' }
  ];

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit() {
    const doctorId = this.route.snapshot.paramMap.get('id');
    if (doctorId) {
      this.fetchDoctorDetails(doctorId);
    }
    this.fetchDoctors();
  }

  fetchDoctorDetails(id: string): void {
    const url = `http://localhost:5000/api/doctor/${id}`;
    this.http.get<{ doctor: Doctor }>(url).subscribe({
      next: (response) => {
        this.doctor = response.doctor;
      },
      error: (error) => {
        console.error('Error fetching doctor details:', error);
      }
    });
  }

  fetchDoctors() {
    let url = 'http://localhost:5000/api/doctor/doc/approved';
    let params: any = {};

    if (this.selectedDepartment) {
      params.specialite = this.departments.find(d => d.id === this.selectedDepartment)?.name;
    } else if (this.selectedSpecialty) {
      params.specialite = this.selectedSpecialty;
    }

    this.http.get<{ doctors: Doctor[] }>(url, { params })
      .subscribe({
        next: (response) => {
          this.doctors = response.doctors;
          this.updateFilteredDoctors(); // Update filtered list after fetching
        },
        error: (error) => {
          console.error('Error fetching doctors:', error);
          this.doctors = [];
          this.filteredDoctors = [];
        }
      });
  }

  updateFilteredDoctors() {
    let filterValue = '';
    if (this.selectedDepartment) {
      filterValue = this.departments.find(d => d.id === this.selectedDepartment)?.name || '';
    } else if (this.selectedSpecialty) {
      filterValue = this.selectedSpecialty;
    }

    if (filterValue) {
      this.filteredDoctors = this.doctors.filter(doctor => doctor.specialite === filterValue);
    } else {
      this.filteredDoctors = [...this.doctors]; // Show all doctors if no filter selected
    }
  }

  onSubmit() {
    this.fetchDoctors();
  }

  resetFilters() {
    this.selectedSpecialty = '';
    this.selectedDepartment = '';
    this.fetchDoctors();
  }
}