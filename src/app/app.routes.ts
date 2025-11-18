import { Routes } from '@angular/router';
import { Login } from './core/login/login';
import { Home } from './pages/home/home';
import { ProfesorHome } from './pages/profesor-home/profesor-home';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'home',
    component: Home
  },
  {
    path: 'profesor-home',
    component: ProfesorHome
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];