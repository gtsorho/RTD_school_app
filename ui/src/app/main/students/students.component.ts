import { Component } from '@angular/core';
import { StudentsService } from './students.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClassService } from '../../admin/class/class.service';
import { ExcelTableComponent } from '../components/excel-table/excel-table.component';

@Component({
  selector: 'app-students',
  imports: [FormsModule, CommonModule, ExcelTableComponent],
  templateUrl: './students.component.html',
  styleUrl: './students.component.scss'
})
export class StudentsComponent {
  students: any[] = [];
  teacher: any;
  subjects: any[] = []
  classes: any[] = []
  selectedSubject: string | number = 0
  selectedClass : string | number = 0
  searchStudentName : string = ''


  constructor(private studentsService: StudentsService, private classService : ClassService ) { 
  }

  ngOnInit() {
    this.getAuthTeacher();
  }

  getAuthTeacher() {
    this.studentsService.authTeacher$.subscribe((teacher) => {
    if (teacher) {
        this.teacher = teacher;
        this.subjects = teacher.subjects
        this.selectedSubject = this.subjects[0].id
        this.classes = teacher.classes
        this.selectedClass = this.classes[0].id
      }
    });
  } 

  getStudents() {
    this.studentsService.getStudents(this.selectedClass, this.searchStudentName, this.selectedClass).subscribe({
      next: (data) => {
        this.students = data;
      },
      error: (error) => {
        console.error('Error fetching students:', error);
      }
    });
  }

  getClasses(){
    this.classService.getClasses().subscribe((data:any)=>{
      this.classes = data
      this.selectedClass = this.classes[0].id
    })
  }



getClassesAndStudents() {
  this.classService.getClasses().subscribe((data: any) => {
    this.classes = data;
    this.selectedClass = this.classes[0].id;
    this.getStudents();
  });
}
}
