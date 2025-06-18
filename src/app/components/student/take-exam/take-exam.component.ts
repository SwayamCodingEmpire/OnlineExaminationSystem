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
  currentQuestionIndex: number = 0;
  showSectionChangeModal: boolean = false;
  sectionChangeMessage: string = '';

  constructor(private router: Router, private route: ActivatedRoute) {
    this.examId = this.route.snapshot.paramMap.get('id') || '';

    this.sections = [
      {
        title: 'Section 1: General Knowledge',
        duration: 1000,
        questions: [
          { text: 'What is the capital of India?', type: 'mcq', options: ['Delhi', 'Mumbai', 'Kolkata'] },
          { text: 'Explain your view on climate change.', type: 'subjective' },
          { text: 'Which is the longest river in the world?', type: 'mcq', options: ['Amazon', 'Nile', 'Yangtze'] },
          { text: 'Who is known as the Father of the Nation in India?', type: 'mcq', options: ['Jawaharlal Nehru', 'Mahatma Gandhi', 'B. R. Ambedkar'] },
          { text: 'Describe the structure of the Indian Parliament.', type: 'subjective' },
          { text: 'Which country hosted the 2020 Olympics?', type: 'mcq', options: ['China', 'Japan', 'Brazil'] },
          { text: 'Explain the concept of global warming.', type: 'subjective' },
          { text: 'Which is the largest desert in the world?', type: 'mcq', options: ['Sahara', 'Gobi', 'Thar'] },
          { text: 'What is the primary function of the United Nations?', type: 'subjective' },
          { text: 'Who wrote the national anthem of India?', type: 'mcq', options: ['Rabindranath Tagore', 'Bankim Chandra Chatterjee', 'Sarojini Naidu'] },
          { text: 'What is the currency of Japan?', type: 'mcq', options: ['Yen', 'Won', 'Dollar'] },
          { text: 'Explain the process of an election in India.', type: 'subjective' },
          { text: 'Which planet is known as the Red Planet?', type: 'mcq', options: ['Mars', 'Venus', 'Jupiter'] },
          { text: 'What does WHO stand for?', type: 'mcq', options: ['World Health Organization', 'World Human Order', 'World Heritage Organization'] },
          { text: 'What is biodiversity and why is it important?', type: 'subjective' },
          { text: 'Where is the Great Barrier Reef located?', type: 'mcq', options: ['Australia', 'USA', 'South Africa'] },
          { text: 'Who discovered America?', type: 'mcq', options: ['Christopher Columbus', 'Marco Polo', 'Vasco da Gama'] },
          { text: 'Describe the functions of the Indian President.', type: 'subjective' },
          { text: 'What is the tallest mountain in the world?', type: 'mcq', options: ['Mount Everest', 'K2', 'Kanchenjunga'] },
          { text: 'Who invented the telephone?', type: 'mcq', options: ['Alexander Graham Bell', 'Thomas Edison', 'Nikola Tesla'] },
          { text: 'Explain the causes of World War II.', type: 'subjective' },
          { text: 'What is the national flower of India?', type: 'mcq', options: ['Lotus', 'Rose', 'Sunflower'] },
          { text: 'What is the full form of NASA?', type: 'mcq', options: ['National Aeronautics and Space Administration', 'Nuclear Agency for Space Advancement', 'North American Space Authority'] },
          { text: 'Discuss the significance of the Indian Independence Movement.', type: 'subjective' },
          { text: 'Which ocean is the largest?', type: 'mcq', options: ['Pacific', 'Atlantic', 'Indian'] },
          { text: 'Who wrote “Discovery of India”?', type: 'mcq', options: ['Jawaharlal Nehru', 'Sardar Patel', 'Indira Gandhi'] },
          { text: 'What is the importance of clean water in public health?', type: 'subjective' },
          { text: 'Which gas is most abundant in Earth’s atmosphere?', type: 'mcq', options: ['Nitrogen', 'Oxygen', 'Carbon Dioxide'] },
          { text: 'Who painted the Mona Lisa?', type: 'mcq', options: ['Leonardo da Vinci', 'Pablo Picasso', 'Vincent Van Gogh'] },
          { text: 'Discuss the impact of social media on youth.', type: 'subjective' },
        ]
      },
      {
        title: 'Section 2: Math',
        duration: 60,
        questions: [
          { text: '2 + 2 = ?', type: 'mcq', options: ['3', '4', '5'] },
          { text: 'Explain Pythagoras theorem.', type: 'subjective' },
          { text: 'What is the square root of 81?', type: 'mcq', options: ['9', '8', '7'] },
          { text: 'What is 15% of 200?', type: 'mcq', options: ['25', '30', '35'] },
          { text: 'Describe the properties of a triangle.', type: 'subjective' },
          { text: '12 × 8 = ?', type: 'mcq', options: ['96', '88', '108'] },
          { text: 'What is 7 squared?', type: 'mcq', options: ['49', '14', '21'] },
          { text: 'Define prime numbers with examples.', type: 'subjective' },
          { text: 'What is the value of π (pi) approximately?', type: 'mcq', options: ['3.14', '2.71', '1.62'] },
          { text: 'What is 100 ÷ 4?', type: 'mcq', options: ['25', '20', '30'] },
          { text: 'Explain how to solve a linear equation.', type: 'subjective' },
          { text: 'What is 2³?', type: 'mcq', options: ['6', '8', '9'] },
          { text: 'What is 1/2 + 1/4?', type: 'mcq', options: ['3/4', '1/2', '2/3'] },
          { text: 'Define LCM and HCF.', type: 'subjective' },
          { text: 'What is the area of a circle with radius 3?', type: 'mcq', options: ['28.27', '18.85', '9.42'] },
          { text: 'What is 9 × 11?', type: 'mcq', options: ['99', '81', '101'] },
          { text: 'Describe the types of angles.', type: 'subjective' },
          { text: 'What is 144 ÷ 12?', type: 'mcq', options: ['12', '10', '14'] },
          { text: 'How many sides does a hexagon have?', type: 'mcq', options: ['6', '8', '5'] },
          { text: 'Explain Pythagorean triples.', type: 'subjective' },
          { text: 'What is the cube root of 27?', type: 'mcq', options: ['3', '9', '6'] },
          { text: 'Solve for x: 2x + 3 = 7', type: 'mcq', options: ['2', '3', '4'] },
          { text: 'Explain the distributive property of multiplication over addition.', type: 'subjective' },
          { text: 'What is 3/5 × 10?', type: 'mcq', options: ['6', '5', '7'] },
          { text: 'What is the perimeter of a square with side 5?', type: 'mcq', options: ['20', '25', '15'] },
          { text: 'Describe the concept of probability.', type: 'subjective' },
          { text: 'Which number is both a square and a cube?', type: 'mcq', options: ['64', '36', '49'] },
          { text: 'What is 10% of 500?', type: 'mcq', options: ['50', '25', '100'] },
          { text: 'Explain the difference between mean and median.', type: 'subjective' },
          { text: 'What is the sum of the first 10 natural numbers?', type: 'mcq', options: ['55', '45', '65'] },
        ]
      }
    ];

  }

  get currentQuestion() {
    return this.currentSection?.questions?.[this.currentQuestionIndex];
  }

  nextQuestion(question: Question) {
    if (this.currentQuestionIndex < this.currentSection!.questions.length - 1) {
      this.currentQuestionIndex++;
    }
    question.viewed = true;
  }

  prevQuestion(question: Question) {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
    question.viewed = true;
  }

  goToQuestion(question: number, q1: Question) {

    this.currentQuestionIndex = question;
    q1.viewed = true
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
