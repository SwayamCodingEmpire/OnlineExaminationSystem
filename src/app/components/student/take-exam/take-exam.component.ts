// src/app/components/student/take-exam/take-exam.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

import {
  TakeExamService,
  SectionDetailDTO,
  RawQuestion,
  AnswerDTO
} from '../../../services/student/take-exam.service';

interface Question {
  code: string;
  text: string;
  type: 'mcq' | 'subjective';
  options: string[];
  viewed: boolean;
  answered: boolean;
  bookmarked: boolean;
  answer: string;
}

interface Section {
  title: string;
  duration: number;   // seconds
  questions: Question[];
}

@Component({
  selector: 'app-take-exam',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './take-exam.component.html',
  styleUrls: ['./take-exam.component.scss']
})
export class TakeExamComponent implements OnInit, OnDestroy {
  @ViewChild('fullScreenContainer') fullScreenContainer!: ElementRef;
  examCode = '';
  sections: Section[] = [];
  examStarted = false;
  showKeyboardWarning = false;
keyboardListener: any = null;
gobackToFullScreenTimer = 5;

  sectionChangeMessage = '';
  showSectionChangeModal = false;
  showGoBackToFullScreenModal = false;

  sectionIndex = 0;
  questionIndex = 0;
  timeLeft = 0;
  timerDisplay = '';
  private timerId?: number;

  private answersMap: Record<string, string> = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: TakeExamService
  ) { }

  ngOnInit(): void {

    this.examCode = this.route.snapshot.paramMap.get('code') || '';
    if (!this.examCode) {
      alert('No exam code provided.');
      this.router.navigate(['/student']);
      return;
    }
    this.svc.getSections(this.examCode).subscribe({
      next: details => this.buildSections(details),
      error: () => {
        alert('Failed to load exam.');
        this.router.navigate(['/student']);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timerId != null) clearInterval(this.timerId);
  if (this.keyboardListener) {
    document.removeEventListener('keydown', this.keyboardListener);
  }
  }

  private buildSections(details: SectionDetailDTO[]): void {
    this.sections = details.map(sec => ({
      title: sec.sectionName,
      duration: sec.duration * 60,
      questions: sec.questions.map(q => ({
        code: q.code,
        text: q.text,
        type: 'mcq',
        options: [q.optionA, q.optionB, q.optionC, q.optionD],
        viewed: false,
        answered: false,
        bookmarked: false,
        answer: ''
      }))
    }));
  }

  // ─── Template getters ────────────────────────────────
  get currentSection(): Section {
    return this.sections[this.sectionIndex];
  }
  get currentQuestion(): Question {
    return this.currentSection.questions[this.questionIndex];
  }
  get currentQuestionIndex(): number {
    return this.questionIndex;
  }
  get isLastSection(): boolean {
    return this.sectionIndex === this.sections.length - 1;
  }

  getSectionTabClass(i: number): string {
    return i === this.sectionIndex ? 'fw-bold text-primary' : 'text-muted';
  }

  // ─── Timer & Navigation ─────────────────────────────
  startExam(): void {
    this.goFullScreen()
    this.examStarted = true;
    this.loadSection(0);

     this.keyboardListener = (event: KeyboardEvent) => {
    // Ignore function keys, Alt, Ctrl, etc.
    // if (event.key === 'F11' || event.key === 'F12' ||
    //     event.key === 'PrintScreen' || event.altKey ||
    //     event.ctrlKey || event.metaKey) {

    //   return;
    // }
    this.showGoBackToFullScreenModal = true;

    this.showKeyboardWarning = true;
    // Auto-hide warning after 3 seconds
    let counter = 1;
    this.gobackToFullScreenTimer = 5; // Reset timer to 5 seconds
const interval = setInterval(() => {
  console.log(`Second ${counter}`);
  this.gobackToFullScreenTimer = this.gobackToFullScreenTimer - 1;
  counter++;

  if (counter > 5) {
    clearInterval(interval);
    this.gobackToFullScreenTimer = 5;
    this.showKeyboardWarning = false;
    this.showGoBackToFullScreenModal = false;
    this.submitExam(); // Auto-submit after 5 seconds
  }


}, 1000);
  };

  document.addEventListener('keydown', this.keyboardListener);
  }

  private loadSection(idx: number): void {
    if (this.timerId != null) clearInterval(this.timerId);
    this.sectionIndex = idx;
    this.questionIndex = 0;
    this.startTimer(this.currentSection.duration);
  }

  /** user clicked “Submit Section” */
  nextSectionOrSubmit(): void {
    if (!this.examStarted) return;
    if (this.timerId != null) clearInterval(this.timerId);

    if (!this.isLastSection) {
      this.showSectionChangeModal = true;
    } else {
      this.submitExam();
    }
  }

  optionLetter(idx: number): string {
    return String.fromCharCode(65 + idx); // 65 is 'A'
  }


  /** auto-advance when time expires (no modal) */
  private autoAdvance(): void {
    if (this.timerId != null) clearInterval(this.timerId);

    if (!this.isLastSection) {
      this.sectionChangeMessage = `Time's up! Moved to ${this.sections[this.sectionIndex + 1].title}`;
      setTimeout(() => this.sectionChangeMessage = '', 3000);
      this.loadSection(this.sectionIndex + 1);
    } else {
      this.submitExam();
    }
  }

  private startTimer(sec: number): void {
    this.timeLeft = sec;
    this.updateTimerDisplay();
    this.currentQuestion.viewed = true;

    this.timerId = window.setInterval(() => {
      this.timeLeft--;
      this.updateTimerDisplay();
      if (this.timeLeft <= 0) {
        clearInterval(this.timerId!);
        this.autoAdvance();
      }
    }, 1000);
  }

  private updateTimerDisplay(): void {
    const m = Math.floor(this.timeLeft / 60);
    const s = this.timeLeft % 60;
    this.timerDisplay = `${m}:${s < 10 ? '0' + s : s}`;
  }

  prevQuestion(_: Question): void {
    if (this.questionIndex > 0) {
      this.questionIndex--;
      this.currentQuestion.viewed = true;
    }
  }

  nextQuestion(_: Question): void {
    if (this.questionIndex < this.currentSection.questions.length - 1) {
      this.questionIndex++;
      this.currentQuestion.viewed = true;
    }
  }

  goToQuestion(i: number, _: Question): void {
    this.questionIndex = i;
    this.currentQuestion.viewed = true;
  }

  confirmNextSection(): void {
    this.showSectionChangeModal = false;
    this.sectionChangeMessage = `Moved to ${this.sections[this.sectionIndex + 1].title}`;
    setTimeout(() => this.sectionChangeMessage = '', 3000);
    this.loadSection(this.sectionIndex + 1);
  }

  // ─── Answering & Bookmark ────────────────────────────
  markAsAnswered(q: Question, answer: string): void {
  q.viewed = true;
  q.answered = true;
  q.answer = answer;
  this.answersMap[q.code] = answer;
}


  toggleBookmark(_: Question): void {
    this.currentQuestion.bookmarked = !this.currentQuestion.bookmarked;
  }

  getGridClass(q: Question): string {
    if (q.bookmarked) return 'purpl text-white';
    if (q.answered) return 'bg-success text-white';
    if (q.viewed) return 'bg-warning text-white';
    return 'bg-secondary text-white';
  }

  // ─── Final Submit ────────────────────────────────────
  submitExam(): void {

    if (this.timerId != null) clearInterval(this.timerId);
    const answers: AnswerDTO[] = [];
    this.sections.forEach(sec =>
      sec.questions.forEach(q => {
        answers.push({
          questionCode: q.code,
          answer: this.answersMap[q.code] || ''
        });
      })
    );
    this.svc
      .submitAnswers(this.examCode, { answers })
      .subscribe(() => {
        this.exitFullScreen();
        this.router.navigate(['/student/results', this.examCode]);
      });
  }

  goFullScreen(): void {
    this.showKeyboardWarning = false; // Dismiss warning when entering full screen
    const elem: any = this.fullScreenContainer.nativeElement;
    this.showGoBackToFullScreenModal = false; // Dismiss modal when entering full screen

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    }
  }

  exitFullScreen(): void {
    const doc: any = document;

    if (doc.exitFullscreen) {
      doc.exitFullscreen();
    } else if (doc.webkitExitFullscreen) {
      doc.webkitExitFullscreen();
    } else if (doc.msExitFullscreen) {
      doc.msExitFullscreen();
    } else if (doc.mozCancelFullScreen) {
      doc.mozCancelFullScreen();
    }
  }



// Add method to dismiss warning
dismissKeyboardWarning(): void {
  this.showKeyboardWarning = false;
}
}
