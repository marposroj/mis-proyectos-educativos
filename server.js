'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {createStore}=require('./platform-db'),{createAPI}=require('./platform-api'),ui=require('./platform-ui');
function createServer({store=createStore(),env=process.env}={}){
 const api=createAPI(store,env),root=path.join(__dirname,'public');
 const routes={'/lumivideo/':'lumivideo/index.html','/aulaelige/':'aulaelige/index.html','/overdrive/':'overdrive/index.html'};
 const assets={'/platform-client.js':['platform-client.js','application/javascript'],'/platform-addons.js':['platform-addons.js','application/javascript'],'/manifest.webmanifest':['manifest.webmanifest','application/manifest+json'],'/sw.js':['sw.js','application/javascript'],'/platform-icon.svg':['platform-icon.svg','image/svg+xml']};
 const headers={'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer','Permissions-Policy':'camera=(),geolocation=(),payment=()','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob: https://*.cloudfront.net https://*.runwayml.com; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'none'; form-action 'self'"};
 if(env.NODE_ENV==='production')headers['Strict-Transport-Security']='max-age=31536000';
 const server=http.createServer(async(req,res)=>{const finish=(status,body,type='text/plain; charset=utf-8',extra={})=>{if(res.headersSent)return;res.writeHead(status,{...headers,'Content-Type':type,...extra});res.end(req.method==='HEAD'?'':body);};
  let url;try{url=new URL(req.url,'http://localhost');}catch{return finish(400,'Solicitud inválida');}
  try{if(url.pathname==='/health'&&['GET','HEAD'].includes(req.method))return finish(200,'ok');
   if(await api.handler(req,res,url,finish))return;
   if(!['GET','HEAD'].includes(req.method))return finish(405,'Método no permitido',undefined,{Allow:'GET, HEAD'});
   if([...Object.keys(routes),'/cuenta/','/admin/','/estado/','/privacidad/'].some(x=>x.slice(0,-1)===url.pathname))return finish(308,'',undefined,{Location:url.pathname+'/'});
   const page=ui.html(url.pathname);if(page)return finish(200,page,'text/html; charset=utf-8');
   if(assets[url.pathname]){const [name,mime]=assets[url.pathname];return finish(200,fs.readFileSync(path.join(__dirname,name)),mime,url.pathname==='/sw.js'?{'Service-Worker-Allowed':'/'}:{});}
   const sample=url.pathname.match(/^\/samples\/(docentes|estudiantes|familias)\.pdf$/);if(sample){const file=path.join(__dirname,'sample-'+sample[1]+'.pdf');if(fs.existsSync(file))return finish(200,fs.readFileSync(file),'application/pdf');return finish(404,'Muestra todavía no incorporada.');}
   if(routes[url.pathname]){const override={'/overdrive/':'overdrive-online.html','/aulaelige/':'aulaelige-online.html'}[url.pathname];let html=fs.readFileSync(override&&fs.existsSync(path.join(__dirname,override))?path.join(__dirname,override):path.join(root,routes[url.pathname]),'utf8');html=html.replace('</head>','<link rel="manifest" href="/manifest.webmanifest"><script src="/platform-client.js" defer></script><script src="/platform-addons.js" defer></script></head>');return finish(200,html,'text/html; charset=utf-8');}
   finish(404,'Página no encontrada. Regresa a /');
  }catch(e){console.error('HTTP error',e.code||e.name);finish(503,'Servicio temporalmente no disponible');}
 });server.headersTimeout=15000;server.requestTimeout=60000;return {server,store};
}
if(require.main===module){const {server,store}=createServer();server.listen(Number.parseInt(process.env.PORT||'3000',10),'0.0.0.0',()=>console.log('Plataforma educativa lista'));process.on('SIGTERM',()=>server.close(()=>{store.close()?.finally(()=>process.exit(0));setTimeout(()=>process.exit(0),3000).unref();}));}
module.exports={createServer};
