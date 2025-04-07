import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {

  private baseUrl = 'http://localhost:5000/api'; // Adjust the path if needed

  constructor(private http: HttpClient) { }

  // Signup
  signup(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/signup`, userData);
  }

  // Login
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, credentials);
  }

  // Get all users
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/user`);
  }

  // Get a single user by ID
  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/${id}`);
  }

  // Create a new user (in case you want to add users manually)
  createUser(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/user`, userData);
  }

  // Update user
  updateUser(id: string, updatedData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/user/${id}`, updatedData);
  }

  // Delete user
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/user/${id}`);
  }
}
