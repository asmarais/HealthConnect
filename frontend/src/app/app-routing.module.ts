import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { AppoComponent } from './appo/appo.component';
import { DoctorsComponent } from './doctors/doctors.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ProfileDComponent } from './profile-d/profile-d.component';
import { ProfilePComponent } from './profile-p/profile-p.component';
import { DDoctorComponent } from './ddoctor/ddoctor.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {path : 'home',component:HomeComponent},
  {path : 'nav',component:NavbarComponent},
  {path : 'footer',component:FooterComponent},
  {path : 'appo',component:AppoComponent},
  {path : 'doc',component:DoctorsComponent},
  {path : 'schedule',component:ScheduleComponent},
  {path : 'login',component:LoginComponent},
  {path : 'reg',component:RegisterComponent},
  {path : 'profilD',component:ProfileDComponent},
  {path : 'profilP',component:ProfilePComponent},
  { path: 'DDoctor/:id', component: DDoctorComponent },

  { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },




];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
