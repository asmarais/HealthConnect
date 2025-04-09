import { Component, OnInit } from '@angular/core';
import { UserServiceService } from '../services/user-service.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private apiUrl = 'http://localhost:5000/api/doctor'; // URL de l'API pour les docteurs

  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private userService: UserServiceService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Vérifier si l'utilisateur est déjà connecté
    if (this.authService.isLoggedIn()) {
      const userData = this.authService.getUserDataFromToken();
      if (userData) {
        const role = userData.role;
        if (role === 'admin') {
          this.router.navigate(['/admin']);
        } else if (role === 'doctor') {
          this.router.navigate(['/profilD']);
        } else if (role === 'patient') {
          this.router.navigate(['/profilP']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      }
    }
  }

  onLogin(): void {
    const credentials = {
      email: this.email,
      mot_de_passe: this.password
    };
    console.log(this.email, this.password);
    this.userService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login successful:', response);

        if (response.token && response.user) {
          // Vérifier si l'utilisateur est un docteur
          if (response.user.role === 'doctor') {
            // Récupérer les données du docteur pour vérifier le statut
            this.http.get<any>(`${this.apiUrl}/${response.user.user_id}`).subscribe(
              (doctorResponse) => {
                if (doctorResponse.doctor) {
                  const doctor = doctorResponse.doctor;
                  // Vérifier le statut
                  if (doctor.status !== 'APPROVED') {
                    this.errorMessage = "Tu n'es pas encore approuvé";
                    return;
                  }
                  // Si APPROVED, continuer
                  this.proceedWithLogin(response);
                } else {
                  this.errorMessage = 'Erreur lors de la récupération des données du docteur';
                }
              },
              (error) => {
                console.error('Erreur lors de la récupération des données du docteur :', error);
                this.errorMessage = 'Erreur lors de la vérification du statut';
              }
            );
          } else {
            // Si ce n'est pas un docteur, continuer directement
            this.proceedWithLogin(response);
          }
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        if (error.error.message === 'User not found') {
          this.errorMessage = 'Email or password incorrect';
        } else {
          this.errorMessage = error.error.message || 'Login failed';
        }
      }
    });
  }

  private proceedWithLogin(response: any): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));

    // Redirection selon le rôle
    if (response.user.role === 'admin') {
      this.router.navigate(['/admin']);
    } else if (response.user.role === 'doctor') {
      this.router.navigate(['/profilD']);
    } else if (response.user.role === 'patient') {
      this.router.navigate(['/profilP']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  loginWithGoogle() {
    window.location.href = 'http://localhost:5000/api/auth/google';
  }
}