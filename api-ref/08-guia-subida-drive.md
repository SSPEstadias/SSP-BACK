# 🚀 Guía: Integración con Google Drive (Uso General del Servicio)

Esta guía es para los desarrolladores de **Penal** y **Voluntarios**. Aquí se explica cómo integrar la subida de archivos del sistema en sus propios módulos de forma rápida.

## 1. Configuración del Módulo (Backend)

Para usar el servicio de Drive en tu módulo, debes importar `SharedModule` o directamente el `CivicoGoogleDriveModule`.

```typescript
// tu-modulo.module.ts
import { CivicoGoogleDriveModule } from 'src/shared/google-drive/civico-google-drive.module';

@Module({
  imports: [CivicoGoogleDriveModule], // <--- Importante
  providers: [TuServicio],
})
export class TuModuloModule {}
```

## 2. Inyección y Uso del Servicio

Inyecta `CivicoGoogleDriveService` y usa los métodos públicos. El servicio se encarga de la autenticación OAuth2 y de renovar los tokens automáticamente.

```typescript
// tu-servicio.service.ts
import { CivicoGoogleDriveService } from 'src/shared/google-drive/civico-google-drive.service';

constructor(private readonly driveService: CivicoGoogleDriveService) {}

async subirArchivo(pdfBuffer: Buffer, nombre: string, personaId: string) {
  // 1. Obtener la carpeta principal (la crea si no existe)
  // Reemplaza 'CIVICO_DRIVE_FOLDER_ID' por tu variable de entorno específica si aplica
  const parentFolderId = process.env.PENAL_DRIVE_FOLDER_ID; 

  const folderId = await this.driveService.getOrCreateFolder(`EXP-${personaId}`, parentFolderId);

  // 2. Subir PDF y obtener datos de persistencia
  const { driveFileId, urlArchivo } = await this.driveService.uploadFile(
    pdfBuffer, 
    nombre, 
    folderId
  );

  return { driveFileId, urlArchivo };
}
```

---

## 3. Configuración del .env (Requerido)

Cada módulo (Penal/Voluntarios) debe tener su propia carpeta raíz para no mezclar archivos con el módulo Cívico.

1.  **Crea una carpeta en Drive** para tu módulo.
2.  **Copia el ID** (ej: `1A2b3C...`).
3.  **Agréga la variable al `.env`**:
    ```env
    # Variables existentes (No tocar)
    GOOGLE_DRIVE_CLIENT_ID=...
    GOOGLE_DRIVE_REFRESH_TOKEN=...
    
    # --- Tus Carpeta Propias ---
    PENAL_DRIVE_FOLDER_ID=ID_DE_TU_CARPETA_AQUI
    VOLUNTARIOS_DRIVE_FOLDER_ID=ID_DE_TU_CARPETA_AQUI
    ```

---

## 🛠️ Métodos Clave

- `getOrCreateFolder(nombre, parentId?)`: Busca o crea. Si omites `parentId`, usará la raíz global.
- `uploadFile(buffer, filename, folderId)`: Sube el PDF y devuelve el ID y Link.
- `updateFile(fileId, buffer)`: Reemplaza el contenido de un archivo (mantiene el mismo ID de Drive).
