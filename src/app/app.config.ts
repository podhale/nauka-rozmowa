import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePl from '@angular/common/locales/pl';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideLocationStrategy } from './core/memory-location';
import { routes } from './app.routes';

registerLocaleData(localePl);

// Zoneless change detection is the default in Angular 21, so no zone.js and no provider needed.
// Hash URLs in the browser and Capacitor; in-memory routing inside sandboxed frames (Claude artifact),
// where the History API is blocked.
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideLocationStrategy(),
    { provide: LOCALE_ID, useValue: 'pl' },
  ],
};
