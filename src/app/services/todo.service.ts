import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of, tap } from 'rxjs';
import { Todo } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private readonly _todos$ = new BehaviorSubject<Todo[]>([]);
  readonly todos$ = this._todos$.asObservable();

  constructor(private readonly httpClient: HttpClient) { }

  addTodo(title: string) {
    return this.httpClient.post('/todos/new', { title });
  }

  fetchTodos() {
    const todos = this._todos$.value;

    if(todos.length) return of(todos);

    return this.refreshTodos();
  }

  refreshTodos() {
    return this.httpClient.get<Todo[]>('/todos').pipe(
      tap(todos => this._todos$.next(todos)),
    )
  }
}
