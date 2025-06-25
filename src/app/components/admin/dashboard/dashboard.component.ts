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
import { AdminDashboardService } from '../../../services/admin/dashboard/admin-dashboard.service';
import { ExamSchedule } from '../../../models/ExamSchedule';
import { LeaderboardEntry } from '../../../models/LeaderBoardEntry';
import { ExamsService } from '../../../services/admin/exams/exams.service';
import { ExamCompletionStatusPayload } from '../../../models/ExamCompletionStatusPayload';

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



interface DashboardStats {
  totalStudents: { current: number, trend: number, percentage: number };
  totalExams: { current: number, trend: number, percentage: number };
  completedExams: { current: number, trend: number, percentage: number };
  averageScore: { current: number, trend: number, percentage: number };
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

  // getTopicWisePerformance
  // Chart Options
  public pieChartOptions: ChartOptions;
  public lineChartOptions: LineChartOptions;
  public topicWisePerformanceChart: BarChartOptions;
  public doughnutChartOptions: ChartOptions;
  topics: string[] = [];
  score: number[] = [];
  topicPageNo:number=0;
  examPageNo:number=0;
  exams: string[] = ['Java', 'Angular', 'Database', 'Python', 'JavaScript', 'C#'];
  examPercentages: number[] = [75, 80, 70, 85, 90, 65];
  passFailData: number[] = [65, 35]; // Example data for pass/fail pie chart
  examCompletionStatus: ExamCompletionStatusPayload|null = null;

  // Dashboard Data
  stats: DashboardStats = {
    totalStudents: { current: 5487, trend: 12, percentage: 8.5 },
    totalExams
: { current: 237, trend: -3, percentage: -2.1 },
    completedExams: { current: 75, trend: 5, percentage: 7.1 },
    averageScore: { current: 78.5, trend: 2.3, percentage: 3.0 }
  };

  examCodes: string[] = [];
  selectedExamCode: string = '';
  leaderboardData: LeaderboardEntry[] = [];
  filteredLeaderboard: LeaderboardEntry[] = [];

  // Calendar
  currentDate = new Date();
  selectedDate = new Date();
  examSchedules: ExamSchedule[] = [];
  calendarView: 'month' | 'week' = 'month';

  constructor(private adminDashboardService: AdminDashboardService, private examService: ExamsService) {
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
          data: this.examPercentages.length > 0 ? this.examPercentages : [75, 80, 70, 85, 90, 65]
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
        categories: this.exams.length > 0 ? this.exams : ['Java', 'Angular', 'Database', 'Python', 'JavaScript', 'C#']
      },
      yaxis: {
        title: {
          text: "Score (%)"
        }
      },
      responsive: []
    };

    // Bar Chart for Subject-wise Performance
    this.topicWisePerformanceChart = {
      series: [
        {
          name: "Average Score",
          data: this.score.length > 0 ? this.score : [75, 80, 70, 85, 90, 65]
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
        categories: this.topics.length > 0 ? this.topics : ['Java', 'Angular', 'Database', 'Python', 'JavaScript', 'C#']
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
        width: 380,
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
    this.loadExamCodes();
    this.loadExamSchedules();
    this.updateStats();
    this.startRealTimeUpdates();
    this.loadTopicWisePerformanceFromService();
    this.loadExamWisePerformanceFromService();
    this.loadPassFailFromService();
    this.loadExamCompletionStatus();
  }

  // Real-time updates
  startRealTimeUpdates(): void {
    setInterval(() => {
      this.updateStats();
    }, 30000); // Update every 30 seconds
  }

  updateStats(): void {
    // Simulate real-time data updates

    this.adminDashboardService.getStudentEnrollmentTrend().subscribe(data => {
      this.stats.totalStudents.current = data.presentValue;
      this.stats.totalStudents.percentage = data.percentageIncrease;
    });

    this.adminDashboardService.getWeeklyExamCount().subscribe(data => {
      this.stats.totalExams.current = data.presentValue;
      this.stats.totalExams.percentage = data.percentageIncrease;
    });

    this.adminDashboardService.getMonthlyExamCompletedCount().subscribe(data => {
      this.stats.completedExams.current = data.presentValue;
      this.stats.completedExams.percentage = data.percentageIncrease;
    });

    this.adminDashboardService.getMonthlyAverageResult().subscribe(data => {
      this.stats.averageScore.current = data.presentValue;
      this.stats.averageScore.percentage = data.percentageIncrease;
    });
  }

  fetchLeaderboardData(): void {
    this.adminDashboardService.getLeaderboard(this.selectedExamCode).subscribe(data => {
      this.leaderboardData = data;
    });
  }

  loadExamCodes(): void {
    this.examService.getAllExamCodes().subscribe(data => {
      this.examCodes = data;
      this.selectedExamCode = this.examCodes[0] || '';
      this.fetchLeaderboardData();
    });
  }

  // Calendar functions
  loadExamSchedules(): void {
    // this.examSchedules = [
    //   {
    //     id: '1',
    //     title: 'Java Fundamentals Exam',
    //     date: new Date(2025, 0, 25),
    //     time: '10:00 AM',
    //     duration: 120,
    //     students: 45,
    //     status: 'upcoming'
    //   },
    //   {
    //     id: '2',
    //     title: 'Angular Assessment',
    //     date: new Date(2025, 0, 27),
    //     time: '2:00 PM',
    //     duration: 90,
    //     students: 32,
    //     status: 'upcoming'
    //   },
    //   {
    //     id: '3',
    //     title: 'Database Design Test',
    //     date: new Date(2025, 0, 30),
    //     time: '11:00 AM',
    //     duration: 60,
    //     students: 28,
    //     status: 'upcoming'
    //   }
    // ];

    const year = this.selectedDate.getFullYear();
    const month = this.selectedDate.getMonth() + 1; // getMonth() is
    this.adminDashboardService.getExamSchedule(year, month).subscribe(data => {
      this.examSchedules = data;
    });
  }

  loadTopicWisePerformanceFromService(): void {
    this.adminDashboardService.getTopicWisePerformance(this.topicPageNo).subscribe(data => {
      this.topics = data.map(item => item.name);
      this.score = data.map(item => item.averagePercentage);
      this.updateTopicWisePErformanceChart();
    });
  }


  loadExamWisePerformanceFromService(): void {
    this.adminDashboardService.getExamWisePercentage(this.examPageNo).subscribe(data => {
      this.exams = data.map(item => item.name);
      this.examPercentages = data.map(item => item.averagePercentage);
      this.updateExamWisePErcentages();
    });
  }

    private updateTopicWisePErformanceChart(): void {
    this.topicWisePerformanceChart.series = [
      {
        name: "Average Score",
        data: this.score
      }
    ];
    this.topicWisePerformanceChart.xaxis = {
      categories: this.topics
    };

    // Trigger Angular change detection
    this.topicWisePerformanceChart = { ...this.topicWisePerformanceChart };
  }

  private loadPassFailFromService(): void {
    this.adminDashboardService.getPassFailPercentage().subscribe(data => {
      this.passFailData = [data.Pass, data.Fail];
      this.updatePassFailChart();
    });
  }

  private updatePassFailChart(): void {
    this.pieChartOptions = {
      series: this.passFailData,
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
  }

  private loadExamCompletionStatus(): void {
    this.adminDashboardService.getExamCompletionStatus().subscribe(data => {
      this.examCompletionStatus = data;
      this.updateExamCompletionChart();
    });
  }

  private updateExamCompletionChart(): void {
    this.doughnutChartOptions = {
      series: [
        this.examCompletionStatus?.completed || 0,
        this.examCompletionStatus?.inProgress || 0,
        this.examCompletionStatus?.notStarted || 0
      ],
      chart: {
        width: 380,
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

  private updateExamWisePErcentages(): void {
    this.lineChartOptions.series = [
      {
        name: "Average Score",
        data: this.examPercentages
      }
    ];
    this.lineChartOptions.xaxis = {
      categories: this.exams
    };

    // Trigger Angular change detection
    this.lineChartOptions = { ...this.lineChartOptions };
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
    this.loadExamSchedules();
  }

  nextMonth(): void {
    this.selectedDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + 1, 1);
    this.loadExamSchedules();
  }

  switchCalendarView(view: 'month' | 'week'): void {
    this.calendarView = view;
  }

  getTrendClassForTotalStudents(trend: number): string {
    return this.stats.totalStudents.percentage >= 0 ? 'text-success' : 'text-danger';
  }

  getTrendIconForTotalStudents(trend: number): string {
    return this.stats.totalStudents.percentage >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
  }

    getTrendClassForTotalExams(trend: number): string {
    return this.stats.totalExams.percentage >= 0 ? 'text-success' : 'text-danger';
  }

  getTrendIconForTotalExams(trend: number): string {
    return this.stats.totalExams.percentage >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
  }

  getTrendClassForCompletedExams(trend: number): string {
    return this.stats.completedExams.percentage >= 0 ? 'text-success' : 'text-danger';
  }

  getTrendIconForCompletedExams(trend: number): string {
    return this.stats.completedExams.percentage >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
  }

  getTrendClassForAverageScore(trend: number): string {
    return this.stats.averageScore.percentage >= 0 ? 'text-success' : 'text-danger';
  }

  getTrendIconForAverageScore(trend: number): string {
    return this.stats.averageScore.percentage >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
  }

  showMoreButtons = false;
  showMoreExamButtons = false;

toggleTopicButtons(): void {
  this.showMoreButtons = !this.showMoreButtons;
}

onScrollLeft(): void {
  console.log('Scroll left clicked');
  if (this.topicPageNo > 0) {
    this.topicPageNo--;
    this.loadTopicWisePerformanceFromService();
  } else {
    console.log('Already at the first page');
    this.toggleTopicButtons();
  }
}

onScrollRight(): void {
  console.log('Scroll right clicked');
  this.topicPageNo++;
  this.loadTopicWisePerformanceFromService();
}

onScrollLeftExam(): void {
  console.log('Scroll left clicked');
  if (this.examPageNo > 0) {
    this.examPageNo--;
    this.loadExamWisePerformanceFromService();
  } else {
    console.log('Already at the first page');
    this.toggleTopicExamButtons();
  }
}

onScrollRightExam(): void {
  console.log('Scroll right clicked');
  this.examPageNo++;
  this.loadExamWisePerformanceFromService();
}

toggleTopicExamButtons(): void {
  this.showMoreExamButtons = !this.showMoreExamButtons;
}


}
