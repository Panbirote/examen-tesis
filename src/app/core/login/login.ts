import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { environment } from '../../app.config';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = signal('');
  password = signal('');
  errorMessage = signal('');
  isLoading = signal(false);

  constructor(private router: Router, private http: HttpClient) {}

  onSubmit() {
    this.errorMessage.set('');
    
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Por favor, completa todos los campos');
      return;
    }

    this.isLoading.set(true);

    const body = {
      correo: this.email(),
      contraseña: this.password()
    };

    this.http.post(`${environment.apiUrl}/usuarios/login`, body, {
      withCredentials: false
    }).subscribe({
      next: (resp: any) => {
        if (resp.Success) {
          localStorage.setItem('user', JSON.stringify({
            email: this.email(),
            type: 'student'
          }));
          const rutainicio = resp.body?.tipousuario === 1 ? 'profesor-home' : 'home';  

          this.router.navigate([`/${rutainicio}`]);

        } else {
          this.errorMessage.set(resp.body || 'Error al iniciar sesión');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        const msg = err.error?.body || "No se pudo conectar al servidor";
        this.errorMessage.set(msg);
        this.isLoading.set(false);
      }
    });
  }
}
