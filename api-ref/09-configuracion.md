# 🛠️ Configuración y Despliegue del Sistema

Esta guía detalla los pasos necesarios para instalar, configurar y poner en marcha el backend de **Reconecta con la Paz**.

## 1. Requisitos Previos

Asegúrate de tener instalado lo siguiente en tu máquina de desarrollo:
- **Node.js** (v18 o superior)
- **npm** o **yarn**
- **PostgreSQL** (v14 o superior)
- **NestJS CLI** (opcional, pero recomendado): `npm i -g @nestjs/cli`

---

## 2. Instalación Inicial

1. **Clonar el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd SSP-BACK
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar la Base de Datos**:
   Crea una base de datos en PostgreSQL llamada `reconecta_bd`.

---

## 3. Configuración del Entorno (.env)

Crea un archivo `.env` en la raíz del proyecto. Puedes usar el siguiente template. **No compartas tus credenciales reales en repositorios públicos.**

```env
# 🔌 Conexión a PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=reconecta_bd

# 🔐 Seguridad JWT
JWT_SECRET=una_clave_secreta_muy_larga_y_segura
JWT_EXPIRES_IN=1d

# 🚀 Servidor
PORT=3000

# 👤 Semilla de Administrador (Primer inicio)
SEED_ADMIN_PASSWORD=Admin1234
ENABLE_SEED=true

# ☁️ Google Drive Integration (OAuth2)
GOOGLE_DRIVE_CLIENT_ID=XXXXX.apps.googleusercontent.com
GOOGLE_DRIVE_CLIENT_SECRET=XXXXX
GOOGLE_DRIVE_REFRESH_TOKEN=1//XXXXX
CIVICO_DRIVE_FOLDER_ID=1IlPA7E7Ka9QmeIYoXt1z4JL1h-sU31sD

# IDs de carpeta para otros módulos (Opcional)
PENAL_DRIVE_FOLDER_ID=
VOLUNTARIADO_DRIVE_FOLDER_ID=
```

### 🗝️ Cómo obtener las credenciales de Drive
1. Ve a [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un proyecto y habilita la **Google Drive API**.
3. Configura la pantalla de consentimiento OAuth y crea "Credenciales de ID de cliente OAuth 2.0".
4. Usa una herramienta como el [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/) para obtener el `refresh_token` con el scope `https://www.googleapis.com/auth/drive.file`.

### 📂 Cómo obtener el `FOLDER_ID`
Abre la carpeta en Google Drive en tu navegador. El ID es la cadena de caracteres al final de la URL:
`https://drive.google.com/drive/u/0/folders/1IlPA7E7Ka9Qme...` <- **Este es el ID**.

---

## 4. Ejecución del Proyecto

### Desarrollo (Con Hot Reload)
```bash
npm run start:dev
```

### Primera vez (Cargar Admin Inicial)
Para crear el usuario administrador por defecto:
```bash
npm run seed:admin
```

---

## 5. Swagger (Documentación Interactiva)
Una vez que el servidor esté corriendo, puedes probar todos los endpoints visualmente en:
`http://localhost:3000/api-docs`
