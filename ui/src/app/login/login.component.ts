import { Component, Renderer2, inject } from '@angular/core';
import { LoaderService } from '../loader.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MsalService } from '@azure/msal-angular';

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

  private msalService = inject(MsalService);

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

MSALlogin() {
  this.msalService.loginPopup().subscribe({
    next: async (result) => {
      console.log('Logged in:', result);

      // Get Azure AD access token
      const tokenResponse = await this.msalService.acquireTokenSilent({
        scopes: ['api://1d1e71b9-a285-41a2-acab-0eeb6e867057/.default']
      }).toPromise();

      const accessToken = tokenResponse?.accessToken;
      console.log('Azure AD Access Token:', accessToken);

      // Send token to backend
      const res = await axios.post(`${this.loaderService.baseUrl}/login`, {token:accessToken}, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Backend Response:', res.data);
    },
    error: (err) => console.error(err),
  });
}

  logout() {
    this.msalService.logoutPopup();
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
