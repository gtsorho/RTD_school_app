import { CommonModule } from '@angular/common';
import { Component, Renderer2, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { LoaderService } from '../loader.service';
import { interval, Subscription } from 'rxjs';
import { StudentsService } from './students/students.service';

@Component({
  selector: 'app-main',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  isAdmin: boolean = false;
  isSidebarOpen: boolean = false;
  isDarkMode: boolean = true;
  private tokenCheckSubscription!: Subscription;

  constructor(
    private renderer: Renderer2,
    private loaderService: LoaderService,
    public router: Router,
    private studentsService: StudentsService
  ) {
    this.loaderService.isDarkMode$.subscribe((res) => {
      this.isDarkMode = res;
    });
  }

  ngOnInit() {
    // this.verifyAdmin();
    this.loadAuthTeacher();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.renderer.setAttribute(
      document.body,
      'class',
      this.isDarkMode ? 'dark' : ''
    );
  }

  loadAuthTeacher() {
    this.studentsService.getAuthTeacher().subscribe({
      next: (data) => {
        if (data || data.length > 0) {
          this.studentsService.setAuthTeacher(data);
        }
      },
      error: (error) => {
        console.error('Error fetching authenticated teacher:', error);
      },
    });
  }

  clearToken() {
    this.setCookie('token', '', 1);
    this.router.navigate(['']);
  }

  verifyAdmin() {
    const data = this.loaderService.getDecodedToken();
    this.isAdmin = data?.role === 'admin';
  }

  getCookie(cname: string) {
    const name = `${cname}=`;
    const ca = document.cookie.split(';');
    for (const c of ca) {
      const cookie = c.trim();
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length);
      }
    }
    return '';
  }

  setCookie(cname: string, cvalue: string, exdays: number) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    const expires = `expires=${d.toUTCString()}`;
    document.cookie = `${cname}=${cvalue};${expires};path=/`;
  }
}
