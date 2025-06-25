import { Component, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import axios from 'axios';
import { LoaderService } from '../../loader.service';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { StudentService } from './student.service';
import { ClassService } from '../class/class.service';

interface Student {
  id?: string | number;
  name: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  date_of_birth?: string;
  gender?: string;
  phone_number?: string;
  address?: string;
  guardian?: string;
  guardian_phone?: string;
  class_id?: string;
  class?: any;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SpinnerComponent],
  templateUrl: './student.component.html',
  styleUrl: './student.component.scss',
})
export class StudentComponent {
  isDarkMode = true;
  loading = false;
  isLoggedIn = false;
  students: Student[] = [];
  classes: any[] = [];
  student: Student = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    date_of_birth: '',
    gender: '',
    phone_number: '',
    address: '',
    guardian: '',
    guardian_phone: '',
    class_id: '',
  };
  isUpdate: boolean = false;
  showModal: boolean = false;
  errorMessage: string = '';

  defaultPhotoUrl =
    'https://images.unsplash.com/photo-1531316282956-d38457be0993?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80';
  photoPreview: string | null = null;
showExportModal: any;


  constructor(
    private renderer: Renderer2,
    private loaderService: LoaderService,
    private studentService: StudentService,
    private classService: ClassService,
    private router: Router
  ) {

  }

  ngOnInit() {
    this.getStudents();
    this.getClasses();
  }


  // --- CRUD ---
  getStudents() {
    this.studentService.getStudents().subscribe((data: Student[]) => {
      this.students = data;
    });
  }

  getClasses() {
    this.classService.getClasses().subscribe((data: any[]) => {
      this.classes = data;
    });
  }

  submitForm() {
    this.loading = true;
    const formData = new FormData();

    for (const [key, value] of Object.entries(this.student)) {
      if (value) formData.append(key, value.toString());
    }

    if (this.photoPreview) {
      const blob = this.dataURLtoBlob(this.photoPreview);
      formData.append('image', blob, 'profile.jpg');
    }

    const url = this.student.id
      ? `${this.loaderService.baseUrl}/students/${this.student.id}`
      : `${this.loaderService.baseUrl}/students`;

    const method = this.student.id ? 'put' : 'post';

    axios({
      method,
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${this.getCookie('token')}`,
      },
    })
      .then(() => {
        this.getStudents();
        this.resetForm();
      })
      .catch((error) => {
        console.error('Error saving student:', error)
        this.errorMessage = 'Failed to save student. Please try again.';
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      })
      .finally(() => (this.loading = false));
  }
  onUpdate(data: Student) {
    this.isUpdate = true;
    this.student = data;
    this.photoPreview = data.image || null;
    this.showModal = true;
  }

  updateStudent() {
    this.loading = true;
  
    const formData = new FormData();
  
    // Append all updatable fields
    for (const [key, value] of Object.entries(this.student)) {
      if (value && key !== 'id') {
        formData.append(key, value.toString());
      }
    }
  
    // If image preview is present, include image blob
    if (this.photoPreview) {
      const blob = this.dataURLtoBlob(this.photoPreview);
      formData.append('image', blob, 'profile.jpg');
    }
  
    axios
      .put(`${this.loaderService.baseUrl}/students/${this.student.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${this.getCookie('token')}`,
        },
      })
      .then(() => {
        this.getStudents(); // Refresh list
        this.resetForm();   // Clear form
      })
      .catch((error) => {
        console.error('Error updating student:', error);
      })
      .finally(() => {
        this.loading = false;
      });
  }

  exportStudents(){
    axios
      .get(`${this.loaderService.baseUrl}/students/export`, {
        headers: { Authorization: `Bearer ${this.getCookie('token')}` },
        responseType: 'blob',
      })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'students.xlsx';
        document.body.appendChild(a);
        a.click();
      })
      .catch((error) => console.error('Error exporting students:', error));
  }


  selectedFile: File | null = null;
  
  isDragging = false;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
  
    if (file && /\.(xlsx?|xls)$/i.test(file.name)) {
      this.selectedFile = file;
    } else {
      alert('Invalid file type. Please upload a .xlsx or .xls file.');
      this.selectedFile = null;
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
      event.dataTransfer.clearData();
    }
  }
  
  importStudents(){
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
  
      axios
        .post(`${this.loaderService.baseUrl}/students/import`, formData, {
          headers: { Authorization: `Bearer ${this.getCookie('token')}` },
        })
        .then(() => {
          this.getStudents(); // Refresh the student list
          this.selectedFile = null; // Reset the selected file
          this.showExportModal = false; // Close the modal
        })
        .catch((error) => {
          console.error('Error importing students:', error)
          this.errorMessage = 'Failed to import students. Please try again.';
          setTimeout(() => {
            this.errorMessage = '';
          }, 5000);
        });        
    } else {
      console.error('No file selected for import.');
      this.errorMessage = 'Please select a file to import.';
      setTimeout(() => {
        this.errorMessage = '';
      }, 5000);
    }
  }
  


  deleteStudent(id: string | number) {
    if (!confirm('Are you sure you want to delete this student?')) return;

    axios
      .delete(`${this.loaderService.baseUrl}/students/${id}`, {
        headers: { Authorization: `Bearer ${this.getCookie('token')}` },
      })
      .then(() => this.getStudents())
      .catch((error) => console.error('Error deleting student:', error));
  }

  // --- FILE + COOKIE ---
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.photoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  dataURLtoBlob(dataURL: string): Blob {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  getCookie(cname: string): string {
    const name = cname + '=';
    const ca = document.cookie.split(';');
    for (let c of ca) {
      c = c.trim();
      if (c.indexOf(name) === 0) return c.substring(name.length);
    }
    return '';
  }

  setCookie(cname: string, cvalue: string, exdays: number) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + d.toUTCString();
    document.cookie = `${cname}=${cvalue};${expires};path=/`;
  }

  resetForm() {
    this.student = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      date_of_birth: '',
      gender: '',
      phone_number: '',
      address: '',
      guardian: '',
      guardian_phone: '',
      class_id: '',
    };
    this.photoPreview = null;
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      this.renderer.addClass(document.body, 'dark');
    } else {
      this.renderer.removeClass(document.body, 'dark');
    }
  }

  formatReadableDate(iso: any) {
    const date = new Date(iso);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
