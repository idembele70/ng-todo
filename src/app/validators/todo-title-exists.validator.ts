import { AbstractControl, AsyncValidatorFn } from "@angular/forms";
import { catchError, map, Observable, of, switchMap, timer } from "rxjs";
import { TodoService } from "../services/todo.service";

export function todoTitleExistsValidator(todoService: TodoService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<{ titleExists: boolean } | null> => {
    const todoTitle = control.value as string;
    if (!todoTitle) return of(null);

    return timer(100).pipe(
      switchMap(() => todoService.todoExistsByTitle(todoTitle.trim())),
      map(({ exists }) => exists ? { titleExists: true } : null),
      catchError(() => of(null)),
    );
  }
}