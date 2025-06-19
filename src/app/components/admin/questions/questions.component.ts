import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Form, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import * as bootstrap from 'bootstrap';
import { TopicsService } from '../../../services/admin/topics/topics.service';
import { ExamQuestionsService } from '../../../services/admin/exam-questions/exam-questions.service';
import { QuestionBankService } from '../../../services/admin/questionbank/question-bank.service';
import { SectionPayload } from '../../../models/SectionPayload';


@Component({
  selector: 'app-questions',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule
  ],
  templateUrl: './questions.component.html',
  styleUrl: './questions.component.scss'
})
export class QuestionsComponent {


  popupPosition = { top: 0, left: 0 };
  descriptionForm!: FormGroup;
  originalQuestions: any[] = [];
  isDescriptionPopupOpen = false;
  currentPage = 1;
  sortedColumn: string = '';
  isAscending: boolean = true;
  questions: any[] = [];
  searchForm: FormGroup;
  pageSizeForm!: FormGroup;
  questionForm: FormGroup;
  mcqForm: FormGroup;
  subjectiveForm: FormGroup;
  isAddingNewQuestion = false;
  tempNewQuestion: any = null;
  editingIndex: number | null = null;
  pageSize = 10;
  deleteModal: any;
  addQuestionModal: any;
  questionIndexToDelete: number | null = null;
  totalPages = Math.ceil(this.questions.length / this.pageSize);
  selectedTopicFilter: string = '';
  currentQuestionType: string = 'MCQ';
  selectedQuestion: any = null;
  fb: FormBuilder = new FormBuilder();
  questionDetailsModal: any;
  topics: any;
  selectedQuestions: boolean[] = [];
  readonly selectedCodes = new Set<String>();
  modalStep: 'confirm' | 'duration' = 'confirm';
  groupedQuestions: Record<string, any[]> = {};
  sectionKeys: string[] = [];
  sectionDurations: Record<string, number> = {};
  modalInstance: any;
  examCode: string = '';

  constructor( private topicService: TopicsService, private questionService: ExamQuestionsService, private route: ActivatedRoute, private questionBankService: QuestionBankService) {
    this.searchForm = new FormGroup({
      searchTerm: new FormControl('')
    });

    this.questionForm = new FormGroup({
      code: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      category: new FormControl('', Validators.required),
      type: new FormControl('', Validators.required),
      difficulty: new FormControl('', Validators.required),
    });

    // MCQ Form
    this.mcqForm = new FormGroup({
      code: new FormControl('', Validators.required),
      topic: new FormControl('', Validators.required),
      questionText: new FormControl('', Validators.required),
      optionA: new FormControl('', Validators.required),
      optionB: new FormControl('', Validators.required),
      optionC: new FormControl('', Validators.required),
      optionD: new FormControl('', Validators.required),
      correctAnswer: new FormControl('', Validators.required),
      difficulty: new FormControl('', Validators.required),
      marks: new FormControl('', [Validators.required, Validators.min(1)])
    });

    // Subjective Form
    this.subjectiveForm = new FormGroup({
      code: new FormControl('', Validators.required),
      topic: new FormControl('', Validators.required),
      questionText: new FormControl('', Validators.required),
      wordLimit: new FormControl('', [Validators.required, Validators.min(1)]),
      difficulty: new FormControl('', Validators.required),
      marks: new FormControl('', [Validators.required, Validators.min(1)])
    });

    this.descriptionForm = new FormGroup({
      description: new FormControl('', [Validators.required, Validators.maxLength(40)])
    });

    this.pageSizeForm = new FormGroup({
      pageSize: new FormControl(10, [Validators.required, Validators.min(1)])
    });
  }

  ngOnInit(): void {
    console.log('QuestionBankComponent ngOnInit called');
    this.examCode = this.route.snapshot.paramMap.get('code') || '';
    console.log('Exam Code:', this.examCode);
    this.loadQuestions();
    this.topicService.getTopics().subscribe((data) => {
      this.topics = data;
    });
    // Initialize search term change detection
    this.searchForm.get('searchTerm')?.valueChanges.subscribe(term => {
      this.filterQuestions();
    });

    // Initialize page size change detection
    this.pageSizeForm.get('pageSize')?.valueChanges.subscribe(size => {
      this.pageSize = size;
    });

    // Initialize Bootstrap tooltips and modal
    setTimeout(() => {
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

      // Initialize the delete modal
      const modalElement = document.getElementById('deleteConfirmationModal');
      if (modalElement) {
        this.deleteModal = new bootstrap.Modal(modalElement);
      }

      // Initialize add question modal
      const addModalElement = document.getElementById('addQuestionModal');
      if (addModalElement) {
        this.addQuestionModal = new bootstrap.Modal(addModalElement);
      }

      // Initialize question details modal
      const detailsModalElement = document.getElementById('questionDetailsModal');
      if (detailsModalElement) {
        this.questionDetailsModal = new bootstrap.Modal(detailsModalElement);
      }
    }, 500);
  }

  getSelectedCodesArray(): String[] {
    return Array.from(this.selectedCodes);
  }

  setQuestionType(type: string) {
    this.currentQuestionType = type;
  }

  showQuestionDetails(question: any) {
    this.selectedQuestion = question;
    if (this.questionDetailsModal) {
      this.questionDetailsModal.show();
    }
  }

  getTopicName(topicCode: string): string {
    const topic = this.topics?.find((t: any) => t.code === topicCode);
    console.log('getTopicName called with:', topicCode, 'found:', topic);
    if (!topicCode) {
      return 'No Topic';
    }
    return topic ? topic.name : topicCode;
  }

  createQuestion() {
    let formToValidate: FormGroup;
    let questionData: any;

    if (this.currentQuestionType === 'MCQ') {
      formToValidate = this.mcqForm;
      if (formToValidate.valid) {
        const formValue = formToValidate.value;
        questionData = {
          id: this.questions.length + 1,
          code: formValue.code,
          questionText: formValue.questionText,
          topic: formValue.topic,
          type: 'MCQ',
          difficulty: formValue.difficulty,
          marks: formValue.marks,
          options: {
            A: formValue.optionA,
            B: formValue.optionB,
            C: formValue.optionC,
            D: formValue.optionD
          },
          correctAnswer: formValue.correctAnswer
        };
      }
    } else {
      formToValidate = this.subjectiveForm;
      if (formToValidate.valid) {
        const formValue = formToValidate.value;
        questionData = {
          id: this.questions.length + 1,
          code: formValue.code,
          questionText: formValue.questionText,
          topic: formValue.topic,
          type: 'Subjective',
          difficulty: formValue.difficulty,
          marks: formValue.marks,
          wordLimit: formValue.wordLimit
        };
      }
    }

    if (formToValidate.valid && questionData) {
      // Add question to the list
      this.questions.unshift(questionData);
      this.originalQuestions = [...this.questions];

      // Reset forms
      this.mcqForm.reset();
      this.subjectiveForm.reset();

      // Close modal
      if (this.addQuestionModal) {
        this.addQuestionModal.hide();
      }

      // Recalculate pagination
      this.calculateTotalPages();

      console.log('Question created:', questionData);
    } else {
      console.log('Form is invalid');
      // Mark all fields as touched to show validation errors
      Object.keys(formToValidate.controls).forEach(key => {
        formToValidate.get(key)?.markAsTouched();
      });
    }
  }

  bulkUpload() {
    console.log('Bulk upload functionality to be implemented');
    // Implement bulk upload functionality here
  }

  filterByTopic() {
    if (this.selectedTopicFilter === '') {
      this.questions = [...this.originalQuestions];
    } else {
      this.questions = this.originalQuestions.filter(question =>
        question.topic === this.selectedTopicFilter
      );
    }
    this.currentPage = 1;
    this.calculateTotalPages();

    // Also apply search filter if exists
    const searchTerm = this.searchForm.get('searchTerm')?.value;
    if (searchTerm && searchTerm.trim() !== '') {
      this.filterQuestions();
    }
  }

  addRow() {
    this.isAddingNewQuestion = true;

    // Create a temporary question object
    this.tempNewQuestion = {
      code: "",
      name: "",
      category: "",
      type: "",
      difficulty: ""
    };

    // Add the temporary question to the beginning of the array
    this.questions.unshift(this.tempNewQuestion);

    // Start editing the new question
    this.editingIndex = 0;

    // Reset the form with default values
    this.questionForm.reset({
      code: "",
      name: "",
      category: "",
      type: "",
      difficulty: ""
    });

    // Recalculate pagination
    this.calculateTotalPages();
  }

  editQuestion(index: number) {
    this.editingIndex = index;
    const question = this.questions[index];

    this.questionForm.patchValue({
      code: question.code,
      name: question.questionText,
      category: question.topic,
      type: question.type,
      difficulty: question.difficulty
    });
  }



  sortTable(column: string, ascending: boolean) {
    this.sortedColumn = column;
    this.isAscending = ascending;

    this.questions.sort((a: any, b: any) => {
      let valA: string;
      let valB: string;

      // Handle different column mappings
      if (column === 'name') {
        valA = a.questionText?.toString().toLowerCase() || '';
        valB = b.questionText?.toString().toLowerCase() || '';
      } else if (column === 'code') {
        valA = a.code?.toString().toLowerCase() || '';
        valB = b.code?.toString().toLowerCase() || '';
      } else {
        valA = a[column]?.toString().toLowerCase() || '';
        valB = b[column]?.toString().toLowerCase() || '';
      }

      return ascending ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }

  loadQuestions() {
    this.questionBankService.getQuestions().subscribe({
      next: (data) => {
        this.questions = data;
        this.originalQuestions = [...this.questions];
        this.calculateTotalPages();
      },
      error: (error) => {
        console.error('Error loading questions:', error);
        // Fallback to empty array if API fails
        this.questions = [];
        this.originalQuestions = [];
        this.calculateTotalPages();
      }
    });
  }

  filterQuestions() {
    const searchTerm = this.searchForm.get('searchTerm')?.value?.toLowerCase() || '';

    let filteredQuestions = [...this.originalQuestions];

    // Apply topic filter first
    if (this.selectedTopicFilter) {
      filteredQuestions = filteredQuestions.filter(question =>
        question.topic === this.selectedTopicFilter
      );
    }

    // Then apply search filter
    if (searchTerm.trim() !== '') {
      filteredQuestions = filteredQuestions.filter(question =>
        question.code.toLowerCase().includes(searchTerm) ||
        question.questionText.toLowerCase().includes(searchTerm) ||
        question.topic.toLowerCase().includes(searchTerm) ||
        question.type.toLowerCase().includes(searchTerm) ||
        question.difficulty.toLowerCase().includes(searchTerm)
      );
    }

    this.questions = filteredQuestions;
    this.currentPage = 1;
    this.calculateTotalPages();
  }

  hideTooltip(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const tooltip = bootstrap.Tooltip.getInstance(target);
    if (tooltip) {
      tooltip.hide();
    }
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.questions.length / this.pageSize);
  }

  goToFirstPage(): void {
    this.currentPage = 1;
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToLastPage(): void {
    this.currentPage = this.totalPages;
  }

  updatePagination(): void {
    this.calculateTotalPages();
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
  }

questionForm1 = this.fb.group({
  code: [''],
  topic: [''],
  difficulty: [''],
  type: ['MCQ'],
  marks: [1],
  questionText: [''],
  optionA: [''],
  optionB: [''],
  optionC: [''],
  optionD: [''],
  correctAnswer: [''],
  wordLimit: [null]
});

onSubmit() {
  if (this.questionForm.valid) {
    console.log('Form Submitted', this.questionForm.value);
    // Call your API or emit event here
  }
}

addQuestion(){
  console.log(this.selectedQuestions);
}

  isSelected(code: String) {
    return this.selectedCodes.has(code);
  }

toggle(code: string, event: Event) {
  const input = event.target as HTMLInputElement;
  const checked = input.checked;

  // Do something with `checked`
  if (checked) {
    this.selectedCodes.add(code);
  } else {
    this.selectedCodes.delete(code);
  }
}

confirmAssign() {
  console.log('Selected Codes:', Array.from(this.selectedCodes));

    this.questionService.assignQuestionsToExam("EXAM001", Array.from(this.selectedCodes))
      .subscribe({
        next: (response) => {
          this.prepareSectionDurations();
          this.modalStep = 'duration';
        },
        error: (err) => {
          console.error('Assignment failed', err);
          this.modalInstance.hide();
        }
      });
  }
prepareSectionDurations() {
    this.groupedQuestions = this.questions.reduce((acc, q) => {
      acc[q.topicCode] = acc[q.topicCode] || [];  // Fixed: use topicCode consistently
      acc[q.topicCode].push(q);
      return acc;
    }, {} as Record<string, any[]>);

    this.sectionKeys = Object.keys(this.groupedQuestions);
    this.sectionDurations = this.sectionKeys.reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {} as Record<string, number>);
}


  submitDurations() {
  const sectionPayloads: SectionPayload[] = this.sectionKeys.map(section => {
    const topicQuestions = this.groupedQuestions[section];
    const totalMarks = topicQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);

    return {
      topicCode: section,
      duration: this.sectionDurations[section],
      totalMarks: totalMarks
    };
  });

  this.questionService.addSectionsToExam(this.examCode, sectionPayloads)
    .subscribe({
      next: (response) => {
        // Handle success
        console.log('Sections assigned successfully');
        // Close modal or show success message
      },
      error: (error) => {
        console.error('Error assigning sections:', error);
        // Handle error
      }
    });
}
openAssignModal() {
  this.modalStep = 'confirm';
  const el = document.getElementById('assignModal');
  if (el) {
    this.modalInstance = new bootstrap.Modal(el);
    this.modalInstance.show();
  } else {
    console.error('Modal element not found!');
  }
}


}
