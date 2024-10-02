# UPBlioteca

UPBlioteca es una plataforma web desarrollada en Next.js que permite a estudiantes universitarios compartir y encontrar documentos de estudio. La aplicación facilita el intercambio de recursos educativos entre la comunidad estudiantil.

## Características principales

- 📚 Compartir y descargar documentos académicos
- 🔍 Búsqueda de documentos por nombre, materia o universidad
- ⭐ Sistema de calificación para documentos
- 👤 Perfiles de usuario personalizables
- 📊 Seguimiento de descargas
- ✨ Sección de publicaciones destacadas

## Tecnologías utilizadas

- [Next.js](https://nextjs.org/) - Framework de React
- [Tailwind CSS](https://tailwindcss.com/) - Framework de CSS
- [Shadcn UI](https://ui.shadcn.com/) - Componentes de UI
- [React Hook Form](https://react-hook-form.com/) - Manejo de formularios
- [Lucide React](https://lucide.dev/) - Íconos
- [React Toastify](https://fkhadra.github.io/react-toastify/) - Notificaciones

## Scripts disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter
## Requisitos previos

- Node.js (versión 14 o superior)
- npm o yarn

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/hrcamilo11/Notas---Next.git
cd upblioteca
```

2. Instala las dependencias:
```bash
npm install
# o
yarn install
```

3. Instala los componentes de Shadcn UI necesarios:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
```

4. Crea un archivo `.env.local` y configura las variables de entorno necesarias:
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Inicia el servidor de desarrollo:
```bash
npm run dev
# o
yarn dev
```

6. Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.


## Despliegue

La aplicación puede ser desplegada en varias plataformas. Aquí te mostramos cómo hacerlo en Vercel:

1. Crea una cuenta en [Vercel](https://vercel.com) si aún no tienes una

2. Instala la CLI de Vercel:
```bash
npm i -g vercel
```

3. Desde la raíz del proyecto, ejecuta:
```bash
vercel
```

4. Sigue las instrucciones en la terminal para completar el despliegue

## Estructura del proyecto

```
upblioteca/
├── app/
│   ├── fonts/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── UPBlioteca.tsx
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       └── label.tsx
├── lib/
│   └── utils.ts
├── .env.local
├── next.config.js
├── package.json
├── README.md
└── tailwind.config.js
```

## Contribuir

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## Contacto

Email: hrcamilo11@gmail.com

Enlace del proyecto: [https://github.com/hrcamilo11/Notas---Next](https://github.com/hrcamilo11/Notas---Next)