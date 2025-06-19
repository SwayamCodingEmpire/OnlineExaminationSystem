import { TestBed } from '@angular/core/testing';

import { ExamSectionService } from './exam-section.service';

describe('ExamSectionService', () => {
  let service: ExamSectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExamSectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
