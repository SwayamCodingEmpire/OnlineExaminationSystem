import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTooltip,
  ApexStroke,
  NgApexchartsModule,
  ApexResponsive,
  ApexLegend,
  ApexFill,
  ApexPlotOptions,
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
};

interface LeaderboardEntry {
  name: string;
  score: number;
  time: string;
}


@Component({
  selector: 'app-admin-dashboard',
  imports: [
            CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
    NgApexchartsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class AdminDashboardComponent {
   @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: ChartOptions;

  constructor() {
    this.chartOptions = {
      series: [44, 55],
      chart: {
        width: 500,
        type: "pie"
      },
      labels: ["Pass","Fail"],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    };
  }

examCodes: string[] = [];

  // Selected exam code
  selectedExamCode: string = '';

  // Dynamic leaderboard data (keyed by any exam code)
  leaderboardData: Record<string, LeaderboardEntry[]> = {};

  // Filtered list for the selected exam
  filteredLeaderboard: LeaderboardEntry[] = [];

  ngOnInit(): void {
    // Simulate fetching dynamic data (replace this with API call)
    this.fetchLeaderboardData();
  }

  fetchLeaderboardData(): void {
    // Imagine this comes from an API
    this.leaderboardData = {
      EXAM2025A: [
        { name: 'Alice Johnson', score: 98, time: '23m 14s' },
        { name: 'Bob Smith', score: 89, time: '27m 02s' }
      ],
      EXAM2025B: [
        { name: 'Charlie Ray', score: 92, time: '25m 33s' },
        { name: 'Dana Wu', score: 87, time: '26m 45s' }
      ],
      EXAM2025C: [] // Can be empty too
    };

    // Extract exam codes dynamically
    this.examCodes = Object.keys(this.leaderboardData);

    // Set a default selected exam code
    this.selectedExamCode = this.examCodes[0] || '';

    // Populate leaderboard
    this.filterLeaderboard();
  }

  filterLeaderboard(): void {
    this.filteredLeaderboard = this.leaderboardData[this.selectedExamCode] || [];
  }

  onExamChange(): void {
    this.filterLeaderboard();
  }

}
