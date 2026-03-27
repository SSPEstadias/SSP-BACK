# 🅰️ Guía para Frontend (Angular 21.1.0)

Esta sección describe los patrones recomendados para consumir la API de **Reconecta con la Paz** utilizando las características modernas de Angular.

## 1. Configuración de HttpClient (Signals & Standalone)

Se recomienda el uso de **Signals** para manejar el estado y `inject()` para la inyección de dependencias.

### Interceptor de Autenticación
Debes configurar un interceptor para añadir el token JWT a todas las peticiones automáticamente.

```typescript
// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token(); // Signal del token

  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(cloned);
  }
  return next(req);
};
```

## 2. Consumo de Servicios

Utiliza el patrón de servicios para centralizar las peticiones.

```typescript
// expediente.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ExpedienteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/civico/expedientes`;

  // Signal para almacenar la lista de expedientes
  expedientes = signal<any[]>([]);

  cargarExpedientes() {
    this.http.get<any[]>(`${this.apiUrl}/caratulas`).subscribe(data => {
      this.expedientes.set(data);
    });
  }
}
```

## 3. Manejo de Documentos (PDF)

Para los endpoints de tipo `GET` que retornan un PDF (como `/oficio-incorporacion/:id`), utiliza el tipo de respuesta `blob`:

```typescript
descargarPdf(expedienteId: string) {
  this.http.get(`${this.apiUrl}/oficio-incorporacion/${expedienteId}`, {
    responseType: 'blob'
  }).subscribe(blob => {
    const url = window.URL.createObjectURL(blob);
    window.open(url); // Abre en pestaña nueva
  });
}
```

## 4. Carga de Archivos (Multipart/Form-Data)

Para el endpoint de **Subir Escaneados**, no uses JSON. Usa `FormData`:

```typescript
subirEscaneado(expedienteId: string, tipo: string, file: File) {
  const formData = new FormData();
  formData.append('expedienteId', expedienteId);
  formData.append('tipo', tipo);
  formData.append('file', file);

  return this.http.post(`${this.apiUrl}/subir-escaneado`, formData);
}
```

## 📝 Tips de Rendimiento
- **Signals**: Usa `computed()` para filtrar listas en el frontend sin peticiones extra.
- **Deferrable Views**: Utiliza `@defer` en tus templates de Angular para cargar componentes pesados (como gráficos o tablas grandes) solo cuando sean visibles.
