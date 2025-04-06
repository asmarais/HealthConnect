import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Output() pageChange = new EventEmitter<string>();
  activePage: string = 'dashboard';

  selectPage(page: string) {
    this.activePage = page;
    this.pageChange.emit(page);
  }
}
