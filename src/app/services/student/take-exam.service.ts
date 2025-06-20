import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RawQuestion {
  code:    string;
  text:    string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

export interface SectionDetailDTO {
  sectionId:   number;
  sectionName: string;
  duration:    number;        // in minutes
  questions:   RawQuestion[];
}

export interface AnswerDTO {
  questionCode: string;
  answer:       string;
}

export interface SubmitRequest {
  answers: AnswerDTO[];
}

@Injectable({ providedIn: 'root' })
export class TakeExamService {
  private readonly baseUrl = 'http://localhost:8080/v1';

  constructor(private readonly http: HttpClient) {}

  /** Fetch raw section details (no pipes/operators) */
  getSections(examCode: string): Observable<SectionDetailDTO[]> {
    return this.http.get<SectionDetailDTO[]>(
      `${this.baseUrl}/exam/${examCode}/sections`
    );
  }

  /** Submit answers payload */
  submitAnswers(examCode: string, payload: SubmitRequest): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/take-exam/${examCode}/submit`,
      payload
    );
  }
}
