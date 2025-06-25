import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import axios from 'axios';
import { LoaderService } from '../../loader.service';
import { AcadamicYearService } from './acadamic-year.service';
import { SpinnerComponent } from "../../components/spinner/spinner.component";

interface AcademicYear {
  id?: string;
  name: string;
  start_date: string;
  end_date: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
@Component({
  selector: 'app-acadamic-year',
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './acadamic-year.component.html',
  styleUrl: './acadamic-year.component.scss'
})
export class AcadamicYearComponent {
errorMessage: any;

  constructor(private loaderService: LoaderService,
    private acadamicYearService: AcadamicYearService,
  ) { }
  academicYears: any[] = [];
  academicYear: AcademicYear = {
    name: `${new Date().getFullYear()}/${new Date().getFullYear() + 1} Academic Year`,
    start_date: new Date().getFullYear().toString(),
    end_date: (new Date().getFullYear() + 1 ).toString(),
    active: true
  }
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
    this.getYears();
  }

  getYears() {
      this.acadamicYearService.getYears().subscribe((data: AcademicYear[]) => {
        this.academicYears = data;
      });
  }

  submitForm() {
    this.loading = true; // Start loader
    axios.post(`${this.loaderService.baseUrl}/years`, this.academicYear, this.axiosHeaders)
      .then(response => {
        this.getYears();
        this.academicYear = {
          name: `${new Date().getFullYear()}/${new Date().getFullYear() + 1} Academic Year`,
          start_date: new Date().getFullYear().toString(),
          end_date: (new Date().getFullYear() + 1).toString(),
          active: false
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
    const { createdAt, updatedAt, ...academicYearData } = this.academicYear;
    axios.put(`${this.loaderService.baseUrl}/years/${this.academicYear.id}`, academicYearData, this.axiosHeaders)
      .then(response => {
        this.getYears();
        this.academicYear = {
          name: `${new Date().getFullYear()}/${new Date().getFullYear() + 1} Academic Year`,
          start_date: new Date().getFullYear().toString(),
          end_date: (new Date().getFullYear() + 1).toString(),
          active: false
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

  onUpdate(data:AcademicYear) {
    this.isUpdate = true;
    this.academicYear = data;
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
    axios.delete(`${this.loaderService.baseUrl}/years/${id}`, this.axiosHeaders)
      .then(response => {
        alert('Academic year deleted successfully.');
        this.getYears();
        this.academicYear = {
          name: `${new Date().getFullYear()}/${new Date().getFullYear() + 1} Academic Year`,
          start_date: new Date().getFullYear().toString(),
          end_date: (new Date().getFullYear() + 1).toString(),
          active: false
        };
        this.showModal = false;
      })
      .catch(error => {
        console.error('Error deleting item:', error);
        alert('Failed to delete the academic year. Please try again.');
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

  dateChange() {
    this.academicYear.name = `${this.academicYear.start_date}/${this.academicYear.end_date} Academic Year`;  
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
