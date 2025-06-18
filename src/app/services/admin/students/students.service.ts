import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class StudentsService {
   private baseUrl ='http://localhost:8080/admin/Students'; // Replace with your API endpoint

  constructor(private http:HttpClient) {

   }


getStudents(): Observable<any[]> {
  // const token = localStorage.getItem('token'); // or retrieve from a service
  // const headers = new HttpHeaders({
  //   Authorization: `Bearer ${token}`
  // });

  return this.http.get<any[]>(`${this.baseUrl}/all`);
}

getAvailableStudents(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/basic`);
}



  addStudent(Student: any): Observable<any> {
    return this.http.post(this.baseUrl, Student);
  }

  updateStudent(Student: any): Observable<any> {
    return this.http.put(this.baseUrl, Student);
  }

    deleteStudent(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}

