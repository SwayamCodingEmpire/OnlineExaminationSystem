import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import * as bootstrap from 'bootstrap';
import { ExamsService } from '../../../services/admin/exams/exams.service';
import { ExamPayload } from '../../../models/ExamPayload';
import { ExamQuestionsService } from '../../../services/admin/exam-questions/exam-questions.service';
import { QuestionBankPayload } from '../../../models/QuestionBankPayload';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-exam',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
  ],
  templateUrl: './exam.component.html',
  styleUrl: './exam.component.scss'
})
export class ExamComponent {
  examCreated = false;
  popupPosition = { top: 0, left: 0 };
  descriptionForm!: FormGroup;
  originalexams: any[] = [];
  isDescriptionPopupOpen = false;
  currentPage = 1;
  sortedColumn: string = '';
  isAscending: boolean = true;
  exams: any[] = [];
  searchForm: FormGroup;
  pageSizeForm!: FormGroup;
  examForm: FormGroup;
  isAddingNewexam = false;
  tempNewexam: any = null;
  editingIndex: number | null = null;
  pageSize = 10;
  duration: string = '';
  deleteModal: any;
  examIndexToDelete: number | null = null;
  totalPages = Math.ceil(this.exams.length / this.pageSize);
  fb: FormBuilder = new FormBuilder();
  selectedQuestions: any[] = []; // replace 'Question' with your actual interface
  instantExamForm: FormGroup = this.fb.group({
    examCode: [''],
    examName: [''],
    examDate: [''],
    examTime: [''],
    questions: this.fb.array([])
  });

  examQuestions: any[] = [];
  examSelected: number | null = null;
  oldCode: string = ''; // Store the old code for potential updates
  students: any[] = [];

  examSelectedCode: string = '' // Store the selected exam code for fetching questions




  ngOnInit(): void {
    console.log('examsComponent ngOnInit called');
    this.loadexams();

    // Initialize search term change detection
    this.searchForm.get('searchTerm')?.valueChanges.subscribe(term => {
      this.filterexams();
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
      this.deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal')!);
    }, 500);

    this.selectedQuestions = [
      {
        code: 'Q1',
        topic: 'Math',
        difficulty: 'Easy',
        type: 'MCQ',
        marks: 2,
        questionText: 'What is 2 + 2?',
        options: { A: '3', B: '4', C: '5', D: '6' },
        correctAnswer: 'B'
      },
      {
        code: 'Q2',
        topic: 'English',
        difficulty: 'Medium',
        type: 'Subjective',
        marks: 5,
        questionText: 'Explain the use of passive voice.',
        wordLimit: 100
      }
    ];

  }

  saveExam(index: number) {
    if (this.examForm.valid) {
      const formValue = this.examForm.value;

      // Build ExamDTO structure
      const updatedExam: ExamPayload = {
        code: formValue.code,
        name: formValue.name,
        examDate: formValue.examDate, // assume it's already in 'YYYY-MM-DD' format
        examTime: formValue.examTime  // assume it's 'HH:mm' or 'HH:mm:ss'
      };

      if (this.isAddingNewexam && index === 0) {
        // Adding a new exam
        this.examService.addExam(updatedExam).subscribe({
          next: () => {
            this.isAddingNewexam = false;
            this.cancelEdit();
            this.loadexams(); // Reload all exams from service
          },
          error: (error: any) => {
            console.error('Error adding exam:', error);
            // Optional: show user feedback here
            this.loadexams(); // Reload to restore original state
          }
        });
      }
      else {
        // Updating an existing exam

        this.examService.updateExam(updatedExam, this.oldCode).subscribe(() => {
          this.cancelEdit();
          this.loadexams(); // Reload all exams from service
        }, (error: any) => {
          console.error('Error updating exam:', error);
          // Handle error case
          this.loadexams(); // Reload to restore original state
        });
      }
    }
  }


  cancelEdit() {
    if (this.isAddingNewexam) {
      // Remove the temporary new exam
      this.exams.shift();
      this.isAddingNewexam = false;
      this.loadexams(); // Refresh the table
    }

    this.editingIndex = null;
    this.examForm.reset();
  }

  closeDescriptionPopup() {
    this.isDescriptionPopupOpen = false;
  }


  constructor(private examService: ExamsService, private examQuestionsService: ExamQuestionsService, private toastr: ToastrService) {
    this.searchForm = new FormGroup({
      searchTerm: new FormControl('')
    });


    this.examForm = new FormGroup({
      code: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      examDate: new FormControl('', Validators.required),
      examTime: new FormControl('', Validators.required),
    });

    this.descriptionForm = new FormGroup({
      description: new FormControl('', [Validators.required, Validators.maxLength(40)])
    });

    this.pageSizeForm = new FormGroup({
      pageSize: new FormControl(8, [Validators.required, Validators.min(1)])
    });

  }


  initializeTooltips() {
    // Destroy existing tooltips
    const existingTooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    existingTooltips.forEach(el => bootstrap.Tooltip.getInstance(el)?.dispose());

    // Initialize new tooltips
    setTimeout(() => {
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      [...tooltipTriggerList].forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }, 0);
  }

  //   saveDescription() {
  //   if (this.editingIndex !== null && this.descriptionForm.valid) {
  //     const description = this.descriptionForm.get('description')?.value.trim();
  //     if (description) {
  //       this.exams[this.editingIndex].description = description;
  //       // Also update the description in the exam form
  //       this.examForm.get('description')?.setValue(description);
  //     }
  //   }
  //   const modal = bootstrap.Modal.getInstance(document.getElementById('editDescriptionModal')!);
  //   modal?.hide();
  // }



  sortTable(column: string, ascending: boolean) {
    this.sortedColumn = column;
    this.isAscending = ascending;
    this.exams.sort((a: any, b: any) => {
      const valA = a[column].toString().toLowerCase();
      const valB = b[column].toString().toLowerCase();
      return ascending ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }


  addRow() {
    this.isAddingNewexam = true;

    // Create a temporary exam object
    this.tempNewexam = {
      code: "",
      name: "",
      date: "",
      time: ""
    };

    // Add the temporary exam to the beginning of the array
    this.exams.unshift(this.tempNewexam);

    // Start editing the new exam
    this.editingIndex = 0;

    // Reset the form with default values
    this.examForm.reset({
      code: "",
      name: "",
      examDate: "",
      examTime: ""
    });

    // Make sure we're on the first page to see the new row
    this.currentPage = 1;
    this.initializeTooltips();
  }

  editexam(index: number) {
    this.editingIndex = index;
    const exam = this.exams[index];
    this.oldCode = exam.code; // Store the old code for potential updates

    // Set form values from the selected exam
    this.examForm.setValue({
      code: exam.code,
      name: exam.name,
      examDate: exam.examDate,
      examTime: exam.examDate,
    });
  }



  deleteexam(index: number) {
    this.examIndexToDelete = index;
    const examCode = this.exams[index].code;
    const examName = this.exams[index].name;

    // Set the exam code in the modal
    const examCodeElement = document.getElementById('examCodeToDelete');
    if (examCodeElement) {
      examCodeElement.textContent = `${examCode}/ ${examName}`;
    }

    // Show the modal
    this.deleteModal.show();

    // Add event listener to the confirm button
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    if (confirmBtn) {
      // Remove any existing event listeners
      confirmBtn.replaceWith(confirmBtn.cloneNode(true));

      // Add new event listener
      document.getElementById('confirmDeleteBtn')?.addEventListener('click', () => {
        this.confirmDeleteexam();
      });
    }
  }


  confirmDeleteexam() {
    if (this.examIndexToDelete !== null) {
      const examId = this.exams[this.examIndexToDelete].code;
      this.examService.deleteExam(examId).subscribe(() => {
        this.examIndexToDelete = null;
        this.deleteModal.hide();
        this.loadexams(); // Reload exams after deletion
      }, (error: any) => {
        console.error('Error deleting exam:', error);
        this.deleteModal.hide();
        this.loadexams(); // Reload to restore original state
      });
    }
  }

  // loadexams() {
  // this.examService.getexams().subscribe((data: any[]) => {
  //   // Sanitize: Ensure every exam has a topics array
  //   this.originalexams = data.map((exam: { topics: any; topicsString: string; name: string }) => ({
  //     ...exam,
  //     topics: exam.topics && exam.topics.length > 0
  //       ? exam.topics
  //       : exam.topicsString
  //         ? exam.topicsString.split(',').map((t: string) => t.trim())
  //         : this.generateDefaultTopics(exam.name)
  //   }));

  //   this.exams = [...this.originalexams];

  //   // Restore any search filtering that was applied
  //   if (this.searchForm.get('searchTerm')?.value) {
  //     this.filterexams();
  //   }

  //   this.totalPages = Math.ceil(this.exams.length / this.pageSize);
  // });

  loadexams() {
    this.examService.getExams().subscribe({
      next: (data: any) => {
        this.exams = data;
        this.originalexams = [...this.exams];
        this.calculateTotalPages();
      },
      error: (error: any) => {
        console.error('Error loading exams:', error);
        // Fallback to empty array if API fails
        this.exams = [];
        this.originalexams = [];
        this.calculateTotalPages();
      }
    });
  }




  // const data: any[] = [
  //   {
  //     code: 'S001',
  //     name: 'John Doe',
  //     date: '13/10/2023',
  //     time: '10:00 AM',
  //   }
  // ];




  generateDefaultTopics(examName: string): string[] {
    const sampleTopics = [
      ['Basics', 'Overview', 'Introduction'],
      ['Advanced Concepts', 'Optimization', 'Deployment'],
      ['Theory', 'Practice', 'Examples'],
      ['Module 1', 'Module 2', 'Quiz'],
      ['Getting Started', 'Intermediate', 'Expert Tips']
    ];

    // Use a hash to deterministically pick a set based on exam name
    const index = examName ? examName.length % sampleTopics.length : 0;
    return sampleTopics[index];
  }



  filterexams() {
    this.currentPage = 1;
    const searchTerm = this.searchForm.get('searchTerm')?.value;

    if (!searchTerm || searchTerm.trim() === '') {
      // If search term is empty, show all exams
      this.exams = [...this.originalexams];
    } else {
      // Filter exams based on search term
      this.exams = this.originalexams.filter(exam =>
        exam.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.time.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    this.initializeTooltips();
  }


  hideTooltip(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const tooltip = bootstrap.Tooltip.getInstance(target);
    if (tooltip) {
      tooltip.hide();
    }
  }

  openDescriptionPopup(event: MouseEvent, exam: any) {
    this.descriptionForm.get('description')?.setValue(exam.description);
    this.isDescriptionPopupOpen = true;

    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    const popupWidth = 450; // Match with your .description-popup CSS width

    const shiftLeftBy = 160;
    this.popupPosition = {
      top: rect.bottom + scrollTop + 10, // space below element
      left: rect.left + scrollLeft + rect.width / 2 - popupWidth / 2 - shiftLeftBy // center horizontally
    };
  }

  getRemainingTopics(topics: string[]): string {
    return topics.slice(2)
      .map((topic, index) => `${index + 1}. ${topic}`)
      .join('\n');
  }


  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.exams.length / this.pageSize);
  }

  // Navigate to first page
  goToFirstPage(): void {
    this.currentPage = 1;
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.initializeTooltips();
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.initializeTooltips();
    }
  }


  // Navigate to last page
  goToLastPage(): void {
    this.currentPage = this.totalPages;
  }

  // Update pagination when page size changes
  updatePagination(): void {
    this.calculateTotalPages();
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
    this.initializeTooltips();
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
    if (this.questionForm1.valid) {
      console.log('Form Submitted', this.questionForm1.value);
      // Call your API or emit event here
    }
  }

  get questions(): FormArray {
    return this.instantExamForm.get('questions') as FormArray;
  }

  addQuestion() {
    const questionForm = this.fb.group({
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
      duration: ['']
    });

    this.questions.push(questionForm);
  }

  submitExam() {

    const formValue = this.instantExamForm.value;

    // Build ExamDTO structure
    const updatedExam: ExamPayload = {
      code: formValue.examCode,
      name: formValue.examName,
      examDate: formValue.examDate, // assume it's already in 'YYYY-MM-DD' format
      examTime: formValue.examTime  // assume it's 'HH:mm' or 'HH:mm:ss'
    };

    if (!this.examCreated) {
      this.examService.addExam(updatedExam).subscribe({
        next: () => {
          this.isAddingNewexam = false;
          this.cancelEdit();
          this.loadexams(); // Reload all exams from service
        },
        error: (error: any) => {
          console.error('Error adding exam:', error);
          // Optional: show user feedback here
          this.loadexams(); // Reload to restore original state
        }
      });
      this.examCreated = true;
    } else {
      // Final submission logic here
      const examPayload: QuestionBankPayload[] = this.questions.value.map((q: any) => ({
        code: q.code,
        question: q.questionText,
        options: [q.optionA, q.optionB, q.optionC, q.optionD],
        correctOption: q.correctAnswer,
        marks: Number(q.marks),
        topicCode: 'INSTANT_EXAM', // Assuming a static topic code for instant exams
        duration: Number(q.duration)
      }));
      this.examQuestionsService.addInstantExam(formValue.examCode, examPayload).subscribe({
        next: () => {
          console.log('Questions assigned successfully');
          // Optionally reset the form or show success message
          this.instantExamForm.reset();
          this.questions.clear(); // Clear the questions array
        },
        error: (error: any) => {
          console.error('Error assigning questions:', error);
          // Handle error case
        }
      });


    }
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

deleteQuestion(index: number) {
  console.log('Delete question at index:', index);
  console.log('Exam selected:', this.examSelected);
    if (this.examSelected) {
      const questionCode = this.examQuestions[index].code;
      console.log('Deleting question with code:', questionCode, 'from exam:', this.examSelectedCode);
      this.examQuestionsService.deleteQuestion(this.examSelectedCode, questionCode).subscribe({
        next: () => {
          this.toastr.success('Question deleted successfully');
          this.examQuestions.splice(index, 1);
        },
        error: (err) => {
          this.toastr.error('Failed to delete question');
          console.error(err);
        }
      });
    }
  }


examDetailsClicked(examCode: string) {
    this.examSelectedCode = examCode;
    this.examSelected = this.exams.findIndex(exam => exam.code === examCode);
    console.log('Exam selected:', this.examSelected, 'for code:', examCode);
    this.examQuestionsService.getExamQuestionsByExamCode(examCode).subscribe(
      (questions: any[]) => {
        this.examQuestions = questions;
      },
      (error) => {
        console.error('Error fetching exam questions:', error);
        this.examQuestions = [];
      }
    );
  }


  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index); // Converts 0 → 'A', 1 → 'B', etc.
  }

  studentDetailsClicked(examCode: string) {
    console.log('Exam code clicked:', examCode);
    this.examSelectedCode = examCode;
    this.examQuestionsService.getStudentsByExamCode(examCode).subscribe(
      (students: any[]) => {
        this.students = students;
        console.log('Fetched students:', this.students);
      },
      (error) => {
        console.error('Error fetching students:', error);
        this.students = [];
      }
    );
  }

}
