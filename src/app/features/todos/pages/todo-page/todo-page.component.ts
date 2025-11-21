import { Component } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { AddFormComponent } from "../../components/add-form/add-form.component";
import { TodoTableComponent } from "../../components/todo-table/todo-table.component";
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: 'app-todo-page',
  standalone: true,
  imports: [
    HeaderComponent,
    AddFormComponent,
    TodoTableComponent,
    FooterComponent,
  ],
  template: `
    <app-header />
    <app-add-form />
    <app-todo-table />
    <app-footer />
  `,
  styles: `
    :host {
      display: block;
      width: 880px;
      background: linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.9));
      border-radius: 16px;
      box-shadow: 0 12px 30px rgba(16, 24, 40, .08);
      padding: 1.25rem;
      backdrop-filter: blur(6px);
      border: 1px solid rgb(0, 0, 0, .03);
      @media (max-width: 880px) {
        width: 100%;
      }
      @media screen and (max-width: 450px) {
        padding: .5rem;
      }
    }
  `,
})
export class TodoPageComponent {

}
