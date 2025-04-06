import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-list-d',
  templateUrl: './list-d.component.html',
  styleUrls: ['./list-d.component.css']
})
export class ListDComponent implements OnInit {
  private apiUrl = 'http://localhost:5000/api/doctor';
  approvedDoctors: any[] = [];
  pendingDoctors: any[] = [];
  selectedDoctor: any = null;
  showProfileModal = false;
  showEditModal = false;
  editedDoctor: any = {};

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadApprovedDoctors();
    this.loadPendingDoctors();
  }

  loadApprovedDoctors() {
    this.http.get(`${this.apiUrl}`).subscribe(
      (data: any) => {
        this.approvedDoctors = data;
      },
      (error) => {
        console.error('Error fetching approved doctors:', error);
      }
    );
  }

  loadPendingDoctors() {
    this.http.get(`${this.apiUrl}/pending`).subscribe(
      (data: any) => {
        this.pendingDoctors = data;
      },
      (error) => {
        console.error('Error fetching pending doctors:', error);
      }
    );
  }

  viewProfile(id: string) {
    this.http.get(`${this.apiUrl}/${id}`).subscribe(
      (data: any) => {
        this.selectedDoctor = data;
        this.showProfileModal = true;
      },
      (error) => {
        console.error('Error fetching doctor:', error);
      }
    );
  }

  openEditModal(doctor: any) {
    this.editedDoctor = { ...doctor };
    this.showEditModal = true;
  }

  updateDoctor() {
    this.http.put(`${this.apiUrl}/${this.editedDoctor.id}`, this.editedDoctor).subscribe(
      () => {
        this.loadApprovedDoctors();
        this.loadPendingDoctors();
        this.showEditModal = false;
      },
      (error) => {
        console.error('Error updating doctor:', error);
      }
    );
  }

  deleteDoctor(id: string) {
    if (confirm('Are you sure you want to delete this doctor?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe(
        () => {
          this.loadApprovedDoctors();
          this.loadPendingDoctors();
        },
        (error) => {
          console.error('Error deleting doctor:', error);
        }
      );
    }
  }

  acceptDoctor(id: string) {
    this.http.put(`${this.apiUrl}/validate/${id}`, { status: 'APPROVED' }).subscribe(
      () => {
        this.loadPendingDoctors();
        this.loadApprovedDoctors();
      },
      (error) => {
        console.error('Error accepting doctor:', error);
      }
    );
  }

  rejectDoctor(id: string) {
    this.http.put(`${this.apiUrl}/validate/${id}`, { status: 'REJECTED' }).subscribe(
      () => {
        this.loadPendingDoctors();
        this.loadApprovedDoctors();
      },
      (error) => {
        console.error('Error rejecting doctor:', error);
      }
    );
  }

  closeModal() {
    this.showProfileModal = false;
    this.showEditModal = false;
  }
}
