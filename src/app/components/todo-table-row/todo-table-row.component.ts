import { DatePipe, NgIf } from '@angular/common';
import { AfterViewChecked, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, Renderer2, ViewChild } from '@angular/core';
import { FormControl, FormsModule, NgModel } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { interval, Subject, takeUntil, tap } from 'rxjs';
import { SpinnerDirective } from '../../directives/spinner.directive';
import { CompleteTodoEvent } from '../../models/complete-todo-event.model';
import { EditTodoTitleEvent } from '../../models/edit-todo-title-event.model';
import { Todo } from '../../models/todo.model';
import { ToggleEditStartEvent } from '../../models/toggle-edit-start-event.model';

export interface DeleteTodoEvent {
  readonly id: number;
  el: HTMLTableRowElement;
};
@Component({
  selector: '[app-todo-table-row]',
  standalone: true,
  imports: [TranslatePipe, DatePipe, NgIf, FormsModule, SpinnerDirective],
  templateUrl: './todo-table-row.component.html',
  styleUrl: './todo-table-row.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoTableRowComponent implements AfterViewInit, OnDestroy, AfterViewChecked {
  @Input({ required: true }) todo!: Todo;
  @Input({ required: true }) isProcessing!: boolean;
  @Input({ required: true }) searching = false;
  @Output() delete = new EventEmitter<DeleteTodoEvent>();
  @Output() toggleComplete = new EventEmitter<CompleteTodoEvent>();
  @Output() editTodoTitle = new EventEmitter<EditTodoTitleEvent>();
  @Output() toggleEditStart = new EventEmitter<ToggleEditStartEvent>();

  @ViewChild('titleInputRef') readonly inputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('titleInputModel') readonly titleInputModel!: NgModel;

  editing = false;

  private previousTitle: string = '';
  private readonly _destroy$ = new Subject<void>();
  private unlistenMouseUp?: () => void;
  private titleInputControl?: FormControl<HTMLInputElement>;


  constructor(
    private readonly el: ElementRef<HTMLTableRowElement>,
    private readonly renderer: Renderer2,
    private readonly cdr: ChangeDetectorRef,
  ) { }

  ngAfterViewChecked() {
    if (this.editing)
      this.inputRef?.nativeElement.focus();
  }

  ngAfterViewInit(): void {
    this.renderer.addClass(this.el.nativeElement, 'entering');
    const enteringDueTime = 400;
    interval(enteringDueTime)
      .pipe(
        tap(() => this.renderer.removeClass(this.el.nativeElement, 'entering')),
        takeUntil(this._destroy$),
      ).subscribe();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this.unlistenMouseUp?.();
  }

  onDeleteTodo() {
    if (this.isProcessing || this.editing) return;

    this.delete.emit({
      id: this.todo.id,
      el: this.el.nativeElement,
    });
  }

  onToggleComplete(ev: Event) {
    ev.preventDefault();
    if (this.isProcessing || this.editing) return;

    this.toggleComplete.emit({
      id: this.todo.id,
      complete: this.todo.complete ? 0 : 1,
    });
  }

  onStartEdit() {
    if (this.isProcessing || this.editing) return;

    this.editing = true;
    this.cdr.markForCheck();

    setTimeout(() => {
      this.titleInputControl = this.titleInputModel?.control;

      if (!this.titleInputControl) return;

      this.toggleEditStart.emit({
        state: true,
        control: this.titleInputControl,
        cdr: this.cdr,
        id: this.todo.id,
      });
    });

    this.previousTitle = this.todo.title.trim();
    this.unlistenMouseUp = this.renderer.listen('window', 'mouseup', (event: Event) => this.save(event));
  }

  save(ev: Event) {
    const inputElName = 'editTodoTitle';
    const target = ev.target as HTMLInputElement;
    const keyboardEvent = ev as KeyboardEvent;

    if (
      (target.name === inputElName &&
        ((ev.type === 'keyup' && !['Enter', 'Escape'].includes(keyboardEvent.key)) ||
          ev.type === 'mouseup')) ||
      this.titleInputControl?.status === 'PENDING'
    ) return;

    this.unlistenMouseUp?.();
    this.editing = false;
    this.cdr.markForCheck();
    this.toggleEditStart.emit({
      id: this.todo.id,
      state: true,
      control: this.titleInputControl!,
      cdr: this.cdr,
    });
    const trimmedTitle = this.todo.title.trim();

    const invalidChange = !trimmedTitle ||
      this.previousTitle === trimmedTitle ||
      this.titleInputControl?.status === 'INVALID';

    if (invalidChange)
      this.todo.title = this.previousTitle;

    this.titleInputControl?.clearAsyncValidators();

    this.editTodoTitle.emit({
      id: this.todo.id,
      title: trimmedTitle,
      invalidChange: invalidChange,
    });
  }
}
