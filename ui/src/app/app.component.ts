import { Component, OnDestroy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { LoaderService } from './loader.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxDaterangepickerMd],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnDestroy {
  title = 'ui';
  private tokenCheckSubscription: Subscription | null = null;
  ngOnInit(): void {
    this.checkTokenExpiration()
    this.setIntervalCheckToken()
  }

  constructor(private loaderService: LoaderService, private router: Router) {}

  checkTokenExpiration() {
    if (this.loaderService.isTokenExpired()) {
      console.warn('Token expired. Redirecting...');
      this.router.navigate(['']);
    } else {
      console.warn('Token valid.');
    }
  }

  setIntervalCheckToken() {
    this.tokenCheckSubscription = interval(1000).subscribe(() => {
      this.checkTokenExpiration();
    });
  }

  ngOnDestroy() {
    if (this.tokenCheckSubscription) {
      this.tokenCheckSubscription.unsubscribe();
    }
  }
}
