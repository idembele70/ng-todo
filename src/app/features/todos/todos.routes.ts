import { Route } from '@angular/router';
import { TodoService } from './services/todo.service';
import { TodoPageComponent } from './pages/todo-page/todo-page.component';

export const TODOS_ROUTES: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    component: TodoPageComponent,
    providers: [
      TodoService,
    ],
  },
];