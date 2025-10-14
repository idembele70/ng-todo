import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { i18nProviders } from './config/i18n.config';
import { toastrProviders } from './config/toastr.config';
import { baseUrlInterceptor } from './interceptors/base-url.interceptor';
import { localeProviders } from './config/locale.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([baseUrlInterceptor])
    ),
    ...i18nProviders,
    ...toastrProviders,
    ...localeProviders,
  ]
};
