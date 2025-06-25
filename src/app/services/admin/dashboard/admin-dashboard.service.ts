import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../Enviornment/enviornment';
import { FieldWisePerformancePayload } from '../../../models/FieldWisePerformancePayload';
import { PresentAndPercentageIncreasePayload } from '../../../models/PresentAndPercentageIncreasePayload';
import { ExamSchedule } from '../../../models/ExamSchedule';
import { LeaderboardEntry } from '../../../models/LeaderBoardEntry';
import { ExamCompletionStatusPayload } from '../../../models/ExamCompletionStatusPayload';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {

private baseUrl = `${environment.apiUrl}/admin/dashboard`;

  constructor(private http: HttpClient) {}


  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';

    console.error('Full error object:', error);

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error: ${error.status} - ${error.message}`;

      if (error.error) {
        console.error('Error response body:', error.error);
        if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error.error) {
          errorMessage = error.error.error;
        }
      }
    }

    console.error('QuestionBankService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  getTopicWisePerformance(topicPageNo:number): Observable<FieldWisePerformancePayload[]> {
    return this.http.get<FieldWisePerformancePayload[]>(`${this.baseUrl}/topic-wise-performance?page=${topicPageNo}`)
      .pipe(catchError(this.handleError));

  }

  getStudentEnrollmentTrend(): Observable<PresentAndPercentageIncreasePayload> {
    return this.http.get<PresentAndPercentageIncreasePayload>(`${this.baseUrl}/student-enrollment`)
      .pipe(catchError(this.handleError));
  }

  getWeeklyExamCount(): Observable<PresentAndPercentageIncreasePayload> {
    return this.http.get<PresentAndPercentageIncreasePayload>(`${this.baseUrl}/weekly-exam-count`)
      .pipe(catchError(this.handleError));
  }

  getMonthlyExamCompletedCount(): Observable<PresentAndPercentageIncreasePayload> {
    return this.http.get<PresentAndPercentageIncreasePayload>(`${this.baseUrl}/monthly-exam-completed-count`)
      .pipe(catchError(this.handleError));
  }

  getMonthlyAverageResult(): Observable<PresentAndPercentageIncreasePayload> {
    return this.http.get<PresentAndPercentageIncreasePayload>(`${this.baseUrl}/monthly-average-result`)
      .pipe(catchError(this.handleError));
  }

  getExamSchedule(year:number, month:number): Observable<ExamSchedule[]> {
    return this.http.get<ExamSchedule[]>(`${this.baseUrl}/exam-schedule?year=${year}&month=${month}`)
      .pipe(catchError(this.handleError));
  }

  getLeaderboard(examCode: string): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.baseUrl}/leaderboard/${examCode}`)
      .pipe(catchError(this.handleError));
  }

  getExamWisePercentage(examPageNo: number): Observable<FieldWisePerformancePayload[]> {
    return this.http.get<FieldWisePerformancePayload[]>(`${this.baseUrl}/exam-wise-percentage?examPageNo=${examPageNo}`)
      .pipe(catchError(this.handleError));
  }

  getPassFailPercentage(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/pass-fail-percentage`)
      .pipe(catchError(this.handleError));
  }

  getExamCompletionStatus(): Observable<ExamCompletionStatusPayload> {
    return this.http.get<ExamCompletionStatusPayload>(`${this.baseUrl}/exam-completion-status`)
      .pipe(catchError(this.handleError));
  }


}
