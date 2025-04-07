import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserServiceService } from '../services/user-service.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  formData = {
    nom: '',
    prenom: '',
    email: '',
    mot_de_passe: '',
    numero_de_telephone: '',
    adresse: '',
    cin: ''
  };

  constructor(private userService: UserServiceService, private router: Router) {}

  onRegister() {
    this.userService.signup(this.formData).subscribe({
      next: (response) => {
        console.log('✅ Registration successful:', response);
        alert('Registration successful!');
        this.router.navigate(['/profilP']); // redirect to login page after success
      },
      error: (error) => {
        console.error('❌ Registration error:', error);
        alert('Registration failed. Please try again.');
      }
    });
  }
  signupWithGoogle() {
    window.location.href = 'http://localhost:5000/api/auth/google';
  }
}
