import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, combineLatest, finalize, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { PaginationInfo } from '../../models/paginated-todos.model';
import { TodoService } from '../../services/todo.service';
import { NotificationService } from './../../services/notification.service';

@Component({
  selector: 'app-add-form',
  standalone: true,
  imports: [TranslatePipe, FormsModule],
  templateUrl: './add-form.component.html',
  styleUrl: './add-form.component.scss'
})
export class AddFormComponent implements OnInit, OnDestroy {
  todoName: string = '';
  isProcessing!: boolean;

  private readonly _destroy$ = new Subject<void>();
  pageInfo: PaginationInfo = {
    currentPage: 1,
    totalItems: 0,
    totalPages: 0,
  };

  constructor(
    private readonly todoService: TodoService,
    private readonly notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
    combineLatest([
      this.todoService.isProcessing$,
      this.todoService.paginationInfo$,
    ])
      .pipe(takeUntil(this._destroy$))
      .subscribe(([isProcessing, pageInfo]) => {
        this.isProcessing = isProcessing;
        this.pageInfo = pageInfo;
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  onAddTodo(e: Event) {
    e.preventDefault();
    if (this.isProcessing) return;

    const inputPrefix = 'addTodoForm.input';
    const trimmedName = this.todoName.trim();
    if(!trimmedName) {
      this.notificationService.notifyError(`${inputPrefix}.whitespace`)
      .pipe(takeUntil(this._destroy$))
      .subscribe();
      return;
    }

    const buttonPrefix = 'addTodoForm.button';
    this.todoService.addTodo(trimmedName)
      .pipe(
        switchMap(() => this.notificationService.notifySuccess(buttonPrefix)),
        switchMap(() => this.todoService.refreshTodos(this.pageInfo.currentPage)),
        tap(() => this.todoName = ''),
        catchError(() => this.notificationService.notifyError(buttonPrefix)),
        finalize(() => this.todoService.setProcessing(false)),
      )
      .subscribe();
  }
}
