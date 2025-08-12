import { Component, ViewChild } from '@angular/core';
import { ClassService } from '../../admin/class/class.service';
import { LoaderService } from '../../loader.service';
import { GradeService } from '../grade/grade.service';
import { StudentsService } from '../students/students.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexLegend,
  ApexTooltip,
  ApexTitleSubtitle,
  ChartComponent,
  ApexFill,

} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  legend: ApexLegend;
  tooltip: ApexTooltip;
  title: ApexTitleSubtitle;
  fill: ApexFill;
};

@Component({
  selector: 'app-classes',
  imports: [
    FormsModule,
    CommonModule,
    NgApexchartsModule,
    NgxDaterangepickerMd,
  ],
  templateUrl: './classes.component.html',
  styleUrl: './classes.component.scss',
})
export class ClassesComponent {
  selectedSubject: string | number = 0;
  selectedClass: string | number = 0;
  searchStudentName: string = '';
  subjects: any[] = [];
  students: any[] = [];
  classes: any[] = [];
  teacher: any;
  loading: boolean = false;
  showModal: boolean = false;
  axiosHeaders: any = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.getCookie('token')}`,
    },
  };

  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions> = {
    series: [],
    chart: {
      type: 'bar',
      height: 400,
      stacked: true,
      toolbar: {
        show: true,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
      },
    },
    xaxis: {
      type: 'category',
      categories: [],
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
    },
    dataLabels: {
      enabled: true,
    },
    fill: {
      colors: ['#4CAF17', '#F44336', '#009688', '#FF9800', '#2196F3'] // green, red, teal, orange, blue
    }
  };

  constructor(
    private studentsService: StudentsService,
    private classService: ClassService,
    private loaderService: LoaderService,
    private gradeService: GradeService
  ) {}

  ngOnInit() {
    this.getAuthTeacher();
  }

  getAuthTeacher() {
    this.loading = true;
    this.studentsService.authTeacher$.subscribe((teacher) => {
      if (teacher) {
        this.teacher = teacher;
        this.subjects = teacher.subjects;
        this.selectedSubject = this.subjects[0].id;
        this.classes = teacher.classes;
        this.selectedClass = this.classes[0].id;
        this.getStudents();
      }
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
          this.loadChartData();
        },
        error: (error) => {
          console.error('Error fetching students:', error);
        },
      });
  }

  closeModal() {
    console.log('Closing modal');
    this.showModal = false;
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

  loadChartData() {
    const xCategories = this.students.map((s) => {
      const parts = s.name.split(' ');
      if (parts.length > 1) {
        return (
          parts[0].charAt(0).toUpperCase() + '.' + parts.slice(1).join(' ')
        );
      }
      return s.name;
    });

    const maxScores = Math.max(...this.students.map((s) => s.scores.length));
    console.log(this.students);
    // Create score series dynamically
    const scoreSeries = Array.from({ length: maxScores }).map((_, index) => ({
      name: `Score ${index + 1}`,
      group: 'score',
      data: this.students.map((s) => s.scores[index]?.score || 0),
    }));

    // Final score series
    const finalSeries = {
      name: 'Final Score',
      group: 'score',
      data: this.students.map((s) => s.finalAssessments[0].total_score || 0),
    };

    // Effort series (sum of all efforts)
    const effortSeries = {
      name: 'Effort',
      group: 'effort',
      data: this.students.map((s) =>
        s.scores.reduce(
          (sum: any, score: any) =>
            parseFloat(sum) + (parseFloat(score.effort) || 0),
          0
        )
      ),
    };

    this.chartOptions.series = [...scoreSeries, finalSeries, effortSeries];
    console.log('Chart series:', this.chartOptions.series);
    this.chartOptions.xaxis = {
      categories: xCategories,
    };
  }

  
  onScoreChange(index: number, jndex:number, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const newScore = parseFloat(inputElement.value);
    this.students[index].scores[jndex].score = newScore;

    this.updateAssessment(this.students[index].scores[jndex].id, {
        score: newScore,
      }
    )
  }

  onEffortChange(index: number,  jndex:number, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const newEffort = parseFloat(inputElement.value);

    this.students[index].scores[jndex].effort = newEffort;
      this.updateAssessment(this.students[index].scores[jndex].id, {
        effort: newEffort,
      }
    )
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
}
