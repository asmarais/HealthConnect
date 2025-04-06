import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-list-p',
  templateUrl: './list-p.component.html',
  styleUrls: ['./list-p.component.css']
})
export class ListPComponent implements OnInit {
  private apiUrl = 'http://localhost:5000/api/patient';
  patients: any[] = [];
  selectedPatient: any = null;
  showProfileModal = false;
  showEditModal = false;
  editedPatient: any = {};

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients() {
    this.http.get(`${this.apiUrl}/`).subscribe(
      (data: any) => {
        this.patients = data;
        console.log(this.patients);
      },
      (error) => {
        console.error('Error fetching patients:', error);
      }
    );
  }

  viewProfile(id: number) {
    this.http.get(`${this.apiUrl}/${id}`).subscribe(
      (data: any) => {
        this.selectedPatient = data;
        this.showProfileModal = true;
      },
      (error) => {
        console.error('Error fetching patient:', error);
      }
    );
  }

  openEditModal(patient: any) {
    this.editedPatient = {
      user_id: patient.user_id,
      numero_securite_sociale: patient.numero_securite_sociale,
      allergies: patient.allergies,
      nom: patient.User.nom,
      prenom: patient.User.prenom,
      email: patient.User.email,
      numero_de_telephone: patient.User.numero_de_telephone,
      adresse: patient.User.adresse,
      cin: patient.User.cin,
    };
    this.showEditModal = true;
  }

  updatePatient() {
    const payload = {
      numero_securite_sociale: this.editedPatient.numero_securite_sociale,
      allergies: this.editedPatient.allergies,
      User: {
        nom: this.editedPatient.nom,
        prenom: this.editedPatient.prenom,
        email: this.editedPatient.email,
        numero_de_telephone: this.editedPatient.numero_de_telephone,
        adresse: this.editedPatient.adresse,
        cin: this.editedPatient.cin,
      }
    };

    this.http.put(`${this.apiUrl}/${this.editedPatient.user_id}`, payload).subscribe(
      () => {
        this.loadPatients();
        this.showEditModal = false;
      },
      (error) => {
        console.error('Error updating patient:', error);
      }
    );
  }

  deletePatient(id: number) {
    if (confirm('Are you sure you want to delete this patient?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe(
        () => {
          this.loadPatients();
        },
        (error) => {
          console.error('Error deleting patient:', error);
        }
      );
    }
  }

  closeModal() {
    this.showProfileModal = false;
    this.showEditModal = false;
  }
}
