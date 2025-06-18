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
import { ResultListComponent } from './components/student/result-list/result-list/result-list.component';
import { AddStudentsComponent } from './components/admin/add-students/add-students.component';

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
      { path: 'exam/questions/:code', component: QuestionsComponent },
      { path: 'exam/students/:code', component: AddStudentsComponent },
    ]
  },
  {
    path: 'student',
    component: StudentLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: StudentDashboardComponent },
      { path: 'results/:id', component: ResultsComponent },       // ✅ View specific result
      { path: 'exams', component: ExamsComponent },
      { path: 'take-exam/:id', component: TakeExamComponent },
      { path: 'student-history' , component:ResultListComponent }
    ]
  },
];

