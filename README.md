# LumiVideo, AulaElige y OVERDRIVE · plataforma conectada

Repositorio compartido para tres proyectos de Mario Posso Rojas desplegados en Railway.

## Cambios de la versión 2

Cuentas con contraseñas scrypt, cookies de sesión HttpOnly, roles, PostgreSQL persistente, cronogramas y tres intentos por competencia controlados en el servidor, registro docente CSV, sincronización de Sheets configurable, guiones privados y base de pedidos con descarga protegida tras verificar Culqi. Portal web instalable (PWA).

Las integraciones externas no se simulan: sin sus credenciales, el estado muestra pendiente. Generación de video IA, pagos y gastos están desactivados por defecto. No hay clonación de voz, suscripciones, anuncios ni publicación en Google Play. Consulta [OPERATIONS.md](OPERATIONS.md) para el estado exacto, variables, límites, backups y pendientes.

## Ejecutar y comprobar

Node.js 22 o posterior. `npm ci`, `npm test`, `npm start`.

Sin DATABASE_URL se pueden abrir las páginas y muestras, pero las operaciones de cuenta/datos fallan de forma segura. No hay una base temporal que aparente guardar permanentemente la información.

Las pruebas usan pg-mem. Antes de evaluación oficial deben verificarse concurrencia real, restauración de backups, privacidad, rúbricas y carga. Los resultados del juego por sí solos no sustituyen las evidencias docentes.

## Rutas

- `/lumivideo/`: editor WebM y guiones conectados.
- `/aulaelige/`: catálogo y muestras PDF reales.
- `/overdrive/`: juego con cuenta y evaluación en el servidor.
- `/cuenta/`: registro, acceso, compras y proyectos.
- `/admin/`: notas, cronograma, PDF privados y ventas.
- `/estado/`: configuración real de integraciones.
- `/health`: proceso web; `/api/status`: base de datos y funciones configuradas.

## Privacidad del contenido

Este repositorio es público. Solo contiene muestras de cuatro páginas; los PDF completos deben cargarse desde Administración y se guardan en PostgreSQL, fuera del repositorio. No subir secretos, datos estudiantiles o copias de seguridad a GitHub.
