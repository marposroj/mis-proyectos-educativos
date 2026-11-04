const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');

let proc, base;
const port = 34000 + Math.floor(Math.random()*10000);
test.before(async () => {
  proc = spawn(process.execPath, ['server.js'], {cwd:require('node:path').resolve(__dirname,'..'), env:{...process.env, PORT:String(port)}, stdio:'ignore'});
  base = `http://127.0.0.1:${port}`;
  for(let i=0; i<40; i++) { try { const r=await fetch(base+'/health'); if(r.ok) return; } catch{} await new Promise(resolve=>setTimeout(resolve,50)); }
  throw new Error('El servidor no inició');
});
test.after(() => proc?.kill('SIGTERM'));
for(const route of ['/', '/lumivideo/', '/aulaelige/', '/overdrive/']) {
 test(`GET ${route} sirve HTML válido`, async() => {
   const r=await fetch(base+route); const body=await r.text();
   assert.equal(r.status,200); assert.match(r.headers.get('content-type')||'',/text\/html/);
   assert.match(body,/<html/i);assert.match(body,/<\/html>/i);
 });
}
test('GET /health responde ok',async()=>{const r=await fetch(base+'/health');assert.equal(r.status,200);assert.equal(await r.text(),'ok');});
test('URL desconocida no expone archivos',async()=>{const r=await fetch(base+'/package.json');assert.equal(r.status,404);});
test('POST no permitido',async()=>{const r=await fetch(base+'/',{method:'POST'});assert.equal(r.status,405);});
test('Rutas sin barra redirigen correctamente',async()=>{const r=await fetch(base+'/lumivideo',{redirect:'manual'});assert.equal(r.status,308);assert.equal(r.headers.get('location'),'/lumivideo/');});
