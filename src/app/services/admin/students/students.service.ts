import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserInfo } from '../../../models/student.interface';
import { environment } from '../../../../Enviornment/enviornment';





@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private baseUrl = `${environment.apiUrl}/student`;

  constructor(private http: HttpClient) { }

  getStudents(): Observable<UserInfo[]> {
    return this.http.get<UserInfo[]>(`${this.baseUrl}/all`);
  }

  addStudent(student: UserInfo): Observable<any> {
    return this.http.post(this.baseUrl, student);
  }

  updateStudent(student: UserInfo): Observable<any> {
    return this.http.put(this.baseUrl, student);
  }

  deleteStudent(code: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${code}`);
  }

  bulkUploadStudents(userInfo: UserInfo[]): Observable<any> {
    console.log(userInfo);
    return this.http.post(`${this.baseUrl}/bulk-upload`, userInfo);
  }

}
