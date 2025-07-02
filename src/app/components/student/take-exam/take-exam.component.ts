import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
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
  examCode = '';
  sections: Section[] = [];
  examStarted = false;

  sectionChangeMessage = '';
  showSectionChangeModal = false;

  sectionIndex = 0;
  questionIndex = 0;
  timeLeft = 0;
  timerDisplay = '';
  private timerId?: number;

  private answersMap: Record<string, string> = {};

  isFullscreen = false;
  showFullscreenWarning = false;
  fullscreenCountdown = 15;
  private fullscreenTimer?: any;
  private alreadySubmitted = false;

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
    if (this.fullscreenTimer) clearInterval(this.fullscreenTimer);
    this.showNavbar();
  }

  private buildSections(details: SectionDetailDTO[]): void {
    this.sections = details.map(sec => ({
      title: sec.sectionName,
      duration: sec.duration * 60,
      questions: sec.questions.map(q => ({
        code: q.code,
        text: q.text,
        type: 'subjective',
        options: [q.optionA, q.optionB, q.optionC, q.optionD],
        viewed: false,
        answered: false,
        bookmarked: false,
        answer: ''
      }))
    }));
  }

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

  async startExam(): Promise<void> {
    this.examStarted = true;
    this.loadSection(0);
    await this.goFullscreenAndHideNavbar();
  }

  private loadSection(idx: number): void {
    if (this.timerId != null) clearInterval(this.timerId);
    this.sectionIndex = idx;
    this.questionIndex = 0;
    this.startTimer(this.currentSection.duration);
  }

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
    return String.fromCharCode(65 + idx);
  }

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

  // ---------- FULLSCREEN AND NAVBAR ----------
  async goFullscreenAndHideNavbar() {
    await this.enterFullscreen();
    this.hideNavbar();
  }

  async enterFullscreen() {
    const elem = document.documentElement as any;
    if (elem.requestFullscreen) {
      await elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
    this.isFullscreen = true;
    this.showFullscreenWarning = false;
    if (this.fullscreenTimer) clearInterval(this.fullscreenTimer);
    setTimeout(() => this.hideNavbar(), 100);
  }

  async exitFullscreen() {
    if (document.fullscreenElement) {
      await (document as any).exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
    this.isFullscreen = false;
    this.showFullscreenWarning = false;
    if (this.fullscreenTimer) clearInterval(this.fullscreenTimer);
    this.showNavbar();
  }

  hideNavbar() {
    setTimeout(() => {
      const nav = document.getElementById('navbar');
      if (nav) nav.style.display = 'none';
      const navbars = document.getElementsByClassName('navbar');
      Array.from(navbars).forEach((el: any) => el.style.display = 'none');
    }, 0);
  }

  showNavbar() {
    setTimeout(() => {
      const nav = document.getElementById('navbar');
      if (nav) nav.style.display = '';
      const navbars = document.getElementsByClassName('navbar');
      Array.from(navbars).forEach((el: any) => el.style.display = '');
    }, 0);
  }

  // ----- ESC/EXIT FULLSCREEN HANDLING -----
  @HostListener('document:fullscreenchange', [])
  onFullScreenChange() {
    if (!document.fullscreenElement && this.examStarted) {
      this.triggerFullscreenWarning();
      this.showNavbar();
    } else if (document.fullscreenElement && this.examStarted) {
      this.cancelFullscreenWarning();
      this.hideNavbar();
    }
  }

  @HostListener('document:keydown.escape', [])
  onEscKey() {
    if (this.examStarted && this.isFullscreen && !this.showFullscreenWarning) {
      this.triggerFullscreenWarning();
      this.showNavbar();
    }
  }

  // ----- DOUBLE CLICK RECOVERY (WINDOWS/DESKTOP ONLY) -----
  @HostListener('document:dblclick', ['$event'])
  onDoubleClick(event: MouseEvent) {
    if (this.showFullscreenWarning) {
      this.recoverFromWarning();
    }
  }

  // Recovery logic: called after double click on warning
  private async recoverFromWarning() {
    await this.goFullscreenAndHideNavbar();
    this.cancelFullscreenWarning();
  }

  triggerFullscreenWarning() {
    this.isFullscreen = false;
    this.showFullscreenWarning = true;
    this.fullscreenCountdown = 15;
    if (this.fullscreenTimer) clearInterval(this.fullscreenTimer);
    this.fullscreenTimer = setInterval(() => {
      this.fullscreenCountdown--;
      if (this.fullscreenCountdown <= 0) {
        clearInterval(this.fullscreenTimer);
        this.autoSubmitExam();
      }
    }, 1000);
  }

  cancelFullscreenWarning() {
    this.isFullscreen = true;
    this.showFullscreenWarning = false;
    if (this.fullscreenTimer) clearInterval(this.fullscreenTimer);
    this.hideNavbar();
  }

  autoSubmitExam() {
    this.submitExam();
  }

  // ---------- SUBMISSION ----------
  async submitExam(): Promise<void> {
  if (this.alreadySubmitted) return;
  this.alreadySubmitted = true; // Lock immediately
  if (this.timerId != null) clearInterval(this.timerId);
  if (this.fullscreenTimer) clearInterval(this.fullscreenTimer);
  await this.exitFullscreen();
  this.showNavbar();

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
    .subscribe({
      next: () => {
        // Success: Always navigate to result
        this.router.navigate(['/student/results', this.examCode]);
      },
      error: (err) => {
        // Failure: Still navigate to result so user is not stuck
        console.error('Submission failed but navigating anyway:', err);
        this.router.navigate(['/student/results', this.examCode]);
      }
    });
}
}
