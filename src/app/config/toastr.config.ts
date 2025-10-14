import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

export const toastrProviders = [
    provideAnimations(),
    provideToastr({
      positionClass: 'toast-top-center',
      timeOut: 1000,
      closeButton: true,
      progressBar: true,
    }),
];