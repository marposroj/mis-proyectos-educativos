"use strict";
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');

// Servidor de demostración estática para tres proyectos. NO gestiona pagos, sesiones ni notas.
const root = path.resolve(__dirname,'public');
const routes = Object.freeze({
 '/': 'index.html',
 '/lumivideo/': 'lumivideo/index.html',
 '/aulaelige/': 'aulaelige/index.html',
 '/overdrive/': 'overdrive/index.html'
});
const redir = Object.freeze({
 '/lumivideo':'/lumivideo/',
 '/aulaelige':'/aulaelige/',
 '/overdrive':'/overdrive/'
});
const securityHeaders = {
 'X-Content-Type-Options':'nosniff',
 'X-Frame-Options':'DENY',
 'Referrer-Policy':'strict-origin-when-cross-origin',
 'Permissions-Policy':'camera=(),geolocation=(),payment=()',
 'Cache-Control':'no-store'
};
const server = http.createServer((req,res)=>{
 const finish=(status,body,type='text/plain; charset=utf-8',extra={})=>{
  res.writeHead(status,{...securityHeaders,'Content-Type':type,...extra});
  res.end(req.method==='HEAD'?'':body);
 };
 if(req.method!=='GET'&&req.method!=='HEAD')return finish(405,'Método no permitido',undefined,{'Allow':'GET, HEAD'});
 let url;try{url=new URL(req.url,'http://localhost')}catch{return finish(400,'Solicitud inválida')}
 if(url.pathname==='/health') return finish(200,'ok');
 if(Object.hasOwn(redir,url.pathname))return finish(308,'',undefined,{'Location':redir[url.pathname]});
 const relative=routes[url.pathname];
 if(!relative)return finish(404,'Página no encontrada. Regresa a /');
 const target=path.resolve(root,relative);
 if(!target.startsWith(root+path.sep))return finish(403,'No autorizado');
 fs.stat(target,(err,stat)=>{
  if(err||!stat.isFile())return finish(404,'No encontrado');
  res.writeHead(200,{...securityHeaders,'Content-Type':'text/html; charset=utf-8','Content-Length':stat.size});
  if(req.method==='HEAD'){res.end();return;}
  const stream=fs.createReadStream(target);
  stream.on('error',()=>res.destroy());
  stream.pipe(res);
 });
});
const port=Number.parseInt(process.env.PORT||'3000',10);
server.listen(port,'0.0.0.0',()=>console.log(`Portal de demostración listo en puerto ${port}`));
process.on('SIGTERM',()=>server.close(()=>process.exit(0)));
