# Configurar VS Code con Git, GitHub, Vercel y Supabase

Esta guía es para tu laptop Windows (Dell XPS). Revisé tu computadora y **Git no está instalado todavía** — hay que instalarlo primero. VS Code sí está instalado, pero el comando `code` no está en el PATH (lo arreglamos abajo también).

## 1. Instalar Git

1. Descarga el instalador desde [git-scm.com/download/win](https://git-scm.com/download/win) (detecta automáticamente que usas Windows 64-bit).
2. Ejecuta el instalador. En casi todas las pantallas puedes dejar las opciones por defecto — las dos que vale la pena revisar:
   - **"Adjusting your PATH environment"** → elige *"Git from the command line and also from 3rd-party software"* (normalmente ya viene seleccionada).
   - **"Choosing the default editor"** → puedes elegir *"Use Visual Studio Code as Git's default editor"* si aparece la opción.
3. Cierra y vuelve a abrir cualquier terminal/PowerShell después de instalar.
4. Verifica que funcionó:
   ```powershell
   git --version
   ```

## 2. Configurar tu identidad de Git (una sola vez)

```powershell
git config --global user.name "Kevin Castillo"
git config --global user.email "kevcas2711@galileo.edu"
```

## 3. Habilitar el comando `code` en la terminal

Si `code --version` no funciona en PowerShell:

1. Abre VS Code.
2. Presiona `Ctrl+Shift+P` para abrir la paleta de comandos.
3. Escribe **"Shell Command: Install 'code' command in PATH"** y selecciónalo.
4. Reinicia la terminal.

## 4. Clonar tu proyecto

Abre PowerShell donde quieras guardar el proyecto (por ejemplo, `Documentos\Proyectos`) y ejecuta:

```powershell
git clone https://github.com/KevDev2711/racket-sports-gt.git
cd racket-sports-gt
code .
```

`code .` abre la carpeta completa en VS Code. Te va a pedir iniciar sesión en GitHub la primera vez que hagas `git clone` de un repo privado — sigue el flujo de autenticación en el navegador que se abre automáticamente.

## 5. Instalar Node.js (si no lo tienes)

El proyecto necesita Node.js para instalar dependencias y correr Vercel localmente:

1. Descarga la versión LTS desde [nodejs.org](https://nodejs.org).
2. Instala con las opciones por defecto.
3. Verifica:
   ```powershell
   node --version
   npm --version
   ```

## 6. Instalar las dependencias del proyecto

Dentro de la carpeta del proyecto (en la terminal integrada de VS Code, `Ctrl+\``):

```powershell
npm install
```

## 7. Configurar tus variables de entorno locales

```powershell
Copy-Item .env.example .env
```

Abre `.env` en VS Code y llena los tres valores (los mismos que ya están en Vercel):

| Variable | Dónde encontrarla |
|---|---|
| `SUPABASE_URL` | [supabase.com/dashboard](https://supabase.com/dashboard) → tu proyecto "racket-sports-gt" → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Mismo lugar → API Keys → `service_role` (secreta, no la comes con nadie) |
| `JWT_SECRET` | Cualquier texto largo aleatorio — puedes usar el mismo que está en Vercel o generar uno nuevo solo para desarrollo local |

`.env` ya está en `.gitignore`, así que nunca se sube a GitHub por accidente.

## 8. Conectar el CLI de Vercel

```powershell
npm install -g vercel
vercel login
```

Esto abre el navegador para iniciar sesión con la cuenta de Vercel que ya conectaste. Luego, dentro de la carpeta del proyecto:

```powershell
vercel link
```

Selecciona tu cuenta y el proyecto existente **racket-sports-gt** cuando te lo pregunte — así quedan enlazados tu carpeta local y el proyecto real en Vercel.

## 9. Probar localmente antes de desplegar

```powershell
vercel dev
```

Esto corre el sitio completo (frontend + funciones de la API) en tu máquina, usando las variables de `.env`, en una dirección como `http://localhost:3000`.

## 10. El flujo de trabajo completo, de principio a fin

```powershell
# 1. Trae los últimos cambios
git pull

# 2. Edita el código en VS Code

# 3. Prueba localmente
vercel dev

# 4. Guarda tus cambios
git add .
git commit -m "Descripción del cambio"
git push

# 5. Cuando estés listo para producción
vercel --prod
```

## 11. Extensiones útiles de VS Code (opcionales)

- **GitLens** — ve quién cambió qué línea y cuándo, directo en el editor.
- **Supabase** (oficial) — autocompletado y vista de tablas dentro de VS Code.
- **Vercel** (oficial) — despliega y ve logs sin salir del editor.

Instálalas desde el ícono de Extensiones en la barra lateral izquierda (o `Ctrl+Shift+X`).
