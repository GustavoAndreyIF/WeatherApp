import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Log para você debugar
      console.error('❌ HTTP Error:', {
        status: error.status,
        message: error.message,
        url: error.url
      });
      
      // Mensagem amigável pro usuário
      let userMessage = 'Erro ao carregar dados';
      
      if (error.status === 0) {
        userMessage = 'Verifique sua conexão com a internet';
      } else if (error.status === 404) {
        userMessage = 'Dados não encontrados';
      } else if (error.status === 429) {
        userMessage = 'Muitas requisições. Aguarde um momento';
      } else if (error.status >= 500) {
        userMessage = 'Servidor temporariamente indisponível';
      }
      
      // Retorna erro tratado
      return throwError(() => ({ 
        message: userMessage, 
        status: error.status,
        originalError: error 
      }));
    })
  );
};