import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import axios from 'axios';
import { LoaderService } from '../../loader.service';
import { SpinnerComponent } from "../../components/spinner/spinner.component";
import { TermService } from './term.service';
import { AcadamicYearService } from '../acadamic-year/acadamic-year.service';

interface Term {
  id?: string;
  name: string;
  start_date: Date | string;
  end_date: Date | string;
  active: boolean;
  academicYear?:any;
  academic_year_id?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-term',
  imports: [SpinnerComponent, CommonModule, FormsModule],
  templateUrl: './term.component.html',
  styleUrl: './term.component.scss'
})
export class TermComponent {
errorMessage: any;

    constructor(
      private loaderService: LoaderService,
      private termService: TermService,
      private acadamicYearService: AcadamicYearService,
    ) { }
    terms: Term[] = [];
    term: Term = {
      name: ``,
      start_date: new Date(),
      end_date: new Date(),
      active: true,
      academic_year_id: 'default',
    }
    academicYears: any[] = [];
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
      this.getTerms();
      this.getYears();
    }
  
    getTerms() {
        this.termService.getTerms().subscribe((data: Term[]) => {
          this.terms = data;
        });
    }

    getYears() {
      this.acadamicYearService.getYears().subscribe((data: any[]) => {
        this.academicYears = data;
      });
  }
  
    submitForm() {
      this.loading = true; // Start loader
      axios.post(`${this.loaderService.baseUrl}/terms`, this.term, this.axiosHeaders)
        .then(response => {
          this.getTerms();
          this.term = {
            name: `${new Date().getFullYear()}/${new Date().getFullYear() + 1} Academic Year`,
            start_date: new Date(),
            end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
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
      const { createdAt, updatedAt, academicYear, ...termData } = this.term;
      axios.put(`${this.loaderService.baseUrl}/terms/${this.term.id}`, termData, this.axiosHeaders)
        .then(response => {
          this.getTerms();
          this.term = {
            name: `${new Date().getFullYear()}/${new Date().getFullYear() + 1} Academic Year`,
            start_date: new Date(),
            end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
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
  
    onUpdate(data:Term) {
      this.isUpdate = true;
      this.term = data;
      this.term.start_date = this.formatDateToInput(data.start_date);
      this.term.end_date = this.formatDateToInput(data.end_date);
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
          this.term = {
            name: `${new Date().getFullYear()}/${new Date().getFullYear() + 1} Academic Year`,
            start_date: new Date(),
            end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
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
