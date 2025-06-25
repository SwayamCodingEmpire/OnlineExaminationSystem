import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, of, throwError } from 'rxjs';
import { environment } from '../../../../Enviornment/enviornment';
import { ExamPayload } from '../../../models/ExamPayload';

@Injectable({
  providedIn: 'root'
})
export class ExamsService {

  private apiUrl = `${environment.apiUrl}/exams`; // ✅ Update with your backend base URL

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

  getExams(): Observable<ExamPayload[]> {
  return this.http.get<ExamPayload[]>(`${this.apiUrl}/all`)
    .pipe(catchError(this.handleError));
}

addExam(exam: ExamPayload): Observable<any> {
  return this.http.post(`${this.apiUrl}`, exam, {
    responseType: 'text' as 'json'
  }).pipe(catchError(this.handleError));
}

updateExam(exam: ExamPayload, oldcode: string): Observable<any> {
  return this.http.put(`${this.apiUrl}/${oldcode}`, exam, {
    responseType: 'text' as 'json'
  }).pipe(catchError(this.handleError));
}

deleteExam(oldcode: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/${oldcode}`, {
    responseType: 'text' as 'json'
  }).pipe(catchError(this.handleError));
}

getAllExamCodes(): Observable<string[]> {
  return this.http.get<string[]>(`${this.apiUrl}/codes`)
    .pipe(catchError(this.handleError));
}






}
