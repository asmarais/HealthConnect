import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  userRole: string | null = null; // Stocker le rôle de l'utilisateur

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Récupérer le rôle de l'utilisateur connecté
    const userData = this.authService.getUserDataFromToken();
    if (userData) {
      this.userRole = userData.role; // Assigner le rôle
    }
  }

  // Vérifier si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  // Vérifier si l'utilisateur n'est PAS un docteur
  showMenuItems(): boolean {
    return this.userRole !== 'doctor'; // Retourne true si le rôle n'est pas 'doctor'
  }

  // Méthode pour déconnexion
  logout() {
    localStorage.removeItem('token'); // Supprimer le token du localStorage
    localStorage.removeItem('user'); // Supprimer les données utilisateur si elles sont stockées
    this.userRole = null; // Réinitialiser le rôle
    this.router.navigate(['/login']); // Rediriger vers la page de login
  }
}