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
const ids=['class','skill','levelLabel','damageType','scalingGrid','scalingNote','synergies','level','pct','pierce','enemyRes','enemyPlr','plrField','poisonResults','status','damageRows','comparison','apply','feedback','reset','chargeModifiers','normalModifiers','chargeResults','normalResults','chargeEditorField','chargeEditor','weaponFields','weaponMin','weaponMax','otherEd','copyBuild','linkFeedback','linkFallback','normalBreaking','teleportField','teleportLevel','teleportPenalty','teleportResults','extraFields','skillInfo','difficulty','difficultyField'];
const elements=Object.fromEntries(ids.map(id=>[id,new Element()]));elements.level.value='1';
c.document={getElementById:id=>elements[id],createElement:()=>new Element()};c.Option=function(text,value){return {text,value};};
vm.runInContext(fs.readFileSync(__dirname+'/main.js','utf8'),c);
assert.equal(elements.skill.children.some(x=>x.text.includes('unsupported')),false);
for(const s of c.catalog.filter(s=>s.formula)){elements.skill.value=s.id;vm.runInContext('changeSkill()',c);assert(!/error/i.test(elements.status.textContent),s.name);if(s.charges){assert.equal(elements.chargeResults.children.length,s.charges.length,s.name);}else{assert.equal(elements.damageRows.children.length,1,s.name);}assert.equal(elements.scalingGrid.querySelectorAll('input').length,(s.charges?s.charges[0].components[0].formula:s.formula).kind!=='flat'?0:12,s.name);}
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

// Audit regressions: false damage stats, hidden helper, mixed damage and custom inputs.
const skill=name=>c.catalog.find(s=>s.name===name);
for(const name of ['Resist Fire','Resist Cold','Resist Lightning','Salvation','Holy Sword','Energy Shield','Inner Sight','Shattering Arrow'])assert.equal(skill(name).formula,null,name);
const component=(name,group=0,index=0)=>skill(name).charges[group].components[index];
const evalComp=(name,group,index,opts={})=>c.charge(component(name,group,index),{skillLevel:1,...opts});
for(const name of ['Corpse Explosion','Death Sentry','Meteor','Molten Boulder','Volcano','Armageddon'])assert.deepEqual(Array.from(skill(name).charges[0].components.map(x=>x.formula.damageType)),['physical','fire'],name);
assert(skill('Corpse Explosion').info.includes('5–10%'));
assert.equal(evalComp('Fire Golem',0,0,{extraInputs:{summonMin:18,summonMax:47}}).min,18);
assert.equal(evalComp('Fire Golem',0,1).min,9);
assert.equal(evalComp('Fire Golem',1,0).min,7);
assert.equal(evalComp('Fire Golem',0,0).needsBaseInput,false);
assert.equal(evalComp('Fire Golem',0,0,{difficulty:'Hell'}).min,18);
assert.equal(evalComp('Dark Pact',0,0,{extraInputs:{curseCount:0}}).min,0);
assert.equal(evalComp('Dark Pact',0,0,{extraInputs:{curseCount:1}}).min,3);
assert(Math.abs(evalComp('Dark Pact',0,0,{extraInputs:{curseCount:3}}).min-3.6)<1e-10);
assert.equal(evalComp('Dark Pact',0,0,{extraInputs:{curseCount:3},skillDamagePct:50}).modifierMultiplier,1.2);
assert(Math.abs(evalComp('Raise Skeleton Warrior',0,0,{skillLevel:4,extraInputs:{masteryLevel:10},synergyPoints:{'Skeleton Mastery':5,'Raise Skeleton Archer':10}}).min-38.4)<1e-10); // (1+3+20) × (1+.1+.3+.2)
assert.equal(evalComp('Raise Skeleton Archer',0,0,{extraInputs:{masteryLevel:10},synergyPoints:{'Skeleton Mastery':5}}).min,45.5);
assert.equal(skill('Raise Skeleton Mage').charges.length,4);
assert.equal(evalComp('Raise Skeleton Mage',2,0,{skillLevel:4,extraInputs:{masteryLevel:1}}).min,8.8); // bolt level 2, 8 fire, +10% mastery
assert.equal(evalComp('Holy Fire',0,0).min,1.25);
assert.equal(evalComp('Holy Fire',1,0).min,5);
assert.equal(evalComp('Holy Light',1,0).min,3.5);
assert.equal(evalComp('Bone Wall',0,0).min,15);
assert.equal(evalComp('Bone Prison',0,0).min,30);
assert.equal(evalComp('Meteor',0,0,{skillDamagePct:100}).min,50); // physical inherits fire mastery
assert.equal(evalComp('Jab',0,0,{weaponMin:100,weaponMax:200,synergyPoints:{Fend:2},otherEnhancedDamagePct:40}).min,200);
assert(Math.abs(evalComp('Clay Golem',0,0,{skillLevel:2,difficulty:'Hell',synergyPoints:{'Golem Mastery':1}}).min-201.6)<1e-10);
assert(Math.abs(evalComp('Blood Golem',0,0,{skillLevel:2,difficulty:'Hell',synergyPoints:{'Golem Mastery':1}}).min-112.2)<1e-10);
assert.equal(skill('Revive').formula,null);assert.equal(skill('Iron Golem').formula,null);
assert.equal(c.calc(skill('Cold Arrow').formula,{skillLevel:1}).min,7);
assert.equal(c.calc(skill('Magic Arrow').formula,{skillLevel:1}).min,2.25);
assert.equal(evalComp('Fire Arrow',0,0).min,8.5);
assert.equal(component('Immolation Arrow',1,0).formula.source,'missile:immolationarrow fire');
assert.equal(component('Fists of Fire',2,2).formula.source,'missile:fofmeteorfire');
for(const s of c.catalog.filter(s=>s.formula)){
 assert(s.auditStatus&&s.auditDetail,s.name+' audit classification');
 for(const comp of s.charges?.flatMap(g=>g.components)||[{formula:s.formula}])for(const skillLevel of [1,8,9,16,17,22,23,28,29,50,100]){
  const result=c.charge(comp,{skillLevel,weaponMin:100,weaponMax:200,extraInputs:{summonMin:10,summonMax:20,masteryLevel:20,grizzlyLevel:20,curseCount:3}});
  assert(Number.isFinite(result.min)&&Number.isFinite(result.max)&&result.min>=0&&result.max>=result.min,s.name+': '+comp.label+' level '+skillLevel);
 }
}
assert.equal(c.catalog.length,231);
console.log('Passed: all 231 audited entries, every available component at 11 level boundaries, mixed damage, curse counts, aura/attack separation, summon/mastery inputs and weapon synergy ED.');
assert(!page.includes('difficultyField'));assert(!page.includes('>Normal<'));assert(!page.includes('>Nightmare<'));
assert.equal(evalComp('Power Strike',2,0).max,3);
assert.equal(evalComp('Thunder Storm',1,0).max,100);
assert.equal(evalComp('Inferno',0,0).min,6.25);
assert.equal(evalComp('Arctic Blast',0,0).min,12.5);
assert.equal(evalComp('Arctic Blast',1,0).min,3);
assert.equal(evalComp('Fire Wall',0,0).min,14.0625);
assert.equal(evalComp('Wake of Inferno',0,0).min,31.250000000000004);
assert.equal(skill('Tornado').charges.length,2);
assert.equal(evalComp('Raise Skeleton Mage',0,0,{extraInputs:{masteryLevel:1}}).durationSec,.48);
elements.skill.value=skill('Dark Pact').id;elements.skill.listeners.change();const curses=elements.extraFields.querySelectorAll('input').find(x=>x.dataset.extra==='curseCount');curses.value='3';curses.listeners.input();assert.equal(elements.status.textContent,'');
assert.equal(vm.runInContext('readExtras().curseCount',c),3);
elements.skill.value=skill('Fire Golem').id;elements.skill.listeners.change();assert(elements.extraFields.querySelectorAll('input').every(x=>!['summonMin','summonMax'].includes(x.dataset.extra)));assert.equal(elements.chargeResults.children.length,2);
console.log('Passed: Hell-only fixed summon bases, secondary novas, continuous rates, shatter nova, mage poison duration and dynamic input updates.');
assert.equal(evalComp('Raise Skeleton Mage',2,0,{extraInputs:{masteryLevel:20},skillDamagePct:50}).appliedBonusPct,250);
elements.skill.value=skill('Raise Skeleton Mage').id;elements.skill.listeners.change();
// At zero resistance, the bonus and effective columns agree, including automated mastery.
for(const section of elements.chargeResults.children){const scroll=section.children.find(x=>x.className==='table-scroll');const table=scroll.children[0];for(const row of table.children.filter(x=>x.children.length===5&&x.children[0].textContent.includes('bolt'))){assert.equal(row.children[2].textContent,row.children[4].textContent);}}
console.log('Passed: summon mastery is included consistently in both bonus and effective damage columns.');

// Immunity breaking, per-source rounding, full item pierce after breaking,
// and combined negative portion (no repeated halving between reductions).
for(const [res,breaking,pierce,want,immune] of [
 [110,[21],500,100,true],[110,[21,31],12,73,false],
 [120,[40],500,100,true],[120,[42],20,79,false],
 [25,[30,30],12,-23,false],[0,[40],40,-40,false],
 [140,[100],100,-5,false],[100,[1,1],500,100,true],
 [100,[2],0,99,false],[0,[500],500,-100,false]
]){const v=c.calc(flat,{skillLevel:1,enemyResistancePct:res,breakingPiercePct:breaking,enemyResistanceReductionPct:pierce});assert.equal(v.effectiveResistancePct,want);assert.equal(v.immune,immune);}
const brokenPoison=c.calc(poison,{skillLevel:1,enemyResistancePct:120,breakingPiercePct:50,enemyResistanceReductionPct:40});assert.equal(brokenPoison.durationSec,2.4);
elements.skill.value=skill('Poison Nova').id;elements.skill.listeners.change();const b=elements.normalBreaking.querySelectorAll('input')[0];b.value='50';b.listeners.input();assert(!/error/i.test(elements.status.textContent));
assert.equal(elements.normalBreaking.querySelectorAll('input').length,1);
const poisonHelp=elements.normalBreaking.children[0].children[0].children[0];assert(poisonHelp.title.includes('Lower Resist'));assert(poisonHelp.title.includes('Poison Creeper'));assert(!poisonHelp.title.includes('Conviction'));
for(const [type,want,exclude] of [['magic','Sanctuary','Lower Resist'],['fire','Inferno','Arctic Blast'],['cold','Arctic Blast','Inferno'],['lightning','Static Field','Sanctuary'],['physical','Amplify Damage','Conviction']]){const box=vm.runInContext(`breakingLabel('${type}')`,c);assert.equal(box.querySelectorAll('input').length,1);const hint=box.children[0].children[0].title;assert(hint.includes(want));assert(!hint.includes(exclude));}
elements.skill.value=skill('Fire Golem').id;elements.skill.listeners.change();assert(elements.chargeModifiers.querySelectorAll('input').some(x=>x.dataset.modifier==='breaking'));
assert(page.indexOf('Found an issue?')<page.indexOf('</header>'));assert(!page.includes('class="site-notice"'));
console.log('Passed: Breaking pierce, immunity thresholds, separate source rounding, combined negative resistance, normal/multi-component controls and inline AI notice.');

for(const [penalty,want] of [[0,100],[25,75],[50,50],[100,0],[150,0],[-10,100]]){const v=vm.runInContext(`teleportDamage(100,200,60,120,${penalty})`,c);assert.equal(v.beforeMin,want);assert.equal(v.afterMin,want*.6);}
elements.teleportLevel.value='26';
for(const s of c.catalog.filter(s=>s.formula&&s.className==='Sorceress')){elements.skill.value=s.id;elements.skill.listeners.change();assert(!elements.teleportField.hidden,s.name);assert(!elements.teleportResults.hidden,s.name);assert(elements.teleportResults.children.length===2,s.name);assert(!/error/i.test(elements.status.textContent),s.name);}
elements.skill.value=skill('Fire Bolt').id;elements.skill.listeners.change();const unchanged=elements.damageRows.children[0].children.map(x=>x.textContent);elements.teleportLevel.value='51';elements.teleportLevel.listeners.input();assert.deepEqual(elements.damageRows.children[0].children.map(x=>x.textContent),unchanged);assert.equal(elements.teleportResults.children[1].children[0].children[1].children[1].textContent,unchanged[2]);assert.equal(elements.teleportPenalty.textContent,'−0% damage');
for(const [level,want] of [[1,50],[20,31],[26,25],[50,1],[51,0],[100,0]])assert.equal(vm.runInContext(`teleportPenalty(${level})`,c),want);assert.equal(elements.teleportLevel.children.length,100);
elements.skill.value=skill('Teeth').id;elements.skill.listeners.change();assert(elements.teleportField.hidden);assert(elements.teleportResults.hidden);assert.equal(elements.teleportResults.children.length,0);
console.log('Passed: every Sorceress selection has Teleport controls and per-component pre/post-resistance output; penalty boundaries, main-output preservation and class visibility.');

// Save/restore full builds, including mixed-component resistance and scaling.
for(const name of ['Fire Bolt','Fists of Fire','Poison Nova','Fire Golem']){
 elements.skill.value=skill(name).id;elements.skill.listeners.change();elements.level.value='44';elements.teleportLevel.value='30';elements.pct.value='70';elements.enemyRes.value='120';
 for(const e of elements.synergies.querySelectorAll('input'))e.value='17';
 for(const e of elements.extraFields.querySelectorAll('input'))e.value='12';
 for(const e of elements.chargeModifiers.querySelectorAll('input'))e.value='33';
 for(const e of elements.normalBreaking.querySelectorAll('input'))e.value='45';
 vm.runInContext('compute()',c);
 if(elements.scalingGrid.querySelectorAll('input').length){elements.scalingGrid.querySelectorAll('input')[0].value='1';elements.apply.listeners.click();}
 const state=vm.runInContext('JSON.stringify(collectBuild())',c);const hash='#build='+encodeURIComponent(state);
 elements.level.value='2';elements.skill.value=skill('Teeth').id;elements.skill.listeners.change();
 c.restoreHash=hash;assert(vm.runInContext('restoreBuild(restoreHash)',c),name);assert.equal(vm.runInContext('JSON.stringify(collectBuild())',c),state,name);assert(!/error/i.test(elements.status.textContent),name);
}
assert.equal(vm.runInContext("restoreBuild('#build=bad')",c),false);
assert.equal(vm.runInContext("restoreBuild('#build='+encodeURIComponent(JSON.stringify({v:1,skill:'missing'})))",c),false);
c.URL=URL;let historyUrl='';c.window={location:{href:'https://example.com/calc/',hash:''},history:{replaceState:(a,b,url)=>historyUrl=url}};
vm.runInContext('linkReady=true;syncBuildLink()',c);assert(historyUrl.includes('#build='));assert.equal(JSON.parse(decodeURIComponent(historyUrl.split('#build=')[1])).skill,elements.skill.value);
console.log('Passed: build URL round trips for spells, martial arts, poison and summons, scaling edits, invalid links and automatic URL updates.');
