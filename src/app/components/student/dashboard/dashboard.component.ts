import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgApexchartsModule } from 'ng-apexcharts';
import { StudentDashboardDTO, LeaderboardEntryDTO } from '../../../models/studentdashboard';
import { StudentDashboardService } from '../../../services/student/student-dashboard.service';

interface StudentInfo {
  name: string;
  email: string;
  code: string;
  age?: number;
  country?: string;
  state?: string;
  city?: string;
  totalExamsTaken: number;
  averageScore: number;
  rank: number;
  totalStudents: number;
}

interface LeaderboardEntry {
  name: string;
  score: number;
  time: number;
  rank?: number;
}

interface UpcomingExam {
  name: string;
  date: string;
  duration: number;
  totalMarks: number;
  topic: string;
}

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
export class StudentDashboardComponent implements OnInit {
  dashboardData?: StudentDashboardDTO;
  statCards: any[] = [];
  scoreTrendOptions: any = null;
  timeTrendOptions: any = null;
  topicBarChartOptions: any = null;
  difficultyPieOptions: any = null;
  attemptsTopicChart: any = null;
  examTableData: any[] = [];
  selectedLeaderboard: LeaderboardEntry[] = [];
  selectedExamName = '';
  leaderboardTimeChart: any = null;
  loading = false;
  error: string | null = null;

  get studentInfo(): StudentInfo {
    const empty: StudentInfo = {
      name: '',
      email: '',
      code: '',
      age: undefined,
      country: '',
      state: '',
      city: '',
      totalExamsTaken: 0,
      averageScore: 0,
      rank: 0,
      totalStudents: 0,
    };
    if (!this.dashboardData?.studentInfo) return empty;
    const attemptedExams = this.dashboardData.attemptedExams ?? [];
    const averageScore =
      attemptedExams.length > 0
        ? +(attemptedExams.reduce((acc, ex) => acc + ex.score, 0) / attemptedExams.length).toFixed(2)
        : 0;
    const info = this.dashboardData.studentInfo as any;
    return {
      name: info.name ?? '',
      email: info.email ?? '',
      code: info.code ?? '',
      age: info.age,
      country: info.country ?? '',
      state: info.state ?? '',
      city: info.city ?? '',
      totalExamsTaken: attemptedExams.length,
      averageScore,
      rank: this.dashboardData.classRank ?? 0,
      totalStudents: this.dashboardData.totalStudents ?? 0,
    };
  }

  get upcomingExams(): UpcomingExam[] {
    return (this.dashboardData?.upcomingExams ?? []) as UpcomingExam[];
  }

  constructor(private dashboardService: StudentDashboardService) { }

  examTablePage: number = 1; // current page number
  examsPerPage: number = 7;  // number of rows per page

  //Leader board
  leaderboardPage: number = 1;
  leaderboardPerPage: number = 12;


  get leaderboardToDisplay(): LeaderboardEntry[] {
    const lb = this.selectedLeaderboard;
    if (!lb?.length) return [];
    const userIndex = lb.findIndex(x => x.name === this.studentInfo.name);
    if (userIndex === -1) {
      return lb.slice(0, 5);
    } else if (userIndex < 5) {
      return lb.slice(0, 5);
    } else {
      const top4 = lb.slice(0, 4);
      return [...top4, lb[userIndex]];
    }
  }
  ngOnInit(): void {
    this.loading = true;
    this.scoreTrendOptions = null;
    this.timeTrendOptions = null;
    this.topicBarChartOptions = null;
    this.difficultyPieOptions = null;
    this.attemptsTopicChart = null;
    this.leaderboardTimeChart = null;

    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.setStatCards();
        this.setCharts();
        this.setExamTableData();
        const attemptedExams = this.dashboardData?.attemptedExams || [];
        if (attemptedExams.length > 0) {
          // Defensive: ensure .code and .examName exist for selectExamForLeaderboard
          const firstExam = {
            ...attemptedExams[0],
            code: attemptedExams[0].examCode ?? attemptedExams[0].code,
            examName: attemptedExams[0].examName
          };
          this.selectExamForLeaderboard(firstExam);
        } else {
          this.selectedLeaderboard = [];
          this.selectedExamName = '';
          this.leaderboardTimeChart = null;
        }

        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load dashboard data';
        this.loading = false;
        this.scoreTrendOptions = null;
        this.timeTrendOptions = null;
        this.topicBarChartOptions = null;
        this.difficultyPieOptions = null;
        this.attemptsTopicChart = null;
        this.leaderboardTimeChart = null;
      }
    });
  }




  setStatCards() {
    const info = this.studentInfo;
    this.statCards = [
      { icon: 'fa-trophy', title: 'Overall Average', value: `${info.averageScore}%`, subtitle: 'All exams', color: 'text-primary' },
      { icon: 'fa-book-open', title: 'Exams Attempted', value: info.totalExamsTaken, subtitle: 'Total', color: 'text-success' },
      { icon: 'fa-award', title: 'Class Rank', value: `#${info.rank}`, subtitle: `Out of ${info.totalStudents}`, color: 'text-info' },
      { icon: 'fa-clock', title: 'Avg Exam Time', value: this.getAvgTime(), subtitle: 'Per exam', color: 'text-warning' }
    ];
  }

  setCharts() {
    if (!this.dashboardData) return;

    const exams = this.dashboardData.attemptedExams || [];
    const topicStats = this.dashboardData.topicStats || [];
    const difficultyStats = this.dashboardData.difficultyStats || [];
    const attemptsByTopic = this.dashboardData.topicStats?.map(ts => ({
      topic: ts.topic,
      attempts: 1 // or 0, or any default value
    })) ?? [];

    this.scoreTrendOptions = exams.length ? {
      series: [{ name: "Score", data: exams.map(d => d.score) }],
      chart: { type: 'line' as const, height: 230, toolbar: { show: false } },
      xaxis: { categories: exams.map(d => d.examName) },
      colors: ["#3B82F6"],
      stroke: { curve: 'smooth' as const, width: 3 }
    } : null;

    this.timeTrendOptions = exams.length ? {
      series: [{ name: "Time (min)", data: exams.map(d => +(d.timeTaken / 60).toFixed(1)) }],
      chart: { type: 'line' as const, height: 230, toolbar: { show: false } },
      xaxis: { categories: exams.map(d => d.examName) },
      colors: ["#F59E0B"],
      stroke: { curve: 'smooth' as const, width: 3 }
    } : null;

    console.log(topicStats, 'dsds')
    this.topicBarChartOptions = topicStats.length ? {
      series: [{ name: 'Average Score', data: topicStats.map(d => d.averageScore) }],
      chart: { type: 'line' as const, height: 230, toolbar: { show: false } },
      xaxis: { categories: topicStats.map(d => d.topic) },
      colors: ['#10B981'],
      stroke: { curve: 'smooth', width: 3 },
      markers: { size: 4 }
    } : null;


    this.difficultyPieOptions = difficultyStats.length ? {
      series: difficultyStats.map(d => d.average),
      labels: difficultyStats.map(d => d.difficulty),
      chart: { type: 'donut' as const, height: 250 },
      colors: ['#3B82F6', '#F59E0B', '#EF4444'],
      legend: { position: 'bottom' as const }
    } : null;

    this.attemptsTopicChart = attemptsByTopic.length ? {
      series: [{ name: 'Attempts', data: attemptsByTopic.map(a => a.attempts) }],
      chart: { type: 'bar' as const, height: 230, toolbar: { show: false } },
      xaxis: { categories: attemptsByTopic.map(a => a.topic) },
      colors: ['#6366F1'],
    } : null;
  }

  setExamTableData() {
    if (!this.dashboardData) return;
    this.examTableData = (this.dashboardData.attemptedExams || []).map(exam => (
      {
        name: exam.examName,
        code: exam.examCode,
        date: exam.date,
        topic: exam.topic,
        score: exam.score,
        time: exam.timeTaken,
        rank: exam.rank,
        difficultyBreakdown: [
          { type: 'Easy', value: exam.difficultyBreakdown?.easy ?? 0, color: 'bg-success' },
          { type: 'Medium', value: exam.difficultyBreakdown?.medium ?? 0, color: 'bg-warning' },
          { type: 'Hard', value: exam.difficultyBreakdown?.hard ?? 0, color: 'bg-danger' }
        ]
      }

    ));
  }

  getStatColorClass(index: number): string {
    const colors = ['purple', 'blue', 'green', 'orange'];
    return colors[index % colors.length];
  }

  getRankBadgeClass(rank: number): string {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return '';
  }

  selectExamForLeaderboard(exam: any) {
    // Defensive check: examCode is the key

    console.log(exam);
    const examCode = exam.code;
    const examName = exam.examName;
    const score = exam.score ?? 0;
    const time = exam.timeTaken ?? 0;

    // Set selected name for UI display
    this.selectedExamName = exam.topic;

    // Call API
    this.dashboardService.getLeaderboard(examCode).subscribe(lb => {

      // Defensive: handle property name from API
      this.selectedLeaderboard = lb.map(x => ({
        ...x,
        name: x.studentName,
        time: x.timeTaken
      }));

      let lbForChart = this.selectedLeaderboard.slice(0, 3);
      // If user not in top 3, show user's score/time as 'You'
      if (this.studentInfo && !lbForChart.find(x => x.name === this.studentInfo.name)) {
        lbForChart.unshift({ name: 'You', score: this.selectedLeaderboard.find(x => x.name === this.studentInfo.name)?.score || 0, time: this.selectedLeaderboard.find(x => x.name === this.studentInfo.name)?.time || 0, rank: 0 });
        lbForChart = lbForChart.slice(0, 3);
      }
      const names = lbForChart.map(x => x.name === this.studentInfo.name ? 'You' : x.name);
      const times = lbForChart.map(x => +(x.time / 60).toFixed(1));

      this.leaderboardTimeChart = {
        series: [{ name: 'Time (min)', data: times }],
        chart: { type: 'bar', height: 160, toolbar: { show: false } },
        xaxis: { categories: names },
        colors: ['#3B82F6', '#10B981', '#F59E0B'],
        plotOptions: { bar: { borderRadius: 6, horizontal: false, columnWidth: '35%' } },
        dataLabels: { enabled: true },
        tooltip: { y: { formatter: (val: any) => `${val} min` } }
      };
    }, err => {
      this.selectedLeaderboard = [];
      this.leaderboardTimeChart = null;
    });
  }


  formatSeconds(sec: number): string {

    if (sec == null) return '--';

    const hours = Math.floor(sec / 3600);

    const minutes = Math.floor((sec % 3600) / 60);

    if (hours > 0) {

      return `${hours}h ${minutes}m`;

    } else {

      return `${minutes}m`;

    }

  }



  private getAvgTime(): string {
    const exams = this.dashboardData?.attemptedExams || [];
    if (!exams.length) return '--';
    const totalSec = exams.reduce((acc, ex) => acc + ex.timeTaken, 0);
    const avgSec = totalSec / exams.length;
    const hours = Math.floor(avgSec / 3600);
    const minutes = Math.floor((avgSec % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  private getMostRecentExam() {
    const exams = this.dashboardData?.attemptedExams || [];
    if (!exams.length) return null;
    const latest = exams.reduce((latest, curr) => {
      return new Date(curr.date) > new Date(latest.date) ? curr : latest;
    });
    // Defensive: ensure code field exists for leaderboard
    return {
      ...latest,
      code: latest.examCode ?? latest.code,
      examName: latest.examName, // so you have a fallback for display
    };
  }

}
