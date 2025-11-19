import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { i18nProviders } from './config/i18n.config';
import { toastrProviders } from './config/toastr.config';
import { baseUrlInterceptor } from './interceptors/base-url.interceptor';
import { localeProviders } from './config/locale.config';
import { TODO_API_PATHS, TODO_API_PATHS_TOKEN } from './features/todos/config/todo-api-paths.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([baseUrlInterceptor])
    ),
    ...i18nProviders,
    ...toastrProviders,
    ...localeProviders,
    {
      provide: TODO_API_PATHS_TOKEN,
      useValue: TODO_API_PATHS,
    }
  ]
};
