import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgApexchartsModule, ChartComponent } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexStroke,
  ApexGrid,
  ApexMarkers,
  ApexDataLabels,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexLegend,
  ApexFill,
} from 'ng-apexcharts';

type QuizName = 'Quiz 1' | 'Quiz 2' | 'Quiz 3';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  colors: string[];
  stroke: ApexStroke;
  markers: ApexMarkers;
  grid: ApexGrid;
  dataLabels: ApexDataLabels;
};

export type DonutChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  legend: ApexLegend;
  responsive: ApexResponsive[];
  fill: ApexFill;
};

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
    NgApexchartsModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class StudentDashboardComponent {
  @ViewChild('chart') chart: ChartComponent | undefined;

  selectedQuiz: QuizName = 'Quiz 1';
  quizList: QuizName[] = ['Quiz 1', 'Quiz 2', 'Quiz 3'];

  leaderboard = [
    { name: 'jayaprakashbiswal78@gmail.com', department: 'CSE', points: 780, initial: 'R', color: '#1f3bb3' },
    { name: 'amitabhtripathay6@gmail.com', department: 'Tech', points: 750, initial: 'A', color: '#7e51ff' },
    { name: 'abhishekkumar8@gmail.com', department: 'Design', points: 700, initial: 'S', color: '#f8b200' },
    { name: 'suryakant5@gmail.com', department: 'Marketing', points: 680, initial: 'A', color: '#2dcfa0' },
    { name: 'mukul8@gmail.com', department: 'Design', points: 650, initial: 'N', color: '#ff744b' },
  ];

  scoreChart: ChartOptions;
  timeChart: ChartOptions;
  donutChart: DonutChartOptions;

  showScoreChart = true;

  constructor() {
    this.scoreChart = this.generateChart(
      ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      [65, 70, 75, 60, 80],
      '#ff7f50'
    );
    this.timeChart = this.generateChart(
      ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      [20, 18, 22, 19, 17],
      '#6a5acd'
    );
    this.donutChart = this.generateDonutChart();
  }

  generateChart(xCategories: string[], seriesData: number[], color: string): ChartOptions {
    return {
      series: [{ name: 'Value', data: seriesData }],
      chart: {
        type: 'line',
        height: 250,
        toolbar: { show: false },
        animations: { enabled: true },
      },
      xaxis: {
        categories: xCategories,
        labels: { style: { fontSize: '13px', colors: '#666' } },
      },
      colors: [color],
      stroke: { curve: 'smooth', width: 3 },
      markers: {
        size: 5,
        colors: [color],
        strokeColors: '#fff',
        strokeWidth: 2,
        hover: { size: 8 },
      },
      grid: { borderColor: 'rgba(0,0,0,0.1)', strokeDashArray: 4 },
      dataLabels: { enabled: false },
    };
  }

  generateDonutChart(): DonutChartOptions {
    return {
      series: [60, 20, 10, 10],
      chart: {
        type: 'donut',
        height: 280,
        toolbar: { show: false },
      },
      labels: ['Tech', 'Operations', 'Design', 'HR'],
      colors: ['#FF7F50', '#2ECC71', '#3498DB', '#AED6F1'],
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'diagonal1',
          gradientToColors: ['#FF9966', '#27AE60', '#2980B9', '#85C1E9'],
          opacityFrom: 0.9,
          opacityTo: 1,
        },
      },
      legend: {
        position: 'bottom',
        fontSize: '14px',
        markers: {
          shape: 'circle', // ✅ only supported property
          fillColors: ['#FF7F50', '#2ECC71', '#3498DB', '#AED6F1'],
        },
        itemMargin: {
          horizontal: 10,
          vertical: 4,
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: { width: 220 },
            legend: { position: 'bottom' },
          },
        },
      ],
    };
  }

  onQuizChange() {
    const dummyData: Record<QuizName, number[]> = {
      'Quiz 1': [65, 70, 75, 60, 80],
      'Quiz 2': [70, 65, 78, 72, 74],
      'Quiz 3': [60, 68, 72, 70, 69],
    };

    const dummyTime: Record<QuizName, number[]> = {
      'Quiz 1': [20, 18, 22, 19, 17],
      'Quiz 2': [22, 21, 20, 18, 19],
      'Quiz 3': [19, 17, 18, 20, 21],
    };

    this.scoreChart = this.generateChart(
      ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      dummyData[this.selectedQuiz],
      '#ff7f50'
    );

    this.timeChart = this.generateChart(
      ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      dummyTime[this.selectedQuiz],
      '#6a5acd'
    );
  }
}
