import { Component } from '@angular/core';
import { LoginCredentials } from '../../../models/LoginCredentials';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { LoginService } from '../../../services/login/login.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ToastrModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  rememberMe: boolean = false;
  username: string = 'swayam';
  password: string = 'password';
  loginForm: FormGroup;
  constructor(private router: Router, private toastr: ToastrService, private loginService: LoginService) {
    this.loginForm = new FormGroup({
      userName: new FormControl('', Validators.required),
      password: new FormControl('', [Validators.required])
    });
  }
  showPassword: boolean = false;
  togglePassword() {
    this.showPassword = !this.showPassword;
  }


  ngOnInit() {
    localStorage.removeItem('user'); // Clear any previous user data
    localStorage.removeItem('token'); // Clear any previous token
    localStorage.removeItem('role'); // Clear any previous role
  }

  login() {
    if (this.loginForm.invalid) {
      this.toastr.error('Please enter Username and Password');
      return;
    }

    const formValues = this.loginForm.value;
    const credentials: LoginCredentials = {
      email: formValues.userName, // use 'userName' as input, send 'email' to backend
      password: formValues.password
    };
    console.log('Login credentials:', credentials);

    this.loginService.login(credentials).subscribe({
      next: (response) => {
        this.toastr.success('Login Successful');
        this.loginService.storeTokenAndRole(response.token, response.role);
        localStorage.setItem('user', JSON.stringify(credentials));
        if (this.rememberMe) {

        }

        // Role-based redirect
        switch (response.role) {
          case 'ADMIN':
            this.router.navigate(['/admin']);
            break;
          case 'STUDENT':
            this.router.navigate(['/student']);
            break;
          default:
            this.router.navigate(['/login']);
        }
      },
      error: (error) => {
        if (error.status === 403) {
          this.toastr.error('Invalid email or password.');
        } else {
          this.toastr.error('Something went wrong. Please try again later.');
        }
        console.error('Login error:', error);
      }
    });
  }

}
