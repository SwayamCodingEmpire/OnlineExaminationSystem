import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExamsService {
  private baseUrl ='http://localhost:8080/admin/Exams'; // Replace with your API endpoint

  constructor(private http:HttpClient) { }

  addExam(exam: any): Observable<any> {
    return this.http.post(this.baseUrl, exam);
  }

  updateExam(exam: any): Observable<any> {
    return this.http.put(this.baseUrl, exam);
  }

  deleteExam(examId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${examId}`);
  }

  getExams(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/all`);
  }
}
