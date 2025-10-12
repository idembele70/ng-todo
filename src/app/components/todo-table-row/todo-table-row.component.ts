import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: '[app-todo-table-row]',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './todo-table-row.component.html',
  styleUrl: './todo-table-row.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoTableRowComponent {
  readonly completed = true
}
