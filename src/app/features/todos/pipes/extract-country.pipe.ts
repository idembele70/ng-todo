import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'extractCountry',
  standalone: true
})
export class ExtractCountryPipe implements PipeTransform {

  transform(value: string): string {
    return value.replace(/_.*/, '')
  }

}
