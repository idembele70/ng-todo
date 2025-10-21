import { ChangeDetectorRef } from "@angular/core";
import { FormControl } from "@angular/forms";

export interface ToggleEditStartEvent {
  state: boolean;
  control: FormControl<string>;
  cdr: ChangeDetectorRef;
  id: number;
}
