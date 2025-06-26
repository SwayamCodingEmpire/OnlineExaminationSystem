import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ViewExamService, Exam } from '../../../services/student/viewexam.service';

@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule
  ],
  templateUrl: './exams.component.html',
  styleUrl: './exams.component.scss'
})
export class ExamsComponent implements OnInit {
  exams: any[] = [];
  originalexams: any[] = [];
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  sortedColumn: string = '';
  isAscending: boolean = true;
  editingIndex: number | null = null;
  isAddingNewexam = false;
  tempNewexam: any = null;

  searchForm: FormGroup;
  examForm: FormGroup;
  descriptionForm: FormGroup;
  pageSizeForm: FormGroup;
  deleteModal: any;
  examIndexToDelete: number | null = null;

  constructor(private examService: ViewExamService) {
    this.searchForm = new FormGroup({
      searchTerm: new FormControl('')
    });
    this.examForm = new FormGroup({
      code: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      date: new FormControl('', Validators.required),
      time: new FormControl('', Validators.required)
    });
    this.descriptionForm = new FormGroup({
      description: new FormControl('', [Validators.required, Validators.maxLength(40)])
    });
    this.pageSizeForm = new FormGroup({
      pageSize: new FormControl(10, [Validators.required, Validators.min(1)])
    });
  }

  ngOnInit(): void {
    this.loadexams();
    this.searchForm.get('searchTerm')?.valueChanges.subscribe(() => {
      this.filterexams();
    });
    this.pageSizeForm.get('pageSize')?.valueChanges.subscribe(size => {
      this.pageSize = size;
      this.updatePagination();
    });
    setTimeout(() => {
      // Bootstrap tooltips/modal setup (if needed)
    }, 500);
  }

loadexams() {
  this.examService.getAllExams().subscribe((data: Exam[]) => {
    this.originalexams = data.map((exam: Exam) => ({
      ...exam,
      rawDate: exam.examDate,                             // ISO date string for logic (e.g., "2025-06-25")
      date: this.formatDate(exam.examDate),               // formatted for display (e.g., "25/06/2025")
      time: this.formatTime(exam.examTime)                // formatted for display (e.g., "11:30")
    }));

    this.exams = [...this.originalexams];

    // Apply filtering if user had typed something
    if (this.searchForm.get('searchTerm')?.value) {
      this.filterexams();
    }

    // Calculate total pages for pagination
    this.totalPages = Math.ceil(this.exams.length / this.pageSize);
  });
}

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB');
  }

  formatTime(timeStr: string): string {
    if (!timeStr) return '';
    // For "11:30:00", returns "11:30"
    return timeStr.substring(0, 5);
  }

  filterexams() {
    this.currentPage = 1;
    const searchTerm = this.searchForm.get('searchTerm')?.value;
    if (!searchTerm || searchTerm.trim() === '') {
      this.exams = [...this.originalexams];
    } else {
      this.exams = this.originalexams.filter(exam =>
        (exam.code && exam.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (exam.name && exam.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (exam.date && exam.date.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (exam.time && exam.time.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    this.totalPages = Math.ceil(this.exams.length / this.pageSize);
  }

  sortTable(column: string, ascending: boolean) {
    this.sortedColumn = column;
    this.isAscending = ascending;
    this.exams.sort((a: any, b: any) => {
      const valA = (a[column] || '').toString().toLowerCase();
      const valB = (b[column] || '').toString().toLowerCase();
      return ascending ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }

  // --- Pagination Controls ---
  goToFirstPage(): void { this.currentPage = 1; }
  goToPreviousPage(): void { if (this.currentPage > 1) this.currentPage--; }
  goToNextPage(): void { if (this.currentPage < this.totalPages) this.currentPage++; }
  goToLastPage(): void { this.currentPage = this.totalPages; }
  updatePagination(): void {
    this.totalPages = Math.ceil(this.exams.length / this.pageSize);
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages || 1;
  }

  // Optional: Provide stubs for unused features to avoid errors.
  hideTooltip(event: MouseEvent) {}
  addRow() {}
  editexam(index: number) {}
  deleteexam(index: number) {}
  confirmDeleteexam() {}
  closeDescriptionPopup() {}
  saveExam(index: number) {}
  cancelEdit() {}


  checkDate(rawDateString: string): boolean {
  if (!rawDateString) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize

  const examDate = new Date(rawDateString);
  examDate.setHours(0, 0, 0, 0);

  return examDate >= today;
}
}

