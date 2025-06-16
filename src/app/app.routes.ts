import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './components/admin/admin-layout/admin-layout.component';
import { StudentComponent } from './components/admin/student/student.component';
import { QuestionBankComponent } from './components/admin/question-bank/question-bank.component';
import { ExamComponent } from './components/admin/exam/exam.component';
import { AdminDashboardComponent } from './components/admin/dashboard/dashboard.component';
import { QuestionsComponent } from './components/admin/questions/questions.component';
import { StudentLayoutComponent } from './components/student/student-layout/student-layout.component';
import { StudentDashboardComponent } from './components/student/dashboard/dashboard.component';
import { ResultsComponent } from './components/student/results/results.component';
import { TakeExamComponent } from './components/student/take-exam/take-exam.component';
import { LoginComponent } from './components/shared/login/login.component';

export const routes: Routes = [
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      // ✅ Default admin route
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'students', component: StudentComponent },
      { path: 'question-bank', component: QuestionBankComponent },
      { path: 'exam', component: ExamComponent },
      { path: 'questions/:code', component: QuestionsComponent }
    ]
  },

  { path: '',  component: LoginComponent },
  {
    path: 'student',
    component: StudentLayoutComponent,
    children: [
      // ✅ Default student route
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      { path: 'dashboard', component: StudentDashboardComponent },
      { path: 'results', component: ResultsComponent },
      { path: 'exams', component: TakeExamComponent }
    ]
  },
];

