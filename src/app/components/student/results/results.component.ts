import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

interface SectionResult {
  sectionTitle: string;
  scored: number;
  max: number;
}

interface TestResult {
  testTitle: string;
  sections: SectionResult[];
}

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent {
  studentName: string = 'John Doe';
  results: TestResult[] = [];

  constructor(private route: ActivatedRoute) {
    // Simulated backend response
    this.results = [
      {
        testTitle: 'Test 1',
        sections: [
          { sectionTitle: 'General Knowledge', scored: 8, max: 10 },
          { sectionTitle: 'Math', scored: 6, max: 10 },
          { sectionTitle: 'Science', scored: 9, max: 10 }
        ]
      },
      {
        testTitle: 'Test 2',
        sections: [
          { sectionTitle: 'English', scored: 7, max: 10 },
          { sectionTitle: 'Reasoning', scored: 5, max: 10 }
        ]
      }
    ];
  }

  getTotalScore(sections: SectionResult[]) {
    return sections.reduce((sum, s) => sum + s.scored, 0);
  }

  getTotalMax(sections: SectionResult[]) {
    return sections.reduce((sum, s) => sum + s.max, 0);
  }
}
