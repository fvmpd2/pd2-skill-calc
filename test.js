// Run with Node.js: node test.js
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c=vm.createContext({});
vm.runInContext(fs.readFileSync(__dirname+'/skills.js','utf8')+fs.readFileSync(__dirname+'/calc.js','utf8')+';globalThis.catalog=skills;globalThis.calc=calculate;globalThis.scale=scaledValue;',c);
const flat={kind:'flat',min:[10,1,2,3,4,5],max:[20,1,2,3,4,5]};
for(const [res,pierce,want] of [[25,40,-7],[0,40,-20],[-20,40,-40],[100,200,100],[200,300,200],[20,10,10],[0,500,-100]])assert.equal(c.calc(flat,{skillLevel:1,enemyResistancePct:res,enemyResistanceReductionPct:pierce}).effectiveResistancePct,want);
assert.equal(c.calc(flat,{skillLevel:1,enemyResistancePct:100,enemyResistanceReductionPct:500}).min,0);
for(const [lvl,want] of [[1,10],[8,17],[9,19],[16,33],[17,36],[22,51],[23,55],[28,75],[29,80]])assert.equal(c.scale(flat.min,lvl),want);
for(const [name,min,max] of [['Fire Bolt',3,6],['Teeth',3,5],['Poison Nova',50,90.625],['War Cry',3,5],['Tornado',32,35]]){const v=c.calc(c.catalog.find(s=>s.name===name).formula,{skillLevel:1});assert.equal(v.min,min,name);assert.equal(v.max,max,name);}
const poison={...flat,damageType:'poison',poisonDurationSec:2};
const p=c.calc(poison,{skillLevel:1,enemyResistanceReductionPct:40});
assert.equal(p.beforeDurationSec,2);assert.equal(p.durationSec,2.4);assert.equal(p.frameMin,.24);assert(Math.abs(p.min-p.frameMin*p.durationSec*25)<1e-9);
assert.equal(c.calc(poison,{skillLevel:1,enemyPlrPct:75}).durationSec,.5);
assert.equal(c.calc(poison,{skillLevel:1,enemyResistancePct:100,enemyResistanceReductionPct:40}).durationSec,2);
assert.equal(c.calc(null,{skillLevel:1}),null);
for(const s of c.catalog)if(s.formula)for(const skillLevel of [1,8,9,16,17,22,23,28,29,50,100]){const v=c.calc(s.formula,{skillLevel});assert(Number.isFinite(v.min)&&Number.isFinite(v.max),s.name);}
// Exercise UI event handling without a browser, including unsupported and editable formulas.
class Element{constructor(){this.value='';this.children=[];this.listeners={};this.firstChild={textContent:''};this.dataset={};this.textContent='';}replaceChildren(...xs){this.children=xs;if(xs[0]?.value!==undefined)this.value=xs[0].value;}append(x){this.children.push(x);}addEventListener(name,fn){this.listeners[name]=fn;}querySelectorAll(){return this.children.flatMap(x=>x.children);}get selectedOptions(){return [{text:this.value}];}}
const ids=['class','skill','levelLabel','damageType','formulaEditor','synergies','level','pct','pierce','enemyRes','enemyPlr','plrField','poisonResults','status','damageRows','comparison','apply','feedback','example','reset'];
const elements=Object.fromEntries(ids.map(id=>[id,new Element()]));elements.level.value='1';
c.document={getElementById:id=>elements[id],createElement:()=>new Element()};c.Option=function(text,value){return {text,value};};
vm.runInContext(fs.readFileSync(__dirname+'/main.js','utf8'),c);
for(const s of c.catalog){elements.skill.value=s.id;vm.runInContext('changeSkill()',c);assert(!elements.status.textContent.includes('Formula error'),s.name);assert.equal(elements.damageRows.children.length,s.formula?1:0,s.name);}
elements.formulaEditor.value=JSON.stringify(flat);elements.apply.listeners.click();assert.equal(elements.damageRows.children.length,1);
elements.formulaEditor.value='broken';elements.apply.listeners.click();assert(elements.feedback.textContent.length>0);
elements.reset.listeners.click();
console.log('Passed: 96 components across 11 levels; resistance, poison, scaling, and all 231 UI selections.');
