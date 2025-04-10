// list-p.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-list-p',
  templateUrl: './list-p.component.html',
  styleUrls: ['./list-p.component.css']
})
export class ListPComponent implements OnInit {
  private apiUrl = 'http://localhost:5000/api/patient';
  private userApiUrl = 'http://localhost:5000/api/user';

  patients: any[] = [];
  selectedPatient: any = null;
  editedPatient: any = null;

  showProfileModal = false;
  showEditModal = false;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients() {
    this.http.get<any>(`${this.apiUrl}/`).subscribe(
      (response) => {
        if (Array.isArray(response)) {
          this.patients = response.map((patient: any) => ({
            ...patient,
            User: patient.User
          }));
        }
      },
      (error) => {
        console.error('Error fetching patients:', error);
      }
    );
  }

  viewProfile(id: number) {
    this.http.get<any>(`${this.apiUrl}/${id}`).subscribe(
      (response) => {
        this.selectedPatient = {
          ...response,
          User: response.User
        };
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
      User: { ...patient.User },
      numero_securite_sociale: patient.numero_securite_sociale,
      allergies: patient.allergies,
      score: patient.score,
      raison: patient.raison
    };
    this.showEditModal = true;
  }

  updatePatient() {
    if (!this.editedPatient?.user_id) return;

    const userData = {
      nom: this.editedPatient.User.nom,
      prenom: this.editedPatient.User.prenom,
      email: this.editedPatient.User.email,
      numero_de_telephone: this.editedPatient.User.numero_de_telephone,
      adresse: this.editedPatient.User.adresse,
      cin: this.editedPatient.User.cin
    };

    const patientData = {
      numero_securite_sociale: this.editedPatient.numero_securite_sociale,
      allergies: this.editedPatient.allergies,
      score: this.editedPatient.score,
      raison: this.editedPatient.raison
    };

    this.http.put(`${this.userApiUrl}/${this.editedPatient.user_id}`, userData).subscribe(
      () => {
        this.http.put(`${this.apiUrl}/${this.editedPatient.user_id}`, patientData).subscribe(
          () => {
            this.showEditModal = false;
            this.loadPatients();
          },
          (error) => {
            console.error('Error updating patient data:', error);
          }
        );
      },
      (error) => {
        console.error('Error updating user data:', error);
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
    this.selectedPatient = null;
    this.editedPatient = null;
  }
}
