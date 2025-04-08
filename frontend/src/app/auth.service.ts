import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  getUserDataFromToken(): any {
    let token = localStorage.getItem('token');
    if (token) {
      try {
        let data = JSON.parse(window.atob(token.split('.')[1]));
        return data;
      } catch (error) {
        console.error('Error parsing token:', error);
        return null;
      }
    }
    return null;
  }

  isLoggedIn(): boolean {
    let token = localStorage.getItem('token');
    if (token) {
      return true;
    } else {
      return false;
    }
  }
}
