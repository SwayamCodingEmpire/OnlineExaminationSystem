import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
// import { StudentService } from '../../../services/student/student.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { StudentsService } from '../../../services/admin/students/students.service';


@Component({
  selector: 'app-student',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule
  ],
  templateUrl: './student.component.html',
  styleUrl: './student.component.scss'
})
export class StudentComponent {
  popupPosition = { top: 0, left: 0 };
  descriptionForm!: FormGroup;
  originalStudents: any[] = [];
  isDescriptionPopupOpen = false;
  currentPage = 1;
  sortedColumn: string = '';
  isAscending: boolean = true;
  Students: any[] = [];
  searchForm: FormGroup;
  pageSizeForm!: FormGroup;
  StudentForm: FormGroup;
  isAddingNewStudent = false;
  tempNewStudent: any = null;
  editingIndex: number | null = null;
  pageSize = 10;
  deleteModal: any;
  StudentIndexToDelete: number | null = null;
  totalPages = Math.ceil(this.Students.length / this.pageSize);

  ngOnInit(): void {
    console.log('StudentsComponent ngOnInit called');
    this.loadStudents();

    // Initialize search term change detection
    this.searchForm.get('searchTerm')?.valueChanges.subscribe(term => {
      this.filterStudents();
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
  }

    saveStudent(index: number) {
    if (this.StudentForm.valid) {
      const formValue = this.StudentForm.value;
      const updatedStudent = {
        ...formValue
      };

      if (this.isAddingNewStudent && index === 0) {
        // Adding a new Student
        this.studentService.addStudent(updatedStudent).subscribe(() => {
          this.isAddingNewStudent = false;
          this.cancelEdit();
          this.loadStudents(); // Reload all Students from service
        }, (error) => {
          console.error('Error adding Student:', error);
          // Handle error case
          this.loadStudents(); // Reload to restore original state
        });
      } else {
        // Updating an existing Student
        const StudentId = this.Students[index].id;
        this.studentService.updateStudent(updatedStudent).subscribe(() => {
          this.cancelEdit();
          this.loadStudents(); // Reload all Students from service
        }, (error) => {
          console.error('Error updating Student:', error);
          // Handle error case
          this.loadStudents(); // Reload to restore original state
        });
      }
    }
  }


  cancelEdit() {
    if (this.isAddingNewStudent) {
      // Remove the temporary new Student
      this.Students.shift();
      this.isAddingNewStudent = false;
      this.loadStudents(); // Refresh the table
    }

    this.editingIndex = null;
    this.StudentForm.reset();
  }

    closeDescriptionPopup() {
    this.isDescriptionPopupOpen = false;
  }


    constructor(private studentService: StudentsService) {
    this.searchForm = new FormGroup({
      searchTerm: new FormControl('')
    });


    this.StudentForm = new FormGroup({
      code: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      phoneNo: new FormControl('', Validators.required),
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
  //       this.Students[this.editingIndex].description = description;
  //       // Also update the description in the Student form
  //       this.StudentForm.get('description')?.setValue(description);
  //     }
  //   }
  //   const modal = bootstrap.Modal.getInstance(document.getElementById('editDescriptionModal')!);
  //   modal?.hide();
  // }



  sortTable(column: string, ascending: boolean) {
    this.sortedColumn = column;
    this.isAscending = ascending;
    this.Students.sort((a: any, b: any) => {
      const valA = a[column].toString().toLowerCase();
      const valB = b[column].toString().toLowerCase();
      return ascending ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }


  addRow() {
    this.isAddingNewStudent = true;

    // Create a temporary Student object
    this.tempNewStudent = {
      code: "",
      name: "",
      email: "",
      phoneNo: ""
    };

    // Add the temporary Student to the beginning of the array
    this.Students.unshift(this.tempNewStudent);

    // Start editing the new Student
    this.editingIndex = 0;

    // Reset the form with default values
    this.StudentForm.reset({
      code: "",
      name: "",
      email: "",
      phoneNo: ""
    });

    // Make sure we're on the first page to see the new row
    this.currentPage = 1;
    this.initializeTooltips();
  }

  editStudent(index: number) {
    this.editingIndex = index;
    const Student = this.Students[index];

    // Set form values from the selected Student
    this.StudentForm.setValue({
      code: Student.code,
      name: Student.name,
      email: Student.email,
      phoneNo: Student.phoneNo,
    });
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
      // Remove any existing event listeners
      confirmBtn.replaceWith(confirmBtn.cloneNode(true));

      // Add new event listener
      document.getElementById('confirmDeleteBtn')?.addEventListener('click', () => {
        this.confirmDeleteStudent();
      });
    }
  }


  confirmDeleteStudent() {
    if (this.StudentIndexToDelete !== null) {
      const StudentId = this.Students[this.StudentIndexToDelete].code;
      this.studentService.deleteStudent(StudentId).subscribe(() => {
        this.StudentIndexToDelete = null;
        this.deleteModal.hide();
        this.loadStudents(); // Reload Students after deletion
      }, (error: any) => {
        console.error('Error deleting Student:', error);
        this.deleteModal.hide();
        this.loadStudents(); // Reload to restore original state
      });
    }
  }

loadStudents() {
  // this.studentService.getStudents().subscribe((data: any[]) => {
  //   // Sanitize: Ensure every Student has a topics array
  //   this.originalStudents = data.map((Student: { topics: any; topicsString: string; name: string }) => ({
  //     ...Student,
  //     topics: Student.topics && Student.topics.length > 0
  //       ? Student.topics
  //       : Student.topicsString
  //         ? Student.topicsString.split(',').map((t: string) => t.trim())
  //         : this.generateDefaultTopics(Student.name)
  //   }));

  //   this.Students = [...this.originalStudents];

  //   // Restore any search filtering that was applied
  //   if (this.searchForm.get('searchTerm')?.value) {
  //     this.filterStudents();
  //   }

  //   this.totalPages = Math.ceil(this.Students.length / this.pageSize);
  // });

  const data:any[] = [
    {
      code: 'S001',
      name: 'John Doe',
      email: 'John Doe@email.com',
      phoneNo: '1234567890',
    }
  ];

  this.originalStudents = data.map((Student: { topics: any; topicsString: string; name: string }) => ({
      ...Student,
      topics: Student.topics && Student.topics.length > 0
        ? Student.topics
        : Student.topicsString
          ? Student.topicsString.split(',').map((t: string) => t.trim())
          : this.generateDefaultTopics(Student.name)
    }));

    this.Students = [...this.originalStudents];

    // Restore any search filtering that was applied
    if (this.searchForm.get('searchTerm')?.value) {
      this.filterStudents();
    }

    this.totalPages = Math.ceil(this.Students.length / this.pageSize);
}


generateDefaultTopics(StudentName: string): string[] {
  const sampleTopics = [
    ['Basics', 'Overview', 'Introduction'],
    ['Advanced Concepts', 'Optimization', 'Deployment'],
    ['Theory', 'Practice', 'Examples'],
    ['Module 1', 'Module 2', 'Quiz'],
    ['Getting Started', 'Intermediate', 'Expert Tips']
  ];

  // Use a hash to deterministically pick a set based on Student name
  const index = StudentName ? StudentName.length % sampleTopics.length : 0;
  return sampleTopics[index];
}



  filterStudents() {
    this.currentPage = 1;
    const searchTerm = this.searchForm.get('searchTerm')?.value;

    if (!searchTerm || searchTerm.trim() === '') {
      // If search term is empty, show all Students
      this.Students = [...this.originalStudents];
    } else {
      // Filter Students based on search term
      this.Students = this.originalStudents.filter(Student =>
        Student.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        Student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        Student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        Student.phoneNo.toLowerCase().includes(searchTerm.toLowerCase())
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

  openDescriptionPopup(event: MouseEvent, Student: any) {
    this.descriptionForm.get('description')?.setValue(Student.description);
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
    this.totalPages = Math.ceil(this.Students.length / this.pageSize);
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


}
