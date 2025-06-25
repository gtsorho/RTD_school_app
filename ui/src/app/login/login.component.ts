import { Component, Renderer2 } from '@angular/core';
import { LoaderService } from '../loader.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import axios from 'axios';
import { StudentsService } from '../main/students/students.service';

interface user {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  isDarkMode = true;
  signinAs: string = 'default';
  userData: user = {
    email: '',
    password: '',
  };
  errorMessage: any;

  constructor(
    private renderer: Renderer2,
    private loaderService: LoaderService,
    private router: Router,
    private studentsService: StudentsService
  ) {
    this.loaderService.isDarkMode$.subscribe((res) => {
      this.isDarkMode = res;
    });
  }
  login() {
    axios
      .post(`${this.loaderService.baseUrl}/login`, this.userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        this.setCookie('token', response.data.token, 0.042);
        const role = this.loaderService.getTokenData('role');

        if (role === 'admin' && this.signinAs === 'admin') {
          this.router.navigate(['/admin/adminselection']);
        } else if (role === 'user' && this.signinAs === 'teacher') {

          this.studentsService.getAuthTeacher().subscribe({
            next: (data) => {
              if (data || data.length > 0) {
                this.studentsService.setAuthTeacher(data);
                this.router.navigate(['/main/students']);
              }
            },
            error: (error) => {
              console.error('Error fetching authenticated teacher:', error);
            },
          });
        }else{
          console.error('Invalid role or signinAs value');
        }
      })
      .catch((error) => {
        console.log(error);
        this.errorMessage =
          error.response?.data?.message || 'An error occurred';
        setTimeout(() => {
          this.errorMessage = null;
        }, 5000);
      });
  }
  

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {
      this.renderer.addClass(document.body, 'dark');
    } else {
      this.renderer.removeClass(document.body, 'dark');
    }
  }

  setCookie(cname: string, cvalue: string, exdays: number) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    let expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
  }
}
