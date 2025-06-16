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
  ApexNonAxisChartSeries,
  ApexYAxis
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
};

export type LineChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  responsive: ApexResponsive[];
};

export type BarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  responsive: ApexResponsive[];
  plotOptions: ApexPlotOptions;
};

interface LeaderboardEntry {
  name: string;
  score: number;
  time: string;
}

interface DashboardStats {
  totalStudents: { current: number, trend: number, percentage: number };
  ongoingExams: { current: number, trend: number, percentage: number };
  completedExams: { current: number, trend: number, percentage: number };
  averageScore: { current: number, trend: number, percentage: number };
}

interface ExamSchedule {
  id: string;
  title: string;
  date: Date;
  time: string;
  duration: number;
  students: number;
  status: 'upcoming' | 'ongoing' | 'completed';
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
  
  // Chart Options
  public pieChartOptions: ChartOptions;
  public lineChartOptions: LineChartOptions;
  public barChartOptions: BarChartOptions;
  public doughnutChartOptions: ChartOptions;

  // Dashboard Data
  stats: DashboardStats = {
    totalStudents: { current: 5487, trend: 12, percentage: 8.5 },
    ongoingExams: { current: 237, trend: -3, percentage: -2.1 },
    completedExams: { current: 75, trend: 5, percentage: 7.1 },
    averageScore: { current: 78.5, trend: 2.3, percentage: 3.0 }
  };

  examCodes: string[] = [];
  selectedExamCode: string = '';
  leaderboardData: Record<string, LeaderboardEntry[]> = {};
  filteredLeaderboard: LeaderboardEntry[] = [];

  // Calendar
  currentDate = new Date();
  selectedDate = new Date();
  examSchedules: ExamSchedule[] = [];
  calendarView: 'month' | 'week' = 'month';

  constructor() {
    // Pie Chart for Pass/Fail
    this.pieChartOptions = {
      series: [65, 35],
      chart: {
        width: 350,
        type: "pie"
      },
      labels: ["Pass", "Fail"],
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

    // Line Chart for Performance Trends
    this.lineChartOptions = {
      series: [
        {
          name: "Average Score",
          data: [65, 70, 75, 78, 82, 79, 85, 88, 78]
        }
      ],
      chart: {
        height: 300,
        type: "line",
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "smooth"
      },
      xaxis: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"]
      },
      yaxis: {
        title: {
          text: "Score (%)"
        }
      },
      responsive: []
    };

    // Bar Chart for Subject-wise Performance
    this.barChartOptions = {
      series: [
        {
          name: "Average Score",
          data: [85, 78, 92, 76, 88, 82]
        }
      ],
      chart: {
        height: 300,
        type: "bar"
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%"
        }
      },
      xaxis: {
        categories: ["Java", "Angular", "Spring", "Database", "Data Structures", "Algorithms"]
      },
      yaxis: {
        title: {
          text: "Score (%)"
        }
      },
      responsive: []
    };

    // Doughnut Chart for Exam Completion Rates
    this.doughnutChartOptions = {
      series: [80, 15, 5],
      chart: {
        width: 350,
        type: "donut"
      },
      labels: ["Completed", "In Progress", "Not Started"],
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

  ngOnInit(): void {
    this.fetchLeaderboardData();
    this.loadExamSchedules();
    this.startRealTimeUpdates();
  }

  // Real-time updates
  startRealTimeUpdates(): void {
    setInterval(() => {
      this.updateStats();
    }, 30000); // Update every 30 seconds
  }

  updateStats(): void {
    // Simulate real-time data updates
    this.stats.ongoingExams.current = Math.floor(Math.random() * 50) + 200;
    this.stats.averageScore.current = Math.floor(Math.random() * 20) + 70;
  }

  fetchLeaderboardData(): void {
    this.leaderboardData = {
      EXAM2025A: [
        { name: 'Alice Johnson', score: 98, time: '23m 14s' },
        { name: 'Bob Smith', score: 89, time: '27m 02s' },
        { name: 'Carol Davis', score: 87, time: '25m 30s' }
      ],
      EXAM2025B: [
        { name: 'Charlie Ray', score: 92, time: '25m 33s' },
        { name: 'Dana Wu', score: 87, time: '26m 45s' }
      ],
      EXAM2025C: [
        { name: 'Eva Green', score: 95, time: '22m 15s' },
        { name: 'Frank Miller', score: 88, time: '28m 20s' }
      ]
    };

    this.examCodes = Object.keys(this.leaderboardData);
    this.selectedExamCode = this.examCodes[0] || '';
    this.filterLeaderboard();
  }

  filterLeaderboard(): void {
    this.filteredLeaderboard = this.leaderboardData[this.selectedExamCode] || [];
  }

  // Calendar functions
  loadExamSchedules(): void {
    this.examSchedules = [
      {
        id: '1',
        title: 'Java Fundamentals Exam',
        date: new Date(2025, 0, 25),
        time: '10:00 AM',
        duration: 120,
        students: 45,
        status: 'upcoming'
      },
      {
        id: '2',
        title: 'Angular Assessment',
        date: new Date(2025, 0, 27),
        time: '2:00 PM',
        duration: 90,
        students: 32,
        status: 'upcoming'
      },
      {
        id: '3',
        title: 'Database Design Test',
        date: new Date(2025, 0, 30),
        time: '11:00 AM',
        duration: 60,
        students: 28,
        status: 'upcoming'
      }
    ];
  }

  getCalendarDays(): Date[] {
    const firstDay = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), 1);
    const lastDay = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + 1, 0);
    const days: Date[] = [];
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), i));
    }
    
    return days;
  }

  getExamsForDate(date: Date): ExamSchedule[] {
    return this.examSchedules.filter(exam => 
      exam.date.toDateString() === date.toDateString()
    );
  }

  previousMonth(): void {
    this.selectedDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() - 1, 1);
  }

  nextMonth(): void {
    this.selectedDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + 1, 1);
  }

  switchCalendarView(view: 'month' | 'week'): void {
    this.calendarView = view;
  }

  getTrendClass(trend: number): string {
    return trend >= 0 ? 'text-success' : 'text-danger';
  }

  getTrendIcon(trend: number): string {
    return trend >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
  }
} 