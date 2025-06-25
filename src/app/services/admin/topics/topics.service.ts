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
    return this.http.get<any[]>(`${this.baseUrl}/all`)
      .pipe(catchError(this.handleError));
  }



  // Additional methods for topic management if needed
  addTopic(topic: any): Observable<any> {
    return this.http.post(this.baseUrl, topic,  { responseType: 'text' as 'json' })
      .pipe(catchError(this.handleError));
  }

  updateTopic(code: string, topic: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${code}`, topic, { responseType: 'text' as 'json' })
      .pipe(catchError(this.handleError));
  }

  deleteTopic(code: string): Observable<any> {
    console.log('Deleting topic with code:', code);
    return this.http.delete(`${this.baseUrl}/${code}`)
      .pipe(catchError(this.handleError));
  }
}
