# Tracktext

Tracktext es una aplicación web desarrollada en React que permite a empresas textiles gestionar pedidos, clientes, producción e inventario. La plataforma facilita la administración eficiente de los procesos de producción y la comunicación entre diferentes roles dentro de la empresa.

## Características principales

- 👤 Sistema de autenticación con roles (admin, empleado, cliente)
- 📦 Gestión completa de pedidos (crear, ver, actualizar, eliminar)
- 🏭 Control de producción con seguimiento de progreso
- 👥 Gestión de clientes y empleados
- 📊 Inventario y seguimiento de pedidos completados
- 🔔 Sistema de notificaciones para eventos importantes
- 📜 Historial de pedidos entregados

## Tecnologías utilizadas

- [React](https://reactjs.org/) - Biblioteca de JavaScript para construir interfaces de usuario
- [Next.js](https://nextjs.org/) - Framework de React
- [TypeScript](https://www.typescriptlang.org/) - Superset tipado de JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Framework de CSS
- [Shadcn UI](https://ui.shadcn.com/) - Componentes de UI
- [Lucide React](https://lucide.dev/) - Íconos

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
git clone https://github.com/hrcamilo11/Tracktext.git
cd Tracktext
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
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add progress
```

4. Crea un archivo `.env.local` y configura las variables de entorno necesarias:

```
NEXT_PUBLIC_API_URL=http://tu-api-url.com
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
textil-dashboard/
├── app/
│   ├── fonts/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Dashboard.tsx
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── checkbox.tsx
│       └── progress.tsx
├── lib/
│   └── utils.ts
├── .env.local
├── next.config.js
├── package.json
├── README.md
└── tailwind.config.js
```

## Uso

1. Inicia sesión con las credenciales predeterminadas:
   - Admin: usuario `admin`, contraseña `admin`
   - Empleado: usuario `employee`, contraseña `employee`
   - Cliente: usuario `client`, contraseña `client`

2. Explora las diferentes secciones del dashboard según tu rol:
   - Pedidos: Gestiona y visualiza todos los pedidos
   - Clientes: Administra la información de los clientes (solo admin y empleados)
   - Producción: Controla el progreso de los pedidos en producción
   - Inventario: Gestiona los pedidos completados y listos para entrega
   - Historial: Revisa los pedidos entregados
   - Empleados: Gestiona los empleados (solo admin)
   - Notificaciones: Revisa alertas importantes del sistema

## Contribuir

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## Contacto

Camilo Hernández - hrcamilo11@gmail.com

Enlace del proyecto: [Tracktext](https://github.com/hrcamilo11/Tracktext)
```

Este README.md proporciona una descripción completa del proyecto Textil Dashboard, incluyendo sus características principales, tecnologías utilizadas, instrucciones de instalación y uso, estructura del proyecto, y información sobre cómo contribuir. Asegúrate de personalizar los detalles como el nombre de usuario de GitHub, información de contacto y enlaces específicos del proyecto antes de utilizarlo.