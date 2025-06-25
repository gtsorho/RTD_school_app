import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoaderService } from '../../loader.service';
import { FormsModule } from '@angular/forms';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import axios from 'axios';
import { AdminSelectionService } from './admin-selection.service';

interface User {
  id?: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
  image?: string;
  phone?: string;
}

@Component({
  selector: 'app-admin-selection',
  imports: [CommonModule, RouterModule, FormsModule,SpinnerComponent],
  templateUrl: './admin-selection.component.html',
  styleUrl: './admin-selection.component.scss',
})
export class AdminSelectionComponent {

  isUpdate = false;
  loading = false;
  users: any;
  user: User = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    phone: '',
  };
  isAddUser:boolean = false;
  axiosHeaders: any = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.getCookie('token')}`,
    },
  };

  defaultPhotoUrl =
    'https://images.unsplash.com/photo-1531316282956-d38457be0993?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80';
  photoPreview: string | null = null;
errorMessage: any;

  constructor(
    private loaderService: LoaderService,
    private adminSelectionService: AdminSelectionService
  ) {}

  ngOnInit() {
    this.getUsers();
  }

  getUsers() {
    this.adminSelectionService.getUsers().subscribe((data: User[]) => {
      this.users = data;
    });
  }

  updateForm() {
    this.loading = true; // Start loader

    const formData = new FormData();
    formData.append('name', this.user.name);
    formData.append('email', this.user.email);
    formData.append('password', this.user.password);
    formData.append('confirmPassword', this.user.confirmPassword);
    formData.append('role', this.user.role);
    formData.append('phone', this.user.phone || '');

    if (this.photoPreview) {
      const blob = this.dataURLtoBlob(this.photoPreview);
      formData.append('image', blob, 'profile.jpg');
    }

    axios
      .put(
        `${this.loaderService.baseUrl}/users/${this.user.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${this.getCookie('token')}`,
          },
        }
      )
      .then((response) => {
        this.getUsers();
        this.user = {
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'user',
        };
        this.photoPreview = null;
        this.getUsers();

      })
      .catch((error) => {
        console.error('Error updating user:', error);
        this.errorMessage = error.response?.data?.message || 'An error occurred';
        setTimeout(() => {
          this.errorMessage = null;
        }, 5000);
      })
      .finally(() => {
        this.loading = false; // Stop loader
      });
  }
  
  submitForm() {
    this.loading = true;

    const formData = new FormData();
    formData.append('name', this.user.name);
    formData.append('email', this.user.email);
    formData.append('password', this.user.password);
    formData.append('confirmPassword', this.user.confirmPassword);
    formData.append('role', this.user.role);
    formData.append('phone', this.user.phone || '');


    if (this.photoPreview) {
      const blob = this.dataURLtoBlob(this.photoPreview);
      formData.append('image', blob, 'profile.jpg');
    }

    axios
      .post('/api/users', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${this.getCookie('token')}`,
        },
      })
      .then((response) => {
        console.log('User created successfully:', response.data);
        this.user = {
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'user',
        };
        this.photoPreview = null;
        this.getUsers();
      })
      .catch((error) => {
        console.error('Error creating user:', error);
        this.errorMessage = error.response?.data?.message || 'An error occurred';
        setTimeout(() => {
          this.errorMessage = null;
        }, 5000);
      })
      .finally(() => {
        this.loading = false;
      });
  }

  deleteUser(id: any) {
    console.log('Deleting user with ID:', id);
    if (!confirm('Are you sure you want to delete this user?')) {
      return; 
    }

    this.loading = true; // Start loader
    axios
      .delete(`${this.loaderService.baseUrl}/users/${id}`, this.axiosHeaders)
      .then((response) => {
        console.log('User deleted successfully:', response.data);
        this.getUsers();
      })
      .catch((error) => {
        console.error('Error deleting user:', error);
      })
      .finally(() => {
        this.loading = false; // Stop loader
      });
  }

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

  private dataURLtoBlob(dataURL: string): Blob {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
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
