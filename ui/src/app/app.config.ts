import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom} from '@angular/core';
import { provideRouter } from '@angular/router';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    importProvidersFrom(NgxDaterangepickerMd.forRoot()),
  ]
};
