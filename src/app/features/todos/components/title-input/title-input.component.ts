import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef, inject, Input, Output, ViewChild, ViewChildren } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { LoaderService } from '../../../../core/services/loader.service';
import { SanitizeTodoTitlePipe } from '../../pipes/sanitize-todo-title.pipe';
import { SpinnerDirective } from '../../directives/spinner.directive';

@Component({
  selector: 'app-title-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SpinnerDirective,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TitleInputComponent),
      multi: true,
    },
    SanitizeTodoTitlePipe,
  ],
  template: `
    <input
      #inputRef
      type="text"
      [name]="name"
      (input)="updateValue($event)"
      (blur)="onTouched()"
      [value]="value"
      [disabled]="disabled"
      [placeholder]="placeholder"
      autocomplete="off"
      [attr.aria-label]="ariaLabel"
      [attr.data-testid]="dataTestId"
      (keyup.enter)="onEnter($event)"
      (keyup.escape)="onEscape($event)"
      maxlength="40">
      @if (isSearching) {
        <div 
          class="spinner"
          [isLoading]="isSearching">
        </div>
      }
  `,
  styles: `
    :host {
      flex: 1;
      position: relative;
      @media screen and (max-width: 450px) {
        width: 100%;
      }
    }

    input {
      width: 100%;
      padding: 0.6rem .75rem;
      border-radius: 10px;
      border: 1px solid rgba(15, 23, 42, .06);
      font-size: .95rem;
      outline: none;
      box-shadow: inset 0 -2px 6px rgba(0, 0, 0, 0.02);
    }
  `
})
export class TitleInputComponent implements ControlValueAccessor {
  private readonly sanitizeTodoTitlePipe = inject(SanitizeTodoTitlePipe);
  private readonly loaderService = inject(LoaderService);
  private readonly cdrRef = inject(ChangeDetectorRef);
  @Input() name = '';
  @Input() placeholder = '';
  @Input() ariaLabel = '';
  @Input() dataTestId = '';
  @Input() isSearching = false;
  @ViewChild('inputRef') titleInput!: ElementRef<HTMLInputElement>;
  @Output() enter = new EventEmitter<KeyboardEvent>();
  @Output() espace = new EventEmitter<KeyboardEvent>();

  value = '';
  disabled = false;

  onChange = (value: string) => { };
  onTouched = () => { };
  onEnter = (ev: Event) => {
    this.enter.emit(ev as KeyboardEvent);
  };
  onEscape = (ev: Event) => {
    this.espace.emit(ev as KeyboardEvent);
  };

  updateValue(event: Event) {
    this.loaderService.setProcessing(true);
    const { value } = event.target as HTMLInputElement;
    const sanitized = this.sanitizeTodoTitlePipe.transform(value);
    this.value = sanitized;
    this.onChange(sanitized);
  }

  writeValue(value: string | null): void {
    this.value = value ?? '';
    this.cdrRef.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  focus(): void {
    this.titleInput.nativeElement.focus();
  }
}
