import { Component } from '@angular/core';
import { UserServiceService } from '../services/user-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private userService: UserServiceService, private router: Router) { }

  onLogin(): void {
    const credentials = {
      email: this.email,
      mot_de_passe: this.password
    };
  console.log(this.email,this.password)
  this.userService.login(credentials).subscribe({
    next: (response) => {
      console.log('Login successful:', response);
  
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user)); // Save full user object
  
        // Redirect based on user role
        if (response.user.role === 'patient') {
          this.router.navigate(['/profilP']);
        } else if (response.user.role === 'doctor') {
          this.router.navigate(['/profilD']);
        } else {
          this.router.navigate(['/dashboard']); // Fallback
        }
      }
    },
    error: (error) => {
      console.error('Login error:', error);
      this.errorMessage = error.error.message || 'Login failed';
    }
  });
  
  }
  loginWithGoogle() {
  window.location.href = 'http://localhost:5000/api/auth/google';
}

}
