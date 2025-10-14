import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { TodoService } from '../../services/todo.service';

@Component({
  selector: 'app-add-form',
  standalone: true,
  imports: [TranslatePipe, FormsModule],
  templateUrl: './add-form.component.html',
  styleUrl: './add-form.component.scss'
})
export class AddFormComponent {
  todoName: string = '';
  constructor(
    private readonly todoService: TodoService,
    private readonly toastr: ToastrService,
    private readonly translate: TranslateService,
  ) { }

  onAddTodo(e: Event) {
    e.preventDefault();
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
