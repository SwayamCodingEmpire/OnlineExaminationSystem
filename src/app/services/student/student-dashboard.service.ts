import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudentDashboardDTO, LeaderboardEntryDTO } from '../../models/studentdashboard';

// --- DTO interfaces (can move to a models file if you like) ---


// --- Service itself ---

@Injectable({ providedIn: 'root' })
export class StudentDashboardService {
  private baseUrl = 'http://localhost:8080/v1'; // Use proxy config or change for prod as needed

  constructor(private http: HttpClient) {}

  /** GET /v1/student/dashboard */
  getDashboard(): Observable<StudentDashboardDTO> {
    return this.http.get<StudentDashboardDTO>(`${this.baseUrl}/student/dashboard`);
  }

  /** GET /v1/student/dashboard/leaderboard/{examCode} */
  getLeaderboard(examCode: string): Observable<LeaderboardEntryDTO[]> {

    console.log(`${this.baseUrl}/student/dashboard/leaderboard/${examCode}`)
    return this.http.get<LeaderboardEntryDTO[]>(
      `${this.baseUrl}/student/dashboard/leaderboard/${examCode}`
    );
  }
}
