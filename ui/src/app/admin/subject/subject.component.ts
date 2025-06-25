import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import axios from 'axios';
import { LoaderService } from '../../loader.service';
import { SpinnerComponent } from "../../components/spinner/spinner.component";
import { SubjectService } from './subject.service';
import { TeacherService } from '../teacher/teacher.service';

interface Subject {
  id?: string;
  name: string;
  code: string;
  description: string;
  teacherIds?: any[];
  teachers?:any;
  createdAt?: string;
  updatedAt?: string;
}
@Component({
  selector: 'app-subject',
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './subject.component.html',
  styleUrl: './subject.component.scss'
})
export class SubjectComponent {
errorMessage: any;

  constructor(private loaderService: LoaderService,
    private subjectService: SubjectService,
    private teacherService: TeacherService
  ) { }
  teachers: any[] = [];
  subjects: Subject[] = [];
  subject: Subject = {
    teacherIds: [],
    name: '',
    code: '',
    description: '',
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
    this.getSubjects();
    this.getTeachers();
  }

  getSubjects() {
      this.subjectService.getSubjects().subscribe((data: Subject[]) => {
        this.subjects = data;
      });
  }

  getTeachers() {
    this.teacherService.getTeachers().subscribe((data: any[]) => {
      this.teachers = data;
    });
}


onUpdate(data:Subject) {
  this.isUpdate = true;
  this.subject = data;
  this.showModal = true;
  this.subject.teacherIds = data.teachers.map((teacher: any) => {
    return { id: teacher.id, name: teacher.user.name };
  });
}

  submitForm() {
    this.loading = true; // Start loader
    if (this.subject.teacherIds) {
      this.subject.teacherIds = this.subject.teacherIds.map(teacher => teacher.id);
    }
    axios.post(`${this.loaderService.baseUrl}/subjects`, this.subject, this.axiosHeaders)
      .then(response => {
        this.getSubjects();
        this.subject = {
          name: '',
          code: '',
          description: '',
          teacherIds: []
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
  if (this.subject.teacherIds) {
    this.subject.teacherIds = this.subject.teacherIds.map(teacher => teacher.id);
  }
  const { createdAt, updatedAt, teachers, ...subjectData } = this.subject;

    axios.put(`${this.loaderService.baseUrl}/subjects/${this.subject.id}`, subjectData, this.axiosHeaders)
      .then(response => {
        this.getSubjects();
        this.subject = {
          name: '',
          code: '',
          description: '',
          teacherIds: []
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
    axios.delete(`${this.loaderService.baseUrl}/subjects/${id}`, this.axiosHeaders)
      .then(response => {
        this.getSubjects();
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
    if (!this.subject.teacherIds) {
      this.subject.teacherIds = [];
    }
    if (teacher && !this.subject.teacherIds.some(t => t.id == teacher.id)) {
      this.subject.teacherIds.push({ id: teacher.id, name: teacher.user.name });
      console.log(this.subject.teacherIds)
    }
  }

  removeTeacher(id: any) {
    if (this.subject.teacherIds) {
      this.subject.teacherIds = this.subject.teacherIds.filter(t => t.id != id.toString());
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
