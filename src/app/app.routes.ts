import { Routes } from '@angular/router';
import { TODOS_ROUTES } from './features/todos/todos.routes';

export const routes: Routes = [
  ...TODOS_ROUTES,
  {
    path: '**',
    redirectTo: '/',
  },
];
