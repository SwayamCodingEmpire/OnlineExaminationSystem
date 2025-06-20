import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginResponse } from '../../models/LoginResponse';
import { LoginCredentials } from '../../models/LoginCredentials';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

private loginUrl = 'http://localhost:8080/v1/login';

  constructor(private http: HttpClient) {}

  login(loginCredentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.loginUrl, loginCredentials);
  }

  storeTokenAndRole(token: string, role: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
  }
}

