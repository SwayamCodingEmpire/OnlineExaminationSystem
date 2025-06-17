import { Component } from '@angular/core';
import { ResultList } from '../result-list';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-result-list',
  imports: [FormsModule,CommonModule],
  templateUrl: './result-list.component.html',
  styleUrl: './result-list.component.scss'
})
export class ResultListComponent {
  testResults: ResultList[] = [];

  ngOnInit(): void {
    // Load data with calculated averages
    this.testResults = [
      { testName: 'Maths', totalMarks: 100, marksSecured: 92 },
      { testName: 'Science', totalMarks: 100, marksSecured: 95 },
      { testName: 'English', totalMarks: 100, marksSecured: 85 }
    ].map(test => ({
      ...test,
      average: this.calculateAverage(test.marksSecured, test.totalMarks)
    }));
  }

  calculateAverage(secured: number, total: number): number {
    return (secured / total) * 100;
  }
}
