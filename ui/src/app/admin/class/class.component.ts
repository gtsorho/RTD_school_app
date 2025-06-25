import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import axios from 'axios';
import { LoaderService } from '../../loader.service';
import { SpinnerComponent } from "../../components/spinner/spinner.component";
import { TeacherService } from '../teacher/teacher.service';
import { ClassService } from './class.service';

interface Class {
  id?: string;
  name: string;
  teacherIds?: any[];
  teachers?:any;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-class',
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './class.component.html',
  styleUrl: './class.component.scss'
})
export class ClassComponent {
errorMessage: any;

  constructor(private loaderService: LoaderService,
    private classService: ClassService,
    private teacherService: TeacherService
  ) { }
  teachers: any[] = [];
  classes: Class[] = [];
  class: Class = {
    teacherIds: [],
    name: ''
  }
  selectedTeacherId: number | null | string = 'default';
  showModal = false;
  isUpdate = false;
  loading: boolean = false;
  axiosHeaders: any = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.getCookie('token')}`,
    },
  };

  ngOnInit() {
    this.getClasses();
    this.getTeachers();
  }

  getClasses() {
      this.classService.getClasses().subscribe((data: Class[]) => {
        this.classes = data;
      });
  }

  getTeachers() {
    this.teacherService.getTeachers().subscribe((data: any[]) => {
      this.teachers = data;
    });
}


onUpdate(data:Class) {
  this.isUpdate = true;
  this.class = data;
  this.showModal = true;
  this.class.teacherIds = data.teachers.map((teacher: any) => {
    return { id: teacher.id, name: teacher.user.name };
  });
}

  submitForm() {
    this.loading = true; // Start loader
    if (this.class.teacherIds) {
      this.class.teacherIds = this.class.teacherIds.map(teacher => teacher.id);
    }
    axios.post(`${this.loaderService.baseUrl}/classes`, this.class, this.axiosHeaders)
      .then(response => {
        this.getClasses();
        this.class = {
          teacherIds: [],
          name: '',
        };
        this.showModal = false;
      })
      .catch(error => {
        console.error('Error submitting form:', error);
        this.errorMessage = error.response?.data?.message || 'An error occurred';
        setTimeout(() => {
          this.errorMessage = null;
        }, 5000);
      })
      .finally(() => {
        this.loading = false; // Stop loader
      });
  }

  updateForm(){
    this.loading = true; // Start loader
    if (this.class.teacherIds) {
      this.class.teacherIds = this.class.teacherIds.map(teacher => teacher.id);
    }
    const { createdAt, updatedAt, teachers, ...classData } = this.class;

    axios.put(`${this.loaderService.baseUrl}/classes/${this.class.id}`, classData, this.axiosHeaders)
      .then(response => {
        this.getClasses();
        this.class = {
          teacherIds: [],
          name: '',
        };
        this.showModal = false;
        this.isUpdate = false;
      })
      .catch(error => {
        console.error('Error submitting form:', error);
        this.errorMessage = error.response?.data?.message || 'An error occurred';
        setTimeout(() => {
          this.errorMessage = null;
        }, 5000);
      })
      .finally(() => {
        this.loading = false; // Stop loader
      });
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
    axios.delete(`${this.loaderService.baseUrl}/classes/${id}`, this.axiosHeaders)
      .then(response => {
        this.getClasses();
        this.showModal = false;
      })
      .catch(error => {
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

  onTeacherSelect() {
    const teacher = this.teachers.find(t => t.id == this.selectedTeacherId);
    if (!this.class.teacherIds) {
      this.class.teacherIds = [];
    }
    if (teacher && !this.class.teacherIds.some(t => t.id == teacher.id)) {
      this.class.teacherIds.push({ id: teacher.id, name: teacher.user.name });
      console.log(this.class.teacherIds)
    }
  }

  removeTeacher(id: any) {
    if (this.class.teacherIds) {
      this.class.teacherIds = this.class.teacherIds.filter(t => t.id != id.toString());
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
