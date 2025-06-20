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
import { ExamsComponent } from './components/student/exams/exams.component';
import { TopicComponent } from './components/admin/topics/topics/topics.component';
import { AddStudentComponent } from './components/admin/add-student/add-student.component';
import { ResultListComponent } from './components/student/result-list/result-list/result-list.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { role: 'ADMIN' },
    component: AdminLayoutComponent,
    children: [
      // ✅ Default admin route
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'students', component: StudentComponent },
      { path: 'question-bank', component: QuestionBankComponent },
      { path: 'exam', component: ExamComponent },
      { path: 'questions/:code', component: QuestionsComponent },
      { path: 'topics', component: TopicComponent },
      { path: 'add-student/:code', component: AddStudentComponent }
    ]
  },
  {
    path: 'student',
    canActivate: [authGuard],
    data: { role: 'STUDENT' },
    component: StudentLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: StudentDashboardComponent },
      { path: 'results/:id', component: ResultsComponent },       // ✅ View specific result
      { path: 'exams', component: ExamsComponent },
      { path: 'take-exam/:code', component: TakeExamComponent },
      { path: 'student-history' , component:ResultListComponent }
    ]
  },
];

