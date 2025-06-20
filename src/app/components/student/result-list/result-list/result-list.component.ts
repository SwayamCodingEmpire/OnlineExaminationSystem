// src/app/components/student/result-list/result-list.component.ts
import { Component, OnInit }      from '@angular/core';
import { CommonModule }           from '@angular/common';
import { forkJoin, of }           from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ResultService, SectionResult } from '../../../../services/student/result.service';
import { ViewExamService, Exam } from '../../../../services/student/viewexam.service';

interface TestResult {
  testName:     string;
  totalMarks:   number;
  marksSecured: number;
  average:      number;
}

@Component({
  selector: 'app-result-list',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './result-list.component.html',
  styleUrls: ['./result-list.component.scss']
})
export class ResultListComponent implements OnInit {
  testResults: TestResult[] = [];

  constructor(
    private examsSvc: ViewExamService,
    private resultSvc: ResultService
  ) {}

  ngOnInit(): void {
    // 1️⃣ load all exams
    this.examsSvc.getAllExams().pipe(
      // 2️⃣ for each exam, call getSummary → produce a TestResult
      switchMap((exams: Exam[]) => {
        if (!exams.length) return of([]);
        const calls = exams.map(exam =>
          this.resultSvc.getSummary(exam.code).pipe(
            // on network error, treat as zeroed result
            catchError(() => of<SectionResult[]>([])),
            map((sections: SectionResult[]) => this.buildTestResult(exam.name, sections))
          )
        );
        return forkJoin(calls);
      })
    ).subscribe({
      next: (results: TestResult[]) => this.testResults = results,
      error: err => {
        console.error(err);
        alert('Could not load exam results');
      }
    });
  }

  private buildTestResult(testName: string, secs: SectionResult[]): TestResult {
    const totalMarks   = secs.reduce((sum, s) => sum + s.totalMarks, 0);
    const marksSecured = secs.reduce((sum, s) => sum + s.marksSecured, 0);
    const average      = totalMarks > 0
      ? Math.round((marksSecured / totalMarks) * 100)
      : 0;
    return { testName, totalMarks, marksSecured, average };
  }

  calculateAverage(secured: number, total: number): number {
    return total > 0 ? Math.round((secured / total) * 100) : 0;
  }
}
