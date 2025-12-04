import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  userEmail = signal('');
  timerDisplay = signal('02:00:00');
  private timerInterval: any;

  constructor(private router: Router) {}

  ngOnInit() {
    // Verificar si el usuario está autenticado
    const user = localStorage.getItem('user');
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    const userData = JSON.parse(user);
    this.userEmail.set(userData.email);

    // Iniciar timer
    this.startTimer(7200); // 2 horas en segundos
  }

  startTimer(duration: number) {
    let timer = duration;
    
    this.timerInterval = setInterval(() => {
      const hours = Math.floor(timer / 3600);
      const minutes = Math.floor((timer % 3600) / 60);
      const seconds = timer % 60;

      const hoursStr = hours < 10 ? '0' + hours : hours.toString();
      const minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();
      const secondsStr = seconds < 10 ? '0' + seconds : seconds.toString();

      this.timerDisplay.set(`${hoursStr}:${minutesStr}:${secondsStr}`);

      if (timer <= 0) {
        clearInterval(this.timerInterval);
        alert('¡El tiempo ha terminado!');
      }

      timer--;
    }, 1000);
  }

  // Función para iniciar un examen
  startExam(subject: string) {
    // En producción, aquí se verificaría qué exámenes están disponibles para el estudiante
    // Por ahora, redirigimos a un examen de ejemplo
    this.router.navigate(['/examen/1']);
  }

  logout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      localStorage.removeItem('user');
      clearInterval(this.timerInterval);
      this.router.navigate(['/login']);
    }
  }

  showHelp() {
    alert('¿Necesitas ayuda? Contacta a nuestro equipo de soporte: soporte@ejemplo.com');
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}