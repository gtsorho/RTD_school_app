import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClassService } from '../../admin/class/class.service';
import { StudentsService } from '../students/students.service';
import axios from 'axios';
import { LoaderService } from '../../loader.service';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { GradeService } from './grade.service';


interface Score {
  id?: string;
  title: string;
  weight: string;
  score?: number;
  effort?: number;
  comment?: string;
  student_id?: string | null;
  assessment_id?: string | number;
  student?: any;
  assessment?: any;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-grade',
  imports: [FormsModule, CommonModule, SpinnerComponent],
  templateUrl: './grade.component.html',
  styleUrl: './grade.component.scss'
})
export class GradeComponent {
  selectedSubject: string | number = 0
  selectedClass : string | number = 0
  selectedAssessment: string | number = 0
  students: any[] = [];
  subjects: any[] = []
  classes: any[] = []
  assessments: any[] = [];
  scoreingStudent: number = 0;
  score:Score = {
    title: '',
    weight: '0',
    score: 0
    };
  scores: Score[] = [];
  errorMessage: any;
  teacher: any;
  searchStudentName : string = ''
  loading: boolean = false;
  axiosHeaders: any = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.getCookie('token')}`,
    },
  };
  scoringcompleted: boolean = false;
  showModal: boolean = false;



  
    constructor(
      private studentsService: StudentsService, 
      private classService : ClassService, 
      private loaderService: LoaderService,
      private gradeService: GradeService
     ) { 
    }
  
  ngOnInit() {
    this.getAuthTeacher();
  }
  
  getAuthTeacher() {
    this.loading = true;
    this.studentsService.authTeacher$.subscribe((teacher) => {
    if (teacher) {
        this.teacher = teacher;
        this.subjects = teacher.subjects
        this.selectedSubject = this.subjects[0].id
        this.classes = teacher.classes
        this.selectedClass = this.classes[0].id
        this.assessments = teacher.subjects[0].assessments
        this.selectedAssessment = this.assessments[0].id
        this.getStudents()

      }
    });
  } 
  
  getStudents() {
    const subjectIndex = this.teacher.subjects.findIndex(
      (subject: any) => subject.id == this.selectedSubject
    );

    this.assessments = this.teacher.subjects[subjectIndex].assessments
    this.selectedAssessment = this.assessments[0].id

    console.log('assessemt:', this.selectedAssessment);

    this.studentsService.getStudents(this.selectedClass, this.searchStudentName, this.selectedSubject).subscribe({
      next: (data) => {
        this.students = data;
        this.loadModal();
        if (this.students.length > 0) {
          
          // Set the initial student_id for the score object
          this.scores = this.students.map(student => ({
            title: '',
            weight: '0',
            score: 0,
            effort: 0,
            student_id: student.id,
            assessment_id: this.selectedAssessment,
            student: { name: this.getStudentName(student.id) },
            assessment: { type: this.getAssessmentName(this.selectedAssessment as string) },
          }));

          this.scoreingStudent = 0; // Ensure it starts from the first student
          this.score.student_id = this.students[this.scoreingStudent].id;
          this.loading = false;
        } else {
          this.score.student_id = null; // No students available
        }
      },
      error: (error) => {
        console.error('Error fetching students:', error);
      }
    });
  }
  
  addScore() {
    if (!this.selectedAssessment || this.selectedAssessment === 'default') {
      this.errorMessage = 'Please select an assessment';
      return;
    }
    this.errorMessage = '';

    // Ensure student_id is set before pushing
    if (this.score.student_id === null && this.students.length > 0) {
        this.score.student_id = this.students[this.scoreingStudent].id;
    }

    const newScore: Score = {
      ...this.score,
      assessment_id: this.selectedAssessment || ''
    };

    const scoreIndex = this.scores.findIndex(s => s.student_id == newScore.student_id);
    if (scoreIndex !== -1) {
      this.scores[scoreIndex] = newScore;
    } else {
      this.scores.push(newScore);
    }

    // Increment the scoring student index
    this.scoreingStudent++;

    // Check if there are more students to score
    if (this.scoreingStudent < this.students.length) {
      // Update the student_id for the *current* score object that ngModel is bound to
      this.score.student_id = this.students[this.scoreingStudent].id;
    } else {
      // All students scored, or no more students. Handle this case (e.g., disable input, show message)
      this.score.student_id = null; // Or some other indicator that scoring is done
      this.scoringcompleted = true; // Set a flag to indicate scoring is complete
    }

    // Reset other score fields for the next entry, but keep the updated student_id
    this.score.score = 0;  // Reset score
    this.score.effort = 0; // Reset effort

  }

  onScoreChange(index: number, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const newScore = parseFloat(inputElement.value);
    this.scores[index].score = newScore;

    this.updateAssessment(this.scores[index].id, {
        score: newScore,
      }
    )
  }

  onEffortChange(index: number, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const newEffort = parseFloat(inputElement.value);

    this.scores[index].effort = newEffort;
      this.updateAssessment(this.scores[index].id, {
      effort: newEffort,
      }
    )
  }

  getStudentName(studentId: string): string {
    const student = this.students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown Student';
  }

  getAssessmentName(assessmentId: string): string {
    const assessment = this.assessments.find(a => a.id == assessmentId);
    return assessment ? assessment.type : 'Unknown Assessment';
  }

  async saveScores(): Promise<void> {
    if (this.scores.length === 0) {
      console.warn('No scores to save.');
      return;
    }

    this.loading = true;
    try {
      const response = await axios.post(
        `${this.loaderService.baseUrl}/assessment_scores`,
        { scores: this.scores },
        this.axiosHeaders
      );
      this.scores = [];
      this.scoreingStudent = 0;
      this.score.student_id = null;
    } catch (error: any) {
      console.error('Error saving scores:', error);
      this.errorMessage = error.response?.data?.message || 'An error occurred while saving scores';
      setTimeout(() => {
        this.errorMessage = null;
      }, 5000);
    } finally {
      this.loading = false;
    }
  }

  async updateAssessment(id:string | number | undefined ,data:any): Promise<void> {
    this.loading = true;

    this.gradeService.updateAssessment(id, data).subscribe({
      next: (response) => {
        this.loading = false;
      } ,
      error: (error) => { 
        console.error('Error updating assessment:', error);
      }
    });
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

  closeModal() {
    this.showModal = false;
  }

  loadModal() {
    this.showModal = true;
  }

}
