import { Injectable } from '@angular/core';
import axios from 'axios';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoaderService } from '../../loader.service';

@Injectable({
  providedIn: 'root'
})
export class GradeService {
 private authTeacherSubject = new BehaviorSubject<any>(null);
authTeacher$ = this.authTeacherSubject.asObservable();



  constructor(private loaderService: LoaderService,) { }

  getAssesmentsPerStudent(id:any): Observable<any> {
    return new Observable((observer) => {
      axios.get(`${this.loaderService.baseUrl}/assessment_scores/student/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getCookie('token')}`,
        }
      })
      .then((response) => {
        observer.next(response.data);
        observer.complete();
      })
      .catch((error: any) => {
        console.log(error);
        observer.error(error);
      });
    });
  }

    updateAssessment(id:string | number |undefined ,data:any): Observable<any> {
      console.log('hello from updateAssessment', id, data);
    return new Observable((observer) => {
      axios.put(`${this.loaderService.baseUrl}/assessment_scores/${id}`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getCookie('token')}`,
        }
      })
      .then((response) => {
        observer.next(response.data);
        observer.complete();
      })
      .catch((error: any) => {
        console.log(error);
        observer.error(error);
      });
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
}
