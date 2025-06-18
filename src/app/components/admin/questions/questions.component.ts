import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Form, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import * as bootstrap from 'bootstrap';
import { TopicsService } from '../../../services/admin/topics/topics.service';


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

  constructor( private topicService: TopicsService) {
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

  saveQuestion(index: number) {
    if (this.questionForm.valid) {
      const formValue = this.questionForm.value;
      const updatedQuestion = {
        ...this.questions[index],
        code: formValue.code,
        questionText: formValue.name,
        topic: formValue.category,
        type: formValue.type,
        difficulty: formValue.difficulty
      };

      if (this.isAddingNewQuestion && index === 0) {
        // Adding a new question
        this.questions[0] = updatedQuestion;
        this.originalQuestions = [...this.questions];
        this.isAddingNewQuestion = false;
        this.cancelEdit();
      } else {
        // Updating an existing question
        this.questions[index] = updatedQuestion;
        this.originalQuestions = [...this.questions];
        this.cancelEdit();
      }
    }
  }

  deleteQuestion(index: number) {
    this.questionIndexToDelete = index;
    const question = this.questions[index];

    // Update the modal content
    const questionCodeElement = document.getElementById('questionCodeToDelete');
    if (questionCodeElement) {
      questionCodeElement.textContent = question.code;
    }

    // Show the modal
    if (this.deleteModal) {
      this.deleteModal.show();
    }

    // Set up the confirm delete button click handler
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
      confirmDeleteBtn.onclick = () => this.confirmDeleteQuestion();
    }
  }

  confirmDeleteQuestion() {
    if (this.questionIndexToDelete !== null) {
      // Remove question from array
      this.questions.splice(this.questionIndexToDelete, 1);
      this.originalQuestions = [...this.questions];

      this.deleteModal?.hide();
      this.questionIndexToDelete = null;
      this.calculateTotalPages();
    }
  }

  cancelEdit() {
    if (this.isAddingNewQuestion) {
      // Remove the temporary new question
      this.questions.shift();
      this.isAddingNewQuestion = false;
      this.loadQuestions(); // Refresh the table
    }

    this.editingIndex = null;
    this.questionForm.reset();
  }

  closeDescriptionPopup() {
    this.isDescriptionPopupOpen = false;
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
    // Updated mock data with new structure including marks
    this.questions = [
      {
        id: 1,
        code: 'Q001',
        questionText: 'What is the main concept of Object-Oriented Programming in Java?',
        topic: 'Java',
        type: 'MCQ',
        difficulty: 'Easy',
        marks: 2,
        options: { A: 'Inheritance', B: 'Encapsulation', C: 'Polymorphism', D: 'All of the above' },
        correctAnswer: 'D'
      },
      {
        id: 2,
        code: 'Q002',
        questionText: 'Explain the concept of Dependency Injection in Spring Framework',
        topic: 'Spring',
        type: 'Subjective',
        difficulty: 'Medium',
        marks: 5,
        wordLimit: 200
      },
      {
        id: 3,
        code: 'Q003',
        questionText: 'What are Angular Components and how do they work?',
        topic: 'Angular',
        type: 'MCQ',
        difficulty: 'Hard',
        marks: 3,
        options: { A: 'UI Building Blocks', B: 'Services', C: 'Modules', D: 'Directives' },
        correctAnswer: 'A'
      },
      {
        id: 4,
        code: 'Q004',
        questionText: 'Design a database schema for an e-commerce application',
        topic: 'Database',
        type: 'Subjective',
        difficulty: 'Medium',
        marks: 8,
        wordLimit: 300
      },
      {
        id: 5,
        code: 'Q005',
        questionText: 'What is the time complexity of Quick Sort algorithm?',
        topic: 'Data Structures',
        type: 'MCQ',
        difficulty: 'Hard',
        marks: 4,
        options: { A: 'O(n)', B: 'O(n log n)', C: 'O(n²)', D: 'O(log n)' },
        correctAnswer: 'B'
      }
    ];
    this.originalQuestions = [...this.questions];
    this.calculateTotalPages();
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

}
