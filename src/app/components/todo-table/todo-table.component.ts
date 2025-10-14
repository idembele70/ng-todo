import { AsyncPipe, NgFor } from "@angular/common";
import { Component, inject, OnInit } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TodoService } from '../../services/todo.service';
import { TodoTableRowComponent } from "../todo-table-row/todo-table-row.component";
import { Todo } from "../../models/todo.model";

@Component({
  selector: 'app-todo-table',
  standalone: true,
  imports: [TranslatePipe, TodoTableRowComponent, NgFor, AsyncPipe],
  templateUrl: './todo-table.component.html',
  styleUrl: './todo-table.component.scss'
})
export class TodoTableComponent implements OnInit {
  private readonly todoService = inject(TodoService);
  readonly todos$ = this.todoService.todos$;

  ngOnInit(): void {
    this.todoService.refreshTodos().subscribe();
  }

  trackById(_: number, todo: Todo) { return todo.id }
}
