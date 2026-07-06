# ROCO - Roles de Congregación

## Descripción
Aplicación web privada en un solo archivo HTML para la gestión automatizada de roles en una congregación. Diseño minimalista, elegante y limpio.

## Stack Tecnológico
- **Frontend**: HTML + CSS + JavaScript (Vanilla)
- **Estilos**: CSS puro con diseño minimalista, fuente Inter
- **Almacenamiento**: localStorage (navegador)
- **Autenticación**: SHA-256 (Web Crypto API)

## Archivos del Proyecto
- `index.html` — Aplicación completa (1230+ líneas)
- `memoria.md` — Este documento

## Cómo Usar
1. Abrir `index.html` en cualquier navegador moderno
2. En la primera ejecución, configurar correo y contraseña de administrador
3. Se crean automáticamente 10 grupos de aseo (Grupo 1...Grupo 10)
4. Agregar encargados de audio y video desde el panel Admin
5. El sistema genera automáticamente las asignaciones semanales

## Funcionalidades

### Autenticación
- Configuración inicial única con correo y contraseña
- Inicio de sesión con verificación SHA-256
- Sesión persistente en localStorage
- Cierre de sesión manual

### Dashboard (Inicio)
- **Semana Actual**: Tarjeta destacada con borde azul. Muestra asignaciones de Jueves y Domingo. Si hoy es día de reunión, badge "HOY". Si es semana de asamblea, banner gris con icono de pausa.
- **Próxima Semana**: Tarjeta secundaria con la misma estructura.
- **Calendario**: Vista de 9 semanas (2 pasadas + actual + 6 futuras). Las semanas pasadas se atenúan. La actual se resalta.

### Admin
- **Grupos de Aseo**: CRUD con edición inline, toggle activo/inactivo, borrado lógico, orden numérico.
- **Audio y Video**: CRUD con edición inline, toggle activo/inactivo, borrado lógico, orden numérico.
- **Pausa por Asamblea**: Toggle por semana para marcar como "Semana de Asamblea". Las semanas con pausa no asignan roles y la rotación se reanuda exactamente donde quedó.

### Historial
- Lista de todas las semanas pasadas ordenadas descendente
- Muestra asignaciones de Jueves y Domingo
- Badge verde "✓" para reuniones completadas
- Semanas de asamblea mostradas con fondo gris

## Lógica de Rotación

### Aseo (1 par por reunión = 2 pares/semana)
- 10 grupos se rotan circularmente: `rotateLeft(grupos, effectiveIdx % total)`
- Jueves: grupos en índices [0,1] del array rotado
- Domingo: grupos en índices [2,3] del array rotado
- Semana de asamblea: no consume pares, índices congelados
- Cada grupo trabaja aprox. 1 vez cada 2.5 semanas

### Audio/Video (1 persona por semana)
- `encargado = activos[effectiveIdx % totalActivos]`
- Una persona cubre ambas reuniones (Jueves + Domingo) de la semana
- Semana de asamblea: no avanza el índice

### Effective Index
- `effectiveIdx` = cantidad de semanas NO-pausa desde el inicio hasta la semana objetivo
- Las semanas de asamblea se saltan en el conteo
- Esto asegura que la rotación se reanude exactamente donde quedó

### Auto-Completado
- Al cargar la app, se comparan las fechas de reunión con la fecha actual
- Reuniones con fecha anterior al día actual se marcan como `completado = true`
- Visualmente se muestra un check verde "✓"

## Diseño UI/UX
- **Paleta**: Fondo #fafaf9, texto #1e293b, acento azul marino #1e3a5f, grises #94a3b8/#64748b
- **Tipografía**: Inter (Google Fonts), pesos 400/500/600/700
- **Cards**: Bordes redondeados (12px), bordes sutiles #e2e8f0, sombras ligeras
- **Header sticky**: Logo ROCO + navegación + info de usuario + botón Salir
- **Transiciones**: Fade-in (0.25s) y slide-up (0.3s) en cambios de vista
- **Responsive**: Adaptable a móviles (media query 640px)

## Historial de Cambios

### v1.0 — Versión Inicial
- Aplicación completa en un solo archivo HTML
- Sistema de autenticación con SHA-256
- CRUD completo de grupos de aseo y encargados AV
- Algoritmo de rotación circular para aseo (pares alternantes)
- Algoritmo de rotación secuencial para AV
- Dashboard con semana actual, próxima y calendario
- Auto-completado de semanas pasadas
- Pausa por asamblea con congelamiento de índices
- Historial consultable de semanas pasadas
- Diseño minimalista con Inter y paleta azul marino
