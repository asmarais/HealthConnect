// list-d.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-list-d',
  templateUrl: './list-d.component.html',
  styleUrls: ['./list-d.component.css']
})
export class ListDComponent implements OnInit {
  private apiUrl = 'http://localhost:5000/api/doctor';
  private userApiUrl = 'http://localhost:5000/api/user'; // Added user API endpoint

  approvedDoctors: any[] = [];
  pendingDoctors: any[] = [];

  selectedDoctor: any = null;
  editedDoctor: any = null;

  showProfileModal = false;
  showEditModal = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchDoctors();
  }

  fetchDoctors(): void {
    this.http.get<any>(`${this.apiUrl}/`).subscribe(
      (response) => {
        if (Array.isArray(response.doctors)) {
          const allDoctors = response.doctors.map((doc: any) => ({
            ...doc,
            User: {
              ...doc.User,
              nom: doc.User.nom,
              prenom: doc.User.prenom,
              email: doc.User.email,
              numero_de_telephone: doc.User.numero_de_telephone,
              adresse: doc.User.adresse,
              cin: doc.User.cin
            }
          }));

          this.approvedDoctors = allDoctors.filter((doc: any) => doc.status === 'APPROVED');
          this.pendingDoctors = allDoctors.filter((doc: any) => doc.status === 'PENDING');
        } else {
          console.error('Invalid doctor data format');
        }
      },
      (error) => {
        console.error('Error fetching doctors:', error);
      }
    );
  }

  viewProfile(userId: number): void {
    this.http.get<any>(`${this.apiUrl}/${userId}`).subscribe(
      (response) => {
        this.selectedDoctor = {
          ...response.doctor,
          User: response.doctor.User
        };
        this.showProfileModal = true;
      },
      (error) => {
        console.error('Error fetching doctor profile:', error);
      }
    );
  }

  openEditModal(doctor: any): void {
    this.editedDoctor = {
      user_id: doctor.user_id,
      User: { ...doctor.User },
      specialite: doctor.specialite,
      datedebut: doctor.datedebut,
      datefin: doctor.datefin,
      image_url: doctor.image_url,
      status: doctor.status
    };
    this.showEditModal = true;
  }

  updateDoctor(): void {
    if (!this.editedDoctor?.user_id) return;

    // Separate User and Doctor data
    const userData = {
      nom: this.editedDoctor.User.nom,
      prenom: this.editedDoctor.User.prenom,
      email: this.editedDoctor.User.email,
      numero_de_telephone: this.editedDoctor.User.numero_de_telephone,
      adresse: this.editedDoctor.User.adresse,
      cin: this.editedDoctor.User.cin
    };

    const doctorData = {
      specialite: this.editedDoctor.specialite,
      datedebut: this.editedDoctor.datedebut,
      datefin: this.editedDoctor.datefin,
      image_url: this.editedDoctor.image_url,
      status: this.editedDoctor.status
    };

    // Update User data
    this.http.put(`${this.userApiUrl}/${this.editedDoctor.user_id}`, userData).subscribe(
      () => {
        // Update Doctor data
        this.http.put(`${this.apiUrl}/${this.editedDoctor.user_id}`, doctorData).subscribe(
          () => {
            this.showEditModal = false;
            this.fetchDoctors();
          },
          (error) => {
            console.error('Error updating doctor data:', error);
          }
        );
      },
      (error) => {
        console.error('Error updating user data:', error);
      }
    );
  }

  deleteDoctor(userId: number): void {
    if (confirm('Are you sure you want to delete this doctor?')) {
      this.http.delete(`${this.apiUrl}/${userId}`).subscribe(
        () => {
          this.fetchDoctors();
        },
        (error) => {
          console.error('Error deleting doctor:', error);
        }
      );
    }
  }

  acceptDoctor(userId: number): void {
    this.http.put(`${this.apiUrl}/validate/${userId}`, { status: 'APPROVED' }).subscribe(
      () => {
        this.fetchDoctors();
      },
      (error) => {
        console.error('Error approving doctor:', error);
      }
    );
  }

  rejectDoctor(userId: number): void {
    this.http.put(`${this.apiUrl}/validate/${userId}`, { status: 'REJECTED' }).subscribe(
      () => {
        this.fetchDoctors();
      },
      (error) => {
        console.error('Error rejecting doctor:', error);
      }
    );
  }

  closeModal(): void {
    this.showProfileModal = false;
    this.showEditModal = false;
    this.selectedDoctor = null;
    this.editedDoctor = null;
  }
}
