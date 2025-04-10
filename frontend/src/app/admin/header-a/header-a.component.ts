import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-header-a',
  templateUrl: './header-a.component.html',
  styleUrls: ['./header-a.component.css']
})
export class HeaderAComponent {
  showDropdown = false;

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }
  userRole: string | null = null; // Stocker le rôle de l'utilisateur

  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userRole = null;
    this.router.navigate(['/login']);
  }
}
