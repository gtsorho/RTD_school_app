import { Injectable } from '@angular/core';
import axios from 'axios';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoaderService } from '../../loader.service';
@Injectable({
  providedIn: 'root'
})


export class StudentsService {

  private authTeacherSubject = new BehaviorSubject<any>(null);
authTeacher$ = this.authTeacherSubject.asObservable();



  constructor(private loaderService: LoaderService,) { }

  getStudents(classId: number|string, studentName: string, subjectId: number | string): Observable<any> {
    return new Observable((observer) => {
      axios.get(`${this.loaderService.baseUrl}/search/student`, {
        params: {
          classId,
          studentName,
          subjectId
        },
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

  getAuthTeacher(): Observable<any> {
    return new Observable((observer) => {
      const authUser = this.loaderService.getTokenData('id');
      console.log('Authenticated User ID:', authUser);
      axios.get(`${this.loaderService.baseUrl}/auth/teacher/${authUser}`, {
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


  setAuthTeacher(teacher: any): void {
      this.authTeacherSubject.next(teacher);
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
