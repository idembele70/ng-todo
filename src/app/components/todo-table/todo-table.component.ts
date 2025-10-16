import { AsyncPipe, NgFor } from "@angular/common";
import { Component, inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastrService } from "ngx-toastr";
import { catchError, EMPTY, finalize, fromEvent, race, Subject, switchMap, take, takeUntil, tap, timer } from "rxjs";
import { CompleteTodoEvent } from "../../models/complete-todo-event.model";
import { EditTodoTitleEvent } from "../../models/edit-todo-title-event.model";
import { Todo } from "../../models/todo.model";
import { TodoService } from '../../services/todo.service';
import { DeleteTodoEvent, TodoTableRowComponent } from "../todo-table-row/todo-table-row.component";

@Component({
  selector: 'app-todo-table',
  standalone: true,
  imports: [TranslatePipe, TodoTableRowComponent, NgFor, AsyncPipe],
  templateUrl: './todo-table.component.html',
  styleUrl: './todo-table.component.scss'
})
export class TodoTableComponent implements OnInit, OnDestroy {
  private readonly todoService = inject(TodoService);
  private readonly toastr = inject(ToastrService);
  private readonly translate = inject(TranslateService);
  private readonly renderer = inject(Renderer2);
  private readonly _destroy$ = new Subject<void>();
  
  readonly todos$ = this.todoService.todos$;
  readonly isProcessing$ = this.todoService.isProcessing$;

  private readonly ANIMATION_TIMEOUT = 2_000;

  ngOnInit(): void {
    this.todoService.refreshTodos()
      .pipe(takeUntil(this._destroy$))
      .subscribe();
  }

  trackById(_: number, todo: Todo) { return todo.id; }

  onDeleteTodo({ id, el }: DeleteTodoEvent) {
    const prefix = 'todoTable.row.btn.remove';
    this.todoService.deleteTodo(id)
    .pipe(
      switchMap(() => this.notifySuccess(prefix)),
      switchMap(() => this.animateRemoval$(el)),
      switchMap(() => this.todoService.refreshTodos()),
      catchError(() => this.notifyError(prefix)),
      finalize(() => {
        this.todoService.setProcessing(false);
      }),
      takeUntil(this._destroy$),
    )
    .subscribe()
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  onToggleComplete(ev:  CompleteTodoEvent) {
    const prefix = 'todoTable.row.checkboxLabel';
    const key = ev.complete ? 'unCompleted' : 'completed';

    this.todoService.toggleTodoCompletion$(ev).pipe(
      switchMap(() => this.notifySuccess(`${prefix}.${key}`)),
      switchMap(() => this.todoService.refreshTodos()),
      catchError(() => this.notifyError(prefix, key)),
      finalize(() => this.todoService.setProcessing(false)),
      takeUntil(this._destroy$),
    ).subscribe();
  }

  onToggleEditStart(state: boolean) {
    this.todoService.setProcessing(state);
  }

  onEditTitle(content: EditTodoTitleEvent) {
    const prefix = 'todoTable.row.title.editInput';
    this.todoService.editTodoTitle$(content).pipe(
      switchMap(() => this.notifySuccess(`${prefix}`)),
      switchMap(() => this.todoService.refreshTodos()),
      catchError(() => this.notifyError(prefix)),
      finalize(() => this.todoService.setProcessing(false)),
      takeUntil(this._destroy$),
    ).subscribe();
  }

  private animateRemoval$(el: HTMLTableRowElement) {
    this.renderer.addClass(el, 'leaving');
    return race(
      fromEvent(el, 'animationend').pipe(take(1)),
      timer(this.ANIMATION_TIMEOUT),
    )
  }

  private notifySuccess(prefix: string) {
    const suffix = '.messages.success';

    return this.translate.get(`${prefix}${suffix}`).pipe(
      tap((message) => this.toastr.success(message)),
    );
  }
  
  private notifyError(prefix: string, key?: string) {
    const suffix = '.messages.error';
    const translationKey = prefix + (key ? '.' + key : '') + suffix;

    return this.translate.get(translationKey).pipe(
      tap((message)=> this.toastr.error(message)),
      switchMap(() => EMPTY),
    );
  }
}
