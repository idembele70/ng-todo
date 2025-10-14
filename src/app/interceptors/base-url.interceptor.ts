import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/todos')) {
    const todosReq = req.clone({
      url: environment.apiUrl + req.url,
    })

    return next(todosReq);
  }

  return next(req);
};
