'use strict';
const {Pool}=require('pg');
const initial=()=>({version:2,users:{},sessions:{},tokens:{},classrooms:{},attempts:{},challenges:{},orders:{},jobs:{},ledger:[],audit:[],settings:{start:null,end:null},files:{},outbox:[],affiliates:{}});
function createStore({pool,connectionString=process.env.DATABASE_URL}={}){
  const enabled=!!(pool||connectionString);
  const p=pool||(enabled?new Pool({connectionString,max:4,connectionTimeoutMillis:10000,idleTimeoutMillis:30000}):null);
  let ready=null,queue=Promise.resolve();
  async function init(){if(!p)throw Object.assign(Error('Falta conectar PostgreSQL. No se guardarán datos en memoria temporal.'),{status:503});
    if(!ready)ready=(async()=>{await p.query('CREATE TABLE IF NOT EXISTS platform_state (id INTEGER PRIMARY KEY, data JSONB NOT NULL)');await p.query('INSERT INTO platform_state (id,data) VALUES (1,$1::jsonb) ON CONFLICT (id) DO NOTHING',[JSON.stringify(initial())]);await p.query('CREATE TABLE IF NOT EXISTS platform_files (id TEXT PRIMARY KEY, content BYTEA NOT NULL, mime TEXT NOT NULL)');})();
    try{await ready;}catch(e){ready=null;throw e;}}
  async function transaction(fn){await init();const previous=queue;let release;queue=new Promise(r=>{release=r;});await previous;
    let c;try{c=await p.connect();await c.query('BEGIN');const r=await c.query('SELECT data FROM platform_state WHERE id=1 FOR UPDATE');const state=structuredClone(r.rows[0].data);const result=await fn(state,c);await c.query('UPDATE platform_state SET data=$1::jsonb WHERE id=1',[JSON.stringify(state)]);await c.query('COMMIT');return result;}catch(e){if(c)await c.query('ROLLBACK');throw e;}finally{if(c)c.release();release();}}
  async function read(fn){await init();const r=await p.query('SELECT data FROM platform_state WHERE id=1');return fn(structuredClone(r.rows[0].data));}
  async function putFile(id,content,mime,c=p){await init();await c.query("INSERT INTO platform_files(id,content,mime) VALUES ($1,decode($2,'base64'),$3) ON CONFLICT(id) DO UPDATE SET content=EXCLUDED.content,mime=EXCLUDED.mime",[id,content.toString('base64'),mime]);}
  async function getFile(id){await init();return (await p.query('SELECT content,mime FROM platform_files WHERE id=$1',[id])).rows[0];}
  return {enabled,init,transaction,read,putFile,getFile,close:()=>p?.end()};
}
module.exports={createStore,initial};
