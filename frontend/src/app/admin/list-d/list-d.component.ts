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
            ...doc.User,
            ...doc,
            nom: doc.User.nom,
            prenom: doc.User.prenom,
            email: doc.User.email,
            numero_de_telephone: doc.User.numero_de_telephone,
            adresse: doc.User.adresse,
            cin: doc.User.cin,
          }));

          this.approvedDoctors = allDoctors.filter((doc: any) => doc.status === 'APPROVED');
          this.pendingDoctors = allDoctors.filter((doc: any) => doc.status === 'PENDING');
        } else {
          console.error('Invalid doctor data format');
        }
      },
      (error) => {
        console.error('Erreur lors du chargement des médecins :', error);
      }
    );
  }

  viewProfile(userId: number): void {
    this.http.get<any>(`${this.apiUrl}/${userId}`).subscribe(
      (doctor) => {
        this.selectedDoctor = {
          ...doctor.User,
          ...doctor,
        };
        this.showProfileModal = true;
      },
      (error) => {
        console.error('Erreur lors de la récupération du médecin :', error);
      }
    );
  }

  openEditModal(doctor: any): void {
    this.editedDoctor = { ...doctor };
    this.showEditModal = true;
  }

  updateDoctor(): void {
    if (!this.editedDoctor.user_id) return;

    this.http.put(`${this.apiUrl}/${this.editedDoctor.user_id}`, this.editedDoctor).subscribe(
      () => {
        this.showEditModal = false;
        this.fetchDoctors();
      },
      (error) => {
        console.error('Erreur lors de la mise à jour du médecin :', error);
      }
    );
  }

  deleteDoctor(userId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce médecin ?')) {
      this.http.delete(`${this.apiUrl}/${userId}`).subscribe(
        () => {
          this.fetchDoctors();
        },
        (error) => {
          console.error('Erreur lors de la suppression du médecin :', error);
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
        console.error('Erreur lors de l\'approbation du médecin :', error);
      }
    );
  }

  rejectDoctor(userId: number): void {
    this.http.put(`${this.apiUrl}/validate/${userId}`, { status: 'REJECTED' }).subscribe(
      () => {
        this.fetchDoctors();
      },
      (error) => {
        console.error('Erreur lors du rejet du médecin :', error);
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
