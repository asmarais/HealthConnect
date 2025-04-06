import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { DashboradComponent } from './dashborad/dashborad.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderAComponent } from './header-a/header-a.component';
import { ListPComponent } from './list-p/list-p.component';
import { ListDComponent } from './list-d/list-d.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AdminComponent,
    DashboradComponent,
    SidebarComponent,
    HeaderAComponent,
    ListPComponent,
    ListDComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    HttpClientModule,
    FormsModule,
  ]
})
export class AdminModule { }
