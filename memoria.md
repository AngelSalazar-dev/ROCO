# ROCO - Roles de Congregación

## Descripción
Aplicación web privada para la gestión automatizada de roles en una congregación. Diseño minimalista, elegante y limpio.

## Stack Tecnológico
- **Frontend/Backend**: Next.js 15 (App Router) + TypeScript
- **Estilos**: Tailwind CSS v3 + fuente Inter
- **Base de Datos**: TiDB Cloud (MySQL-compatible) vía mysql2
- **Autenticación**: JWT + bcryptjs (httpOnly cookie)
- **Deploy**: Vercel

## Repositorio
https://github.com/AngelSalazar-dev/ROCO

## Archivos del Proyecto

```
ROCO/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Dashboard (semana actual, próxima, calendario)
│   │   ├── login/page.tsx        # Login
│   │   ├── admin/page.tsx        # Admin (CRUD grupos, CRUD AV, pausa)
│   │   ├── historial/page.tsx    # Historial consultable
│   │   ├── layout.tsx            # Root layout con Inter
│   │   ├── globals.css           # Tailwind + animaciones
│   │   └── api/
│   │       ├── auth/login/route.ts
│   │       ├── auth/logout/route.ts
│   │       ├── auth/me/route.ts
│   │       ├── grupos-aseo/route.ts
│   │       ├── encargados-av/route.ts
│   │       ├── rotacion/route.ts       # GET: genera + retorna todo
│   │       ├── rotacion/pausa/route.ts # POST: toggle asamblea
│   │       └── rotacion/completar/route.ts # POST: auto-completar
│   ├── components/
│   │   ├── layout/Header.tsx
│   │   ├── dashboard/CurrentWeek.tsx
│   │   ├── dashboard/MeetingRow.tsx
│   │   └── dashboard/WeekCalendar.tsx
│   ├── lib/
│   │   ├── db.ts                 # mysql2 pool + migrate()
│   │   ├── auth.ts               # JWT + bcrypt + session helpers
│   │   ├── rotation.ts           # Algoritmo de rotación
│   │   ├── dates.ts              # getMonday, addDays, formatDate, parseDate
│   │   ├── migrate.ts            # Script para crear tablas
│   │   └── seed.ts               # Script para datos iniciales
│   ├── middleware.ts             # Protege /admin y /historial
│   └── types/index.ts
├── index.html                    # Versión standalone (legacy)
├── .env.example
├── .gitignore
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── package.json
└── postcss.config.mjs
```

## Base de Datos (TiDB)

### Conexión
```
DATABASE_URL="mysql://user:pass@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/test"
```

### Tablas
- **Profile**: id, email (unique), password (bcrypt), role ('admin'|'viewer')
- **GrupoAseo**: id, nombre, activo, orden
- **EncargadoAV**: id, nombre, activo, orden
- **HistorialRol**: id, fechaInicioSemana + tipoReunion (unique), grupoAseo1Id, grupoAseo2Id, encargadoAvId, esPausaAsamblea, completado

### Seed Data
- Admin: admin@roco.app / admin123 (role: admin)
- 10 grupos: Grupo 1, Grupo 2... Grupo 10 (todos activos)
- Encargados AV: vacío (admin los agrega)

## Lógica de Rotación

### Aseo (1 par por reunión = 2 pares/semana)
- `rotateLeft(grupos, effectiveIdx % total)` 
- Jueves: índices [0,1], Domingo: índices [2,3]
- Asamblea: no consume pares, índices congelados

### Audio/Video (1 persona por semana)
- `encargados[effectiveIdx % total]`
- Cubre ambas reuniones de la semana
- Asamblea: no avanza el índice

### Effective Index
- Contador de semanas NO-pausa desde el inicio
- Una semana de asamblea se salta en el conteo
- La rotación se reanuda exactamente donde quedó

### Auto-Completado
- Al cargar el dashboard, se marcan como completadas las reuniones con fecha anterior a hoy
- Visualmente: check verde "✓"

## Diseño UI/UX
- **Paleta**: Fondo #fafaf9, texto #1e293b, acento #1e3a5f, grises #94a3b8
- **Tipografía**: Inter (Google Fonts)
- **Componentes**: Cards con bordes redondeados, header sticky, transiciones suaves
- **Responsive**: Adaptable a móviles

## Para Desarrollo Local

```bash
# Instalar dependencias
npm install

# Copiar y configurar variables de entorno
cp .env.example .env.local
# Editar DATABASE_URL y JWT_SECRET

# Migrar base de datos
npx tsx src/lib/migrate.ts

# Sembrar datos iniciales
npx tsx src/lib/seed.ts

# Iniciar servidor de desarrollo
npm run dev
```

## Para Producción (Vercel)

1. Conectar repositorio a Vercel
2. Configurar variables de entorno:
   - `DATABASE_URL`: string de conexión a TiDB
   - `JWT_SECRET`: secreto para firmar tokens
   - `NODE_TLS_REJECT_UNAUTHORIZED`: 0 (para SSL de TiDB)
3. Desplegar
4. Una vez desplegado, ejecutar migración y seed desde terminal de Vercel o localmente

## Historial de Cambios

### v1.0 — Primer commit
- Proyecto Next.js con App Router + TypeScript + Tailwind
- Conexión a TiDB Cloud vía mysql2
- Sistema de autenticación JWT + bcryptjs
- API CRUD para grupos de aseo y encargados AV
- Algoritmo de rotación circular para aseo, secuencial para AV
- Dashboard con semana actual, próxima semana y calendario
- Auto-completado de semanas pasadas
- Pausa por asamblea con congelamiento de índices
- Panel admin con tabs y CRUD inline
- Historial consultable
- Middleware de protección de rutas
- Versión standalone HTML (index.html) como respaldo
