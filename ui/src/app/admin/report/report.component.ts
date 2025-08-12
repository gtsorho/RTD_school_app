import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClassService } from '../class/class.service';
import { LoaderService } from '../../loader.service';
import { SubjectService } from '../subject/subject.service';
import { StudentsService } from '../../main/students/students.service';
import { AcadamicYearService } from '../acadamic-year/acadamic-year.service';
import { TermService } from '../term/term.service';
import axios from 'axios';
import { SpinnerComponent } from '../../components/spinner/spinner.component';

@Component({
  selector: 'app-report',
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss',
})
export class ReportComponent {
  selectedSubject: string | number = 0;
  selectedClass: string | number = 0;
  searchStudentName: string = '';
  subjects: any[] = [];
  students: any[] = [];
  classes: any[] = [];
  teacher: any;
  activeYear: any;
  activeTerm: any;
  loading: boolean = false;
  showModal: boolean = false;
  axiosHeaders: any = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.getCookie('token')}`,
    },
  };

  constructor(
    private studentsService: StudentsService,
    private subjectService: SubjectService,
    private classService: ClassService,
    private loaderService: LoaderService,
    private yearService: AcadamicYearService,
    private termService: TermService
  ) {}

  ngOnInit() {
    this.getClasses();
    this.getSubjects();
  }

  getClasses() {
    this.classService.getClasses().subscribe((data: any) => {
      this.classes = data;
    });
  }

  getSubjects() {
    this.subjectService.getSubjects().subscribe((data: any) => {
      this.subjects = data;
      console.log('Subjects fetched:', this.subjects);
    });
  }

  getStudents() {
    this.studentsService
      .getStudents(
        this.selectedClass,
        this.searchStudentName,
        this.selectedSubject
      )
      .subscribe({
        next: (data) => {
          this.students = data;

          this.students = this.students.map((student) => {
            const scores = student.finalAssessments
              .map((a: any) => a.total_score)

            const max = Math.max(...scores);
            const min = Math.min(...scores);
            const avg =
            scores.length > 0
              ? scores.reduce((sum: any, val: any) => parseFloat(sum) + parseFloat(val), 0) / scores.length
              : 0;


            return {
              ...student,
              finalScoreMap: new Map(
                student.finalAssessments.map((assessment: any) => [
                  assessment.subject_id,
                  assessment,
                ])
              ),
              maxScore: max,
              minScore: min,
              avgScore: avg.toFixed(2), // Optional: round to 2 decimal places
            };
          });

          this.loading = false; // Stop loading after fetching students
        },
        error: (error) => {
          console.error('Error fetching students:', error);
        },
      });
  }

  async calculateFinals() {
    this.loading = true;

    try {
      const yearData = await this.yearService.getActiveYear().toPromise();
      const termData = await this.termService.getActiveTerm().toPromise();
      this.activeYear = yearData.id;
      this.activeTerm = termData.id;

      const data = {
        classId: this.selectedClass,
        academicYearId: this.activeYear,
        termId: this.activeTerm,
      };

      await axios.post(
        `${this.loaderService.baseUrl}/final_assessments`,
        data,
        this.axiosHeaders
      );
      console.log('Final assessments calculated:');
      this.getStudents();
    } catch (error) {
      console.log(error);
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
}
