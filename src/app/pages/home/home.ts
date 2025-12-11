import { Component, OnInit, signal, PLATFORM_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { environment } from '../../app.config';
import { HttpHeaders } from '@angular/common/http';
// jwtDecode no es necesario aquí si solo leemos datos del usuario ya guardados

@Component({
  selector: 'app-home',
  standalone: true, // Asegúrate de que sea standalone si usas imports
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  userEmail = signal('');
  userName = signal('');
  showCodeModal = signal(false);
  examCode = signal('');
  isLoading = signal(false);
  errorMessage = signal(''); // Variable que faltaba
  isBrowser: boolean = false;

  // Lista de exámenes disponibles para el estudiante
  availableExams = signal<any[]>([]);

  // CORRECCIÓN: Se agregó 'private http: HttpClient' al constructor
  constructor(
    private router: Router, 
    private http: HttpClient, 
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (!this.isBrowser) {
        return; // Detiene la ejecución en el servidor
    }
    // Verificar si el usuario está autenticado
    const user = localStorage.getItem('user');
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      const userData = JSON.parse(user);
      this.userEmail.set(userData.email || 'Usuario');
      // Ajuste para leer nombre o name según como lo guardes
      this.userName.set(userData.nombre || userData.name || 'Estudiante'); 
      
      // Cargar exámenes guardados del estudiante
      this.loadStudentExams();
    } catch (e) {
      // Si el JSON del usuario está corrupto, limpiar y salir
      localStorage.removeItem('user');
      this.router.navigate(['/login']);
    }
  }

  /**
   * Carga los exámenes que el estudiante ha registrado
   * CORREGIDO: Se eliminó la lógica de Login copiada y se puso lógica de carga.
   */
  loadStudentExams() {
    this.isLoading.set(true);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const headers = new HttpHeaders({
      'token': user.token
    });
    this.http.get(`${environment.apiUrl}/encuestas/listaEncuestasPorAlumno/${user.idusuario}`, { headers: headers })
      .subscribe({
        next: (resp: any) => {
          if (resp.Success) {
             this.availableExams.set(resp.body || []);
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error cargando exámenes', err);
          this.errorMessage.set('No se pudieron cargar los exámenes');
          this.isLoading.set(false);
        }
      });
    
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
      // Simulación de llamada a API
      await this.validateExamCode(code);
      
      // Si llegamos aquí, el código es válido
      alert(`✅ ¡Examen registrado exitosamente!\n\nCódigo: ${code}\n\nEl examen aparecerá en tu lista de exámenes disponibles.`);
      
      this.closeCodeModal();
      this.loadStudentExams(); // Recargar la lista
      
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
      // Simulación temporal
      setTimeout(() => {
        // Validar formato del código
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

        // Leer exámenes actuales
        const currentExams = this.availableExams();
        
        // Verificar si el código ya fue registrado
        if (currentExams.some(exam => exam.codigo === code)) {
          reject(new Error('Este código de examen ya ha sido registrado'));
          return;
        }

        // Agregar y guardar
        const updatedExams = [...currentExams, mockExam];
        
        // Guardamos en LocalStorage para persistencia simple
        localStorage.setItem('student_exams', JSON.stringify(updatedExams));
        
        // Actualizamos la señal localmente también (aunque loadStudentExams lo hará de nuevo)
        this.availableExams.set(updatedExams);
        
        resolve();
      }, 1000);
    });
  }

  /**
   * Inicia un examen
   */
  startExam(examId: number) {
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

    const fechaLimite = new Date(exam.fechaLimite);
    const hoy = new Date();
    
    if (hoy > fechaLimite) {
      alert('Este examen ha expirado');
      return;
    }

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

  logout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      localStorage.removeItem('user');
      this.router.navigate(['/login']);
    }
  }

  showHelp() {
    alert(
      '📚 AYUDA - Sistema de Exámenes\n\n' +
      '1. Ingresa el código de examen que te proporcionó tu profesor\n' +
      '2. El examen aparecerá en tu lista de exámenes disponibles\n' +
      '3. Haz clic en "Comenzar Examen" cuando estés listo'
    );
  }

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

  getStatusColor(estado: string): string {
    const colors: { [key: string]: string } = {
      'disponible': '#28a745',
      'en-progreso': '#ffc107',
      'completado': '#6c757d',
      'expirado': '#dc3545'
    };
    return colors[estado] || '#6c757d';
  }

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