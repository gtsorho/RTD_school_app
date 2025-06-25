import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import axios from 'axios';
import { LoaderService } from '../../loader.service';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { AcadamicYearService } from '../acadamic-year/acadamic-year.service';
import { TeacherService } from './teacher.service';
import { ClassService } from '../class/class.service';

interface Teacher {
  id?: string;
  user_id: string;
  user?: any;
  classIds?: any[];
  subjects?: any;
  classes?: any;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-teacher',
  imports: [SpinnerComponent, CommonModule, FormsModule],
  templateUrl: './teacher.component.html',
  styleUrl: './teacher.component.scss',
})
export class TeacherComponent {
  errorMessage: any;

  constructor(
    private loaderService: LoaderService,
    private teacherService: TeacherService,
    private classService: ClassService
  ) {}
  teachers: Teacher[] = [];
  teacher: Teacher = {
    user_id: 'default',
    classIds: [],
  };
  users: any[] = [];
  classes: any[] = [];
  showModal = false;
  isUpdate = false;
  selectedClassId: number | null | string = 'default';

  loading: boolean = false;
  axiosHeaders: any = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.getCookie('token')}`,
    },
  };

  ngOnInit() {
    this.getTeachers();
    this.getUsers();
    this.getClasses()
  }

  getTeachers() {
    this.teacherService.getTeachers().subscribe((data: Teacher[]) => {
      this.teachers = data;
    });
  }

  getClasses() {
    this.classService.getClasses().subscribe((data: any) => {
      this.classes = data;
    });
  }

  getUsers() {
    this.teacherService.getUsers().subscribe((data: any[]) => {
      this.users = data;
    });
  }

  submitForm() {
    this.loading = true; // Start loader
    if (this.teacher.classIds) {
      this.teacher.classIds = this.teacher.classIds.map(
        (this_class) => this_class.id
      );
    }
    axios
      .post(
        `${this.loaderService.baseUrl}/teachers`,
        this.teacher,
        this.axiosHeaders
      )
      .then((response) => {
        this.getTeachers();
        this.teacher = {
          user_id: 'default',
        };
        this.showModal = false;
      })
      .catch((error) => {
        console.error('Error submitting form:', error);
        this.errorMessage = error.response.data.message || 'An error occurred';
        setTimeout(() => {
          this.errorMessage = null;
        }, 5000);
      })
      .finally(() => {
        this.loading = false; // Stop loader
      });
  }

  updateForm() {
    this.loading = true; // Start loader
    if (this.teacher.classIds) {
      this.teacher.classIds = this.teacher.classIds.map(
        (this_class) => this_class.id
      );
    }
    // Only send user_id, id, and classIds
    const teacherData = {
      user_id: this.teacher.user_id,
      id: this.teacher.id,
      classIds: this.teacher.classIds
    };

    axios
      .put(
        `${this.loaderService.baseUrl}/teachers/${this.teacher.id}`,
        teacherData,
        this.axiosHeaders
      )
      .then((response) => {
      this.getTeachers();
      this.teacher = {
        user_id: 'default',
      };
      this.showModal = false;
      this.isUpdate = false;
      })
      .catch((error) => {
      console.error('Error submitting form:', error);
      this.errorMessage = error.response.data.message || 'An error occurred';
      setTimeout(() => {
        this.errorMessage = null;
      }, 5000);
      })
      .finally(() => {
      this.loading = false; // Stop loader
      });
  }

  onUpdate(data: Teacher) {
    this.isUpdate = true;
    this.teacher = data;
    this.showModal = true;
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  deleteItem(id: string) {
    if (!confirm('Are you sure you want to delete this academic year?')) {
      return;
    }
    this.loading = true;
    axios
      .delete(`${this.loaderService.baseUrl}/teachers/${id}`, this.axiosHeaders)
      .then((response) => {
        this.getTeachers();
      })
      .catch((error) => {
        console.error('Error deleting item:', error);
      })
      .finally(() => {
        this.loading = false;
      });
  }
  getNextFiveYears(): any {
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1];
    for (let i = 0; i < 5; i++) {
      years.push(currentYear + i);
    }
    return years;
  }

  formatReadableDate(isoString: any) {
    const date = new Date(isoString);

    return date
      .toLocaleString('en-US', {
        weekday: 'short', // e.g., Tue
        month: 'short', // e.g., Feb
        day: 'numeric', // e.g., 25
        year: 'numeric', // e.g., 2025
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // AM/PM format
      })
      .replace('AM', 'AM')
      .replace('PM', 'PM'); // Removes any extra timezone info
  }

  formatDateToInput(date: string | Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onClassSelect() {
    const this_class = this.classes.find((c) => c.id == this.selectedClassId);
    if (!this.teacher.classIds) {
      this.teacher.classIds = [];
    }
    if (
      this_class &&
      !this.teacher.classIds.some((c) => c.id == this_class.id)
    ) {
      this.teacher.classIds.push({ id: this_class.id, name: this_class.name });
      console.log(this.teacher.classIds);
    }
  }

  removeClass(id: any) {
    if (this.teacher.classIds) {
      this.teacher.classIds = this.teacher.classIds.filter(
        (t) => t.id != id.toString()
      );
    }
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
