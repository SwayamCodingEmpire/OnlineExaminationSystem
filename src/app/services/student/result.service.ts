// src/app/services/student/result.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SectionResult {
  sectionTitle: string;
  marksSecured:  number;
  totalMarks:    number;
}

@Injectable({ providedIn: 'root' })
export class ResultService {
  private baseUrl = 'http://localhost:8080/v1';

  constructor(private http: HttpClient) {}

  /** GET /v1/exams/{code}/summary */
  getSummary(examCode: string): Observable<SectionResult[]> {
    return this.http.get<SectionResult[]>(
      `${this.baseUrl}/exams/${examCode}/summary`
    );
  }
}
