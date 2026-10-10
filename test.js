// Run with Node.js: node test.js
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c=vm.createContext({});
vm.runInContext(fs.readFileSync(__dirname+'/skills.js','utf8')+fs.readFileSync(__dirname+'/calc.js','utf8')+';globalThis.catalog=skills;globalThis.calc=calculate;globalThis.scale=scaledValue;globalThis.charge=calculateChargeComponent;',c);
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
for(const s of c.catalog)if(s.formula?.kind==='flat')for(const skillLevel of [1,8,9,16,17,22,23,28,29,50,100]){const v=c.calc(s.formula,{skillLevel});assert(Number.isFinite(v.min)&&Number.isFinite(v.max),s.name);}
// Exercise UI event handling without a browser, including unsupported and editable formulas.
class Element{constructor(){this.value='';this.children=[];this.listeners={};this.firstChild={textContent:''};this.dataset={};this.textContent='';}replaceChildren(...xs){this.children=xs;if(xs[0]?.value!==undefined)this.value=xs[0].value;}append(x){this.children.push(x);}addEventListener(name,fn){this.listeners[name]=fn;}querySelectorAll(selector){const all=this.children.flatMap(x=>[x,...x.querySelectorAll(selector)]);return all.filter(x=>selector==='input'&&x.type==='number');}get selectedOptions(){return [{text:this.value}];}}
const ids=['class','skill','levelLabel','damageType','scalingGrid','scalingNote','synergies','level','pct','pierce','enemyRes','enemyPlr','plrField','poisonResults','status','damageRows','comparison','apply','feedback','reset','chargeModifiers','normalModifiers','chargeResults','normalResults','chargeEditorField','chargeEditor','weaponFields','weaponMin','weaponMax','otherEd'];
const elements=Object.fromEntries(ids.map(id=>[id,new Element()]));elements.level.value='1';
c.document={getElementById:id=>elements[id],createElement:()=>new Element()};c.Option=function(text,value){return {text,value};};
vm.runInContext(fs.readFileSync(__dirname+'/main.js','utf8'),c);
assert.equal(elements.skill.children.some(x=>x.text.includes('unsupported')),false);
for(const s of c.catalog.filter(s=>s.formula)){elements.skill.value=s.id;vm.runInContext('changeSkill()',c);assert(!/error/i.test(elements.status.textContent),s.name);if(s.charges){assert.equal(elements.chargeResults.children.length,3,s.name);}else{assert.equal(elements.damageRows.children.length,1,s.name);}assert.equal(elements.scalingGrid.querySelectorAll('input').length,s.formula.kind==='weapon'?0:12,s.name);}
for(const className of new Set(c.catalog.map(s=>s.className))){elements.class.value=className;elements.class.listeners.change();assert(elements.skill.children.every(option=>c.catalog.find(s=>s.id===option.value).formula));}
elements.skill.value=c.catalog.find(s=>s.name==='Poison Nova').id;elements.skill.listeners.change();assert.equal(elements.poisonResults.children.length,4);
const original=vm.runInContext('skillFormula().min[0]',c);const synergy=vm.runInContext('JSON.stringify(skillFormula().synergy)',c);
elements.scalingGrid.querySelectorAll('input')[0].value='1';elements.apply.listeners.click();assert.equal(vm.runInContext('skillFormula().min[0]',c),1);assert.equal(vm.runInContext('JSON.stringify(skillFormula().synergy)',c),synergy);
elements.scalingGrid.querySelectorAll('input')[0].value='';elements.apply.listeners.click();assert(elements.feedback.textContent.includes('valid'));
elements.scalingGrid.querySelectorAll('input')[0].value='99999999';elements.apply.listeners.click();assert(elements.feedback.textContent.includes('Min must'));
elements.reset.listeners.click();assert.equal(vm.runInContext('skillFormula().min[0]',c),original);
console.log('Passed: damage engine, all supported selections, class filtering, 12 tier inputs, poison cards, Apply/Reset and validation.');

const fof=c.catalog.find(s=>s.name==='Fists of Fire');
assert.equal(fof.charges.length,3);assert.deepEqual(Array.from(fof.charges[2].components.map(x=>x.formula.damageType)),['fire','physical','fire']);
for(const s of c.catalog.filter(s=>s.charges))for(const stage of s.charges)for(const comp of stage.components)for(const skillLevel of [1,8,16,22,28,44,100]){const v=c.charge(comp,{skillLevel,weaponMin:100,weaponMax:200});assert(Number.isFinite(v.min)&&Number.isFinite(v.max),s.name+comp.label);}
assert.equal(c.charge(fof.charges[0].components[0],{skillLevel:1}).min,1);
assert.equal(c.charge(fof.charges[1].components[0],{skillLevel:17}).min,39);
const phys=fof.charges[2].components[1];assert.equal(c.charge(phys,{skillLevel:1,skillDamagePct:70}).min,1);
assert.equal(c.charge(fof.charges[2].components[0],{skillLevel:1,skillDamagePct:70}).min,1.7);
assert.equal(c.charge(phys,{skillLevel:1,enemyResistancePct:100}).min,0);
const tiger=c.catalog.find(s=>s.name==='Tiger Strike');for(let i=0;i<3;i++)assert.equal(c.charge(tiger.charges[i].components[0],{skillLevel:1,weaponMin:100,weaponMax:200}).min,150+i*50);
elements.skill.value=fof.id;elements.skill.listeners.change();elements.chargeEditor.value='2:1';elements.chargeEditor.listeners.change();const old=vm.runInContext('skillFormula().min[0]',c);elements.scalingGrid.querySelectorAll('input')[0].value='0.5';elements.apply.listeners.click();assert.equal(vm.runInContext('skillFormula().min[0]',c),.5);assert.equal(vm.runInContext('active.charges[0].components[0].formula.min[0]',c),1);elements.reset.listeners.click();assert.equal(vm.runInContext('skillFormula().min[0]',c),old);
console.log('Passed: all six martial arts skills, three stages, mixed fire/physical, weapon ED, per-component overrides, and charge UI.');

for(const [internal,name] of [['Royal Strike','Phoenix Strike'],['Poison Dagger','Poison Strike'],['Fire Trauma','Fire Blast'],['Shock Field','Shock Web'],['Eruption','Fissure'],['AmpDmg','Amplify Damage'],['Vines','Solar Creeper']])assert.equal(c.catalog.find(s=>s.internalName===internal).name,name);
const page=fs.readFileSync(__dirname+'/index.html','utf8');assert(page.includes('Built with AI'));assert(page.includes('fvm'));assert(page.includes('https://hiimpd2.com/planner'));assert(page.includes('https://hiimpd2.com/damage-calc'));
console.log('Passed: in-game name aliases and site notice/resource links.');

assert.equal(elements.status.textContent,'');assert(!page.includes('Supported component'));assert(!page.includes('class="footer"'));assert(page.includes('class="ai-credit"'));assert(!page.includes('build-label'));assert.deepEqual(Array.from(elements.class.children.map(c=>c.text)),Array.from(elements.class.children.map(c=>c.text)).sort((a,b)=>a.localeCompare(b)));
console.log('Passed: alphabetical classes, compact poison cards, clean header/footer and removed routine status.');
