import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../../Enviornment/enviornment';
import { SectionPayload } from '../../../models/SectionPayload';
import { QuestionBankPayload } from '../../../models/QuestionBankPayload';

@Injectable({
  providedIn: 'root'
})
export class ExamQuestionsService {

  private apiUrl = `${environment.apiUrl}/exam`; // ✅ Update with your backend base URL

  constructor(private http: HttpClient) {}

assignQuestionsToExam(examCode: string, codes: String[]): Observable<any> {
  const payload = { codes };
  return this.http.post(`${this.apiUrl}/${examCode}/question`, payload, {
      responseType: 'text' as 'json' // accept plain text if server returns no JSON
    })
    .pipe(catchError(this.handleError));
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


  addSectionsToExam(examCode: string, sections: SectionPayload[]): Observable<any> {
  return this.http.post(`${this.apiUrl}/${examCode}/sections`, sections, {
    responseType: 'text' as 'json'
  }).pipe(
    catchError(this.handleError)
  );
}

  getExamQuestionsByExamCode(code: String): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${code}/questions/all`)
      .pipe(catchError(this.handleError));

  }
    deleteQuestion(examCode: string, questionCode: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${examCode}/question/${questionCode}`, {
      responseType: 'text' as 'json'
    }).pipe(catchError(this.handleError));
  }

  getStudentsByExamCode(code: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${code}/students`)
      .pipe(catchError(this.handleError));
  }

    addInstantExam(examCode: string, questions: QuestionBankPayload[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/${examCode}/instant-exam`, questions, {
      responseType: 'text' as 'json'
    }).pipe(
      catchError(this.handleError)
    );
  }

}
