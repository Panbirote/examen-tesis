import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = signal('');
  password = signal('');
  errorMessage = signal('');
  isLoading = signal(false);

  constructor(private router: Router) {}

  onSubmit() {
    this.errorMessage.set('');
    
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Por favor, completa todos los campos');
      return;
    }

    this.isLoading.set(true);

    // Simulación de autenticación
    setTimeout(() => {
      // Aquí irá tu lógica de autenticación real
      if (this.email() === 'estudiante@ejemplo.com' && this.password() === '123456') {
        // Guardar sesión
        localStorage.setItem('user', JSON.stringify({ email: this.email() }));
        this.router.navigate(['/home']);
      } else {
        this.errorMessage.set('Credenciales incorrectas');
        this.isLoading.set(false);
      }
    }, 1000);
  }
}