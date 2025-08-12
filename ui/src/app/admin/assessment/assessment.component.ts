import { Component } from '@angular/core';
import axios from 'axios';
import { LoaderService } from '../../loader.service';
import { AcadamicYearService } from '../acadamic-year/acadamic-year.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { TermService } from '../term/term.service';
import { SubjectService } from '../subject/subject.service';
import { AssessmentService } from './assessment.service';

interface AcademicYear {
  id?: string;
  name: string;
  start_date: string;
  end_date: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Assessment {
  id?: string;
  type: string;
  weight: string;
  subject_id?: string;
  term_id?: string;
  academic_year_id?: string;
  subject?: any;
  term?: any;
  academicYear?:any;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-assessment',
  imports: [FormsModule, CommonModule, SpinnerComponent],
  templateUrl: './assessment.component.html',
  styleUrl: './assessment.component.scss',
})
export class AssessmentComponent {
  errorMessage: any;

  constructor(
    private loaderService: LoaderService,
    private acadamicYearService: AcadamicYearService,
    private termsService: TermService,
    private subjectsService: SubjectService,
    private assessmentsService: AssessmentService
  ) {}

  terms: any[] = [];
  activeYear: any;
  subjects: any[] = [];
  assessments: Assessment[] = [];
  assessment: Assessment = {
    type: 'classwork',
    weight: '0',
  };
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
    this.getActiveYear();
    this.getTerms();
    this.getSubjects();
    this.getAssessments();
  }

  getActiveYear() {
    this.acadamicYearService
      .getActiveYear()
      .subscribe((data: AcademicYear[]) => {
        this.activeYear = data;
      });
  }

  getTerms() {
    this.termsService.getTerms().subscribe((data: any[]) => {
      this.terms = data;
    });
  }

  getSubjects() {
    this.subjectsService.getSubjects().subscribe((data: any[]) => {
      this.subjects = data;
    });
  }

  getAssessments() {
    this.assessmentsService.getAssessments().subscribe((data: any[]) => {
      this.assessments = data;
    });
  }

  submitForm() {
    this.loading = true; // Start loader
    axios
      .post(
        `${this.loaderService.baseUrl}/assessments`,
        this.assessment,
        this.axiosHeaders
      )
      .then((response) => {
        this.getActiveYear();
        this.assessment = {
          type: 'classwork',
          weight: '0',
          subject_id: '',
          term_id: '',
          academic_year_id: this.activeYear[0]?.id || '',
        };
        this.showModal = false;
      })
      .catch((error) => {
        console.error('Error submitting form:', error);
        this.errorMessage =
          error.response?.data?.message || 'An error occurred';
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
    const { createdAt, updatedAt, ...assessmentData } = this.assessment;
    axios
      .put(
        `${this.loaderService.baseUrl}/years/${this.assessment.id}`,
        assessmentData,
        this.axiosHeaders
      )
      .then((response) => {
        this.getActiveYear();
        this.assessment = {
          type: 'classwork',
          weight: '0',
          subject_id: '',
          term_id: '',
          academic_year_id: this.activeYear[0]?.id || '',
        };
        this.showModal = false;
        this.isUpdate = false;
      })
      .catch((error) => {
        console.error('Error submitting form:', error);
        this.errorMessage =
          error.response?.data?.message || 'An error occurred';
        setTimeout(() => {
          this.errorMessage = null;
        }, 5000);
      })
      .finally(() => {
        this.loading = false; // Stop loader
      });
  }

  onUpdate(data: Assessment) {
    this.isUpdate = true;
    this.assessment = data;
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
      .delete(`${this.loaderService.baseUrl}/years/${id}`, this.axiosHeaders)
      .then((response) => {
        alert('Academic year deleted successfully.');
        this.getActiveYear();
        this.showModal = false;
      })
      .catch((error) => {
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
