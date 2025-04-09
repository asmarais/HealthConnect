import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-ddoctor',
  templateUrl: './ddoctor.component.html',
  styleUrls: ['./ddoctor.component.css']
})
export class DDoctorComponent implements OnInit {
  doctor: any;  // To store the doctor data

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    // Get the doctor id from the route parameter
    const doctorId = this.route.snapshot.paramMap.get('id');
    if (doctorId) {
      // Call the API to fetch the doctor data
      this.http.get(`http://localhost:5000/api/doctor/${doctorId}`).subscribe((data: any) => {
        this.doctor = data.doctor;  // Store the doctor data
      });
    }
  }
}
