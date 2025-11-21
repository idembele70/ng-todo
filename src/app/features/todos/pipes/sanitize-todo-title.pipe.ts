import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sanitizeTodoTitle',
  standalone: true
})
export class SanitizeTodoTitlePipe implements PipeTransform {
  transform(title: string): string {
    return title
      .trim()
      .replace(/^[^A-Za-z0-9]+/, '')
      .replace(/ {2,}/g, ' ')
      .slice(0, 40);;
  }
}
