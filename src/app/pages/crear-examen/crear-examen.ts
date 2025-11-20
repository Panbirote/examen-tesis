import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'open';
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  points: number;
}

@Component({
  selector: 'app-crear-examen',
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-examen.html',
  styleUrl: './crear-examen.css',
})
export class CrearExamen implements OnInit {
  // Datos del examen
  examTitle = signal('');
  examSubject = signal('');
  examDescription = signal('');
  examDuration = signal(60);
  
  // Preguntas
  questions = signal<Question[]>([]);
  
  // Estado de la interfaz
  currentStep = signal(1);
  showQuestionModal = signal(false);
  editingQuestionId = signal<string | null>(null);
  
  // Nueva pregunta temporal
  newQuestion = signal<Question>({
    id: '',
    type: 'multiple-choice',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    points: 1
  });

  constructor(private router: Router) {}

  ngOnInit() {
    // Verificar autenticación
    const user = localStorage.getItem('user');
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
  }

  // Navegación entre pasos
  nextStep() {
    if (this.currentStep() === 1 && this.validateStep1()) {
      this.currentStep.set(2);
    } else if (this.currentStep() === 2) {
      this.currentStep.set(3);
    }
  }

  previousStep() {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  validateStep1(): boolean {
    if (!this.examTitle()) {
      alert('Por favor ingresa un título para el examen');
      return false;
    }
    if (!this.examSubject()) {
      alert('Por favor selecciona una materia');
      return false;
    }
    if (!this.examDescription()) {
      alert('Por favor ingresa una descripción');
      return false;
    }
    return true;
  }

  // Gestión de preguntas
  openQuestionModal() {
    this.editingQuestionId.set(null);
    this.resetNewQuestion();
    this.showQuestionModal.set(true);
  }

  resetNewQuestion() {
    this.newQuestion.set({
      id: '',
      type: 'multiple-choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 1
    });
  }

  addQuestion() {
    const question = this.newQuestion();
    
    if (!question.question.trim()) {
      alert('Por favor ingresa el texto de la pregunta');
      return;
    }

    if (question.type === 'multiple-choice') {
      const validOptions = question.options?.filter(opt => opt.trim() !== '');
      if (!validOptions || validOptions.length < 2) {
        alert('Por favor ingresa al menos 2 opciones');
        return;
      }
    }

    const newQ: Question = {
      ...question,
      id: Date.now().toString()
    };

    this.questions.set([...this.questions(), newQ]);
    this.showQuestionModal.set(false);
    this.resetNewQuestion();
  }

  editQuestion(questionId: string) {
    const question = this.questions().find(q => q.id === questionId);
    if (question) {
      this.newQuestion.set({ ...question });
      this.editingQuestionId.set(questionId);
      this.showQuestionModal.set(true);
    }
  }

  updateQuestion() {
    const questionId = this.editingQuestionId();
    if (!questionId) return;

    const updatedQuestions = this.questions().map(q =>
      q.id === questionId ? { ...this.newQuestion(), id: questionId } : q
    );

    this.questions.set(updatedQuestions);
    this.showQuestionModal.set(false);
    this.resetNewQuestion();
    this.editingQuestionId.set(null);
  }

  deleteQuestion(questionId: string) {
    if (confirm('¿Estás seguro de que deseas eliminar esta pregunta?')) {
      this.questions.set(this.questions().filter(q => q.id !== questionId));
    }
  }

  duplicateQuestion(questionId: string) {
    const question = this.questions().find(q => q.id === questionId);
    if (question) {
      const duplicated: Question = {
        ...question,
        id: Date.now().toString()
      };
      this.questions.set([...this.questions(), duplicated]);
    }
  }

  moveQuestionUp(index: number) {
    if (index > 0) {
      const newQuestions = [...this.questions()];
      [newQuestions[index], newQuestions[index - 1]] = [newQuestions[index - 1], newQuestions[index]];
      this.questions.set(newQuestions);
    }
  }

  moveQuestionDown(index: number) {
    if (index < this.questions().length - 1) {
      const newQuestions = [...this.questions()];
      [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
      this.questions.set(newQuestions);
    }
  }

  // Utilidades
  updateQuestionType(type: 'multiple-choice' | 'true-false' | 'open') {
    const current = this.newQuestion();
    if (type === 'true-false') {
      this.newQuestion.set({
        ...current,
        type,
        options: ['Verdadero', 'Falso'],
        correctAnswer: 0
      });
    } else if (type === 'open') {
      this.newQuestion.set({
        ...current,
        type,
        options: undefined,
        correctAnswer: undefined
      });
    } else {
      this.newQuestion.set({
        ...current,
        type,
        options: ['', '', '', ''],
        correctAnswer: 0
      });
    }
  }

  updateQuestionText(text: string) {
    this.newQuestion.set({ ...this.newQuestion(), question: text });
  }

  updateOption(index: number, value: string) {
    const current = this.newQuestion();
    const newOptions = [...(current.options || [])];
    newOptions[index] = value;
    this.newQuestion.set({ ...current, options: newOptions });
  }

  updateCorrectAnswer(value: number) {
    this.newQuestion.set({ ...this.newQuestion(), correctAnswer: value });
  }

  updatePoints(value: number) {
    this.newQuestion.set({ ...this.newQuestion(), points: value });
  }

  addOption() {
    const current = this.newQuestion();
    const newOptions = [...(current.options || []), ''];
    this.newQuestion.set({ ...current, options: newOptions });
  }

  removeOption(index: number) {
    const current = this.newQuestion();
    const newOptions = current.options?.filter((_, i) => i !== index);
    this.newQuestion.set({ ...current, options: newOptions });
  }

  getQuestionTypeText(type: string): string {
    const types: { [key: string]: string } = {
      'multiple-choice': 'Opción múltiple',
      'true-false': 'Verdadero/Falso',
      'open': 'Respuesta abierta'
    };
    return types[type] || type;
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  getTotalPoints(): number {
    return this.questions().reduce((sum, q) => sum + q.points, 0);
  }

  // Guardar examen
  saveExam(status: 'draft' | 'active') {
    if (!this.validateStep1()) return;

    if (this.questions().length === 0) {
      alert('Por favor agrega al menos una pregunta');
      return;
    }

    const exam = {
      title: this.examTitle(),
      subject: this.examSubject(),
      description: this.examDescription(),
      duration: this.examDuration(),
      questions: this.questions(),
      status,
      createdDate: new Date().toISOString(),
      totalPoints: this.getTotalPoints()
    };

    console.log('Guardando examen:', exam);
    
    const message = status === 'draft' 
      ? '¡Examen guardado como borrador! ✅' 
      : '¡Examen publicado exitosamente! 🚀';
    
    alert(message + '\n\nTítulo: ' + exam.title + '\nPreguntas: ' + exam.questions.length + '\nPuntos totales: ' + exam.totalPoints);
    
    // TODO: Guardar en backend o localStorage
    this.router.navigate(['/profesor-home']);
  }

  cancel() {
    if (confirm('¿Estás seguro de que deseas cancelar? Se perderán todos los cambios.')) {
      this.router.navigate(['/profesor-home']);
    }
  }
}