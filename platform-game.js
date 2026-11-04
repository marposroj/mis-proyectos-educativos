'use strict';
const {randomInt,randomUUID}=require('node:crypto');
const map=[1,1,0,2,1,0,2],names=['INDAGA','EXPLICA','DISEÑA'];
const pick=a=>a[randomInt(a.length)];
function data(i){
 if(i===0)return {m:pick([2,4,6,8]),v:pick([20,30,40,50])};
 if(i===1){let m=pick([2,4,5,8]),factor=pick([2,3,4]),x=pick([1,2,3]);return {m,k:20*m*factor,h:factor*x*x};}
 if(i===2){let m=pick([2,4,5,10]),f=pick([20,40,60,80,100]),final=pick([200,400,600,800]),initial=final+f*10;return {m,h:initial/(10*m),initial,final,d:10};}
 if(i===3)return {m:pick([20,40,60]),h:pick([4,6,8]),t:pick([2,4,5,8])};
 if(i===4){let phi=pick([1.2,1.6,2,2.4]),e=pick([2.8,4]);return {phi,target:Number((e-phi).toFixed(1))};}
 if(i===5){let mass=pick([20,40,100,200]),massUnit='mg';return {targetTJ:mass*.09,massUnit};}
 return {massG:pick([3,6,9,12]),beta:pick([.6,.8])};
}
function expected(i,d,unit){
 return [()=>d.v*d.v/20,()=>Math.sqrt(20*d.m*d.h/d.k),()=>(d.initial-d.final)/d.d,()=>10*d.m*d.h/d.t,()=>d.phi+d.target,()=>d.targetTJ/(unit==='mg'?.09:90),()=>((1/Math.sqrt(1-d.beta*d.beta))-1)*d.massG*90][i]();
}
function correct(i,d,answer){const n=Number(answer.value);if(!Number.isFinite(n)||n<0)return false;
 if(i===4){let e=[1.8,2.4,2.8,4][answer.photon];return n>0&&Number.isFinite(e)&&e>d.phi&&Math.abs((e-d.phi)-d.target)<1e-8;}
 if(i===5&&!['g','mg'].includes(answer.unit))return false;
 const target=expected(i,d,answer.unit);return Math.abs(n-target)<=1e-8*Math.max(1,Math.abs(target));}
function record(state,uid){return state.classrooms[uid]??=({attempts:[0,0,0],started:[null,null,null],completed:Array(7).fill(false),score:0,updated:new Date().toISOString()});}
function summary(state,uid){const r=record(state,uid);return {...r,grades:names.map((_,j)=>Number((20*map.reduce((n,x,i)=>n+(x===j&&r.completed[i]?1:0),0)/map.filter(x=>x===j).length).toFixed(2))),schedule:state.settings};}
function issue(state,uid,mission,admin=false){if(!Number.isInteger(mission)||mission<0||mission>6)throw Object.assign(Error('Misión inválida'),{status:400});
 const old=Object.values(state.challenges).find(c=>c.uid===uid&&c.mission===mission&&!c.used&&Date.now()-c.created<45*60000);if(old)return old;
 const c={id:randomUUID(),uid,mission,data:data(mission),created:Date.now(),used:false,admin};state.challenges[c.id]=c;
 for(const [id,c] of Object.entries(state.challenges))if(Date.now()-c.created>2*86400000)delete state.challenges[id];return c;}
function submit(state,uid,challengeId,answer,admin=false){const c=state.challenges[challengeId];if(!c||c.uid!==uid||c.admin!==admin)throw Object.assign(Error('Reto no encontrado'),{status:404});
 if(c.result)return c.result;const r=record(state,uid),j=map[c.mission],t=Date.now();
 if(t-c.created>=45*60000)throw Object.assign(Error('Reto vencido'),{status:409});
 if(!admin){if(state.settings.start&&t<Date.parse(state.settings.start)||state.settings.end&&t>Date.parse(state.settings.end))throw Object.assign(Error('Fuera del cronograma'),{status:403});
 if(r.completed[c.mission])throw Object.assign(Error('Misión ya completada'),{status:409});
 if(r.attempts[j]>=3||r.started[j]&&t-r.started[j]>=45*60000)throw Object.assign(Error('No hay más intentos o terminó el tiempo'),{status:409});
 r.started[j]??=t;r.attempts[j]++;}
 const success=correct(c.mission,c.data,answer);if(!admin&&success){r.completed[c.mission]=true;r.score+=[250,300,350,400,450,500,600][c.mission];}r.updated=new Date().toISOString();
 const id=randomUUID();state.attempts[id]={id,uid,mission:c.mission,capacity:j,success,at:r.updated,admin};c.used=true;c.result={id,success,progress:summary(state,uid),admin};return c.result;}
module.exports={map,names,data,expected,correct,record,summary,issue,submit};
