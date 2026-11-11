const A=require('node:assert/strict'),E=require('./engine.js');const wish=(kind,minSockets,maxSockets=minSockets)=>({kind,minSockets,maxSockets,minEd:0,minIas:0});
const x={base:'9ls',quality:'uni',ilvl:90,strategy:'after',wishes:[wish('sockets',3),wish('dmg%+swing1',2)]};const r=E.calculate(x);A(Math.abs(r.total-.075)<1e-10);A(Math.abs(r.per[0]-.07)<1e-10);A(Math.abs(r.per[1]-.005)<1e-10);A(Math.abs(r.brick-.25)<1e-10);
const overlap=E.calculate({...x,wishes:[wish('sockets',3,4),wish('sockets',3)]});A(Math.abs(overlap.total-.13)<1e-10);
const pre=E.calculate({...x,strategy:'before',wishes:[wish('dmg%+swing1',2)]});A(Math.abs(pre.total-.0075)<1e-10);
const plain=E.calculate({...x,strategy:'none',wishes:[wish('dmg%+swing1',2)]});A.equal(plain.total,0);
const capped=E.calculate({...x,base:'dgr',wishes:[wish('sockets',1)]});A(Math.abs(capped.total-.25)<1e-10);
const min=E.calculate({...x,wishes:[{...wish('dmg%+swing1',2),minEd:120}]});A(Math.abs(min.total-.005/41)<1e-10);
for(const b of E.data.bases.filter(b=>b.caps[2]>0)){for(const sockets of [0,1]){const ds=E.distribution(b,'uni',sockets);A(Math.abs(ds.reduce((s,x)=>s+x.p,0)-1)<1e-10,b.code);}}
console.log('Corruption, puzzle order, OR overlap, socket caps, roll thresholds and all base distributions passed.');
