import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Form, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import * as bootstrap from 'bootstrap';
import * as XLSX from 'xlsx';
import { QuestionBankService } from '../../../services/admin/questionbank/question-bank.service';
import { TopicsService } from '../../../services/admin/topics/topics.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { TopicComponent } from "../topics/topics/topics.component";


@Component({
  selector: 'app-question-bank',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
    ToastrModule,
    TopicComponent
],
  templateUrl: './question-bank.component.html',
  styleUrl: './question-bank.component.scss'
})
export class QuestionBankComponent {
  selectedTopic: string = '';
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
  editQuestionModal: any;
  questionIndexToDelete: number | null = null;
  totalPages = Math.ceil(this.questions.length / this.pageSize);
  selectedTopicFilter: string = '';
  currentQuestionType: string = 'MCQ';
  selectedQuestion: any = null;
  questionDetailsModal: any;
  fb: FormBuilder = new FormBuilder();
  topics: any;
  // For bulk upload
  selectedBulkFile: File | null = null;
  bulkQuestions: any[] = [];
  bulkUploadModal: any = null;
  bulkUploadTopicCode: string = '';

onTopicSelect(code: string) {
  this.selectedTopicFilter = code;
  this.filterByTopic();
}

  constructor(
    private questionService: QuestionBankService,
    private topicService: TopicsService,
    private toastr: ToastrService,
    ) {
    this.searchForm = new FormGroup({
      searchTerm: new FormControl('')
    });

    this.questionForm = new FormGroup({
      code: new FormControl('', Validators.required),
      question: new FormControl('', Validators.required),
      topicCode: new FormControl('', Validators.required),
      type: new FormControl('', Validators.required),
      difficulty: new FormControl('', Validators.required),
    });

    // MCQ Form
    this.mcqForm = new FormGroup({
      code: new FormControl('', Validators.required),
      topicCode: new FormControl('', Validators.required),
      question: new FormControl('', Validators.required),
      option0: new FormControl('', Validators.required),
      option1: new FormControl('', Validators.required),
      option2: new FormControl('', Validators.required),
      option3: new FormControl('', Validators.required),
      correctOption: new FormControl('', Validators.required),
      difficulty: new FormControl('', Validators.required),
      marks: new FormControl('', [Validators.required, Validators.min(1)])
    });

    // Subjective Form
    this.subjectiveForm = new FormGroup({
      code: new FormControl('', Validators.required),
      topicCode: new FormControl('', Validators.required),
      question: new FormControl('', Validators.required),
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

      const editModalElement = document.getElementById('editQuestionModal');
      if (editModalElement) {
        this.editQuestionModal = new bootstrap.Modal(editModalElement);
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

      // Initialize bulk upload modal
      const bulkUploadModalElement = document.getElementById('bulkUploadModal');
      if (bulkUploadModalElement) {
        this.bulkUploadModal = new bootstrap.Modal(bulkUploadModalElement);
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
      console.log('Selected question for details:', question);

    }
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
          question: formValue.question,
          topicCode: formValue.topicCode,
          type: 'MCQ',
          difficulty: formValue.difficulty,
          marks: formValue.marks,
          options: [
            formValue.option0,
            formValue.option1,
            formValue.option2,
            formValue.option3
          ],
          correctOption: formValue.correctOption,
          enabled: true,
          comments: ''
        };
      }
    } else {
      formToValidate = this.subjectiveForm;
      if (formToValidate.valid) {
        const formValue = formToValidate.value;
        questionData = {
          id: this.questions.length + 1,
          code: formValue.code,
          question: formValue.question,
          topicCode: formValue.topicCode,
          type: 'Subjective',
          difficulty: formValue.difficulty,
          marks: formValue.marks,
          wordLimit: formValue.wordLimit,
          enabled: true,
          comments: ''
        };
      }
    }

    if (formToValidate.valid && questionData) {
      // Call API to add question
      this.questionService.addQuestion(questionData).subscribe({
        next: (response) => {
          console.log('Question created successfully:', response);

          // Reload questions from API to get updated list
          this.loadQuestions();

          // Reset forms
          this.mcqForm.reset();
          this.subjectiveForm.reset();

          // Close modal
          if (this.addQuestionModal) {
            this.addQuestionModal.hide();
          }
        },
        error: (error) => {
          console.error('Error creating question:', error);

        }
      });
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

  openBulkUploadModal() {
    this.selectedBulkFile = null;
    this.bulkQuestions = [];
    if (this.bulkUploadModal) {
      this.bulkUploadModal.show();
    }
  }

  onBulkFileSelected(event: any, topicCode: string) {
    const file = event.target.files[0];
    if (!file) {
      this.selectedBulkFile = null;
      return;
    }
    this.selectedBulkFile = file;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheet];
        const jsonArr: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        this.bulkUploadTopicCode = topicCode;
        this.bulkQuestions = jsonArr.map(row => ({
          code: row['code'],
          question: row['question'],
          topicCode: row['topicCode'],
          difficulty: row['difficulty'],
          marks: row['marks'],
          options: [
            row['optionA'],
            row['optionB'],
            row['optionC'],
            row['optionD']
          ],
          correctOption: row['correctOption'],
          type: 'MCQ',
        }));
      } catch (error) {
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  uploadBulkFile() {
    if (!this.bulkQuestions || this.bulkQuestions.length === 0) {
      this.toastr.error('No valid question records found in the file.');
      return;
    }

    this.questionService.bulkUploadQuestions(this.bulkQuestions, this.bulkUploadTopicCode).subscribe({
      next: (res: any) => {
        this.toastr.success('Bulk upload successful!');
        this.bulkUploadModal.hide();
        this.selectedBulkFile = null;
        this.bulkQuestions = [];
        this.loadQuestions();
      },
      error: (err: any) => {
        const errorMessage = err?.error?.message || err?.error || 'Bulk upload failed.';
        this.toastr.error(errorMessage);
      }
    });
  }

  filterByTopic() {
    if (this.selectedTopicFilter === '') {
      this.questions = [...this.originalQuestions];
    } else {
      this.questions = this.originalQuestions.filter(question =>
        question.topicCode === this.selectedTopicFilter
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

    if(this.originalQuestions.length === 0) {
      this.originalQuestions.length
    }
    if (this.isAddingNewQuestion) {
      return;
    }
    this.tempNewQuestion = {
      code: '',
      question: '',
      topicCode: '',
      type: '',
      difficulty: '',
      isNew: true
    };
    this.isAddingNewQuestion = true;
    this.editingIndex = -1;
  }

  editQuestion(question: any) {
    console.log('Editing question:', question);
    this.selectedQuestion = { ...question };
    this.questionForm1.patchValue(this.selectedQuestion);
    if (this.selectedQuestion.type === 'MCQ' && this.selectedQuestion.options) {
      console.log('Populating MCQ options:', this.selectedQuestion.options);
      this.questionForm1.get('option0')?.setValue(this.selectedQuestion.options[0]);
      this.questionForm1.get('option1')?.setValue(this.selectedQuestion.options[1]);
      this.questionForm1.get('option2')?.setValue(this.selectedQuestion.options[2]);
      this.questionForm1.get('option3')?.setValue(this.selectedQuestion.options[3]);
    }
    this.editQuestionModal.show();
  }

  onUpdate() {
    if (this.questionForm1.valid) {
      const updatedQuestion = { ...this.selectedQuestion, ...this.questionForm1.value };
      if (updatedQuestion.type === 'MCQ') {
        updatedQuestion.options = [
          this.questionForm1.value.option0,
          this.questionForm1.value.option1,
          this.questionForm1.value.option2,
          this.questionForm1.value.option3
        ];
      }
      this.questionService.updateQuestion(updatedQuestion).subscribe({
        next: () => {
          this.toastr.success('Question updated successfully');
          this.editQuestionModal.hide();
          this.loadQuestions();
        },
        error: (err) => {
          this.toastr.error('Failed to update question');
          console.error(err);
        }
      });
    }
  }

  deleteQuestion(index: number) {
    this.questionIndexToDelete = index;
    const questionToDelete = this.questions[index];
    const modalElement = document.getElementById('deleteConfirmationModal');
    const questionCodeElement = document.getElementById('questionCodeToDelete');
    if (modalElement && questionCodeElement) {
      questionCodeElement.textContent = questionToDelete.code;
      this.deleteModal.show();
    }
  }

  confirmDeleteQuestion() {
    if (this.questionIndexToDelete !== null) {
      const questionToDelete = this.questions[this.questionIndexToDelete];
      const questionCodeToDelete = questionToDelete.code;
      this.questionService.deleteQuestion(questionCodeToDelete).subscribe({
        next: (response) => {
          this.toastr.success('Question deleted successfully!');

          const indexInOriginal = this.originalQuestions.findIndex(q => q.code === questionCodeToDelete);
          if (indexInOriginal !== -1) {
            this.originalQuestions.splice(indexInOriginal, 1);
          }

          const indexInCurrent = this.questions.findIndex(q => q.code === questionCodeToDelete);
          if (indexInCurrent !== -1) {
            this.questions.splice(indexInCurrent, 1);
          }

          this.filterQuestions();

          this.questionIndexToDelete = null;
          this.deleteModal.hide();
        },
        error: (error) => {
          console.error('Error deleting question:', error);
          this.toastr.error('Error deleting question. Please try again.');
          this.questionIndexToDelete = null;
          this.deleteModal.hide();
        }
      });
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
        valA = a.question?.toString().toLowerCase() || '';
        valB = b.question?.toString().toLowerCase() || '';
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
    this.questionService.getQuestions().subscribe({
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
        question.topicCode === this.selectedTopicFilter
      );
    }

    // Then apply search filter
    if (searchTerm.trim() !== '') {
      filteredQuestions = filteredQuestions.filter(question =>
        question.code.toLowerCase().includes(searchTerm) ||
        question.question.toLowerCase().includes(searchTerm)
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

  getTopicName(topicCode: string): string {
    const topic = this.topics?.find((t: any) => t.code === topicCode);
    return topic ? topic.name : topicCode;
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
  id: [null],
  code: ['', Validators.required],
  question: ['', Validators.required],
  topicCode: ['', Validators.required],
  type: ['MCQ', Validators.required],
  difficulty: ['', Validators.required],
  marks: [0, [Validators.required, Validators.min(1)]],
  options: this.fb.array([]),
  option0: ['', Validators.required],
  option1: ['', Validators.required],
  option2: ['', Validators.required],
  option3: ['', Validators.required],
  correctOption: ['', Validators.required],
  wordLimit: [null]
});

onSubmit() {
  if (this.questionForm1.invalid) {
    this.toastr.error('Please fill all the required fields');
    return;
  }

  const questionData = this.questionForm1.value;
  if (questionData.type === 'MCQ') {
    questionData.options = [
      questionData.option0,
      questionData.option1,
      questionData.option2,
      questionData.option3
    ];
  }

  this.questionService.addQuestion(questionData).subscribe({
    next: (res) => {
      this.toastr.success('Question added successfully');
      this.addQuestionModal.hide();
      this.loadQuestions();
      this.questionForm1.reset({
        type: 'MCQ'
      });
    },
    error: (err) => {
      this.toastr.error('Failed to add question');
      console.error(err);
    }
  });
}

}
