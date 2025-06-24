import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../Enviornment/enviornment';

@Injectable({
  providedIn: 'root'
})
export class TopicsService {
  private baseUrl = `${environment.apiUrl}/topic`;

  constructor(private http: HttpClient) { }

  private getHttpOptions() {
    const token = localStorage.getItem('token'); // Get token from localStorage
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      })
    };
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error: ${error.status} - ${error.message}`;

      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }

    console.error('TopicsService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  getTopics(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/all`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }



  // Additional methods for topic management if needed
  addTopic(topic: any): Observable<any> {
    return this.http.post(this.baseUrl, topic,  { ...this.getHttpOptions(), responseType: 'text' as 'json' })
      .pipe(catchError(this.handleError));
  }

  updateTopic(code: string, topic: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${code}`, topic, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  deleteTopic(code: string): Observable<any> {
    console.log('Deleting topic with code:', code);
    return this.http.delete(`${this.baseUrl}/${code}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }
}
