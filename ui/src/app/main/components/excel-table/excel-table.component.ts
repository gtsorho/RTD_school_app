import { CommonModule } from '@angular/common';
import { Component , Output, EventEmitter} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Input } from '@angular/core';
import { GradeService } from '../../grade/grade.service';
import { SpinnerComponent } from '../../../components/spinner/spinner.component';

@Component({
  selector: 'app-excel-table',
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './excel-table.component.html',
  styleUrl: './excel-table.component.scss'
})
export class ExcelTableComponent {
  loading: boolean = false;

  constructor(private gradeService: GradeService) {}
  @Input() assessments: any[] = [];
  @Output() assessmentUpdated = new EventEmitter<string>();

  editCell: { index: number, column: string } | null = null;
  draggedRowIndex: number | null = null;
 

  onScoreChange(index: number, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const newScore = parseFloat(inputElement.value);
    this.assessments[index].score = newScore;


    this.updateAssessment(this.assessments[index].id, {
        score: newScore,
        student_id: this.assessments[index].student_id,
      }
    )
  }

  onEffortChange(index: number, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const newEffort = parseInt(inputElement.value, 10);

    this.assessments[index].effort = newEffort;
    
      this.updateAssessment(this.assessments[index].id, {
        effort: newEffort,
        student_id: this.assessments[index].student_id,
      }
    )
  }


  drag(event: DragEvent, index: number) {
    this.draggedRowIndex = index;
    event.dataTransfer?.setData('text', index.toString());
  }

  allowDrop(event: DragEvent) {
    event.preventDefault();
  }

  drop(event: DragEvent) {
    event.preventDefault();
    if (this.draggedRowIndex !== null) {
      this.assessments.splice(this.draggedRowIndex, 1);
      this.draggedRowIndex = null;
    }
  }

    async updateAssessment(id:string | number | undefined ,data:any): Promise<void> {
    this.loading = true;
    const { student_id, ...dataWithoutStudentId } = data;

    this.gradeService.updateAssessment(id, dataWithoutStudentId).subscribe({
      next: (response) => {
        this.assessmentUpdated.emit(data.student_id as string);        
        this.loading = false;
      },
      error: (error) => { 
        console.error('Error updating assessment:', error);
      }
    });
  }
}
