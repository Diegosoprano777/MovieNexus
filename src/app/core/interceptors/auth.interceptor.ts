import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Clona la petición y añade la API Key automáticamente
  const apiReq = req.clone({
    params: req.params.set('api_key', environment.apiKey)
  });

  return next(apiReq);
};
