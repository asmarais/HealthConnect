import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

interface Doctor {
  user_id: number;
  specialite: string;
  User: {
    nom: string;
    prenom: string;
  };
}

@Component({
  selector: 'app-appo',
  templateUrl: './appo.component.html',
  styleUrls: ['./appo.component.css']
})
export class AppoComponent implements OnInit {
  appointmentForm: FormGroup;
  specialists: Doctor[] = [];
  userid: number | null = null;
  constructor(private fb: FormBuilder, private http: HttpClient,private authService: AuthService) {
    this.appointmentForm = this.fb.group({
      patientName: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      medecinId: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      patientNote: ['']
    });
  }

  ngOnInit() {
    const userData = this.authService.getUserDataFromToken();
    console.log('User data:', userData);
    this.userid=userData.userId;
    this.loadDoctors();
  }
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
  loadDoctors() {
    this.http.get<{ doctors: Doctor[] }>('http://localhost:5000/api/doctor')
      .subscribe({
        next: (response) => {
          this.specialists = response.doctors;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des docteurs', error);
        }
      });
  }

  onSubmit() {
    if (this.appointmentForm.valid) {
      const formValue = this.appointmentForm.value;

      const appointmentData = {
        patient_id: this.userid, // À modifier selon votre système d'authentification
        medecin_id: parseInt(formValue.medecinId),
        date_debut: new Date(formValue.appointmentDate).toISOString(),
        date_fin: new Date(new Date(formValue.appointmentDate).getTime() + 30*60000).toISOString(),
        statut: 'CONFIRMED'
      };

      this.http.post('http://localhost:5000/api/rendezvous', appointmentData)
        .subscribe({
          next: (response) => {
            console.log('Rendez-vous créé avec succès', response);
            this.appointmentForm.reset();
          },
          error: (error) => {
            console.error('Erreur lors de la création du rendez-vous', error);
          }
        });
    }
  }
}
