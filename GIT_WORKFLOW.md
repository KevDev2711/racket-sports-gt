# Guía rápida: Git + GitHub para este proyecto

Tu repositorio ya existe y está conectado: [github.com/KevDev2711/racket-sports-gt](https://github.com/KevDev2711/racket-sports-gt) (privado). Esta guía es para cuando tú (desde tu propia laptop, no desde aquí) quieras seguir haciendo cambios.

## 1. Clonar el proyecto en tu computadora

La primera vez, trae el código a tu máquina:

```bash
git clone https://github.com/KevDev2711/racket-sports-gt.git
cd racket-sports-gt
npm install
```

## 2. Configura tus variables de entorno localmente

Copia el ejemplo y pon tus propios valores (nunca subas este archivo a GitHub — ya está en `.gitignore`):

```bash
cp .env.example .env
```

Edita `.env` con la URL de Supabase, la service role key, y el JWT secret (los mismos valores que están en Vercel, o puedes generar un `JWT_SECRET` distinto para desarrollo local).

## 3. El flujo de trabajo diario (simple, sin ramas complicadas)

Como eres el único desarrollador por ahora, puedes trabajar directo en `main`:

```bash
# 1. Antes de empezar, trae los últimos cambios (por si trabajaste desde otra máquina)
git pull

# 2. Haz tus cambios en el código (edita archivos normalmente)

# 3. Revisa qué cambió
git status
git diff

# 4. Agrega los archivos modificados
git add .

# 5. Guarda los cambios con un mensaje descriptivo
git commit -m "Descripción breve de lo que cambiaste"

# 6. Sube los cambios a GitHub
git push
```

## 4. Cuando quieras probar algo arriesgado: usa una rama

Si vas a experimentar con algo que podría romper el login en producción, aísla el cambio:

```bash
git checkout -b prueba-nueva-funcion   # crea y cambia a una rama nueva
# ... haces cambios y commits normalmente ...
git push -u origin prueba-nueva-funcion
```

Luego en GitHub.com puedes abrir un "Pull Request" para revisar el cambio antes de fusionarlo (`Merge`) a `main`. Si el experimento no funciona, simplemente no la fusiones y bórrala:

```bash
git checkout main
git branch -D prueba-nueva-funcion
```

## 5. Desplegar tus cambios a producción (Vercel)

Cada vez que hagas `git push` a `main`, si conectas el repo de GitHub directamente al proyecto de Vercel desde el dashboard (Vercel → Project → Settings → Git), **el despliegue sucede automáticamente**. Si prefieres desplegar manualmente desde tu computadora:

```bash
npx vercel --prod
```

## 6. Comandos que usarás casi siempre

| Comando | Qué hace |
|---|---|
| `git status` | Muestra qué archivos cambiaste |
| `git add .` | Marca todos los cambios para guardar |
| `git commit -m "mensaje"` | Guarda un punto en la historia |
| `git push` | Sube tus commits a GitHub |
| `git pull` | Baja los cambios más recientes de GitHub |
| `git log --oneline` | Ve el historial de cambios, resumido |

## 7. Si algo se rompe

- **"Failed to fetch" en el sitio:** revisa las variables de entorno en Vercel (Settings → Environment Variables) — deben coincidir con tu proyecto de Supabase.
- **Login no funciona después de un cambio:** revisa los logs de la función en Vercel (Project → Deployments → clic en el deployment → Functions).
- **Quieres regresar a una versión anterior:** en Vercel puedes "Promote to Production" cualquier deployment anterior desde la lista de Deployments, sin tocar el código.
