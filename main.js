const $=id=>document.getElementById(id);
const classes=[...new Set(skills.map(s=>s.className))];
let active=skills[0];
const overrides={};
$('class').innerHTML=classes.map(c=>`<option>${c}</option>`).join('');
function refreshSkillList(){const matching=skills.filter(s=>s.className===$('class').value&&s.name.toLowerCase().includes($('filter').value.toLowerCase()));
  $('skill').replaceChildren(...matching.map(s=>{const o=document.createElement('option');o.value=s.id;o.textContent=s.name+' · '+s.tree;return o;}));
  active=matching.find(s=>s.id===active?.id)||matching[0]||null;
  if(active)$('skill').value=active.id;
  $('formulaEditor').value=skillFormula()?JSON.stringify(skillFormula(),null,2):'';render();}
function num(id){return Number($(id).value)}
function skillFormula(){return active&&(overrides[active.id]||active.formula)}
function render(){for(const [id,out] of [['hard','hardOut'],['plus','plusOut'],['pct','pctOut']])$(out).textContent=$(id).value;
  if(!active){$('skillInfo').textContent='No matching skill';$('result').textContent='—';$('comparison').textContent='—';return;}
  $('skillInfo').textContent=active.className+' / '+active.tree+' · '+(skillFormula()?'Formula loaded (verify patch)':'Formula needed');
  const f=skillFormula();$('synergies').replaceChildren();
  for(const sy of f?.synergy||[]){const label=document.createElement('label');label.textContent=sy.name+' (hard points)';const input=document.createElement('input');input.type='number';input.min=0;input.max=20;input.value=20;input.dataset.synergy=sy.name;input.addEventListener('input',compute);label.append(input);$('synergies').append(label);}
  compute();}
function compute(){for(const [id,out] of [['hard','hardOut'],['plus','plusOut'],['pct','pctOut']])$(out).textContent=$(id).value;const f=skillFormula();if(!f){$('result').textContent='No verified formula entered';$('comparison').textContent='Add a formula to enable comparison.';return;}
  const sy={};for(const input of $('synergies').querySelectorAll('input'))sy[input.dataset.synergy]=Math.min(20,Math.max(0,Number(input.value)||0));
  const opts={hardPoints:num('hard'),plusSkills:num('plus'),skillDamagePct:num('pct'),synergyPoints:sy};
  try{const base=calculate(f,opts),level=calculate(f,{...opts,plusSkills:opts.plusSkills+1}),pct=calculate(f,{...opts,skillDamagePct:opts.skillDamagePct+5});
  const fmt=n=>Math.round(n).toLocaleString();$('result').innerHTML=`<div class="metric">Level ${base.level} · ${f.damageType||'unspecified'} · per hit (model)</div>${fmt(base.min)}–${fmt(base.max)}<div class="metric">Average ${fmt(base.avg)} · Synergy +${base.synergyPct.toFixed(1)}%</div>`;
  const increase=x=>((x.avg/base.avg-1)*100).toFixed(2);$('comparison').innerHTML=`+1 skill: <strong>+${increase(level)}%</strong> (${fmt(level.avg)} avg)<br>+5% skill damage: <strong>+${increase(pct)}%</strong> (${fmt(pct.avg)} avg)`;
  }catch(e){$('result').textContent='Formula error: '+e.message;$('comparison').textContent='—';}}
$('class').addEventListener('change',refreshSkillList);$('filter').addEventListener('input',refreshSkillList);
$('skill').addEventListener('change',()=>{active=skills.find(s=>s.id===$('skill').value);$('formulaEditor').value=skillFormula()?JSON.stringify(skillFormula(),null,2):'';render();});
for(const id of ['hard','plus','pct'])$(id).addEventListener('input',compute);
$('apply').addEventListener('click',()=>{try{if(!active)throw Error('Select a skill');const f=JSON.parse($('formulaEditor').value);if(f.kind!=='flat'||!Array.isArray(f.min)||!Array.isArray(f.max)||f.min.length!==6||f.max.length!==6||[...f.min,...f.max].some(x=>typeof x!=='number'||!Number.isFinite(x)))throw Error('Invalid flat formula: min/max require six numeric entries');if(f.synergy&&!Array.isArray(f.synergy))throw Error('synergy must be an array');overrides[active.id]=f;$('feedback').textContent='Applied locally. Copy into skills.js to make permanent.';render();coverage();}catch(e){$('feedback').textContent=e.message;}});
$('example').addEventListener('click',()=>{$('formulaEditor').value=JSON.stringify({kind:'flat',damageType:'magic',min:[10,4,5,6,7,8],max:[15,5,6,7,8,9],synergy:[{name:'Example synergy',pctPerHardPoint:0.06}]},null,2);$('feedback').textContent='Demonstration values only—not PD2 data.';});
$('reset').addEventListener('click',()=>{if(active)delete overrides[active.id];$('formulaEditor').value='';$('feedback').textContent='Temporary formula cleared.';render();coverage();});
function coverage(){const done=skills.filter(s=>s.formula||overrides[s.id]).length;$('coverage').textContent=`${done} / ${skills.length} candidate skill entries have formulas (${skills.length-done} remain).`;}
refreshSkillList();coverage();
