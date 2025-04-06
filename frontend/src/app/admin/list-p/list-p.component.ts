import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-list-p',
  templateUrl: './list-p.component.html',
  styleUrls: ['./list-p.component.css']
})
export class ListPComponent implements OnInit {
  private apiUrl = 'http://localhost:3000/api/patient';
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
    this.http.get(this.apiUrl).subscribe(
      (data: any) => {
        this.patients = data;
      },
      (error) => {
        console.error('Error fetching patients:', error);
      }
    );
  }

  viewProfile(id: string) {
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
    this.editedPatient = { ...patient };
    this.showEditModal = true;
  }

  updatePatient() {
    this.http.put(`${this.apiUrl}/${this.editedPatient.id}`, this.editedPatient).subscribe(
      () => {
        this.loadPatients();
        this.showEditModal = false;
      },
      (error) => {
        console.error('Error updating patient:', error);
      }
    );
  }

  deletePatient(id: string) {
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
