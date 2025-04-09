// doctors.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
  doctors: Doctor[] = [];
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

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchDoctors();
  }

  fetchDoctors() {
    let url = 'http://localhost:5000/api/doctor/doc/approved';
    let params: any = {};

    // Use department name as specialite if selected, otherwise use specialty
    if (this.selectedDepartment) {
      params.specialite = this.departments.find(d => d.id === this.selectedDepartment)?.name;
    } else if (this.selectedSpecialty) {
      params.specialite = this.selectedSpecialty;
    }

    this.http.get<{ doctors: Doctor[] }>(url, { params })
      .subscribe({
        next: (response) => {
          this.doctors = response.doctors;
        },
        error: (error) => {
          console.error('Error fetching doctors:', error);
        }
      });
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