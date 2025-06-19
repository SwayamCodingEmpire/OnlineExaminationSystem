import { TestBed } from '@angular/core/testing';

import { ExamQuestionsService } from './exam-questions.service';

describe('ExamQuestionsService', () => {
  let service: ExamQuestionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExamQuestionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
