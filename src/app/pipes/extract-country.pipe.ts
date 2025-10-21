import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'extractCountry',
  standalone: true
})
export class ExtractCountryPipe implements PipeTransform {

  transform(value: string): unknown {
    return value.replace(/_.*/, '')
  }

}
