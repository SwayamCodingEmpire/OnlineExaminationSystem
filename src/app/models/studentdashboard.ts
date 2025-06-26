// student-dashboard.model.ts

export interface UserInfoDTO {
  code: string;
  name: string;
  email: string;
  phoneNo?: string;
  city?: string;
  state?: string;
  country?: string;
  age?: number;
}

export interface DifficultyBreakdownDTO {
  easy: number;
  medium: number;
  hard: number;
}

export interface ExamStatsDTO {
  code: any;
  examCode: string;
  examName: string;
  date: string;
  topic: string;
  score: number;
  maxScore: number;
  timeTaken: number;
  rank: number;
  difficultyBreakdown: DifficultyBreakdownDTO;
}

export interface TopicStatsDTO {
  topic: string;
  averageScore: number;
}

export interface DifficultyStatsDTO {
  difficulty: string;
  average: number;
}

export interface UpcomingExamDTO {
  examCode: string;
  name: string;
  date: string;
  duration: number;
  totalMarks: number;
  topic: string;
}

export interface StudentDashboardDTO {
  studentInfo: UserInfoDTO;
  attemptedExams: ExamStatsDTO[];
  topicStats: TopicStatsDTO[];
  difficultyStats: DifficultyStatsDTO[];
  upcomingExams: UpcomingExamDTO[];
  classRank: number | null;
  totalStudents: number;
}

export interface LeaderboardEntryDTO {
  studentName: string;
  score: number;
  timeTaken: number;
  rank: number;
}
