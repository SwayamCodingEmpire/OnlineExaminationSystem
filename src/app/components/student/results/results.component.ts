// src/app/components/student/results/results.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute }     from '@angular/router';
import { CommonModule }       from '@angular/common';
import { ResultService }      from '../../../services/student/result.service';

interface FlatSection {
  sectionTitle: string;
  totalMarks:   number;
  marksSecured: number;
}

interface SectionView {
  sectionTitle: string;
  scored:       number;
  max:          number;
}

interface TestResult {
  testTitle: string;
  sections:  SectionView[];
}

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {
  examCode = '';
  results: TestResult[] = [];

  constructor(
    private route: ActivatedRoute,
    private svc:   ResultService
  ) {}

  ngOnInit() {
    // route like /student/results/:id
    this.examCode = this.route.snapshot.paramMap.get('id')!;

    this.svc.getSummary(this.examCode).subscribe({
      next: (secs: FlatSection[]) => {
        // remap the backend fields into {scored, max} for the template
        const view: SectionView[] = secs.map(s => ({
          sectionTitle: s.sectionTitle,
          scored:       s.marksSecured,
          max:          s.totalMarks
        }));

        this.results = [
          {
            testTitle: this.examCode, // or pull real exam name if you have it
            sections:  view
          }
        ];
      },
      error: err => {
        console.error(err);
        alert('Failed to load your results');
      }
    });
  }

  getTotalScore(sections: SectionView[]): number {
    return sections.reduce((sum, s) => sum + s.scored, 0);
  }

  getTotalMax(sections: SectionView[]): number {
    return sections.reduce((sum, s) => sum + s.max, 0);
  }
}
