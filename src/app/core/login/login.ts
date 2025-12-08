import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { environment } from '../../app.config';
import { jwtDecode } from 'jwt-decode';

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
        try {
          if (!resp.Success) {
            this.errorMessage.set(resp.body || 'Error al iniciar sesión');
            this.isLoading.set(false);
            return;
          }

          if (!resp.body) {
            this.errorMessage.set("No se recibió el token del servidor");
            this.isLoading.set(false);
            return;
          }

          const token = resp.body;

          // Decodificar el token
          const decoded: any = jwtDecode(token);

          // Validar que el token tenga lo que esperas


          // Guardar datos del usuario
          localStorage.setItem('user', JSON.stringify({
            email: this.email(),
            type: decoded.tipousuario === 1 ? 'teacher' : 'student', token: token,
            idusuario: decoded.id
          }));

          // Definir ruta según el tipo de usuario
          const rutainicio = decoded.tipoUsuario === 1 ? 'profesor-home' : 'home';

          // Navegar
          this.router.navigate([`/${rutainicio}`]);

        } catch (error) {
          this.errorMessage.set("Token inválido o imposible de procesar");
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
