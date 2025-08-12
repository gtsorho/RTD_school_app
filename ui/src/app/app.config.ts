import {
  ApplicationConfig,
  provideZoneChangeDetection,
  importProvidersFrom,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { routes } from './app.routes';
import { msalInstance } from './msal.config';
import { MSAL_INSTANCE, MsalService, MsalModule } from '@azure/msal-angular';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(NgxDaterangepickerMd.forRoot()),

    {
      provide: MSAL_INSTANCE,
      useValue: msalInstance,
    },
    MsalService,
  ],
};
