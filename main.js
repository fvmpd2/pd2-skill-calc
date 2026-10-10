const $=id=>document.getElementById(id);
const supportedSkills=skills.filter(s=>s.formula);
const classes=[...new Set(supportedSkills.map(s=>s.className))].sort((a,b)=>a.localeCompare(b));let active=null;const overrides={};const savedSynergies={};
const types={poison:/poison|plague|rabies|venom|desecrate/i,fire:/fire|flame|meteor|hydra|molten|fissure|volcano|armageddon|inferno|immolation|blaze|combustion|explod/i,cold:/cold|ice|frost|blizzard|frozen|glacial|hurricane|arctic/i,lightning:/lightning|charged|shock|thunder|nova|static/i,magic:/teeth|bone spear|bone spirit|blessed hammer|holy bolt|psychic hammer|mind blast/i};
const editorKey=()=>active?.charges?`${active.id}:${$('chargeEditor').value}`:active?.id;
const selectedComponent=()=>{if(!active?.charges)return null;const [stage,index]=$('chargeEditor').value.split(':').map(Number);return active.charges[stage]?.components[index];};
const skillFormula=()=>active&&(overrides[editorKey()]||selectedComponent()?.formula||active.formula);
const guessedType=s=>Object.entries(types).find(([_,re])=>re.test(s.name))?.[0]||'physical';
const n=id=>Number($(id).value)||0;const fmt=v=>Number(v.toFixed(3)).toLocaleString();const range=(a,b)=>`${fmt(a)} – ${fmt(b)}`;
$('class').replaceChildren(...classes.map(c=>new Option(c,c)));
function refreshSkillList(){const matching=supportedSkills.filter(s=>s.className===$('class').value);$('skill').replaceChildren(...matching.map(s=>new Option(s.name,s.id)));active=matching[0]||null;changeSkill();}
function changeSkill(){active=supportedSkills.find(s=>s.id===$('skill').value)||active;if(!active)return;$('feedback').textContent='';$('levelLabel').firstChild.textContent=`${active.name} (slvl)`;setupCharges();$('damageType').value=skillFormula()?.damageType||guessedType(active);renderScaling();renderSynergies();compute();}
function renderSynergies(){const f=skillFormula(),holder=$('synergies');holder.replaceChildren();for(const sy of synergyList()){const label=document.createElement('label');label.textContent=`${sy.name} (hlvl)`;const input=document.createElement('input');input.type='number';input.min=0;input.max=20;input.value=savedSynergies[active.id]?.[sy.name]??20;input.addEventListener('input',()=>{(savedSynergies[active.id]??={})[sy.name]=Number(input.value)||0;compute();});input.dataset.synergy=sy.name;label.append(input);holder.append(label);}}
function compute(){if(active?.charges){computeCharges();return;}const poison=$('damageType').value==='poison';$('plrField').hidden=!poison;$('poisonResults').hidden=!poison;const f=skillFormula();$('status').textContent=f?'':'No damage formula available.';if(!f){$('damageRows').replaceChildren();$('poisonResults').textContent='';$('comparison').textContent='';return;}
 const sy={};for(const e of $('synergies').querySelectorAll('input'))sy[e.dataset.synergy]=Math.max(0,Math.min(20,Number(e.value)||0));const opts={skillLevel:Math.max(1,Math.min(100,Math.floor(n('level')))),skillDamagePct:n('pct'),enemyResistanceReductionPct:n('pierce'),enemyResistancePct:n('enemyRes'),enemyPlrPct:n('enemyPlr'),damageType:$('damageType').value,synergyPoints:sy};
 try{const base=calculate(f,opts),higher=calculate(f,{...opts,skillLevel:opts.skillLevel+1}),boost=calculate(f,{...opts,skillDamagePct:opts.skillDamagePct+5});const baseFactor=1+base.synergyPct/100,bonusFactor=1+n('pct')/100;const rawMin=base.baseMin*baseFactor,rawMax=base.baseMax*baseFactor;const netMin=rawMin*bonusFactor,netMax=rawMax*bonusFactor;
 const row=document.createElement('tr');for(const t of [$('damageType').selectedOptions[0].text,range(rawMin,rawMax),range(netMin,netMax),`${base.effectiveResistancePct.toFixed(1)}%`,range(base.min,base.max)]){let cell=document.createElement('td');cell.textContent=t;row.append(cell);}$('damageRows').replaceChildren(row);
 if(poison){$('poisonResults').hidden=false;const holder=$('poisonResults');holder.replaceChildren();
 const cards=[['Duration before pierce',`${base.beforeDurationSec.toFixed(2)} s`],['Duration after pierce',`${base.durationSec.toFixed(2)} s`],['Damage / frame (25 fps)',range(base.frameMin,base.frameMax)],['Damage / second',range(base.dpsMin,base.dpsMax)]];
 for(const [title,value,hint] of cards){const card=document.createElement('div');card.className='poison-card';const label=document.createElement('span');label.textContent=title;const strong=document.createElement('strong');strong.textContent=value;card.append(label);card.append(strong);holder.append(card);}
}if(base.immune)$('status').textContent+=' Immune: item pierce cannot break immunity; damage is zero.';const inc=x=>base.avg?`${((x.avg/base.avg-1)*100).toFixed(2)}%`:'n/a';$('comparison').textContent=`+1 skill level: ${inc(higher)} · +5% skill damage: ${inc(boost)}`;
 }catch(e){$('status').textContent=`Formula error: ${e.message}`;$('damageRows').replaceChildren();$('poisonResults').textContent='';$('comparison').textContent='';}}
$('class').addEventListener('change',refreshSkillList);$('skill').addEventListener('change',changeSkill);for(const id of ['level','pct','pierce','enemyRes','enemyPlr','damageType'])$(id).addEventListener('input',compute);
function renderScaling(){
 const f=skillFormula(),holder=$('scalingGrid');holder.replaceChildren();$('apply').disabled=f?.kind==='weapon';if(!f)return;if(f.kind==='weapon'){$('scalingNote').textContent='This charge scales weapon damage. Use the weapon damage and enhanced damage boxes above; its charge bonus comes from the supplied game formula.';return;}
 const tiers=['Level 1','Levels 2–8','Levels 9–16','Levels 17–22','Levels 23–28','Levels 29+'];
 tiers.forEach((title,i)=>{const box=document.createElement('div');box.className='scaling-tier';const heading=document.createElement('h3');heading.textContent=title;box.append(heading);const note=document.createElement('p');note.textContent=i===0?'Starting damage':'+ Damage per level';box.append(note);
  for(const key of ['min','max']){const label=document.createElement('label');label.textContent=key==='min'?'Min':'Max';const input=document.createElement('input');input.type='number';input.step='any';input.min='0';input.value=String(f[key][i]);input.dataset.bound=key;input.dataset.tier=String(i);label.append(input);box.append(label);}holder.append(box);
 });
 $('scalingNote').textContent=f.damageType==='poison'?`Poison values are total damage over the skill’s base ${f.poisonDurationSec} seconds. Duration and synergies are retained when you apply changes.`:'These values set the imported damage component. Synergies are retained when you apply changes.';
}
$('apply').addEventListener('click',()=>{try{const f=JSON.parse(JSON.stringify(skillFormula()));for(const input of $('scalingGrid').querySelectorAll('input')){const value=Number(input.value);if(input.value.trim()===''||!Number.isFinite(value)||value<0)throw Error('Enter a valid, non-negative number in every box.');f[input.dataset.bound][Number(input.dataset.tier)]=value;}for(let i=0;i<6;i++)if(f.min[i]>f.max[i])throw Error('Min must not exceed Max in any tier.');overrides[editorKey()]=f;compute();$('feedback').textContent='Scaling applied for this session.';}catch(e){$('feedback').textContent=e.message;}});
$('reset').addEventListener('click',()=>{delete overrides[editorKey()];renderScaling();compute();$('feedback').textContent='Original skill scaling restored.';});

function synergyList(){const list=active?.charges?active.charges.flatMap(stage=>stage.components.flatMap(c=>c.formula.synergy||[])):skillFormula()?.synergy||[];return [...new Map(list.map(s=>[s.name,s])).values()];}
function setupCharges(){
 const charge=!!active.charges;$('chargeModifiers').hidden=!charge;$('normalModifiers').hidden=charge;$('chargeResults').hidden=!charge;$('normalResults').hidden=charge;$('chargeEditorField').hidden=!charge;
 $('weaponFields').hidden=!charge||!active.charges.some(s=>s.components.some(c=>c.formula.kind==='weapon'));
 if(!charge)return;
 $('chargeEditor').replaceChildren(...active.charges.flatMap((stage,si)=>stage.components.map((c,ci)=>new Option(`${stage.label} · ${c.label}`,`${si}:${ci}`))));
 const holder=$('chargeModifiers');holder.replaceChildren();
 for(const type of new Set(active.charges.flatMap(stage=>stage.components.map(c=>c.formula.damageType)))){
  const box=document.createElement('div');box.className='charge-modifier';const h=document.createElement('h3');h.textContent=type[0].toUpperCase()+type.slice(1);box.append(h);const fields=document.createElement('div');fields.className='fields';
  const specs=[['res','Enemy res (%)',0],['pierce','− Enemy res / pierce (%)',0]];
  if(type!=='physical')specs.unshift(['bonus','+ Skill damage (%)',0]);if(type==='poison')specs.push(['plr','Poison length reduction (%)',0]);
  for(const [key,title,initial] of specs){const label=document.createElement('label');label.textContent=title;label.dataset.modifier=key;const input=document.createElement('input');input.type='number';input.value=String(initial);input.dataset.type=type;input.dataset.modifier=key;input.addEventListener('input',compute);label.append(input);fields.append(label);}box.append(fields);holder.append(box);
 }
}
function computeCharges(){
 const level=Math.max(1,Math.min(100,Math.floor(n('level')))),sy={};for(const input of $('synergies').querySelectorAll('input'))sy[input.dataset.synergy]=Math.max(0,Math.min(20,Number(input.value)||0));
 const modifiers={};for(const input of $('chargeModifiers').querySelectorAll('input'))(modifiers[input.dataset.type]??={})[input.dataset.modifier]=Number(input.value)||0;
 const holder=$('chargeResults');holder.replaceChildren();$('status').textContent='';
 try{active.charges.forEach((stage,si)=>{
  const section=document.createElement('div');section.className='charge-stage';const heading=document.createElement('h3');heading.textContent=stage.label;section.append(heading);
  const scroll=document.createElement('div');scroll.className='table-scroll';const table=document.createElement('table');const header=document.createElement('tr');for(const text of ['Component','With synergies','+ Damage bonus','Effective resistance','Effective damage']){const th=document.createElement('th');th.textContent=text;header.append(th);}table.append(header);
  let sumMin=0,sumMax=0,hitCount=0;
  stage.components.forEach((original,ci)=>{const c={...original,formula:overrides[`${active.id}:${si}:${ci}`]||original.formula},m=modifiers[c.formula.damageType]||{};
   const result=calculateChargeComponent(c,{skillLevel:level,synergyPoints:sy,skillDamagePct:m.bonus||0,enemyResistancePct:m.res||0,enemyResistanceReductionPct:m.pierce||0,enemyPlrPct:m.plr||0,weaponMin:n('weaponMin'),weaponMax:n('weaponMax'),otherEnhancedDamagePct:n('otherEd')});
   const rawFactor=1+result.synergyPct/100;const rawMin=result.baseMin*rawFactor,rawMax=result.baseMax*rawFactor;const bonus=c.formula.damageType==='physical'?1:1+(m.bonus||0)/100;
   const unit=c.formula.damageType==='poison'?'total poison':c.unit;const tr=document.createElement('tr');for(const text of [`${c.label} (${unit})`,range(rawMin,rawMax),range(rawMin*bonus,rawMax*bonus),`${result.effectiveResistancePct}%${result.immune?' · immune':''}`,range(result.min,result.max)]){const td=document.createElement('td');td.textContent=text;tr.append(td);}table.append(tr);
   if(c.unit==='per hit'&&c.formula.damageType!=='poison'){sumMin+=result.min;sumMax+=result.max;hitCount++;}
   if(c.formula.damageType==='poison'){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=5;td.textContent=`Duration: ${result.beforeDurationSec.toFixed(2)} s → ${result.durationSec.toFixed(2)} s with pierce · Damage/frame (25 fps): ${range(result.frameMin,result.frameMax)} · DPS: ${range(result.dpsMin,result.dpsMax)}`;tr.append(td);table.append(tr);}
   if(c.formula.kind==='weapon'){const note=document.createElement('p');note.className='muted';note.textContent=`Charge enhanced damage: +${result.enhancedPct.toFixed(0)}%.${n('weaponMax')===0?' Enter your weapon Min/Max above to see physical damage.':''}`;section.append(note);}
  });scroll.append(table);section.append(scroll);
  if(hitCount>1){const total=document.createElement('p');total.className='charge-total';total.textContent=`Combined impact damage: ${range(sumMin,sumMax)} (one hit from each listed impact component)`;section.append(total);}
  if(stage.note){const note=document.createElement('p');note.className='muted';note.textContent=stage.note;section.append(note);}holder.append(section);
 });$('comparison').textContent='';}catch(e){holder.replaceChildren();$('status').textContent=`Charge calculation error: ${e.message}`;}
}
$('chargeEditor').addEventListener('change',()=>{renderScaling();$('feedback').textContent='';});
for(const id of ['weaponMin','weaponMax','otherEd'])$(id).addEventListener('input',compute);
refreshSkillList();
