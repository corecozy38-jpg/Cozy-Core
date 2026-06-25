import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withDebugTracing, withRouterConfig, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { guestInterceptor } from './core/interceptors/guest-interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { authInterceptor } from './core/interceptors/auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions({ skipInitialTransition: true }),withDebugTracing()),
    provideHttpClient(withInterceptors([authInterceptor,guestInterceptor])),
    provideAnimationsAsync(),
    provideTranslateService({
      fallbackLang: 'en',
      loader: provideTranslateHttpLoader({
        prefix: 'i18n/',
        suffix: '.json',
      })
    }),
  ]
};
