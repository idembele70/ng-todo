import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AddFormComponent } from "./components/add-form/add-form.component";
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from "./components/header/header.component";
import { TodoTableComponent } from "./components/todo-table/todo-table.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HeaderComponent, AddFormComponent, TodoTableComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
}
