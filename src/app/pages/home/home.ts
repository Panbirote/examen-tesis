import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  userEmail = signal('');
  userName = signal('');
  showCodeModal = signal(false);
  examCode = signal('');
  isLoading = signal(false);
  
  // Lista de exámenes disponibles para el estudiante
  availableExams = signal<any[]>([]);

  constructor(private router: Router) {}

  ngOnInit() {
    // Verificar si el usuario está autenticado
    const user = localStorage.getItem('user');
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    const userData = JSON.parse(user);
    this.userEmail.set(userData.email || 'Usuario');
    this.userName.set(userData.nombre || userData.name || 'Estudiante');

    // Cargar exámenes guardados del estudiante
    this.loadStudentExams();
  }

  /**
   * Carga los exámenes que el estudiante ha registrado
   */
  loadStudentExams() {
    try {
      const studentExams = localStorage.getItem('student_exams');
      if (studentExams) {
        this.availableExams.set(JSON.parse(studentExams));
      }
    } catch (error) {
      console.error('Error al cargar exámenes:', error);
    }
  }

  /**
   * Abre el modal para ingresar código
   */
  openCodeModal() {
    this.examCode.set('');
    this.showCodeModal.set(true);
  }

  /**
   * Cierra el modal
   */
  closeCodeModal() {
    this.showCodeModal.set(false);
    this.examCode.set('');
  }

  /**
   * Valida y registra el código del examen
   */
  async submitExamCode() {
    const code = this.examCode().trim();
    
    if (!code) {
      alert('Por favor ingresa un código de examen');
      return;
    }

    this.isLoading.set(true);

    try {
      // TODO: Aquí deberías hacer una llamada a tu API para validar el código
      // Por ahora, simulamos la validación
      
      // Simulación de llamada a API
      await this.validateExamCode(code);
      
      // Si llegamos aquí, el código es válido
      alert(`✅ ¡Examen registrado exitosamente!\n\nCódigo: ${code}\n\nEl examen aparecerá en tu lista de exámenes disponibles.`);
      
      this.closeCodeModal();
      this.loadStudentExams();
      
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Valida el código del examen con la API
   */
  private async validateExamCode(code: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // TODO: Reemplazar con llamada real a la API
      // Ejemplo:
      // this.http.post('/api/estudiante/registrar-examen', { codigo: code })
      //   .subscribe({
      //     next: (response) => resolve(response),
      //     error: (error) => reject(error)
      //   });

      // Simulación temporal
      setTimeout(() => {
        // Validar formato del código (por ejemplo, 6 caracteres alfanuméricos)
        if (code.length < 4) {
          reject(new Error('El código debe tener al menos 4 caracteres'));
          return;
        }

        // Simular examen encontrado
        const mockExam = {
          id: Date.now(),
          codigo: code,
          titulo: 'Examen de Matemáticas - Álgebra',
          materia: 'Matemáticas',
          duracion: 60,
          fechaLimite: '2025-12-31',
          profesor: 'Prof. Juan Pérez',
          estado: 'disponible',
          intentos: 0,
          intentosMaximos: 3
        };

        // Guardar en localStorage (temporal)
        const currentExams = this.availableExams();
        
        // Verificar si el código ya fue registrado
        if (currentExams.some(exam => exam.codigo === code)) {
          reject(new Error('Este código de examen ya ha sido registrado'));
          return;
        }

        currentExams.push(mockExam);
        localStorage.setItem('student_exams', JSON.stringify(currentExams));
        
        resolve();
      }, 1000);
    });
  }

  /**
   * Inicia un examen
   */
  startExam(examId: number) {
    // Verificar si el examen está disponible
    const exam = this.availableExams().find(e => e.id === examId);
    
    if (!exam) {
      alert('Examen no encontrado');
      return;
    }

    if (exam.estado === 'completado') {
      alert('Ya has completado este examen');
      return;
    }

    if (exam.intentos >= exam.intentosMaximos) {
      alert(`Has alcanzado el número máximo de intentos (${exam.intentosMaximos})`);
      return;
    }

    // Verificar fecha límite
    const fechaLimite = new Date(exam.fechaLimite);
    const hoy = new Date();
    
    if (hoy > fechaLimite) {
      alert('Este examen ha expirado');
      return;
    }

    // Confirmar inicio
    if (confirm(`¿Deseas comenzar el examen "${exam.titulo}"?\n\nDuración: ${exam.duracion} minutos\nIntentos restantes: ${exam.intentosMaximos - exam.intentos}`)) {
      this.router.navigate(['/examen', examId]);
    }
  }

  /**
   * Elimina un examen de la lista
   */
  removeExam(examId: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este examen de tu lista?')) {
      const updatedExams = this.availableExams().filter(e => e.id !== examId);
      this.availableExams.set(updatedExams);
      localStorage.setItem('student_exams', JSON.stringify(updatedExams));
    }
  }

  /**
   * Cierra sesión
   */
  logout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      localStorage.removeItem('user');
      this.router.navigate(['/login']);
    }
  }

  /**
   * Muestra ayuda
   */
  showHelp() {
    alert(
      '📚 AYUDA - Sistema de Exámenes\n\n' +
      '1. Ingresa el código de examen que te proporcionó tu profesor\n' +
      '2. El examen aparecerá en tu lista de exámenes disponibles\n' +
      '3. Haz clic en "Comenzar Examen" cuando estés listo\n\n' +
      '¿Necesitas más ayuda?\n' +
      'Contacta a: soporte@ejemplo.com'
    );
  }

  /**
   * Obtiene el icono según la materia
   */
  getSubjectIcon(materia: string): string {
    const icons: { [key: string]: string } = {
      'Matemáticas': '📊',
      'Lectura': '📚',
      'Ciencias': '🔬',
      'Historia': '📜',
      'Geografía': '🌍',
      'Inglés': '🗣️'
    };
    return icons[materia] || '📝';
  }

  /**
   * Obtiene el color según el estado
   */
  getStatusColor(estado: string): string {
    const colors: { [key: string]: string } = {
      'disponible': '#28a745',
      'en-progreso': '#ffc107',
      'completado': '#6c757d',
      'expirado': '#dc3545'
    };
    return colors[estado] || '#6c757d';
  }

  /**
   * Obtiene el texto del estado
   */
  getStatusText(estado: string): string {
    const texts: { [key: string]: string } = {
      'disponible': 'Disponible',
      'en-progreso': 'En Progreso',
      'completado': 'Completado',
      'expirado': 'Expirado'
    };
    return texts[estado] || estado;
  }
}