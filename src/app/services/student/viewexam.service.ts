// src/app/services/admin/exams/exams.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Exam {
  code: string;
  name: string;
  examDate: string; // ISO date string (e.g. '2024-06-20')
  examTime: string; // ISO time string (e.g. '10:00:00')
  totalMarks?: number;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ViewExamService {
  private apiUrl = 'http://localhost:8080/v1/exams'; // Update this if needed

  constructor(private http: HttpClient) {}

  getAllExams(): Observable<Exam[]> {
    return this.http.get<Exam[]>(`${this.apiUrl}/all`);
  }

}
