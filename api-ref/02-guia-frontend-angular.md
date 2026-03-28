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

## 5. Flujo de Vida del Expediente (Business Logic)

Para que el Frontend sea coherente con las reglas del negocio, sigue este orden de operaciones:

### Paso 1: Autenticación e Inicio
- El usuario hace login. El sistema devuelve un token y los **roles**.
- Si el rol es `Guia`, la vista principal debería ser la **Bitácora**.
- Si el rol es `Admin`, `Psicologo` o `TrabajoSocial`, la vista principal es el **Listado de Carátulas**.

### Paso 2: Registro de Beneficiario
- **Antes de crear un expediente**, verifica si la persona ya existe buscando por **CURP**.
- Si no existe, crea la persona en `/beneficiarios`.

### Paso 3: Apertura de Expediente
- Con el `beneficiarioId`, crea el expediente cívico en `/civico/expedientes`.
- El estatus inicial será `INDUCCION`.

### Paso 4: Diagnóstico (La "Llave" de Proceso)
1.  **F1 (Psicología)**: El psicólogo llena la entrevista.
2.  **F2 (Trabajo Social)**: El trabajador social llena el estudio.
3.  **Cambio de Estado**: Cuando ambos están `COMPLETADO`, el expediente pasa a `PLANEACION`.

### Paso 5: Planeación y Seguimiento
- El Admin crea el **F3 (Plan)** y el **F4 (Cédula)**.
- El expediente pasa a `EN_SEGUIMIENTO`.
- **Bitácora**: El Guía registra asistencias diarias. El frontend debe mostrar la barra de progreso basada en `avanceHoras / horasSentencia`.

### Paso 6: Graduación o Baja
- El sistema cambia a `GRADUADO` automáticamente cuando las horas se cumplen.
- El sistema cambia a `BAJA` automáticamente si se registran 3 incidencias.

---

## 📝 Tips Premium para el Front
- **Barra de Progreso Dinámica**: Usa un Signal computado para recalcular el `%` de avance en tiempo real.
- **Validación Atómica**: No permitas que el botón de "Crear Plan F3" sea clickeable si los servicios de consulta de F1/F2 no retornan estatus `COMPLETADO`.
- **Skeleton Screens**: Muestra sombras de carga mientras se obtienen los JSONB pesados de los formatos F1/F2 para mejorar la percepción de velocidad.
