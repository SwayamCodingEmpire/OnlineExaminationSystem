import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
// import { StudentService } from '../../../services/student/student.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { UserInfo } from '../../../interfaces/admin/student.interface';
import * as XLSX from 'xlsx';
import { StudentService } from '../../../services/admin/students/students.service';


@Component({
  selector: 'app-student',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule
  ],
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.scss']
})
export class StudentComponent implements OnInit {
  popupPosition = { top: 0, left: 0 };
  isDescriptionPopupOpen = false;
  originalStudents: UserInfo[] = [];
  Students: UserInfo[] = [];
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  sortedColumn: string = '';
  isAscending: boolean = true;
  isAddingNewStudent = false;
  tempNewStudent: UserInfo | null = null;
  editingIndex: number | null = null;
  deleteModal: any;
  StudentIndexToDelete: number | null = null;
  searchForm: FormGroup;
  StudentForm: FormGroup;
  pageSizeForm: FormGroup;

    constructor(private studentService: StudentService, private toastr: ToastrService) {
    this.searchForm = new FormGroup({
      searchTerm: new FormControl('')
    });

    this.StudentForm = new FormGroup({
      code: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      phoneNo: new FormControl('', Validators.required),
    });

    this.pageSizeForm = new FormGroup({
      pageSize: new FormControl(10, [Validators.required, Validators.min(1)])
    });
  }

  selectedBulkFile: File | null = null;
  bulkUploadError: string = '';
  bulkUploadSuccess: string = '';
  bulkUsers: UserInfo[] = [];
  bulkUploadModal: any = null;


  openBulkUploadModal() {
    this.bulkUploadError = '';
    this.bulkUploadSuccess = '';
    this.selectedBulkFile = null;
    this.bulkUsers = [];
    setTimeout(() => {
      this.bulkUploadModal = new bootstrap.Modal(document.getElementById('bulkUploadModal')!);
      this.bulkUploadModal.show();
    }, 100);
  }



  onBulkFileSelected(event: any) {
    this.bulkUploadError = '';
    this.bulkUploadSuccess = '';
    this.bulkUsers = [];
    const file = event.target.files[0];
    if (!file) {
      this.selectedBulkFile = null;
      return;
    }
    this.selectedBulkFile = file;

    // Read and parse file
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheet];
      const jsonArr: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      // Map to UserInfo
      this.bulkUsers = jsonArr.map(row => ({
        code: row['code'] || row['Code'],
        name: row['name'] || row['Name'],
        email: row['email'] || row['Email'],
        phoneNo: row['phoneNo'] || row['PhoneNo'] || row['phone'] || row['Phone'],
      }));
    };
    reader.readAsArrayBuffer(file);
    console.log(this.bulkUsers);
  }

  uploadBulkFile() {
    this.bulkUploadError = '';
    this.bulkUploadSuccess = '';
    if (!this.bulkUsers || this.bulkUsers.length === 0) {
      this.toastr.error('No valid records found in the file.');
      return;
    }

    console.log('Uploading students:', this.bulkUsers); // For debugging

    this.studentService.bulkUploadStudents(this.bulkUsers).subscribe({
      next: (res: any) => {
        this.toastr.success('Bulk upload successful!');
        this.bulkUploadModal.hide();
        this.selectedBulkFile = null;
        this.bulkUsers = [];
        this.loadStudents();
      },
      error: (err: any) => {
        // Convert error to string, not object
        if (typeof err?.error === 'object') {
          this.bulkUploadError = JSON.stringify(err.error); // Or use a friendlier message
        } else {
          this.bulkUploadError = (err?.error?.message || err?.error || 'Bulk upload failed.');
        }
        this.toastr.error(this.bulkUploadError);
      }
    });
  }





  ngOnInit(): void {
    this.loadStudents();

    this.searchForm.get('searchTerm')?.valueChanges.subscribe(() => {
      this.filterStudents();
    });

    this.pageSizeForm.get('pageSize')?.valueChanges.subscribe(size => {
      this.pageSize = size;
      this.updatePagination();
    });

    setTimeout(() => {
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
      this.deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal')!);
    }, 500);
  }

  loadStudents() {
    this.studentService.getStudents().subscribe(
      (data: UserInfo[]) => {
        this.originalStudents = data;
        this.Students = [...this.originalStudents];
        if (this.searchForm.get('searchTerm')?.value) {
          this.filterStudents();
        }
        this.calculateTotalPages();
      },
      (error) => {
        console.error('Error loading students:', error);
        this.originalStudents = [];
        this.Students = [];
        this.calculateTotalPages();
      }
    );
  }

  addRow() {
    this.isAddingNewStudent = true;
    this.tempNewStudent = {
      code: '',
      name: '',
      email: '',
      phoneNo: ''
    };
    this.Students.unshift(this.tempNewStudent);
    this.editingIndex = 0;
    this.StudentForm.reset({
      code: '',
      name: '',
      email: '',
      phoneNo: ''
    });
    this.currentPage = 1;
  }

  editStudent(index: number) {
    this.editingIndex = index;
    const student = this.Students[index];
    this.StudentForm.setValue({
      code: student.code,
      name: student.name,
      email: student.email,
      phoneNo: student.phoneNo || '',
    });
  }

  saveStudent(index: number) {
    if (this.StudentForm.valid) {
      const formValue: UserInfo = this.StudentForm.value;

      if (this.isAddingNewStudent && index === 0) {
        this.studentService.addStudent(formValue).subscribe(() => {
          this.isAddingNewStudent = false;
          this.cancelEdit();
          this.loadStudents();
        }, (error: any) => {
          console.error('Error adding student:', error);
          this.loadStudents();
        });
      } else {
        this.studentService.updateStudent(formValue).subscribe(() => {
          this.cancelEdit();
          this.loadStudents();
        }, (error: any) => {
          console.error('Error updating student:', error);
          this.loadStudents();
        });
      }
    }
  }

  cancelEdit() {
    if (this.isAddingNewStudent) {
      this.Students.shift();
      this.isAddingNewStudent = false;
      this.loadStudents();
    }
    this.editingIndex = null;
    this.StudentForm.reset();
  }

  deleteStudent(index: number) {
    this.StudentIndexToDelete = index;
    const StudentCode = this.Students[index].code;
    const StudentName = this.Students[index].name;

    // Set the Student code in the modal
    const StudentCodeElement = document.getElementById('StudentCodeToDelete');
    if (StudentCodeElement) {
      StudentCodeElement.textContent = `${StudentCode}/ ${StudentName}`;
    }

    // Show the modal
    this.deleteModal.show();

    // Add event listener to the confirm button
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    if (confirmBtn) {
      confirmBtn.replaceWith(confirmBtn.cloneNode(true));
      document.getElementById('confirmDeleteBtn')?.addEventListener('click', () => {
        this.confirmDeleteStudent();
      });
    }
  }

  confirmDeleteStudent() {
    if (this.StudentIndexToDelete !== null) {
      const code = this.Students[this.StudentIndexToDelete].code;
      this.studentService.deleteStudent(code).subscribe(() => {
        this.StudentIndexToDelete = null;
        this.deleteModal.hide();
        this.loadStudents();
      }, (error: any) => {
        console.error('Error deleting student:', error);
        this.deleteModal.hide();
        this.loadStudents();
      });
    }
  }

  filterStudents() {
    this.currentPage = 1;
    const searchTerm = this.searchForm.get('searchTerm')?.value || '';
    if (!searchTerm.trim()) {
      this.Students = [...this.originalStudents];
    } else {
      this.Students = this.originalStudents.filter(student =>
        student.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.phoneNo || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    this.calculateTotalPages();
  }

  sortTable(column: string, ascending: boolean) {
    this.sortedColumn = column;
    this.isAscending = ascending;
    this.Students.sort((a: any, b: any) => {
      const valA = (a[column] || '').toString().toLowerCase();
      const valB = (b[column] || '').toString().toLowerCase();
      return ascending ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.Students.length / this.pageSize) || 1;
  }
  goToFirstPage(): void { this.currentPage = 1; }
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
  goToLastPage(): void { this.currentPage = this.totalPages; }
  updatePagination(): void {
    this.calculateTotalPages();
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
  }

  // (Optional) Keep this for tooltips if your template uses them
  initializeTooltips() {
    const existingTooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    existingTooltips.forEach(el => (bootstrap.Tooltip.getInstance(el) as any)?.dispose());
    setTimeout(() => {
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      [...tooltipTriggerList].forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }, 0);
  }

  closeDescriptionPopup() {
    this.isDescriptionPopupOpen = false;
  }

  hideTooltip(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const tooltip = bootstrap.Tooltip.getInstance(target);
    if (tooltip) {
      tooltip.hide();
    }
  }


}
