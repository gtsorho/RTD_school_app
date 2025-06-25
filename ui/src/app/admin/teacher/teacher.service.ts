import { Injectable } from '@angular/core';
import axios from 'axios';
import { Observable } from 'rxjs';
import { LoaderService } from '../../loader.service';
@Injectable({
  providedIn: 'root'
})
export class TeacherService {


  constructor(private loaderService: LoaderService) { }

  getTeachers(): Observable<any> {
    return new Observable((observer) => {
      axios.get(`${this.loaderService.baseUrl}/teachers`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.getCookie('token')}`,
          }
        }
      ).then((response) => {
        observer.next(response.data);
        observer.complete();
      })
        .catch((error: any) => {
          console.log(error);
        });
    })
  }

    getUsers(): Observable<any> {
    return new Observable((observer) => {
      axios.get(`${this.loaderService.baseUrl}/users`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.getCookie('token')}`,
          }
        }
      ).then((response) => {
        observer.next(response.data);
        observer.complete();
      })
        .catch((error: any) => {
          console.log(error);
        });
    })
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
