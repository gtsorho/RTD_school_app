import { Injectable } from '@angular/core';
import { LoaderService } from './loader.service';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private loaderService: LoaderService) {}

  isLoggedIn(): boolean {
    const token = this.getCookie('token');
    return !!token;
  }

  getToken(): string | null {
    return this.getCookie('token');
  }

  logout() {
    this.setCookie('token', '', 0.042);
  }

  getUser() {
    axios
      .get(`${this.loaderService.baseUrl}/auth`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getCookie('token')}`,
        },
      })
      .then((response) => {
        return response.data;
      })
      .catch((error: any) => {
        console.log(error);
      });
  }

  getCookie(cname: string): string {
    let name = cname + '=';
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  }

  setCookie(cname: string, cvalue: string, exdays: number) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    let expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
  }
}
