import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, combineLatest, finalize, Subject, switchMap, takeUntil } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { TodoService } from '../../services/todo.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isProcessing: boolean = false;
  hasTodos: boolean = false;
  hasCompletedTodos: boolean = false;

  private readonly _destroy$ = new Subject<void>();

  constructor(
    readonly todoService: TodoService,
    private readonly notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
    combineLatest([
      this.todoService.isProcessing$,
      this.todoService.todos$,
      this.todoService.hasCompletedTodos$,
    ]).pipe(
      takeUntil(this._destroy$),
    ).subscribe(([isProcessing, todos, hasCompletedTodos]) =>{
      this.isProcessing = isProcessing;
      this.hasTodos = !!todos.length;
      this.hasCompletedTodos = hasCompletedTodos;
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  onDeleteAllTodos(completed: boolean) {
    if (!this.hasTodos || this.isProcessing) return;

    const prefix = 'header.clear';
    const key = completed ? 'completed'  : 'all';

    this.todoService.deleteAllTodos$(completed).pipe(
      switchMap(() => this.notificationService.notifySuccess(`${prefix}.${key}`)),
      switchMap(() => this.todoService.refreshTodos()),
      catchError(() => this.notificationService.notifyError(prefix, key)),
      finalize(() => this.todoService.setProcessing(false)),
      takeUntil(this._destroy$),
    ).subscribe();
  }
}
