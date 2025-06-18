import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import * as bootstrap from 'bootstrap';
import { StudentService } from '../../../services/student/student.service';

interface Topic {
  code: string;
  name: string;
  description: string;
  isActive: boolean;
}

@Component({
  selector: 'app-topic',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule
  ],
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.scss']
})
export class TopicComponent {
  popupPosition = { top: 0, left: 0 };
  descriptionForm!: FormGroup;
  originalTopics: Topic[] = [];
  isDescriptionPopupOpen = false;
  currentPage = 1;
  sortedColumn: string = '';
  isAscending: boolean = true;
  topics: Topic[] = [];
  searchForm: FormGroup;
  pageSizeForm!: FormGroup;
  topicForm: FormGroup;
  isAddingNewTopic = false;
  tempNewTopic: Topic | null = null;
  editingIndex: number | null = null;
  pageSize = 10;
  deleteModal: any;
  topicIndexToDelete: number | null = null;
  totalPages = 1;

  constructor(
    private studentService: StudentService,
    private fb: FormBuilder
  ) {
    this.searchForm = new FormGroup({
      searchTerm: new FormControl('')
    });

    this.topicForm = new FormGroup({
      code: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      description: new FormControl(''),
      isActive: new FormControl(true)
    });

    this.descriptionForm = new FormGroup({
      description: new FormControl('', [Validators.required, Validators.maxLength(40)])
    });

    this.pageSizeForm = new FormGroup({
      pageSize: new FormControl(10, [Validators.required, Validators.min(1)])
    });
  }

  ngOnInit(): void {
    this.loadTopics();

    this.searchForm.get('searchTerm')?.valueChanges.subscribe(term => {
      this.filterTopics();
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

  loadTopics(): void {
    // Replace with actual service call
    this.topics = [
      { code: '1', name: 'Java', description: 'Java programming language', isActive: true },
      { code: '2', name: 'Angular', description: 'Angular framework', isActive: true },
      { code: '3', name: 'Spring', description: 'Spring framework', isActive: false }
    ];
    this.originalTopics = [...this.topics];
    this.calculateTotalPages();
  }

  addRow(): void {
    this.isAddingNewTopic = true;
    this.tempNewTopic = {
      code: '',
      name: '',
      description: '',
      isActive: true
    };
    this.topics.unshift(this.tempNewTopic);
    this.editingIndex = 0;
    this.topicForm.reset({
      code: '',
      name: '',
      description: '',
      isActive: true
    });
    this.currentPage = 1;
  }

  editTopic(index: number): void {
    this.editingIndex = index;
    const topic = this.topics[index];
    this.topicForm.patchValue({
      code: topic.code,
      name: topic.name,
      description: topic.description,
      isActive: topic.isActive
    });
  }

  saveTopic(index: number): void {
    if (this.topicForm.valid) {
      const formValue = this.topicForm.value;
      const updatedTopic: Topic = {
        code: formValue.code,
        name: formValue.name,
        description: formValue.description,
        isActive: formValue.isActive
      };

      if (this.isAddingNewTopic && index === 0) {
        // Add new topic
        this.topics[0] = updatedTopic;
        this.isAddingNewTopic = false;
      } else {
        // Update existing topic
        this.topics[index] = updatedTopic;
      }

      this.originalTopics = [...this.topics];
      this.cancelEdit();
    }
  }

  deleteTopic(index: number): void {
    this.topicIndexToDelete = index;
    const topic = this.topics[index];

    // Update the modal content
    const topicCodeElement = document.getElementById('topicCodeToDelete');
    if (topicCodeElement) {
      topicCodeElement.textContent = `${topic.code} - ${topic.name}`;
    }

    // Show the modal
    if (this.deleteModal) {
      this.deleteModal.show();
    }
  }

  confirmDeleteTopic(): void {
    if (this.topicIndexToDelete !== null) {
      // Remove the topic
      this.topics.splice(this.topicIndexToDelete, 1);
      this.originalTopics = [...this.topics];

      // Reset and hide modal
      this.topicIndexToDelete = null;
      if (this.deleteModal) {
        this.deleteModal.hide();
      }

      // Update pagination
      this.calculateTotalPages();

      // Reset to first page if needed
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
    }
  }

  cancelEdit(): void {
    if (this.isAddingNewTopic) {
      this.topics.shift();
      this.isAddingNewTopic = false;
    }
    this.editingIndex = null;
    this.topicForm.reset();
  }

  filterTopics(): void {
    const searchTerm = this.searchForm.get('searchTerm')?.value?.toLowerCase() || '';

    if (!searchTerm) {
      this.topics = [...this.originalTopics];
    } else {
      this.topics = this.originalTopics.filter(topic =>
        topic.code.toLowerCase().includes(searchTerm) ||
        topic.name.toLowerCase().includes(searchTerm) ||
        topic.description.toLowerCase().includes(searchTerm)
      );
    }

    this.currentPage = 1;
    this.calculateTotalPages();
  }

  sortTable(column: keyof Topic, ascending: boolean): void {
    this.sortedColumn = column;
    this.isAscending = ascending;

    this.topics.sort((a, b) => {
      const valA = a[column]?.toString().toLowerCase() || '';
      const valB = b[column]?.toString().toLowerCase() || '';
      return ascending ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.topics.length / this.pageSize) || 1;
  }

  goToFirstPage(): void {
    this.currentPage = 1;
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
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

  hideTooltip(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const tooltip = bootstrap.Tooltip.getInstance(target);
    if (tooltip) {
      tooltip.hide();
    }
  }

}