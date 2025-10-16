import { AsyncPipe, NgFor } from "@angular/common";
import { Component, inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastrService } from "ngx-toastr";
import { catchError, EMPTY, finalize, fromEvent, race, Subject, switchMap, take, takeUntil, tap, timer } from "rxjs";
import { CompleteTodoEvent } from "../../models/complete-todo-event.model";
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
  readonly isProcessing$ = this.todoService.isProcessing$

  private readonly ANIMATION_TIMEOUT = 2_000;

  ngOnInit(): void {
    this.todoService.refreshTodos()
      .pipe(takeUntil(this._destroy$))
      .subscribe();
  }

  trackById(_: number, todo: Todo) { return todo.id; }

  onDeleteTodo({ id, el }: DeleteTodoEvent) {
    this.todoService.deleteTodo(id)
    .pipe(
      switchMap(() => this.translate.get('todoTable.row.btn.remove.messages.success')),
      tap(message => this.toastr.success(message)),
      switchMap(() => this.animateRemoval$(el)),
      switchMap(() => this.todoService.refreshTodos()),
      catchError(() =>
        this.translate.get('todoTable.row.btn.remove.messages.error').pipe(
          tap(message => this.toastr.error(message)),
          switchMap(() => EMPTY),
        )),
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
    const key = this.getTranslationKey(ev.complete);
    this.todoService.toggleTodoCompletion$(ev).pipe(
      switchMap(() => {
        return this.translate.get(`todoTable.row.checkboxLabel.${key}.message.success`)
      }),
      tap((message) => this.toastr.success(message)),
      switchMap(() => this.todoService.refreshTodos()),
      catchError(() => {
        return this.translate.get(`todoTable.row.checkboxLabel.${key}.message.error`).pipe(
          tap((message)=> this.toastr.error(message)),
          switchMap(() => EMPTY),
        )
      }),
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

  private getTranslationKey(isComplete: 0 | 1) {
    return isComplete ? 'unCompleted' : 'completed';
  }
}
