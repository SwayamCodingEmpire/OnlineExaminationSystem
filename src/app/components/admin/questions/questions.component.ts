import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-questions',
  imports: [],
  templateUrl: './questions.component.html',
  styleUrl: './questions.component.scss'
})
export class QuestionsComponent {
   examCode!: string;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Access route param from URL
    this.examCode = this.route.snapshot.paramMap.get('code') || '';
    console.log('Exam Code:', this.examCode);

    // You can now use this.examCode to fetch data
  }

}
