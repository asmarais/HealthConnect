import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Doctor {
  user_id: number;
  specialite: string;
  status: string;
  datedebut: string;
  datefin: string;
  image_url: string;
  rating: string | null;
  joined_at: string | null;
  User: {
    user_id: number;
    nom: string;
    prenom: string;
    email: string;
    mot_de_passe: string;
    numero_de_telephone: string;
    adresse: string;
    date_de_creation: string;
    role: string;
    cin: string;
    genre: string | null;
  };
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  doctors: Doctor[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getDoctors();
  }

  getDoctors() {
    this.http.get<{doctors: Doctor[]}>('http://localhost:5000/api/doctor/')
      .subscribe({
        next: (response) => {
          this.doctors = response.doctors;
        },
        error: (error) => {
          console.error('Error fetching doctors:', error);
        }
      });
  }

}