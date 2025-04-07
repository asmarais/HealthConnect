import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define the expected response structure
interface ApiResponse {
  message: string;
}

// Define the expected error structure
interface ApiError {
  message: string;
}


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private apiUrl = 'http://localhost:5000/api'; // URL de l'API
  

  isDoctor: boolean = false;

  formData = {
    nom: '',
    prenom: '',
    email: '',
    mot_de_passe: '',
    numero_de_telephone: '',
    adresse: '',
    cin: '',
    numero_securite_sociale: '',
    allergies: '',
    specialite: '',
    datedebut: '',
    datefin: '',
    image_url: ''
  };

  constructor(private http: HttpClient, private router: Router) {}
  

  // Méthode pour enregistrer un patient
  registerPatient(patientData: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/patient`, patientData);
  }

  // Méthode pour enregistrer un docteur
  registerDoctor(doctorData: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/doctor/register`, doctorData);
  }

  onRegister() {
    if (this.isDoctor) {
      // Inscription d'un docteur
      const doctorData = {
        nom: this.formData.nom,
        prenom: this.formData.prenom,
        email: this.formData.email,
        mot_de_passe: this.formData.mot_de_passe,
        numero_de_telephone: this.formData.numero_de_telephone,
        adresse: this.formData.adresse,
        cin: this.formData.cin,
        specialite: this.formData.specialite,
        datedebut: this.formData.datedebut,
        datefin: this.formData.datefin,
        image_url: this.formData.image_url || 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.future-doctor.de%2Fen%2Fwhy-become-a-doctor%2F&psig=AOvVaw3j4kJAk5HGf1qHS15-WCnu&ust=1743869708012000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCLiC5YXjvowDFQAAAAAdAAAAABAE'
      };

      this.registerDoctor(doctorData).subscribe({
        next: (response: ApiResponse) => {
          console.log('✅ Doctor registration successful:', response);
          alert('Doctor registration successful!');
          this.router.navigate(['/profilP']);
        },
        error: (error: ApiError) => {
          console.error('❌ Doctor registration error:', error);
          alert('Doctor registration failed. Please try again.');
        }
      });
    } else {
      // Inscription d'un patient
      const patientData = {
        nom: this.formData.nom,
        prenom: this.formData.prenom,
        email: this.formData.email,
        mot_de_passe: this.formData.mot_de_passe,
        numero_de_telephone: this.formData.numero_de_telephone,
        adresse: this.formData.adresse,
        cin: this.formData.cin,
        numero_securite_sociale: this.formData.numero_securite_sociale,
        allergies: this.formData.allergies
      };

      this.registerPatient(patientData).subscribe({
        next: (response: ApiResponse) => {
          console.log('✅ Patient registration successful:', response);
          alert('Patient registration successful!');
          this.router.navigate(['/profilP']);
        },
        error: (error: ApiError) => {
          console.error('❌ Patient registration error:', error);
          alert('Patient registration failed. Please try again.');
        }
      });
    }
  }

  signupWithGoogle() {
    window.location.href = 'http://localhost:5000/api/auth/google';
  }
}