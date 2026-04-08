# 🅰️ Guía para Frontend Angular

Esta guía contiene los errores comunes, mejores prácticas y consejos específicos para el proyecto.

---

## 1. ⚠️ Fotos de Beneficiarios — Barras Invertidas

**Este es el error más común al registrar beneficiarios con URL de foto local.**

Si usas rutas de Windows con barras invertidas `\`, el JSON las interpreta como caracteres de escape y el servidor lanzará un error de parseo.

###   Forma CORRECTA (barras hacia adelante `/`)
```json
{
  "urlFoto": "C:/Users/yahir/Downloads/yoimage.jpeg"
}
```

### ❌ Forma INCORRECTA (barras invertidas `\`)
```json
{
  "urlFoto": "C:\Users\yahir\Downloads\yoimage.jpeg"
}
```

> **Nota**: Las URLs de internet (Drive, Cloudinary, etc.) siempre vienen con `/` y no tienen este problema. Solo las rutas locales de Windows necesitan esta corrección.

---

## 2. Flujo de IDs — Lo que Debes Guardar

El mayor riesgo de error es perder los IDs entre pasos. Usa este mapa:

```
POST /users           → guarda: id (psicologoId, trabajadorSocialId, guiaId)
POST /beneficiarios   → guarda: id (beneficiarioId para expediente y salud)
POST /civico/expedientes → guarda: idUUID (expedienteId para TODO lo demás)
```

**En Angular, guarda estos en un servicio o en el store de la sesión:**
```typescript
// session.service.ts
beneficiarioId = signal<number | null>(null);
expedienteUUID = signal<string | null>(null);
```

---

## 3. Respuestas PDF — Cómo Manejar `application/pdf`

Los endpoints de documentos devuelven el PDF directamente como `application/pdf`. En Angular:

```typescript
// documentos.service.ts
generarOficioIncorporacion(expedienteId: string): Observable<Blob> {
  return this.http.get(
    `${this.apiUrl}/civico/documentos/oficio-incorporacion/${expedienteId}`,
    { responseType: 'blob', headers: this.authHeaders() }
  );
}

// En el componente:
this.documentosService.generarOficioIncorporacion(uuid).subscribe(blob => {
  const url = window.URL.createObjectURL(blob);
  window.open(url); // abre en nueva pestaña
  // O para forzar descarga:
  const a = document.createElement('a');
  a.href = url;
  a.download = 'oficio-incorporacion.pdf';
  a.click();
});
```

---

## 4. Autenticación con Interceptor

```typescript
// auth.interceptor.ts
intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
  const token = this.authService.getToken(); // guardado en localStorage
  if (token) {
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next.handle(authReq);
  }
  return next.handle(req);
}
```

---

## 5. Validar Candado RF-008 Antes de F3

Antes de mostrar el formulario del F3, siempre consulta:

```
GET /civico/f2/expediente/{expedienteId}/candado-f3
```

**Respuesta:**
```json
{
  "canCrearF3": true,
  "f1Completado": true,
  "f2Completado": true,
  "mensaje": "F1 y F2 completados. Puede proceder a crear el F3."
}
```

Si `canCrearF3 = false`, muestra un mensaje al usuario con qué falta completar.

---

## 6. Alertas de Incidencias (Contador de Strikes)

Consulta periódicamente o después de cada asistencia:

```
GET /civico/incidencias/expediente/{expedienteId}/strikes
```

**Respuesta:**
```json
{
  "strikes": 2,
  "limite": 3,
  "enRiesgo": true,
  "bajaActivada": false
}
```

**Lógica de colores sugerida:**
- `strikes = 0` → verde
- `strikes = 1` → amarillo
- `strikes >= 2` → naranja + alerta "¡A 1 falta de la baja!"
- `bajaActivada = true` → rojo + badge "BAJA AUTOMÁTICA APLICADA"

---

## 7. Progreso de Horas en Tiempo Real

Después de cada `POST /civico/documentos/lista-asistencia`, recarga:

```
GET /civico/bitacora/expediente/{expedienteId}/horas
```

**Respuesta:**
```json
{
  "horasAcumuladas": 36.5,
  "horasSentencia": 48,
  "porcentajeAvance": 76.04
}
```

Usa `porcentajeAvance` para una barra de progreso.

---

## 8. Subida de Archivos Escaneados (multipart/form-data)

```typescript
subirEscaneado(expedienteId: string, tipo: 'CANALIZACION' | 'INCORPORACION', file: File) {
  const formData = new FormData();
  formData.append('expedienteId', expedienteId);
  formData.append('tipo', tipo);
  formData.append('file', file);
  return this.http.post(`${this.apiUrl}/civico/documentos/subir-escaneado`, formData, {
    headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    // ⚠️ NO pongas Content-Type manualmente — Angular lo agrega con el boundary automáticamente
  });
}
```

---

## 9. Tip Clave: Atajos para No Re-Pegar IDs

**En Swagger durante pruebas:**
- Usa `Ctrl+H` en tu editor de texto para reemplazar `{{EXP_UUID}}` con el UUID real.

**En Postman:**
```javascript
// Agrega esto en la pestaña "Tests" del POST /civico/expedientes:
pm.environment.set("EXP_UUID", pm.response.json().idUUID);
pm.environment.set("BENEF_ID", pm.response.json().beneficiarioId);
// Luego todas las rutas usan {{EXP_UUID}} automáticamente
```

**En Angular (ngOnInit del componente de expediente):**
```typescript
// Extrae el UUID de los parámetros de ruta y guárdalo:
this.route.params.subscribe(params => {
  this.expedienteId = params['id'];
  this.cargarTodo(this.expedienteId);
});
```
