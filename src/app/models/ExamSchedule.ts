export interface ExamSchedule {
  code: string;
  title: string;
  date: Date;
  time: string;
  duration: number;
  students: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}
