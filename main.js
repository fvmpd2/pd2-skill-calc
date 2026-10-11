const $=id=>document.getElementById(id);
const supportedSkills=skills.filter(s=>s.formula&&!s.excluded);
const classes=[...new Set(supportedSkills.map(s=>s.className))].sort((a,b)=>a.localeCompare(b));let active=null;const overrides={};const savedSynergies={};
const types={poison:/poison|plague|rabies|venom|desecrate/i,fire:/fire|flame|meteor|hydra|molten|fissure|volcano|armageddon|inferno|immolation|blaze|combustion|explod/i,cold:/cold|ice|frost|blizzard|frozen|glacial|hurricane|arctic/i,lightning:/lightning|charged|shock|thunder|nova|static/i,magic:/teeth|bone spear|bone spirit|blessed hammer|holy bolt|psychic hammer|mind blast/i};
const editorKey=()=>active?.charges?`${active.id}:${$('chargeEditor').value}`:active?.id;
const selectedComponent=()=>{if(!active?.charges)return null;const [stage,index]=$('chargeEditor').value.split(':').map(Number);return active.charges[stage]?.components[index];};
const skillFormula=()=>active&&(overrides[editorKey()]||selectedComponent()?.formula||active.formula);
const guessedType=s=>Object.entries(types).find(([_,re])=>re.test(s.name))?.[0]||'physical';
const n=id=>Number($(id).value)||0;
$('teleportLevel').replaceChildren(...Array.from({length:100},(_,i)=>new Option(String(i+1),String(i+1))));const fmt=v=>$('truncateNumbers').checked?Math.trunc(v).toLocaleString():v.toLocaleString(undefined,{maximumFractionDigits:3});const range=(a,b)=>`${fmt(a)} – ${fmt(b)}`;
$('class').replaceChildren(...classes.map(c=>new Option(c,c)));
function refreshSkillList(){const matching=supportedSkills.filter(s=>s.className===$('class').value);$('skill').replaceChildren(...matching.map(s=>new Option(s.name,s.id)));active=matching[0]||null;changeSkill();}
function changeSkill(){active=supportedSkills.find(s=>s.id===$('skill').value)||active;if(!active)return;for(const id of ['pct','pierce','enemyRes','enemyPlr','criticalChance','deadlyChance','criticalBonus','deadlyBonus'])$(id).value='0';$('feedback').textContent='';$('levelLabel').firstChild.textContent=`${active.name} (slvl)`;setupExtras();setupCharges();$('skillInfo').textContent=active.info||'';$('skillInfo').hidden=!active.info;$('damageType').value=skillFormula()?.damageType||guessedType(active);$('damageType').disabled=true;$('normalModifierType').textContent=$('damageType').value[0].toUpperCase()+$('damageType').value.slice(1);$('pct').disabled=$('damageType').value==='physical';renderScaling();renderSynergies();compute();}
function renderSynergies(){const f=skillFormula(),holder=$('synergies'),defaults=defaultSynergies();$('synergyDetails').open=synergyList().length>3;$('synergyDetails').hidden=!synergyList().length;holder.replaceChildren();for(const sy of synergyList()){const label=document.createElement('label');label.textContent=`${sy.name} (hlvl)`;const input=document.createElement('input');input.type='number';input.min=0;input.max=20;input.value=savedSynergies[active.id]?.[sy.name]??defaults[sy.name];input.addEventListener('input',()=>{(savedSynergies[active.id]??={})[sy.name]=Number(input.value)||0;compute();});input.dataset.synergy=sy.name;label.append(input);holder.append(label);}}
function compute(){syncBuildLink();$('criticalPanel').hidden=!hasCriticalDamage();$('criticalTitle').textContent='Strike comparison · hypothetical';$('criticalResults').hidden=!hasCriticalDamage();$('criticalResults').replaceChildren();$('teleportPenalty').textContent=`−${teleportPenalty(n('teleportLevel'))}% damage`;$('teleportField').hidden=active?.className!=='Sorceress';$('teleportResults').hidden=active?.className!=='Sorceress';$('teleportResults').replaceChildren();if(active?.charges){computeCharges();return;}const poison=$('damageType').value==='poison';$('plrField').hidden=!poison;$('poisonResults').hidden=!poison;const f=skillFormula();$('status').textContent=f?'':'No damage formula available.';if(!f){$('damageRows').replaceChildren();$('poisonResults').textContent='';$('comparison').textContent='';return;}
 const sy={};for(const e of $('synergies').querySelectorAll('input'))sy[e.dataset.synergy]=Math.max(0,Math.min(20,Number(e.value)||0));const opts={breakingPiercePct:Array.from($('normalBreaking').querySelectorAll('input')).map(e=>Number(e.value)||0),extraInputs:readExtras(),skillLevel:Math.max(1,Math.min(100,Math.floor(n('level')))),skillDamagePct:$('damageType').value==='physical'?0:n('pct'),enemyResistanceReductionPct:n('pierce'),enemyResistancePct:n('enemyRes'),enemyPlrPct:n('enemyPlr'),damageType:$('damageType').value,synergyPoints:sy};
 try{const base=calculate(f,opts),higher=calculate(f,{...opts,skillLevel:opts.skillLevel+1}),boost=calculate(f,{...opts,skillDamagePct:opts.skillDamagePct+5});const baseFactor=1+base.synergyPct/100,bonusFactor=(1+opts.skillDamagePct/100)*(base.modifierMultiplier??1);const rawMin=base.baseMin*baseFactor,rawMax=base.baseMax*baseFactor;const netMin=rawMin*bonusFactor,netMax=rawMax*bonusFactor;
 const component={label:$('damageType').value,beforeMin:netMin,beforeMax:netMax,afterMin:base.min,afterMax:base.max};
 $('damageRows').replaceChildren(...comparisonRows(component));
 renderCriticalDamage(component);
 $('normalResistance').textContent=`Enemy resistance after pierce: ${base.effectiveResistancePct}%`;
 $('normalBreakdown').replaceChildren(damageBreakdown([{label:component.label,rawMin,rawMax,netMin,netMax,res:base.effectiveResistancePct,min:base.min,max:base.max}]));
 if(poison){$('poisonResults').hidden=false;const holder=$('poisonResults');holder.replaceChildren();
 const cards=[['Duration before pierce',`${base.beforeDurationSec.toFixed(2)} s`],['Duration after pierce',`${base.durationSec.toFixed(2)} s`],['Damage / frame (25 fps)',range(base.frameMin,base.frameMax)],['Damage / second',range(base.dpsMin,base.dpsMax)]];
 for(const [title,value,hint] of cards){const card=document.createElement('div');card.className='poison-card';const label=document.createElement('span');label.textContent=title;const strong=document.createElement('strong');strong.textContent=value;card.append(label);card.append(strong);holder.append(card);}
}if(base.immune)$('status').textContent+=' Immune after Breaking pierce; damage is zero.';const inc=x=>base.avg?`${((x.avg/base.avg-1)*100).toFixed(2)}%`:'n/a';$('comparison').textContent=`+1 skill level: ${inc(higher)} · +5% skill damage: ${inc(boost)}`;
 }catch(e){$('status').textContent=`Formula error: ${e.message}`;$('damageRows').replaceChildren();$('poisonResults').textContent='';$('comparison').textContent='';}}
$('class').addEventListener('change',refreshSkillList);$('skill').addEventListener('change',changeSkill);for(const id of ['level','pct','pierce','enemyRes','enemyPlr','damageType','teleportLevel','truncateNumbers','criticalChance','deadlyChance','criticalBonus','deadlyBonus'])$(id).addEventListener('input',compute);
function renderScaling(){
 const f=skillFormula(),holder=$('scalingGrid');holder.replaceChildren();$('apply').disabled=f?.kind!=='flat';if(!f)return;if(f.kind!=='flat'){$('scalingNote').textContent=f.kind==='summon-base'?'This attack uses the summon base-damage inputs above; skill and synergy bonuses come from its passive stats.':'This attack scales your weapon range and enhanced damage inputs above.';return;}
 const tiers=['Level 1','Levels 2–8','Levels 9–16','Levels 17–22','Levels 23–28','Levels 29+'];
 tiers.forEach((title,i)=>{const box=document.createElement('div');box.className='scaling-tier';const heading=document.createElement('h3');heading.textContent=title;box.append(heading);const note=document.createElement('p');note.textContent=i===0?'Starting damage':'+ Damage per level';box.append(note);
  for(const key of ['min','max']){const label=document.createElement('label');label.textContent=key==='min'?'Min':'Max';const input=document.createElement('input');input.type='number';input.step='any';input.min='0';input.value=String(f[key][i]);input.dataset.bound=key;input.dataset.tier=String(i);label.append(input);box.append(label);}holder.append(box);
 });
 $('scalingNote').textContent=f.damageType==='poison'?`Poison values are total damage over the skill’s base ${f.poisonDurationSec} seconds. Duration and synergies are retained when you apply changes.`:'These values set the imported damage component. Synergies are retained when you apply changes.';
}
$('apply').addEventListener('click',()=>{try{const f=JSON.parse(JSON.stringify(skillFormula()));for(const input of $('scalingGrid').querySelectorAll('input')){const value=Number(input.value);if(input.value.trim()===''||!Number.isFinite(value)||value<0)throw Error('Enter a valid, non-negative number in every box.');f[input.dataset.bound][Number(input.dataset.tier)]=value;}for(let i=0;i<6;i++)if(f.min[i]>f.max[i])throw Error('Min must not exceed Max in any tier.');overrides[editorKey()]=f;compute();$('feedback').textContent='Scaling applied for this session.';}catch(e){$('feedback').textContent=e.message;}});
$('reset').addEventListener('click',()=>{delete overrides[editorKey()];renderScaling();compute();$('feedback').textContent='Original skill scaling restored.';});

function setupExtras(){const holder=$('extraFields');holder.replaceChildren();holder.hidden=!active.extraInputs?.length;for(const spec of active.extraInputs||[]){const label=document.createElement('label');label.textContent=spec.label;const input=document.createElement('input');input.type='number';input.min=0;input.max=spec.max;input.value=String(spec.default);input.dataset.extra=spec.key;input.addEventListener('input',compute);label.append(input);holder.append(label);}}
function readExtras(){return Object.fromEntries(Array.from($('extraFields').querySelectorAll('input')).map(input=>[input.dataset.extra,Math.max(0,Number(input.value)||0)]));}
function synergyList(){const list=active?.charges?active.charges.flatMap(stage=>stage.components.flatMap(c=>c.formula.synergy||[])):skillFormula()?.synergy||[];return [...new Map(list.map(s=>[s.name,s])).values()];}
const breakingSources={
 physical:['Amplify Damage','Decrepify','Battle Cry'],
 magic:['Sanctuary'],
 fire:['Conviction','Lower Resist','Inferno'],
 cold:['Conviction','Lower Resist','Arctic Blast'],
 lightning:['Conviction','Lower Resist','Static Field'],
 poison:['Lower Resist','Poison Creeper']
};
function defaultSynergies(){
 const list=synergyList();const ranked=[...list].sort((a,b)=>b.pctPerHardPoint-a.pctPerHardPoint);const maxed=new Set(ranked.slice(0,3).map(s=>s.name));return Object.fromEntries(list.map(s=>[s.name,maxed.has(s.name)?20:0]));
}
function breakingLabel(type){
 type=type||active.formula.damageType||guessedType(active);
 const box=document.createElement('label');box.className='breaking-box';box.dataset.modifier='breaking';
 const title=document.createElement('span');title.textContent='Breaking pierce (%) ';
 const help=document.createElement('span');help.className='breaking-help';help.textContent='?';help.tabIndex=0;
 help.title=`${type[0].toUpperCase()+type.slice(1)} immunity-breaking skills: ${(breakingSources[type]||[]).join(', ')}. Enter their combined reduction as a positive percentage. Against immunity, the total is halved; combining odd-valued sources can differ slightly from individual in-game rounding.`;
 help.ariaLabel=help.title;title.append(help);box.append(title);
 const input=document.createElement('input');input.type='number';input.min=0;input.step=1;input.value='0';input.ariaLabel=`${type} Breaking pierce (%)`;input.dataset.type=type;input.dataset.modifier='breaking';input.addEventListener('input',compute);box.append(input);return box;
}
function setupCharges(){
 const charge=!!active.charges;$('chargeModifiers').hidden=!charge;$('normalModifiers').hidden=charge;$('chargeResults').hidden=!charge;$('normalResults').hidden=charge;$('chargeEditorField').hidden=!charge;
 $('weaponFields').hidden=!charge||!active.charges.some(s=>s.components.some(c=>c.formula.kind==='weapon'));
 if(!charge){$('normalBreaking').replaceChildren(breakingLabel());return;}
 $('chargeEditor').replaceChildren(...active.charges.flatMap((stage,si)=>stage.components.map((c,ci)=>new Option(`${stage.label} · ${c.label}`,`${si}:${ci}`))));
 const holder=$('chargeModifiers');holder.replaceChildren();
 for(const type of new Set(active.charges.flatMap(stage=>stage.components.flatMap(c=>[c.formula.damageType,...(c.formula.bonusType?[c.formula.bonusType]:[])])))){
  const box=document.createElement('div');box.className='charge-modifier';const h=document.createElement('h3');h.textContent=type[0].toUpperCase()+type.slice(1);box.append(h);const fields=document.createElement('div');fields.className='fields';
  const specs=[['bonus','+ Skill damage',0],['res','Enemy res',0],['pierce','−Enemy res %',0]];if(type==='poison')specs.push(['plr','Poison length reduction (%)',0]);
  for(const [key,title,initial] of specs){const label=document.createElement('label');label.textContent=title;label.dataset.modifier=key;const input=document.createElement('input');input.type='number';input.value=String(initial);input.dataset.type=type;input.dataset.modifier=key;if(key==='bonus'&&type==='physical'){input.disabled=true;input.title='Skill damage bonus does not apply to physical damage.';}input.addEventListener('input',compute);label.append(input);fields.append(label);}fields.append(breakingLabel(type));box.append(fields);holder.append(box);
 }
}
function computeCharges(){
 const level=Math.max(1,Math.min(100,Math.floor(n('level')))),sy={};for(const input of $('synergies').querySelectorAll('input'))sy[input.dataset.synergy]=Math.max(0,Math.min(20,Number(input.value)||0));
 const modifiers={};for(const input of $('chargeModifiers').querySelectorAll('input')){const m=(modifiers[input.dataset.type]??={});if(input.dataset.modifier==='breaking')(m.breaking??=[]).push(Number(input.value)||0);else m[input.dataset.modifier]=Number(input.value)||0;}
 const holder=$('chargeResults'),teleportRows=[];holder.replaceChildren();$('status').textContent='';
 try{active.charges.forEach((stage,si)=>{
  const section=document.createElement('div');section.className='charge-stage';const heading=document.createElement('h3');heading.textContent=stage.label;section.append(heading);
  const breakdown=[];const scroll=document.createElement('div');scroll.className='table-scroll';const table=document.createElement('table');const header=document.createElement('tr');for(const text of ['Component / condition','Before resistance','After resistance']){const th=document.createElement('th');th.textContent=text;header.append(th);}if(si===0)table.append(header);
  let sumMin=0,sumMax=0,hitCount=0,missingBase=false;
  stage.components.forEach((original,ci)=>{const c={...original,formula:overrides[`${active.id}:${si}:${ci}`]||original.formula},m=modifiers[c.formula.damageType]||{},bonusM=modifiers[c.formula.bonusType||c.formula.damageType]||{};
   const result=calculateChargeComponent(c,{skillLevel:level,difficulty:'Hell',synergyPoints:sy,skillDamagePct:bonusM.bonus||0,extraInputs:readExtras(),breakingPiercePct:m.breaking||[],enemyResistancePct:m.res||0,enemyResistanceReductionPct:m.pierce||0,enemyPlrPct:m.plr||0,weaponMin:n('weaponMin'),weaponMax:n('weaponMax'),otherEnhancedDamagePct:n('otherEd')});
   const rawFactor=1+result.synergyPct/100;const rawMin=result.baseMin*rawFactor,rawMax=result.baseMax*rawFactor;const bonus=(1+(result.appliedBonusPct||0)/100)*(result.modifierMultiplier??1);
   teleportRows.push({label:`${stage.label} · ${c.label} (${c.unit})`,beforeMin:rawMin*bonus,beforeMax:rawMax*bonus,afterMin:result.min,afterMax:result.max});
   const unit=c.formula.damageType==='poison'?'total poison':c.unit;
   const label=`${c.label} (${unit})`;
   breakdown.push({label,rawMin,rawMax,netMin:rawMin*bonus,netMax:rawMax*bonus,res:result.effectiveResistancePct,min:result.min,max:result.max});
   for(const row of comparisonRows({label,beforeMin:rawMin*bonus,beforeMax:rawMax*bonus,afterMin:result.min,afterMax:result.max},true,result.needsBaseInput))table.append(row);
   if(result.needsBaseInput)missingBase=true;
   if(c.unit==='per hit'&&c.formula.damageType!=='poison'){sumMin+=result.min;sumMax+=result.max;hitCount++;}
   if(c.formula.damageType==='poison'){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=3;td.textContent=`Duration: ${result.beforeDurationSec.toFixed(2)} s → ${result.durationSec.toFixed(2)} s with pierce · Damage/frame (25 fps): ${range(result.frameMin,result.frameMax)} · DPS: ${range(result.dpsMin,result.dpsMax)}`;tr.append(td);table.append(tr);}
   if(c.formula.kind==='weapon'){const note=document.createElement('p');note.className='muted';note.textContent=`Skill enhanced damage: +${result.enhancedPct.toFixed(0)}%.${n('weaponMax')===0?' Enter your weapon Min/Max above to see physical damage.':''}`;section.append(note);}
  });scroll.append(table);section.append(scroll);section.append(damageBreakdown(breakdown));
  if(hitCount>1&&stage.total!==false){const total=document.createElement('p');total.className='charge-total';total.textContent=missingBase?'Enter summon base physical damage to calculate the combined hit.':`Combined impact damage: ${range(sumMin,sumMax)} (one hit from each listed impact component)`;section.append(total);}
  if(stage.note){const note=document.createElement('p');note.className='muted';note.textContent=stage.note;section.append(note);}holder.append(section);
 });$('comparison').textContent='';}catch(e){holder.replaceChildren();$('status').textContent=`Charge calculation error: ${e.message}`;}
}
$('chargeEditor').addEventListener('change',()=>{renderScaling();$('feedback').textContent='';syncBuildLink();});
for(const id of ['weaponMin','weaponMax','otherEd'])$(id).addEventListener('input',compute);

function comparisonRows(component,multiple=false,missing=false){
 const rows=[];const conditions=[{label:multiple?component.label:'Normal',...component}];
 if(active.className==='Sorceress')conditions.push({label:`${multiple?component.label+' · ':''}After Teleport (−${teleportPenalty(n('teleportLevel'))}%)`,...teleportDamage(component.beforeMin,component.beforeMax,component.afterMin,component.afterMax,teleportPenalty(n('teleportLevel')))});
 conditions.forEach((v,i)=>{const tr=document.createElement('tr');tr.className=i?'teleport-row':'normal-row';for(const t of [i?v.label:(multiple?component.label:'Normal'),missing?'Enter base damage':range(v.beforeMin,v.beforeMax),missing?'—':range(v.afterMin,v.afterMax)]){const td=document.createElement('td');td.textContent=t;tr.append(td);}rows.push(tr);});return rows;
}
function damageBreakdown(rows){
 const details=document.createElement('details');details.className='damage-breakdown';const summary=document.createElement('summary');summary.textContent='Calculation breakdown';details.append(summary);
 const scroll=document.createElement('div');scroll.className='table-scroll';const table=document.createElement('table');const header=document.createElement('tr');for(const text of ['Component','With synergies','With skill damage','Effective res','After resistance']){const th=document.createElement('th');th.textContent=text;header.append(th);}table.append(header);
 for(const v of rows){const tr=document.createElement('tr');for(const text of [v.label,range(v.rawMin,v.rawMax),range(v.netMin,v.netMax),`${v.res}%`,range(v.min,v.max)]){const td=document.createElement('td');td.textContent=text;tr.append(td);}table.append(tr);}scroll.append(table);details.append(scroll);return details;
}

function hasCriticalDamage(){return active?.name==='Shock Wave'||active?.name==='War Cry';}
const pctText=value=>value.toLocaleString(undefined,{maximumFractionDigits:3});
function renderCriticalDamage(component){
 if(!hasCriticalDamage())return;
 const v=criticalDamage({criticalChancePct:n('criticalChance'),deadlyChancePct:n('deadlyChance'),criticalBonusPct:n('criticalBonus'),deadlyBonusPct:n('deadlyBonus')});
 $('criticalMultiplierHint').textContent=`Base 2× + ${pctText(Math.max(0,n('criticalBonus')))}% = ${pctText(v.criticalMultiplier)}× damage`;
 $('deadlyMultiplierHint').textContent=`Base 1.5× + ${pctText(Math.max(0,n('deadlyBonus')))}% = ${pctText(v.deadlyMultiplier)}× damage`;
 const holder=$('criticalResults');holder.hidden=false;
 const stats=document.createElement('div');stats.className='critical-stats';
 for(const [title,value] of [['Chance of either strike',`${pctText(v.eitherChance*100)}%`],['Effective Deadly Strike chance',`${pctText(v.deadlyChance*100)}%`],['Average damage multiplier',`${pctText(v.averageMultiplier*100)}% (+${pctText((v.averageMultiplier-1)*100)}%)`]]){
  const card=document.createElement('div');const label=document.createElement('span');label.textContent=title;const strong=document.createElement('strong');strong.textContent=value;card.append(label);card.append(strong);stats.append(card);
 }holder.append(stats);
 const scroll=document.createElement('div');scroll.className='table-scroll';const table=document.createElement('table');const header=document.createElement('tr');for(const text of ['Outcome','Actual chance','Before resistance','After resistance']){const th=document.createElement('th');th.textContent=text;header.append(th);}table.append(header);
 for(const [label,chance,multiplier] of [['Normal hit',v.normalChance,1],[`Critical Strike · ${pctText(v.criticalMultiplier)}×`,v.criticalChance,v.criticalMultiplier],[`Deadly Strike · ${pctText(v.deadlyMultiplier)}×`,v.deadlyChance,v.deadlyMultiplier],['Average multiplier damage',null,v.averageMultiplier]]){
  const tr=document.createElement('tr');if(chance===null)tr.className='critical-average';for(const text of [label,chance===null?'Weighted average':`${pctText(chance*100)}%`,range(component.beforeMin*multiplier,component.beforeMax*multiplier),range(component.afterMin*multiplier,component.afterMax*multiplier)]){const td=document.createElement('td');td.textContent=text;tr.append(td);}table.append(tr);
 }scroll.append(table);holder.append(scroll);
 const average=document.createElement('p');average.className='critical-expected';average.textContent=`Expected average per hit: ${fmt((component.beforeMin+component.beforeMax)/2*v.averageMultiplier)} before resistance → ${fmt((component.afterMin+component.afterMax)/2*v.averageMultiplier)} after resistance`;holder.append(average);
}

// Store a self-contained build in the URL fragment: GitHub Pages needs no backend.
var linkReady=false,restoringBuild=false;
const buildFields=['level','pct','pierce','enemyRes','enemyPlr','weaponMin','weaponMax','otherEd','teleportLevel','criticalChance','deadlyChance','criticalBonus','deadlyBonus'];
function collectBuild(){
 const values=Object.fromEntries(buildFields.map(id=>[id,String(n(id))]));
 const inputs=holder=>Array.from($(holder).querySelectorAll('input')).map(e=>({key:e.dataset.synergy||e.dataset.extra||e.dataset.modifier,type:e.dataset.type||'',value:e.value}));
 const scaling=Object.fromEntries(Object.entries(overrides).map(([key,f])=>[key,{min:f.min,max:f.max}]));
 return {v:1,skill:active.id,values,synergies:inputs('synergies'),extras:inputs('extraFields'),modifiers:inputs(active.charges?'chargeModifiers':'normalBreaking'),editor:$('chargeEditor').value,truncated:!!$('truncateNumbers').checked,scaling};
}
function buildUrl(){const url=new URL(window.location.href);url.hash='build='+encodeURIComponent(JSON.stringify(collectBuild()));return url.href;}
function syncBuildLink(){if(!linkReady||restoringBuild||typeof window==='undefined')return;try{window.history.replaceState(null,'',buildUrl());}catch(e){/* Local-file browsers can disallow history updates; copying still works. */}}
function restoreBuild(hash){
 if(!hash.startsWith('#build='))return false;
 try{
  if(hash.length>100000)throw Error('Build link too large');
  const data=JSON.parse(decodeURIComponent(hash.slice(7)));
  const skill=supportedSkills.find(s=>s.id===data.skill);if(data.v!==1||!skill)throw Error('Unknown build');
  restoringBuild=true;$('truncateNumbers').checked=data.truncated!==false;
  for(const key of Object.keys(overrides))delete overrides[key];
  for(const [key,steps] of Object.entries(data.scaling||{})){
   const [id,stage,index]=key.split(':');const item=supportedSkills.find(s=>s.id===id);const f=item?.charges?item.charges[Number(stage)]?.components[Number(index)]?.formula:item?.formula;
   if(f?.kind==='flat'&&['min','max'].every(k=>Array.isArray(steps[k])&&steps[k].length===6&&steps[k].every(x=>Number.isFinite(x)&&x>=0))&&steps.min.every((x,i)=>x<=steps.max[i]))overrides[key]={...f,min:steps.min,max:steps.max};
  }
  $('class').value=skill.className;refreshSkillList();$('skill').value=skill.id;changeSkill();
  for(const id of buildFields){const value=Number(data.values?.[id]??(['criticalChance','deadlyChance','criticalBonus','deadlyBonus'].includes(id)?0:NaN));if(Number.isFinite(value))$(id).value=String(value);}
  function restoreInputs(holder,entries){for(const e of $(holder).querySelectorAll('input')){const entry=Array.isArray(entries)&&entries.find(x=>x.key===(e.dataset.synergy||e.dataset.extra||e.dataset.modifier)&&(x.type||'')===(e.dataset.type||''));if(entry&&Number.isFinite(Number(entry.value))){e.value=String(Number(entry.value));if(e.dataset.synergy)(savedSynergies[active.id]??={})[e.dataset.synergy]=Number(e.value);}}}
  restoreInputs('synergies',data.synergies);restoreInputs('extraFields',data.extras);restoreInputs(active.charges?'chargeModifiers':'normalBreaking',data.modifiers);
  if(active.charges&&active.charges.some((s,si)=>s.components.some((_,ci)=>data.editor===`${si}:${ci}`)))$('chargeEditor').value=data.editor;
  renderScaling();compute();return true;
 }catch(e){$('linkFeedback').textContent='This build link could not be loaded. Choose a skill to start again.';return false;}finally{restoringBuild=false;}
}
$('resetBuild').addEventListener('click',()=>{
 const id=active.id;
 for(const key of Object.keys(overrides))if(key===id||key.startsWith(id+':'))delete overrides[key];
 savedSynergies[id]={};
 savedSynergies[id]=defaultSynergies();
 for(const field of buildFields)$(field).value=['level','teleportLevel'].includes(field)?'1':'0';
 changeSkill();
 for(const e of $('extraFields').querySelectorAll('input'))e.value=e.dataset.extra==='curseCount'||(e.dataset.extra==='masteryLevel'&&active.charges?.some(stage=>stage.components.some(c=>c.formula.model==='skeleton-mage')))?'1':'0';
 $('linkFallback').hidden=true;$('linkFeedback').textContent='Inputs reset. Class and skill kept.';
 renderScaling();compute();
});
$('copyBuild').addEventListener('click',async()=>{
 try{const url=buildUrl();await navigator.clipboard.writeText(url);$('linkFeedback').textContent='Build link copied. Save it as a bookmark or share it.';}
 catch(e){$('linkFallback').value=buildUrl();$('linkFallback').hidden=false;$('linkFallback').select();$('linkFeedback').textContent='Copy the link from the box below.';}
});
refreshSkillList();
if(typeof window!=='undefined'){restoreBuild(window.location.hash);linkReady=true;window.addEventListener('hashchange',()=>restoreBuild(window.location.hash));}
