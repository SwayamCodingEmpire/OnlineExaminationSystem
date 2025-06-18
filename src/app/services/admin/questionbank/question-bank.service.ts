import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../../Enviornment/enviornment';

@Injectable({
  providedIn: 'root'
})
export class QuestionBankService {
  private baseUrl = `${environment.apiUrl}/question-bank`; // Replace with your API endpoint

  constructor(private http: HttpClient) {}

  private getHttpOptions() {
    const token = localStorage.getItem('token'); // Get token from localStorage
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      })
    };
  }

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

  getQuestions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/all`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
      
  }

  getAvailableQuestions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/basic`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  getQuestionById(code: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/get/${code}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  addQuestion(question: any): Observable<any> {
    return this.http.post(this.baseUrl, question, { ...this.getHttpOptions(), responseType: 'text' as 'json' })
      .pipe(catchError(this.handleError));
  }

  updateQuestion(question: any): Observable<any> {
    return this.http.put(this.baseUrl, question, { ...this.getHttpOptions(), responseType: 'text' as 'json' })
      .pipe(catchError(this.handleError));
  }

  deleteQuestion(code: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${code}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  } 

  // Additional method for bulk operations if needed
  bulkUploadQuestions(questions: any[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/bulk`, questions, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }
}

