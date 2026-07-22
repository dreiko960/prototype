# Prototype

Proyecto web con Vite y TypeScript listo para publicarse en GitHub y desplegarse en Netlify.

## Requisitos

- Node.js 18+ instalado
- npm (incluido con Node.js)

## Instalación

En la raíz del proyecto, ejecuta:

```bash
npm install
```

## Ejecutar en modo desarrollo

```bash
npm run dev
```

Abre la dirección que muestra la terminal, por ejemplo:

```text
http://localhost:5173
```

## Generar la versión de producción

```bash
npm run build
```

Los archivos listos para publicar se generan en la carpeta `dist/`.

## Subir a GitHub

1. Inicia un repositorio en GitHub.
2. Añade los cambios:

```bash
git init
git add .
git commit -m "Primer despliegue"
git branch -M main
git remote add origin <tu-url-de-github>
git push -u origin main
```

## Desplegar en Netlify

1. Inicia sesión en Netlify.
2. Crea un nuevo sitio desde Git.
3. Conecta tu repositorio de GitHub.
4. Usa estas opciones:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Publica el sitio.

## Archivos principales

- `index.html` - punto de entrada del sitio
- `src/main.ts` - código principal de la aplicación
- `src/style.css` - estilos
- `package.json` - scripts y dependencias
- `tsconfig.json` - configuración de TypeScript
