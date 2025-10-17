import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TodoService } from '../../services/todo.service';
import { NotificationService } from '../../services/notification.service';
import { catchError, finalize, Subject, switchMap, takeUntil } from 'rxjs';

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

  private readonly _destroy$ = new Subject<void>();

  constructor(
    readonly todoService: TodoService,
    private readonly notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
    this.todoService.isProcessing$.pipe(
      takeUntil(this._destroy$),
    ).subscribe(
      isProcessing => this.isProcessing = isProcessing
    );

    this.todoService.todos$.pipe(
      takeUntil(this._destroy$),
    ).subscribe(
      todos => this.hasTodos = !!todos.length
    );
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  onDeleteAllTodos() {
    if (!this.hasTodos || this.isProcessing) return;

    const prefix = 'header.clear.all';
    this.todoService.deleteAllTodos$().pipe(
      switchMap(() => this.notificationService.notifySuccess(prefix)),
      switchMap(() => this.todoService.refreshTodos()),
      catchError(() => this.notificationService.notifyError(prefix)),
      finalize(() => this.todoService.setProcessing(false)),
      takeUntil(this._destroy$),
    ).subscribe();
  }
}
