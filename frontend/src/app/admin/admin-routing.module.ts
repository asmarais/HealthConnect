import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { DashboradComponent } from './dashborad/dashborad.component';
import { HeaderAComponent } from './header-a/header-a.component';
import { ListPComponent } from './list-p/list-p.component';
import { ListDComponent } from './list-d/list-d.component';
import { SidebarComponent } from './sidebar/sidebar.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent ,
    children: [
      { path: 'dash', component: DashboradComponent },
      { path: 'header', component: HeaderAComponent },
      { path: 'listP', component: ListPComponent },
      { path: 'listD', component: ListDComponent },
      { path: 'sid', component: SidebarComponent },
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
