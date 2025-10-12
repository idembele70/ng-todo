import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TodoTableRowComponent } from "../todo-table-row/todo-table-row.component";

@Component({
  selector: 'app-todo-table',
  standalone: true,
  imports: [TranslatePipe, TodoTableRowComponent],
  templateUrl: './todo-table.component.html',
  styleUrl: './todo-table.component.scss'
})
export class TodoTableComponent {

}
