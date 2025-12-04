import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Question {
  id: string;
  type: 'multiple-choice';
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

interface Problem {
  id: string;
  description: string;
  questions: Question[];
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
  
  // Problemas (cada problema tiene múltiples preguntas)
  problems = signal<Problem[]>([]);
  
  // Estado de la interfaz
  currentStep = signal(1);
  showProblemModal = signal(false);
  showQuestionModal = signal(false);
  editingProblemId = signal<string | null>(null);
  editingQuestionId = signal<string | null>(null);
  
  // Nuevo problema temporal
  newProblem = signal<Problem>({
    id: '',
    description: '',
    questions: []
  });
  
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
    return true;
  }

  // Gestión de problemas
  openProblemModal() {
    this.editingProblemId.set(null);
    this.resetNewProblem();
    this.showProblemModal.set(true);
  }

  resetNewProblem() {
    this.newProblem.set({
      id: '',
      description: '',
      questions: []
    });
  }

  addProblem() {
    const problem = this.newProblem();
    
    if (!problem.description.trim()) {
      alert('Por favor ingresa la descripción del problema');
      return;
    }

    if (problem.questions.length === 0) {
      alert('Por favor agrega al menos una pregunta al problema');
      return;
    }

    const newP: Problem = {
      ...problem,
      id: Date.now().toString()
    };

    this.problems.set([...this.problems(), newP]);
    this.showProblemModal.set(false);
    this.resetNewProblem();
  }

  editProblem(problemId: string) {
    const problem = this.problems().find(p => p.id === problemId);
    if (problem) {
      this.newProblem.set({ ...problem, questions: [...problem.questions] });
      this.editingProblemId.set(problemId);
      this.showProblemModal.set(true);
    }
  }

  updateProblem() {
    const problemId = this.editingProblemId();
    if (!problemId) return;

    const problem = this.newProblem();
    
    if (!problem.description.trim()) {
      alert('Por favor ingresa la descripción del problema');
      return;
    }

    if (problem.questions.length === 0) {
      alert('El problema debe tener al menos una pregunta');
      return;
    }

    const updatedProblems = this.problems().map(p =>
      p.id === problemId ? { ...problem, id: problemId } : p
    );

    this.problems.set(updatedProblems);
    this.showProblemModal.set(false);
    this.resetNewProblem();
    this.editingProblemId.set(null);
  }

  deleteProblem(problemId: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este problema y todas sus preguntas?')) {
      this.problems.set(this.problems().filter(p => p.id !== problemId));
    }
  }

  duplicateProblem(problemId: string) {
    const problem = this.problems().find(p => p.id === problemId);
    if (problem) {
      const duplicated: Problem = {
        ...problem,
        id: Date.now().toString(),
        questions: problem.questions.map(q => ({ ...q, id: Date.now().toString() + Math.random() }))
      };
      this.problems.set([...this.problems(), duplicated]);
    }
  }

  moveProblemUp(index: number) {
    if (index > 0) {
      const newProblems = [...this.problems()];
      [newProblems[index], newProblems[index - 1]] = [newProblems[index - 1], newProblems[index]];
      this.problems.set(newProblems);
    }
  }

  moveProblemDown(index: number) {
    if (index < this.problems().length - 1) {
      const newProblems = [...this.problems()];
      [newProblems[index], newProblems[index + 1]] = [newProblems[index + 1], newProblems[index]];
      this.problems.set(newProblems);
    }
  }

  // Gestión de preguntas dentro del modal de problema
  openQuestionModalInProblem() {
    this.editingQuestionId.set(null);
    this.resetNewQuestion();
    this.showQuestionModal.set(true);
  }

  addQuestionToProblem() {
    const question = this.newQuestion();
    
    if (!question.question.trim()) {
      alert('Por favor ingresa el texto de la pregunta');
      return;
    }

    const validOptions = question.options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 4) {
      alert('Por favor completa las 4 opciones (A, B, C, D)');
      return;
    }

    const newQ: Question = {
      ...question,
      id: Date.now().toString() + Math.random()
    };

    const currentProblem = this.newProblem();
    this.newProblem.set({
      ...currentProblem,
      questions: [...currentProblem.questions, newQ]
    });

    this.showQuestionModal.set(false);
    this.resetNewQuestion();
  }

  editQuestionInProblem(questionId: string) {
    const question = this.newProblem().questions.find(q => q.id === questionId);
    if (question) {
      this.newQuestion.set({ ...question });
      this.editingQuestionId.set(questionId);
      this.showQuestionModal.set(true);
    }
  }

  updateQuestionInProblem() {
    const questionId = this.editingQuestionId();
    if (!questionId) return;

    const question = this.newQuestion();
    
    if (!question.question.trim()) {
      alert('Por favor ingresa el texto de la pregunta');
      return;
    }

    const validOptions = question.options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 4) {
      alert('Por favor completa las 4 opciones (A, B, C, D)');
      return;
    }

    const currentProblem = this.newProblem();
    const updatedQuestions = currentProblem.questions.map(q =>
      q.id === questionId ? { ...question, id: questionId } : q
    );

    this.newProblem.set({
      ...currentProblem,
      questions: updatedQuestions
    });

    this.showQuestionModal.set(false);
    this.resetNewQuestion();
    this.editingQuestionId.set(null);
  }

  deleteQuestionFromProblem(questionId: string) {
    if (confirm('¿Estás seguro de que deseas eliminar esta pregunta?')) {
      const currentProblem = this.newProblem();
      this.newProblem.set({
        ...currentProblem,
        questions: currentProblem.questions.filter(q => q.id !== questionId)
      });
    }
  }

  moveQuestionUpInProblem(index: number) {
    const currentProblem = this.newProblem();
    if (index > 0) {
      const newQuestions = [...currentProblem.questions];
      [newQuestions[index], newQuestions[index - 1]] = [newQuestions[index - 1], newQuestions[index]];
      this.newProblem.set({ ...currentProblem, questions: newQuestions });
    }
  }

  moveQuestionDownInProblem(index: number) {
    const currentProblem = this.newProblem();
    if (index < currentProblem.questions.length - 1) {
      const newQuestions = [...currentProblem.questions];
      [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
      this.newProblem.set({ ...currentProblem, questions: newQuestions });
    }
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

  // Utilidades
  updateProblemDescription(text: string) {
    this.newProblem.set({ ...this.newProblem(), description: text });
  }

  updateQuestionText(text: string) {
    this.newQuestion.set({ ...this.newQuestion(), question: text });
  }

  updateOption(index: number, value: string) {
    const current = this.newQuestion();
    const newOptions = [...current.options];
    newOptions[index] = value;
    this.newQuestion.set({ ...current, options: newOptions });
  }

  updateCorrectAnswer(value: number) {
    this.newQuestion.set({ ...this.newQuestion(), correctAnswer: value });
  }

  updatePoints(value: number) {
    this.newQuestion.set({ ...this.newQuestion(), points: value });
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  getTotalPoints(): number {
    return this.problems().reduce((sum, problem) => 
      sum + problem.questions.reduce((qSum, q) => qSum + q.points, 0), 0
    );
  }

  getTotalQuestions(): number {
    return this.problems().reduce((sum, problem) => sum + problem.questions.length, 0);
  }

  // Guardar examen
  saveExam(status: 'draft' | 'active') {
    if (!this.validateStep1()) return;

    if (this.problems().length === 0) {
      alert('Por favor agrega al menos un problema');
      return;
    }

    const exam = {
      title: this.examTitle(),
      subject: this.examSubject(),
      problems: this.problems(),
      status,
      createdDate: new Date().toISOString(),
      totalPoints: this.getTotalPoints(),
      totalQuestions: this.getTotalQuestions()
    };

    console.log('Guardando examen:', exam);
    
    const message = status === 'draft' 
      ? '¡Examen guardado como borrador! ✅' 
      : '¡Examen publicado exitosamente! 🚀';
    
    alert(message + '\n\nTítulo: ' + exam.title + '\nProblemas: ' + exam.problems.length + '\nPreguntas totales: ' + exam.totalQuestions + '\nPuntos totales: ' + exam.totalPoints);
    
    // TODO: Guardar en backend o localStorage
    this.router.navigate(['/profesor-home']);
  }

  cancel() {
    if (confirm('¿Estás seguro de que deseas cancelar? Se perderán todos los cambios.')) {
      this.router.navigate(['/profesor-home']);
    }
  }
}