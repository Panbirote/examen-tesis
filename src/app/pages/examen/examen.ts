import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Question {
  id: string;
  type: 'multiple-choice';
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

interface ExamData {
  id: string;
  title: string;
  subject: string;
  description: string;
  questions: Question[];
  totalPoints: number;
  timeLimit?: number;
}

interface UserAnswer {
  questionId: string;
  selectedOption: number | null;
}

@Component({
  selector: 'app-examen',
  imports: [CommonModule],
  templateUrl: './examen.html',
  styleUrl: './examen.css',
})
export class Examen implements OnInit, OnDestroy {
  // Datos del examen
  examData = signal<ExamData | null>(null);
  
  // Control de navegación
  currentQuestionIndex = signal(0);
  
  // Respuestas del usuario
  userAnswers = signal<UserAnswer[]>([]);
  
  // Estados
  showDescription = signal(true);
  examStarted = signal(false);
  examFinished = signal(false);
  
  // Timer
  timeRemaining = signal(0);
  timerDisplay = signal('00:00:00');
  private timerInterval: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Verificar autenticación
    const user = localStorage.getItem('user');
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    // Cargar examen (aquí usamos datos de ejemplo)
    // En producción, se cargaría desde el backend usando el ID de la ruta
    const examId = this.route.snapshot.paramMap.get('id');
    this.loadExamData(examId);
  }

  loadExamData(examId: string | null) {
    // Datos de ejemplo - En producción vendría del backend
    const sampleExam: ExamData = {
      id: examId || '1',
      title: 'Examen de Matemáticas - Álgebra Básica',
      subject: 'Matemáticas',
      description: 'Este examen evalúa tus conocimientos en álgebra básica, incluyendo ecuaciones lineales, factorización y sistemas de ecuaciones. Lee cuidadosamente cada pregunta y selecciona la respuesta que consideres correcta. Tienes 60 minutos para completar el examen. ¡Mucha suerte!',
      questions: [
        {
          id: 'q1',
          type: 'multiple-choice',
          question: 'Resuelve la siguiente ecuación: 2x + 5 = 13. ¿Cuál es el valor de x?',
          options: ['x = 2', 'x = 4', 'x = 6', 'x = 8'],
          correctAnswer: 1,
          points: 2
        },
        {
          id: 'q2',
          type: 'multiple-choice',
          question: 'Factoriza la expresión: x² + 5x + 6',
          options: [
            '(x + 2)(x + 3)',
            '(x + 1)(x + 6)',
            '(x - 2)(x - 3)',
            '(x + 4)(x + 2)'
          ],
          correctAnswer: 0,
          points: 3
        },
        {
          id: 'q3',
          type: 'multiple-choice',
          question: 'Si f(x) = 2x - 3, ¿cuál es el valor de f(5)?',
          options: ['5', '7', '10', '13'],
          correctAnswer: 1,
          points: 2
        },
        {
          id: 'q4',
          type: 'multiple-choice',
          question: 'Resuelve el sistema de ecuaciones:\nx + y = 10\nx - y = 2\n¿Cuál es el valor de x?',
          options: ['x = 4', 'x = 6', 'x = 8', 'x = 10'],
          correctAnswer: 1,
          points: 4
        },
        {
          id: 'q5',
          type: 'multiple-choice',
          question: 'Simplifica la expresión: 3(2x + 4) - 2(x - 1)',
          options: ['4x + 14', '6x + 14', '4x + 10', '8x + 10'],
          correctAnswer: 0,
          points: 3
        }
      ],
      totalPoints: 14,
      timeLimit: 3600 // 60 minutos en segundos
    };

    this.examData.set(sampleExam);
    
    // Inicializar respuestas vacías
    const emptyAnswers = sampleExam.questions.map(q => ({
      questionId: q.id,
      selectedOption: null
    }));
    this.userAnswers.set(emptyAnswers);

    // Configurar timer si hay límite de tiempo
    if (sampleExam.timeLimit) {
      this.timeRemaining.set(sampleExam.timeLimit);
    }
  }

  startExam() {
    this.showDescription.set(false);
    this.examStarted.set(true);
    this.currentQuestionIndex.set(0);
    
    // Iniciar timer
    const timeLimit = this.examData()?.timeLimit;
    if (timeLimit) {
      this.startTimer(timeLimit);
    }
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
      this.timeRemaining.set(timer);

      if (timer <= 0) {
        clearInterval(this.timerInterval);
        this.submitExam();
        alert('¡El tiempo ha terminado! El examen se enviará automáticamente.');
      }

      timer--;
    }, 1000);
  }

  selectOption(questionId: string, optionIndex: number) {
    const currentAnswers = this.userAnswers();
    const updatedAnswers = currentAnswers.map(answer =>
      answer.questionId === questionId
        ? { ...answer, selectedOption: optionIndex }
        : answer
    );
    this.userAnswers.set(updatedAnswers);
  }

  getSelectedOption(questionId: string): number | null {
    const answer = this.userAnswers().find(a => a.questionId === questionId);
    return answer?.selectedOption ?? null;
  }

  nextQuestion() {
    const exam = this.examData();
    if (!exam) return;

    if (this.currentQuestionIndex() < exam.questions.length - 1) {
      this.currentQuestionIndex.set(this.currentQuestionIndex() + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex() > 0) {
      this.currentQuestionIndex.set(this.currentQuestionIndex() - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getCurrentQuestion(): Question | null {
    const exam = this.examData();
    if (!exam) return null;
    return exam.questions[this.currentQuestionIndex()];
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  getAnsweredCount(): number {
    return this.userAnswers().filter(a => a.selectedOption !== null).length;
  }

  isQuestionAnswered(index: number): boolean {
    const exam = this.examData();
    if (!exam) return false;
    const questionId = exam.questions[index].id;
    const answer = this.userAnswers().find(a => a.questionId === questionId);
    return answer?.selectedOption !== null;
  }

  goToQuestion(index: number) {
    this.currentQuestionIndex.set(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  canSubmit(): boolean {
    const exam = this.examData();
    if (!exam) return false;
    return this.getAnsweredCount() === exam.questions.length;
  }

  submitExam() {
    const exam = this.examData();
    if (!exam) return;

    const unanswered = exam.questions.length - this.getAnsweredCount();
    
    if (unanswered > 0) {
      if (!confirm(`Tienes ${unanswered} pregunta${unanswered !== 1 ? 's' : ''} sin responder.\n\n¿Estás seguro de que deseas enviar el examen?`)) {
        return;
      }
    } else {
      if (!confirm('¿Estás seguro de que deseas enviar el examen?\n\nNo podrás modificar tus respuestas después de enviarlo.')) {
        return;
      }
    }

    // Detener timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    // Calcular resultados
    let correctAnswers = 0;
    let totalPoints = 0;

    exam.questions.forEach(question => {
      const userAnswer = this.userAnswers().find(a => a.questionId === question.id);
      if (userAnswer?.selectedOption === question.correctAnswer) {
        correctAnswers++;
        totalPoints += question.points;
      }
    });

    const percentage = ((correctAnswers / exam.questions.length) * 100).toFixed(1);

    // Guardar resultados (aquí se enviaría al backend)
    const results = {
      examId: exam.id,
      answers: this.userAnswers(),
      correctAnswers,
      totalQuestions: exam.questions.length,
      pointsObtained: totalPoints,
      totalPoints: exam.totalPoints,
      percentage,
      timeSpent: (exam.timeLimit || 0) - this.timeRemaining(),
      submittedAt: new Date().toISOString()
    };

    console.log('Resultados del examen:', results);

    this.examFinished.set(true);
    
    alert(
      `¡Examen enviado exitosamente! ✅\n\n` +
      `Respuestas correctas: ${correctAnswers}/${exam.questions.length}\n` +
      `Puntos obtenidos: ${totalPoints}/${exam.totalPoints}\n` +
      `Porcentaje: ${percentage}%\n\n` +
      `Los resultados se han guardado.`
    );

    // Redirigir al home después de 2 segundos
    setTimeout(() => {
      this.router.navigate(['/home']);
    }, 2000);
  }

  exitExam() {
    if (this.examStarted() && !this.examFinished()) {
      if (confirm('¿Estás seguro de que deseas salir?\n\nTus respuestas no se guardarán.')) {
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
        }
        this.router.navigate(['/home']);
      }
    } else {
      this.router.navigate(['/home']);
    }
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}