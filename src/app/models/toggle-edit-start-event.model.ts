import { ChangeDetectorRef } from "@angular/core";
import { FormControl } from "@angular/forms";

export interface ToggleEditStartEvent {
  state: boolean;
  control: FormControl<HTMLInputElement>;
  cdr: ChangeDetectorRef;
  id: number;
}
