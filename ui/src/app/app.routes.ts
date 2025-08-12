import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';
import { AdminSelectionComponent } from './admin/admin-selection/admin-selection.component';
import { AdminComponent } from './admin/admin.component';
import { AcadamicYearComponent } from './admin/acadamic-year/acadamic-year.component';
import { TermComponent } from './admin/term/term.component';
import { TeacherComponent } from './admin/teacher/teacher.component';
import { SubjectComponent } from './admin/subject/subject.component';
import { ClassComponent } from './admin/class/class.component';
import { StudentComponent } from './admin/student/student.component';
import { HomeComponent } from './main/home/home.component';
import { StudentsComponent } from './main/students/students.component';
import { GradeComponent } from './main/grade/grade.component';
import { AssessmentComponent } from './admin/assessment/assessment.component';
import { ClassesComponent } from './main/classes/classes.component';
import { ReportComponent } from './admin/report/report.component';
import { AuthGuard } from './auth.guard';


export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'main', component: MainComponent,  canActivate: [AuthGuard], data: { role: 'admin' },
        children: [
            { path: 'home', component: HomeComponent },
            { path: 'students', component: StudentsComponent },
            { path: 'grade', component: GradeComponent },
            { path: 'class', component: ClassesComponent },


            // { path: '**', component: PageNotFoundComponent }
        ]
    },
    
    { path: 'admin', component: AdminComponent,  canActivate: [AuthGuard], data: { role: 'admin' },
        children: [
            { path: 'adminselection', component: AdminSelectionComponent },
            { path: 'acadamicyear', component: AcadamicYearComponent},
            { path: 'term', component: TermComponent},
            { path: 'teacher', component: TeacherComponent},    
            { path: 'subjects', component: SubjectComponent}, 
            { path: 'class', component: ClassComponent}, 
            { path: 'student', component: StudentComponent}, 
            { path: 'assessment', component: AssessmentComponent}, 
            { path: 'report', component: ReportComponent}, 








            // { path: '**', component: PageNotFoundComponent }
        ]
    },

];
