# Plataforma conectada: estado y operación

## Implementado

- PostgreSQL con transacciones y bloqueo de fila para consumo atómico de intentos y créditos. Para un aula pequeña: estado JSONB y archivos privados BYTEA; para escalar, separar tablas por entidad y añadir trabajos asíncronos.
- Registro, scrypt con sal aleatoria, cookies HttpOnly/Secure/SameSite, CSRF, validación de origen, roles, límites de peticiones y auditoría.
- OVERDRIVE evalúa respuestas y registra notas/intentos en el servidor: tres intentos y 45 minutos por competencia. Las respuestas enviadas no pueden declarar una nota o un resultado. No importa PIN ni notas de la antigua demostración local.
- Recuperación y verificación por enlaces de un solo uso y 30 minutos; revoca sesiones al cambiar contraseña. Requiere SMTP.
- Guiones privados, contador de créditos y adaptador Runway gen4.5 con límite diario e idempotencia. Fallos inciertos quedan `needs_review`; no se reintentan cobros/generaciones automáticamente.
- Catálogo, muestras de cuatro páginas extraídas de los PDF del autor, carga privada del PDF completo, pedidos Culqi, reconsulta del proveedor antes de habilitar descarga, afiliados con registro de comisión (sin pago automático de comisiones).
- Registro docente CSV y sincronización de Google Sheets mediante cuenta de servicio, cola persistente y reintento cada minuto.
- Portal PWA instalable con conexión obligatoria. No cachea cuentas, sesiones, compras ni calificaciones.

## No completado / no simular

- Sin credenciales privadas no se envían correos, verifican cobros ni generan videos de IA.
- La clonación de voz no está implementada. La lectura con voz del dispositivo no equivale a clonación ni a una pista incorporada al video.
- Las suscripciones, compra de créditos, almacenamiento duradero de videos IA y monetización con anuncios no están implementados.
- Los enlaces de resultados del proveedor son temporales; todavía se debe conectar almacenamiento de objetos y un trabajo de descarga con límites.
- No se ha publicado en Google Play ni probado un APK. La instalación PWA no es publicación en la tienda.
- No se han configurado dominios propios sin propiedad/DNS verificables.
- No existe una copia de seguridad externa hasta configurar y probar el destino de backups.
- Las calificaciones del juego miden resolución de problemas: no acreditan por sí mismas desempeño oficial en Indaga y Diseña. Falta la rúbrica docente y las evidencias prácticas.
- Requiere revisión independiente de seguridad, carga, privacidad y procedimientos institucionales antes de uso escolar oficial.

## Variables privadas

Nunca subir archivos .env o secretos a GitHub. En Railway, servicio web → Variables:

| Variable | Uso |
| --- | --- |
| DATABASE_URL | Referencia `${{Postgres.DATABASE_URL}}` al Postgres del mismo proyecto |
| PUBLIC_URL | URL HTTPS canónica del servicio, sin barra final |
| ADMIN_EMAIL | Correo del propietario; por defecto marposroj@gmail.com |
| ADMIN_BOOTSTRAP_TOKEN | Valor aleatorio de al menos 32 bytes configurado privadamente; retirar tras reclamar administración |
| TRUST_PROXY | `true` solo detrás del proxy de confianza de Railway |
| SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM | Correo autorizado; TLS 465 o STARTTLS 587 |
| ALLOW_PAID_PROVIDERS | Dejar `false` hasta aprobación expresa de costes |
| CULQI_SECRET_KEY, CULQI_PUBLIC_KEY | Llaves del comercio de AulaElige; usar primero pruebas |
| CULQI_WEBHOOK_TOKEN | Token privado de autenticación Bearer del webhook |
| RUNWAYML_API_SECRET | Credencial API del proveedor de video |
| VIDEO_CREDITS_PER_SECOND | Créditos internos por segundo, por defecto 25 |
| MAX_DAILY_VIDEO_CREDITS | Límite global diario, por defecto 0; no habilita gastos por sí solo |
| GOOGLE_SERVICE_ACCOUNT_JSON | JSON de cuenta de servicio con alcance de Sheets |
| GOOGLE_SHEET_ID, GOOGLE_SHEET_TAB | Hoja compartida con la cuenta de servicio; pestaña existente OVERDRIVE por defecto |

Reclamar propietario: registrarse con ADMIN_EMAIL, iniciar sesión y usar el formulario de primera configuración en Mi cuenta con el token privado. Nadie se convierte en administrador por registrarse primero ni por elegir ese rol en el navegador. No hay contraseña predeterminada.

## Archivos y ventas

1. Iniciar sesión como administrador y cargar los PDF completos desde Administración, o importarlos directamente en PostgreSQL mediante una conexión privada del propietario. Nunca publicar los PDF completos, cifrados o sin cifrar, en este repositorio público.
2. Las muestras públicas conservan el aviso de registros editoriales no acreditados; no inventar ISBN/depósito legal.
3. Configurar Culqi en modo pruebas, autorizar autenticación del webhook `/api/webhooks/culqi`, probar una orden y su confirmación.
4. No usar el CulqiLink de LumiVideo para vender libros. Cada pedido tiene un ID e importe calculado por el servidor.
5. La descarga solo funciona con la sesión del comprador y una orden pagada verificada vía API. Un webhook no puede declarar por sí solo un pago.
6. No se almacenan datos de tarjeta ni se muestran llaves del servidor.

## Pruebas y despliegue

`npm ci`, `npm test`. El Dockerfile instala únicamente dependencias de producción y arranca Node como usuario no privilegiado. Railway sigue la rama main. `/health` verifica el proceso; `/api/status` verifica conexión de base de datos y configuración de integraciones, sin revelar secretos.

Para probar PostgreSQL real antes de uso oficial: confirmar transacciones concurrentes desde dos procesos, restauración y reinicio. Las pruebas automatizadas usan pg-mem: no sustituyen todas las garantías de concurrencia de PostgreSQL real.

## Copias de seguridad y restauración

Utilizar un sistema externo con `pg_dump -Fc` y cifrado (por ejemplo age) antes de transferir. Entregar DATABASE_URL a través de entorno privado, nunca por argumentos ni archivos públicos. No guardar dumps en el repositorio ni en el sistema efímero del contenedor. Probar `pg_restore` en una base aislada y comprobar usuarios, archivos, compras, notas y permisos. Definir retención y eliminar sesiones/token de un dump de pruebas. El volumen persistente no es una copia de seguridad. La programación no está activada hasta disponer de un destino externo autorizado.

## Costes

No se ha autorizado pasar a un plan de pago. Tanto el servidor como PostgreSQL consumen crédito de prueba. La permanencia depende del crédito y de las condiciones de Railway. No añadir réplicas o planes ni cambiar límites de gasto sin autorización. Configurar avisos mediante el panel del proveedor; no confundir un aviso con un límite de gasto real.

## Referencias oficiales consultadas

- https://node-postgres.com/features/transactions
- https://docs.culqi.com/es/documentacion/pagos-online/ordenes-de-pago/ordenes/
- https://docs.culqi.com/es/documentacion/pagos-online/webhooks/
- https://docs.dev.runwayml.com/guides/using-the-api/
