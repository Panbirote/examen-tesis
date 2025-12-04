import { Routes } from '@angular/router';
import { Login } from './core/login/login';
import { Home } from './pages/home/home';
import { ProfesorHome } from './pages/profesor-home/profesor-home';
import { CrearExamen } from './pages/crear-examen/crear-examen';
import { Examen } from './pages/examen/examen';

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
    path: 'crear-examen',
    component: CrearExamen
  },
  {
    path: 'examen/:id',
    component: Examen
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];