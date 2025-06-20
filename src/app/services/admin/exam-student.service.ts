import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../Enviornment/enviornment';

@Injectable({
  providedIn: 'root'
})
export class ExamStudentService {
  private baseUrl = `${environment.apiUrl}/exam`;

  constructor(private http: HttpClient) { }

  addStudentToExam(examCode: string, codes: string[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/${examCode}/students`, { codes }, { responseType: 'text' as 'json' });
  }
}
