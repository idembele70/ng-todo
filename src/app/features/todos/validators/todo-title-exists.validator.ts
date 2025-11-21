import { AbstractControl, AsyncValidatorFn } from "@angular/forms";
import { catchError, map, Observable, of, switchMap, tap, timer } from "rxjs";
import { TodoService } from "../services/todo.service";

let lastTitle: string;

export function todoTitleExistsValidator(
  todoService: TodoService,
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<{ titleExists: boolean } | null> => {
    const title = control.value;
    return timer(250).pipe(
      switchMap(() => {
        if (lastTitle === title) {
          return of(null);
        }
        return todoService.todoExistsByTitle({ title });
      }),
      tap(() => lastTitle = title),
      map((exists) => exists ? { titleExists: true } : null),
      catchError(() => of(null)),
    );
  }
}