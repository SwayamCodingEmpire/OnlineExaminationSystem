import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';

interface Question {
  text: string;
  type: 'mcq' | 'subjective';
  options?: string[];
  answer?: string;
  bookmarked?: boolean;
  viewed?: boolean;
  answered?: boolean;
}

interface Section {
  title: string;
  duration: number; // in seconds
  questions: Question[];
}

@Component({
  selector: 'app-take-exam',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgxPaginationModule
  ],
  templateUrl: './take-exam.component.html',
  styleUrls: ['./take-exam.component.scss']
})
export class TakeExamComponent {
  examId: string = '';
  examStarted: boolean = false;
  examSubmitted: boolean = false;

  sections: Section[] = [];
  sectionIndex = 0;
  currentSection: Section | null = null;

  timer!: any;
  timeLeft: number = 0;
  timerDisplay: string = '';

  showSectionChangeModal: boolean = false;
  sectionChangeMessage: string = '';

  constructor(private router: Router, private route: ActivatedRoute) {
    this.examId = this.route.snapshot.paramMap.get('id') || '';

    this.sections = [
      {
        title: 'Section 1: General Knowledge',
        duration: 60,
        questions: [
          { text: 'What is the capital of India?', type: 'mcq', options: ['Delhi', 'Mumbai', 'Kolkata'] },
          { text: 'Explain your view on climate change.', type: 'subjective' },
        ]
      },
      {
        title: 'Section 2: Math',
        duration: 60,
        questions: [
          { text: '2 + 2 = ?', type: 'mcq', options: ['3', '4', '5'] },
          { text: 'Explain Pythagoras theorem.', type: 'subjective' },
        ]
      }
    ];
  }

  startExam() {
    this.examStarted = true;
    this.loadSection(0);
  }

  loadSection(index: number) {
    this.clearTimer();
    this.sectionIndex = index;
    this.currentSection = this.sections[index];

    // Mark all questions as viewed
    this.currentSection.questions.forEach(q => q.viewed = true);

    this.timeLeft = this.currentSection.duration;
    this.startTimer();
  }

  startTimer() {
    this.updateTimerDisplay();
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.updateTimerDisplay();

      if (this.timeLeft <= 0) {
        this.clearTimer();
        this.autoSubmitOrNext();
      }
    }, 1000);
  }

  updateTimerDisplay() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    this.timerDisplay = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }

  clearTimer() {
    if (this.timer) clearInterval(this.timer);
  }

  markAsAnswered(question: Question) {
    question.answered = true;
    question.viewed = true;
  }

  toggleBookmark(question: Question) {
    question.bookmarked = !question.bookmarked;
  }

  getQuestionCardClass(q: Question): string {
    if (q.bookmarked) return 'border-info';
    if (q.answered) return 'border-success';
    if (q.viewed) return 'border-danger';
    return 'border-secondary';
  }

  getGridClass(q: Question): string {
    if (q.bookmarked) return 'bg-info text-white';
    if (q.answered) return 'bg-success text-white';
    if (q.viewed) return 'bg-danger text-white';
    return 'bg-secondary text-white';
  }

  nextSectionOrSubmit() {
    if (this.sectionIndex < this.sections.length - 1) {
      this.showSectionChangeModal = true;
    } else {
      const modal = new (window as any).bootstrap.Modal(document.getElementById('confirmSubmitModal'));
      modal.show();
    }
  }

  confirmNextSection() {
    this.showSectionChangeModal = false;
    this.loadSection(this.sectionIndex + 1);
  }

  autoSubmitOrNext() {
    if (this.sectionIndex < this.sections.length - 1) {
      this.loadSection(this.sectionIndex + 1);
      this.sectionChangeMessage = `Time's up! Moved to ${this.sections[this.sectionIndex].title}`;
      setTimeout(() => {
        this.sectionChangeMessage = '';
      }, 3000);
    } else {
      this.submitExam();
    }
  }

  submitExam() {
    this.examSubmitted = true;
    this.clearTimer();
    this.router.navigate(['/student/results', this.examId]);
  }

  getSectionTabClass(index: number): string {
    return index === this.sectionIndex ? 'fw-bold text-primary' : 'text-muted';
  }
}
