import { Component } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  activePage: string = 'dashboard';

  onPageChange(page: string) {
    this.activePage = page;
  }
}
