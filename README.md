# Publicación de LumiVideo, AulaElige y OVERDRIVE en Railway

**Contenido:** un solo servicio web de demostración con tres aplicaciones existentes.
**No incluye:** cuentas de servidor, recuperación por correo, pagos Culqi operativos, PDFs comerciales, datos escolares centralizados, motor de video con IA, almacenamiento permanente o dominio personalizado. No usar OVERDRIVE para evaluación oficial ni cargar datos personales reales de alumnos en esta versión.

## Opción A: Railway desde tu computadora (sin GitHub)
1. Descarga y **descomprime** este ZIP. Abre una terminal dentro de la carpeta `PAQUETE_RAILWAY_3_PROYECTOS`.
2. Instala Node.js 20+ si no está disponible y después Railway CLI siguiendo su documentación oficial: https://docs.railway.com/cli.
3. Ejecuta `railway up --new --name mis-proyectos-educativos`. Railway solicitará iniciar sesión en tu navegador. **No compartas tus contraseñas ni tokens aquí**.
4. En Railway, entra al servicio -> **Settings -> Networking -> Public Networking -> Generate Domain**. La plataforma mostrará tu dominio real.
5. Abre ese dominio. La página inicial enlaza `/lumivideo/`, `/aulaelige/` y `/overdrive/`. Verifica `/health` devuelve `ok`.

## Opción B: Railway desde https://railway.com/new
1. Descomprime este ZIP en tu equipo.
2. Crea un repositorio **privado** en GitHub y sube los archivos y subcarpetas del paquete (la carpeta raíz debe contener `Dockerfile` y `server.js`).
3. En `https://railway.com/new`, elige **Deploy from GitHub Repo**, conecta GitHub si lo solicita y selecciona ese repositorio.
4. Railway detectará el Dockerfile y creará el servicio.
5. Abre el servicio -> **Settings -> Deploy -> Healthcheck Path** y configura `/health`; después **Settings -> Networking -> Public Networking -> Generate Domain**.
6. Visita el dominio generado y prueba las tres rutas.

## Prueba local
- Con Node.js 20+ instalado: `npm start` y abrir `http://localhost:3000/`.
- Pruebas automáticas: `npm test`.
- El servidor escucha `0.0.0.0` y la variable `PORT` que Railway entrega automáticamente. No requiere dependencias de npm.

## Arquitectura actual
- `/` portal informativo.
- `/lumivideo/` editor de videos locales WebM.
- `/aulaelige/` catálogo sin pagos.
- `/overdrive/` videojuego con almacenamiento exclusivamente local de prueba.
- `/health` respuesta HTTP 200 para revisiones de arranque.

## Requisitos reales antes de abrir al público en producción
- Aislar OVERDRIVE detrás de autenticación real y llevar notas, cronogramas e intentos a PostgreSQL, con autorización por roles y recuperación segura por correo.
- Definir documentos de consentimiento, protección de datos, retención y borrado, especialmente al tratarse de estudiantes.
- Conectar Culqi usando **credenciales secretas solo en backend** y webhook verificado; no entregar archivos ni activar créditos por el simple clic de un enlace de cobro.
- Subir y verificar los PDFs completos y derechos/registro editorial antes de venta, y activar la entrega temporal autorizada.
- Integrar proveedor de video IA, cuotas y almacenamiento adecuado para LumiVideo; controlar costos de generación.
- Gestionar variables privadas en Railway, establecer límites de gasto y copias de seguridad, y realizar pruebas de penetración y pago de extremo a extremo.
- Los nombres actuales bajo `chatgpt.site` no se actualizan al desplegar este paquete; el dominio Railway es nuevo hasta configurar dominio y DNS.

Fuentes oficiales: https://docs.railway.com/cli/up, https://docs.railway.com/services, https://docs.railway.com/networking/public-networking
