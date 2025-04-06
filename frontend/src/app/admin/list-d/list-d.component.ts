import { Component } from '@angular/core';

@Component({
  selector: 'app-list-d',
  templateUrl: './list-d.component.html',
  styleUrls: ['./list-d.component.css']
})
export class ListDComponent {
  doctors = [
    { name: 'Dr. Emily Carter', email: 'emily.carter@hospital.com', phone: '+1 987 654 3210', specialty: 'Cardiologie' },
    { name: 'Dr. James Wilson', email: 'james.wilson@hospital.com', phone: '+1 234 567 8901', specialty: 'Neurologie' },
    { name: 'Dr. Anna Taylor', email: 'anna.taylor@hospital.com', phone: '+1 345 678 9012', specialty: 'Pédiatrie' }
  ];
}
