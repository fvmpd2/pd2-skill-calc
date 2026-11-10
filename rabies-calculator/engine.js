/* Poison rate and finite-exposure model. Infection is not another damage stack. */
(function(root){
const D=typeof module!=='undefined'?require('./data.js'):RABIES_DATA;
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const num=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
const level=x=>clamp(Math.floor(num(x,1)),1,100);
const hard=x=>clamp(Math.floor(num(x)),0,20);
function scale(a,l){const bands=[Math.min(l-1,7),clamp(l-8,0,8),clamp(l-16,0,6),clamp(l-22,0,6),Math.max(0,l-28)];return a[0]+bands.reduce((v,n,i)=>v+n*a[i+1],0);}
function resistance(start,sources,pierce){start=num(start);pierce=Math.abs(num(pierce));const immuneBefore=start>=100;const breaking=sources.reduce((s,v)=>s+Math.floor(Math.abs(num(v))/(immuneBefore?2:1)),0);const afterBreaking=start-breaking,immune=afterBreaking>=100;const total=breaking+(immune?0:pierce);const positive=Math.min(total,Math.max(0,start));const effective=immune?afterBreaking:clamp(Math.trunc(start-positive-(total-positive)/2),-100,99);return {effective,immune,breaking,afterBreaking,factor:immune?0:Math.max(0,1-effective/100)};}
const defaults={rabiesLevel:40,creeperLevel:36,creeperHard:20,feralHard:20,shapeHard:20,rabiesHard:20,carrionHard:20,solarHard:20,bonus:0,pierce:0,enemyRes:50,enemyPlr:0,lowerRes:0,breaking:0,creeperActive:true,creeperBonus:0,creeperPierce:0,whole:true};
function calculate(input={}){const s={...defaults,...input};for(const k of Object.keys(s))if(typeof defaults[k]==='number')s[k]=num(s[k],defaults[k]);for(const k of ['pierce','lowerRes','breaking','creeperPierce'])s[k]=Math.abs(s[k]);const cl=level(s.creeperLevel),rl=level(s.rabiesLevel),debuff=s.creeperActive?Math.min(40,cl+4):0;const sources=[s.lowerRes,s.breaking,debuff];
function poison(key,l,synergyPoints,bonus,pierce){const d=D[key],synergy=synergyPoints*d.synergy;const mult=(1+synergy/100)*Math.max(0,1+bonus/100);const raw=[scale(d.min,l),scale(d.max,l)].map(v=>v*Math.pow(2,d.hitShift)/256*mult);const res=resistance(s.enemyRes,sources,pierce);const net=raw.map(v=>v*res.factor);const plr=clamp(s.enemyPlr,-100,75);const effectivePlr=clamp(s.enemyPlr-(res.immune?0:pierce/2),-100,75);const durationBefore=d.frames*(1-plr/100)/25;const frames=Math.max(1,Math.floor(d.frames*(1-effectivePlr/100)));const duration=frames/25;return {level:l,synergy,rawFrame:raw,frame:net,rawDps:raw.map(v=>v*25),dps:net.map(v=>v*25),rawTotal:raw.map(v=>v*d.frames),total:net.map(v=>v*frames),durationBefore,duration,baseDuration:d.frames/25,frames,res,avgDps:(net[0]+net[1])*12.5,avgTotal:(net[0]+net[1])*frames/2};}
const rabies=poison('rabies',rl,hard(s.creeperHard)+hard(s.feralHard)+hard(s.shapeHard),s.bonus,s.pierce);
const creeper=poison('creeper',cl,hard(s.rabiesHard)+hard(s.carrionHard)+hard(s.solarHard),s.creeperBonus,s.creeperPierce);
return {s,rabies,creeper,creepers:1+Math.floor(hard(s.creeperHard)/10),debuff,rabiesAr:65+15*(rl-1),infectionSeconds:D.rabies.frames/25,trailSeconds:4,trailHitDelay:15/25};}
function marginal(input={}){const s={...defaults,...input},base=calculate(s).rabies;const gain=x=>{const r=calculate(x).rabies;return {rate:base.avgDps?100*(r.avgDps/base.avgDps-1):null,total:base.avgTotal?100*(r.avgTotal/base.avgTotal-1):null};};return {skill:gain({...s,rabiesLevel:level(s.rabiesLevel)+1}),damage:gain({...s,bonus:num(s.bonus)+5}),pierce:gain({...s,pierce:Math.abs(num(s.pierce))+5})};}
const api={calculate,marginal,resistance,scale,defaults};if(typeof module!=='undefined')module.exports=api;else root.RabiesCalc=api;
})(typeof window!=='undefined'?window:globalThis);
