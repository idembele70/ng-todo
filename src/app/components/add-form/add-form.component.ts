import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, finalize, Subject, switchMap, takeUntil } from 'rxjs';
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

  constructor(
    private readonly todoService: TodoService,
    private readonly notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
      this.todoService.isProcessing$
      .pipe(takeUntil(this._destroy$))
      .subscribe(value => this.isProcessing = value);
  }

  ngOnDestroy(): void {
      this._destroy$.next();
      this._destroy$.complete();
  }

  onAddTodo(e: Event) {
    e.preventDefault();
    if(this.isProcessing) return;

    const prefix = 'addTodoForm.add';
    this.todoService.addTodo(this.todoName)
    .pipe(
      switchMap(() => this.notificationService.notifySuccess(prefix)),
      switchMap(() => this.todoService.refreshTodos()),
      catchError(() => this.notificationService.notifyError(prefix)),
      finalize(() => {
        this.todoName = '';
        this.todoService.setProcessing(false);
      }),
    )
    .subscribe();
  }
}
