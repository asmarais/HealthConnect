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
    const userData = this.authService.getUserDataFromToken();
    if (userData) {
      this.userRole = userData.role;
    }
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  showMenuItems(): boolean {
    return this.userRole !== 'doctor';
  }
  getProfileRoute(): string {
    if (this.userRole === 'doctor') {
      return '/profilD';
    } else if (this.userRole === 'user') {
      return '/profilP';
    } else {
      return '/login'; 
    }
  }
  // Méthode pour déconnexion
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userRole = null;
    this.router.navigate(['/login']);
  }
}
