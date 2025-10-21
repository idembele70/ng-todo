import { AfterViewInit, Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: 'div.spinner',
  standalone: true,
})
export class SpinnerDirective implements OnChanges, AfterViewInit {
  @Input({ required: true }) isLoading: boolean = false
  @Input() size?: number;
  private animation?: Animation;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isLoading']) {
      this.setupStyles();
      this.toggleSpinner();
    }
  }

  ngAfterViewInit(): void {
    this.setupStyles();
    this.toggleSpinner();
  }

  constructor(
    private readonly el: ElementRef,
    private readonly renderer: Renderer2,
  ) { }

  private setupStyles() {
    const spinner = this.el.nativeElement as HTMLDivElement;
    const y = this.size ? 0 : -50;

    this.renderer.setStyle(spinner, 'width', this.size ? `${this?.size}rem` : '1.5rem');
    this.renderer.setStyle(spinner, 'height', this.size ? `${this?.size}rem` : '1.5rem');
    this.renderer.setStyle(spinner, 'position', this.size ? 'relative' : 'absolute');
    this.renderer.setStyle(spinner, 'transform', `translateY(${y}%)`);
  }

  private toggleSpinner() {
    const spinner = this.el.nativeElement as HTMLDivElement;
    this.renderer.setStyle(spinner, 'display', this.isLoading ? 'block' : 'none');

    if (this.isLoading) {
      this.animation?.cancel();
      const y = this.size ? 0 : -50;
      this.animation = spinner.animate([
        { transform: `translateY(${y}%) rotate(0deg)` },
        { transform: `translateY(${y}%) rotate(360deg)` },
      ], { duration: 700, iterations: Infinity, easing: 'linear' });
    } else {
      this.animation?.cancel();
    }
  }
}
