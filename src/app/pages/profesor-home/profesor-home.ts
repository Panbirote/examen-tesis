import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Exam {
  id: string;
  title: string;
  subject: string;
  questions: number;
  status: 'draft' | 'active' | 'completed';
  createdDate: string;
  students: number;
}

@Component({
  selector: 'app-profesor-home',
  imports: [CommonModule],
  templateUrl: './profesor-home.html',
  styleUrl: './profesor-home.css',
})
export class ProfesorHome implements OnInit {
  profesorName = signal('');
  profesorEmail = signal('');
  exams = signal<Exam[]>([]);
  stats = signal({
    totalExams: 0,
    activeExams: 0,
    totalStudents: 0,
    completedExams: 0
  });

  constructor(private router: Router) {}

  ngOnInit() {
    // Verificar si el usuario está autenticado
    const user = localStorage.getItem('user');
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    const userData = JSON.parse(user);
    this.profesorEmail.set(userData.email);
    this.profesorName.set(userData.name || 'Profesor');

    // Cargar datos de ejemplo
    this.loadExamples();
  }

  loadExamples() {
    const sampleExams: Exam[] = [
      {
        id: '1',
        title: 'Examen de Matemáticas - Álgebra',
        subject: 'Matemáticas',
        questions: 30,
        status: 'active',
        createdDate: '2024-11-10',
        students: 45
      },
      {
        id: '2',
        title: 'Comprensión Lectora - Nivel Avanzado',
        subject: 'Lectura',
        questions: 25,
        status: 'active',
        createdDate: '2024-11-12',
        students: 42
      },
      {
        id: '3',
        title: 'Ciencias Naturales - Biología',
        subject: 'Ciencias',
        questions: 28,
        status: 'draft',
        createdDate: '2024-11-15',
        students: 0
      },
      {
        id: '4',
        title: 'Geometría y Trigonometría',
        subject: 'Matemáticas',
        questions: 35,
        status: 'completed',
        createdDate: '2024-10-28',
        students: 48
      }
    ];

    this.exams.set(sampleExams);

    // Calcular estadísticas
    this.stats.set({
      totalExams: sampleExams.length,
      activeExams: sampleExams.filter(e => e.status === 'active').length,
      totalStudents: sampleExams.reduce((sum, e) => sum + e.students, 0),
      completedExams: sampleExams.filter(e => e.status === 'completed').length
    });
  }

  // Funciones de gestión de exámenes
  createNewExam() {
    //console.log('Creando nuevo examen desde cero...');
    //alert('Redirigiendo al creador de exámenes...\n\nAquí podrás:\n• Seleccionar materia\n• Agregar preguntas\n• Configurar tiempo\n• Asignar estudiantes');
  this.router.navigate(['/pages/crear-examen/crear-examen']);
  }

  editExam(examId: string) {
    console.log(`Editando examen ID: ${examId}`);
    const exam = this.exams().find(e => e.id === examId);
    alert(`Editando: ${exam?.title}\n\nPodrás modificar:\n• Título y descripción\n• Preguntas\n• Tiempo límite\n• Estudiantes asignados`);
    // TODO: this.router.navigate(['/profesor/editar-examen', examId]);
  }

  publishExam(examId: string) {
    console.log(`Publicando examen ID: ${examId}`);
    if (confirm('¿Estás seguro de que deseas publicar este examen?\n\nLos estudiantes podrán comenzar a responderlo.')) {
      const updatedExams = this.exams().map(e => 
        e.id === examId ? { ...e, status: 'active' as const } : e
      );
      this.exams.set(updatedExams);
      this.loadExamples(); // Recalcular stats
      alert('¡Examen publicado exitosamente! ✅');
    }
  }

  viewResults(examId: string) {
    console.log(`Viendo resultados del examen ID: ${examId}`);
    const exam = this.exams().find(e => e.id === examId);
    alert(`Resultados: ${exam?.title}\n\nEstadísticas:\n• Promedio: 82%\n• Aprobados: ${Math.floor((exam?.students || 0) * 0.85)}\n• Reprobados: ${Math.floor((exam?.students || 0) * 0.15)}\n• Tiempo promedio: 45 min`);
    // TODO: this.router.navigate(['/profesor/resultados', examId]);
  }

  monitorExam(examId: string) {
    console.log(`Monitoreando examen ID: ${examId}`);
    const exam = this.exams().find(e => e.id === examId);
    alert(`Monitoreo en vivo: ${exam?.title}\n\n👥 Estudiantes activos: ${exam?.students}\n⏱️ Tiempo transcurrido: 25 min\n✅ Completados: ${Math.floor((exam?.students || 0) * 0.3)}`);
    // TODO: this.router.navigate(['/profesor/monitorear', examId]);
  }

  downloadReport(examId: string) {
    console.log(`Descargando reporte del examen ID: ${examId}`);
    const exam = this.exams().find(e => e.id === examId);
    alert(`Descargando reporte: ${exam?.title}\n\nFormatos disponibles:\n• PDF (Detallado)\n• Excel (Datos)\n• CSV (Simple)`);
    // TODO: Implementar descarga real
  }

  showExamMenu(examId: string) {
    console.log(`Mostrando menú para examen ID: ${examId}`);
    const options = [
      'Duplicar examen',
      'Compartir con otros profesores',
      'Archivar',
      'Eliminar'
    ];
    alert(`Opciones adicionales:\n\n${options.map((o, i) => `${i + 1}. ${o}`).join('\n')}`);
  }

  deleteExam(examId: string) {
    console.log(`Eliminando examen ID: ${examId}`);
    const exam = this.exams().find(e => e.id === examId);
    if (confirm(`¿Estás seguro de que deseas eliminar:\n\n"${exam?.title}"?\n\nEsta acción no se puede deshacer.`)) {
      const updatedExams = this.exams().filter(e => e.id !== examId);
      this.exams.set(updatedExams);
      this.loadExamples(); // Recalcular stats
      alert('Examen eliminado exitosamente 🗑️');
    }
  }

  // Funciones de gestión de estudiantes
  addStudent() {
    console.log('Agregando nuevo estudiante...');
    alert('Agregar Estudiante\n\nOpciones:\n• Agregar manualmente\n• Importar desde CSV\n• Importar desde Excel\n• Sincronizar con sistema escolar');
    // TODO: Abrir modal o formulario
  }

  viewGroup(groupId: string) {
    console.log(`Viendo grupo: ${groupId}`);
    alert(`Grupo ${groupId}\n\nDetalles:\n• 28 estudiantes\n• Promedio: 87%\n• Asistencia: 95%\n• Última actividad: Hoy`);
    // TODO: this.router.navigate(['/profesor/grupo', groupId]);
  }

  // Funciones de análisis y resultados
  viewDetailedAnalysis() {
    console.log('Viendo análisis detallado...');
    alert('Análisis Detallado\n\nInformación disponible:\n• Tendencias de desempeño\n• Comparativas por materia\n• Progresión temporal\n• Análisis por estudiante');
    // TODO: this.router.navigate(['/profesor/analisis']);
  }

  exportAllResults() {
    console.log('Exportando todos los resultados...');
    alert('Exportar Resultados\n\nSelecciona formato:\n• PDF Completo\n• Excel con gráficos\n• CSV (datos crudos)\n• Presentación PowerPoint');
    // TODO: Implementar exportación
  }

  // Funciones de acceso rápido
  openQuestionBank() {
    console.log('Abriendo banco de preguntas...');
    alert('Banco de Preguntas PISA\n\n📚 Matemáticas: 180 preguntas\n📖 Lectura: 150 preguntas\n🔬 Ciencias: 170 preguntas\n\nFiltros disponibles:\n• Por dificultad\n• Por tema\n• Por año');
    // TODO: this.router.navigate(['/profesor/banco-preguntas']);
  }

  openAnalytics() {
    console.log('Abriendo dashboard analítico...');
    alert('Dashboard Analítico\n\nVisualiza:\n• Métricas en tiempo real\n• Gráficos interactivos\n• Comparativas\n• Tendencias\n• Exportación de datos');
    // TODO: this.router.navigate(['/profesor/analytics']);
  }

  manageStudents() {
    console.log('Gestionando estudiantes...');
    alert('Gestión de Estudiantes\n\nOpciones:\n• Ver lista completa\n• Agregar/Editar/Eliminar\n• Importar/Exportar\n• Asignar a grupos\n• Ver historial');
    // TODO: this.router.navigate(['/profesor/estudiantes']);
  }

  exportReports() {
    console.log('Exportando reportes...');
    alert('Generar Reportes\n\nTipos disponibles:\n• Reporte individual\n• Reporte por grupo\n• Reporte general\n• Reporte comparativo\n• Reporte temporal');
    // TODO: Abrir modal de configuración de reporte
  }

  accessCalendar() {
    console.log('Accediendo al calendario...');
    alert('Calendario de Exámenes\n\nPróximos eventos:\n• 22 Nov: Matemáticas Grupo A\n• 25 Nov: Lectura Grupo B\n• 28 Nov: Ciencias Grupo C\n\n¿Deseas programar un nuevo examen?');
    // TODO: this.router.navigate(['/profesor/calendario']);
  }

  viewTemplates() {
    console.log('Viendo plantillas...');
    alert('Plantillas de Exámenes PISA\n\nDisponibles:\n• Matemáticas (5 plantillas)\n• Lectura (4 plantillas)\n• Ciencias (6 plantillas)\n• Mixtos (5 plantillas)\n\nTodas basadas en estándares OECD');
    // TODO: this.router.navigate(['/profesor/plantillas']);
  }

  // Utilidades
  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'draft': 'Borrador',
      'active': 'Activo',
      'completed': 'Completado'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  logout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      localStorage.removeItem('user');
      this.router.navigate(['/login']);
    }
  }

  showHelp() {
    alert('Ayuda para Profesores - PISA\n\n📚 CREAR EXAMEN:\nDiseña evaluaciones personalizadas con nuestro editor intuitivo.\n\n📊 GESTIONAR:\nEdita, publica o elimina exámenes según necesites.\n\n📈 RESULTADOS:\nVisualiza el desempeño con gráficos y estadísticas detalladas.\n\n👥 ESTUDIANTES:\nAdministra grupos y monitorea progreso individual.\n\n📧 SOPORTE:\nprofesores@ejemplo.com\nTel: +52 123 456 7890\n\n💡 TIP: Usa Ctrl+H para abrir esta ayuda');
  }

  ngOnDestroy() {
    // Limpieza si es necesario
  }
}