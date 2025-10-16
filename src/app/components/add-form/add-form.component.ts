import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { TodoService } from '../../services/todo.service';
import { Subject, takeUntil } from 'rxjs';

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
    private readonly toastr: ToastrService,
    private readonly translate: TranslateService,
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
    this.todoService.addTodo(this.todoName)
    .subscribe({
      next: () => {
        const message = this.translate.instant('addTodoForm.success');
        this.toastr.success(message);
        this.todoName = '';
        this.todoService.refreshTodos().subscribe();
      },
      error: () => {
        const message = this.translate.instant('addTodoForm.error');
        this.toastr.error(message);
      }
    })
  }

}
