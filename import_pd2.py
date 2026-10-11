#!/usr/bin/env python3
"""Convert PD2 tab-separated Skills/Missiles into a browsable calculator catalogue.
Run: python3 import_pd2.py Skills.txt Missiles.txt Skilldesc.txt MissCalc.txt [MonStats.txt MonLvl.txt] > skills.js
Damage depends on in-game engine details; conservative direct-damage import only.
"""
import csv,json,re,sys
CLASS={'ama':'Amazon','ass':'Assassin','bar':'Barbarian','dru':'Druid','nec':'Necromancer','pal':'Paladin','sor':'Sorceress'}
DISPLAY_NAMES={'Royal Strike':'Phoenix Strike','Poison Dagger':'Poison Strike','Fire Trauma':'Fire Blast','Shock Field':'Shock Web','Wake of Fire Sentry':'Wake of Fire','Inferno Sentry':'Wake of Inferno','FireGolem':'Fire Golem','ClayGolem':'Clay Golem','BloodGolem':'Blood Golem','IronGolem':'Iron Golem','Plague Poppy':'Poison Creeper','Summon Fenris':'Summon Dire Wolf','Eruption':'Fissure','Enchant':'Enchant Fire','AmpDmg':'Amplify Damage','LowRes':'Lower Resist','CurMas':'Curse Mastery','Shape Shifting':'Lycanthropy','Wearbear':'Werebear','Wearwolf':'Werewolf','Dopplezon':'Decoy','Quickness':'Burst of Speed','Cycle of Life':'Carrion Vine','Vines':'Solar Creeper','Wake Of Fire Sentry':'Wake of Fire','Lightning bolt':'Lightning Bolt'}
TYPE={'mag':'magic','fire':'fire','cold':'cold','ltng':'lightning','pois':'poison','phys':'physical'}
def load(path):
 with open(path,encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f,delimiter='\t'))
def numeric(x):
 try:return float(x) if x and re.fullmatch(r'-?\d+(?:\.\d+)?',x.strip()) else None
 except:return None
def vals(r,keys):return [numeric(r.get(k,'')) for k in keys]
def extract_synergies(expr,r):
 if not expr:return [],True
 for param in re.findall(r'\bpar([1-8])\b',expr):
  if numeric(r.get('Param'+param,'')) is None:return [],False
 # Validates that expression is ONLY sum of one or more skill('<name>'.blvl) terms multiplied by parN or literal.
 terms=re.findall(r"skill\('([^']+)'\.blvl\)",expr)
 if not terms:return [],False
 replacement=re.sub(r"skill\('[^']+'\.blvl\)",'X',expr)
 # Instead of evaluating expression, derive coefficient by substituting one variable at a time and parsing restricted arithmetic.
 exprpy=expr.replace('skill(','skill(')
 def evaluate(values):
  x=re.sub(r"skill\('([^']+)'\.blvl\)",lambda m:str(values.get(m.group(1),0)),expr)
  x=re.sub(r'\bpar([1-8])\b',lambda m:str(numeric(r.get('Param'+m.group(1),'')) or 0),x)
  if not re.fullmatch(r'[0-9.\s+*/()\-]+',x):raise ValueError('complex formula')
  return eval(x,{'__builtins__':{}},{})
 try:
  base=evaluate({})
  if abs(base)>0.0001:return [],False
  out=[]
  for name in dict.fromkeys(terms):
   coeff=evaluate({name:1})
   if coeff<=0 or abs(evaluate({name:2})-2*coeff)>1e-6:return [],False
   out.append({'name':name,'pctPerHardPoint':coeff/100})
  if abs(evaluate(dict.fromkeys(terms,1))-sum(s['pctPerHardPoint']*100 for s in out))>0.0001:return [],False
  return out,True
 except Exception:return [],False

def charge_data(r, missiles):
 name=r['skill']
 if name not in ['Fists of Fire','Claws of Thunder','Blades of Ice','Royal Strike','Cobra Strike','Tiger Strike']:return None
 def component(label,source=None,physical=False,rate=False):
  row=r if source is None else missiles[source.lower()]
  keys=['MinDam','MinLevDam'] if source is None else ['MinDamage','MinLevDam']
  if physical:
   mn=vals(row,[keys[0]]+[keys[1]+str(i) for i in range(1,6)])
   mx=vals(row,['MaxDam' if source is None else 'MaxDamage']+['MaxLevDam'+str(i) for i in range(1,6)])
   typ='physical';expr=row.get('DmgSymPerCalc','')
  else:
   mn=vals(row,['EMin']+['EMinLev'+str(i) if source is None else 'MinELev'+str(i) for i in range(1,6)])
   mx=vals(row,['EMax' if source is None else 'Emax']+['EMaxLev'+str(i) if source is None else 'MaxELev'+str(i) for i in range(1,6)])
   typ=TYPE[row['EType']];expr=row.get('EDmgSymPerCalc','')
  if not all(x is not None for x in mn+mx):raise ValueError('Incomplete charge damage: '+label)
  synergy,ok=extract_synergies(expr,row)
  if not ok:raise ValueError('Unsupported charge synergy: '+expr)
  factor=2**(numeric(row.get('HitShift','')) or 0)/256
  if rate:factor*=25
  f={'kind':'flat','damageType':typ,'min':[v*factor for v in mn],'max':[v*factor for v in mx],'synergy':synergy,'source':'skill' if source is None else 'missile:'+source,'rawSynergy':expr}
  if typ=='poison':
   length=numeric(row.get('ELen',''))
   if not length:raise ValueError('Missing charge poison duration')
   f['min']=[v*length for v in f['min']];f['max']=[v*length for v in f['max']];f['poisonDurationSec']=length/25
  return {'label':label,'formula':f,'unit':'per second' if rate else 'per hit'}
 def stage(label,components,note=''):return {'label':label,'components':components,'note':note}
 if name=='Fists of Fire':return [
  stage('Charge 1 · Explosion',[component('Fire explosion'),component('Ground fire', 'fistsoffirefirewall',rate=True)],'Explosion damage and ground-fire damage per second are separate.'),
  stage('Charge 2 · Fire nova',[component('Fire nova','fistsoffirenova')]),
  stage('Charge 3 · Meteors',[component('Meteor impact · Fire','fofmeteor'),component('Meteor impact · Physical','fofmeteor',physical=True),component('Ground fire','fistsoffirefirewall',rate=True)],'Impact values are per meteor. Three meteors are released; they may hit different targets. Ground fire is shown per second, separately.')]
 if name=='Claws of Thunder':return [stage('Charge 1 · Lightning hit',[component('Lightning hit')]),stage('Charge 2 · Nova',[component('Lightning nova','clawsofthundernova')]),stage('Charge 3 · Charged bolts',[component('Charged bolt','clawsofthunderbolt'),component('Lightning strike','cotthunderstorm')],'Each bolt and its triggered lightning strike roll damage independently. Values are per bolt/strike, not all projectiles.')]
 if name=='Blades of Ice':return [stage('Charge 1 · Cold hit',[component('Cold hit')]),stage('Charge 2 · Ice waves',[component('Ice wave','boiwavetrail')],'Damage per wave hit.'),stage('Charge 3 · Ice bolts',[component('Ice bolt','boichaosice')],'Damage per bolt; not multiplied by projectile count.')]
 if name=='Royal Strike':return [stage('Charge 1 · Meteor',[component('Meteor impact','royalstrikemeteor'),component('Ground fire','royalstrikemeteorfire',rate=True)],'Fire-only meteor impact; ground fire is separate damage per second.'),stage('Charge 2 · Chain lightning',[component('Chain lightning','royalstrikechainlightning')],'Damage per target hit.'),stage('Charge 3 · Ice bolts',[component('Ice bolt','royalstrikechaosice')],'Damage per bolt.')]
 def weapon(label,base,increment,multiplier=1):return {'label':label,'unit':'per hit','formula':{'kind':'weapon','damageType':'physical','enhancedBase':base,'enhancedPerLevel':increment,'chargeMultiplier':multiplier,'min':[0]*6,'max':[0]*6,'synergy':[]}}
 if name=='Tiger Strike':return [stage('Charge '+str(i)+' · Physical hit',[weapon('Physical hit',float(r['Param1']),float(r['Param2']),i)],'Uses your weapon damage and other off-weapon enhanced damage inputs.') for i in range(1,4)]
 if name=='Cobra Strike':return [stage('Charge 1 · Poison bolts',[component('Poison bolt','cobrastrikepoisonbolt')],'Poison per bolt. Added Venom/gear poison is not included.'),stage('Charge 2 · Physical hit',[weapon('Physical hit',float(r['Param6'])+float(r['Param7']),float(r['Param7']))],'Life/mana leech bonus: '+r['Param1']+'% + '+r['Param2']+'% per additional skill level. Leech recovery and added gear damage are not calculated.'),stage('Charge 3 · Poison cloud',[component('Poison cloud','cobrastrikepoisoncloud')],'One poison application; added Venom/gear poison and repeated cloud applications are not included.')]

def make_data(skill_path,missile_path,desc_path=None,calc_path=None,monstats_path=None,monlvl_path=None):
 rows=load(skill_path); missiles=load(missile_path)
 descs={r["skilldesc"]:r for r in load(desc_path)} if desc_path else {}
 codes={r["code"]:r.get("*desc", "") for r in load(calc_path)} if calc_path else {}
 missile_by_name={r['Missile'].lower():r for r in missiles if r.get('Missile')}
 out=[]; stats={'direct':0,'missile':0,'review':0}
 for r in rows:
  if r.get('charclass') not in CLASS or not r.get('skill') or not r.get('Id','').isdigit():continue
  name=r['skill']; klass=CLASS[r['charclass']]; eid=r['Id']; stype=TYPE.get(r.get('EType',''))
  formula=None; reason='No direct damage fields or complex skill logic; requires manual review.'; origin='skill'
  # Direct physical damage often needs weapon damage, attack frames, and skills-specific transforms.
  # Accept only bare physical hits with no weapon source; still flag as review.
  opts=[]
  if stype:
   vmin=vals(r,['EMin']+['EMinLev'+str(i) for i in range(1,6)])
   vmax=vals(r,['EMax']+['EMaxLev'+str(i) for i in range(1,6)])
   if all(x is not None for x in vmin+vmax):opts.append((stype,vmin,vmax,r.get('EDmgSymPerCalc',''),'skill'))
  if not opts and not (numeric(r.get('SrcDam','')) or 0):
   mn=vals(r,['MinDam']+['MinLevDam'+str(i) for i in range(1,6)])
   mx=vals(r,['MaxDam']+['MaxLevDam'+str(i) for i in range(1,6)])
   if all(v is not None for v in mn+mx) and any(mn+mx):opts.append(('physical',mn,mx,r.get('DmgSymPerCalc',''),'skill'))
  # A skill may contain no elemental data but fire damage is on an associated missile. Cautious fallback.
  if not opts:
   names=[r.get(x,'') for x in ['srvmissile','srvmissilea','srvmissileb','srvmissilec']]
   for mname in names:
    m=missile_by_name.get(mname.lower())
    if not m:continue
    mt=TYPE.get(m.get('EType',''))
    mn=vals(m,['EMin']+['MinELev'+str(i) for i in range(1,6)])
    mx=vals(m,['Emax']+['MaxELev'+str(i) for i in range(1,6)])
    if mt and all(v is not None for v in mn+mx):
     opts.append((mt,mn,mx,m.get('EDmgSymPerCalc',''),'missile:'+mname));break
  if opts:
   typ,mn,mx,syn,origin=opts[0]
   sy,ok=extract_synergies(syn,r if origin=='skill' else missile_by_name[origin.split(':',1)[1].lower()])
   if ok:
    source_row=r if origin=='skill' else missile_by_name[origin.split(':',1)[1].lower()]
    shift=numeric(source_row.get('HitShift','')) or 0
    mn=[v*2**shift/256 for v in mn];mx=[v*2**shift/256 for v in mx]
    # Skills can contain additional damage components (phys + element); or require weapon scaling.
    complexity=bool(numeric(r.get('SrcDam','')) and numeric(r.get('SrcDam',''))>0)
    formula={'kind':'flat','damageType':typ,'min':mn,'max':mx,'synergy':sy,'source':origin,'rawSynergy':syn}
    if typ=='poison':
     length=numeric(r.get('ELen','')) if origin=='skill' else numeric(missile_by_name[origin.split(':',1)[1].lower()].get('ELen',''))
     if length and length>0:
      # Poison rate was converted using HitShift above; multiply by length in frames.
      formula['min']=[round(v*length,6) for v in mn];formula['max']=[round(v*length,6) for v in mx]
      formula['poisonDurationSec']=length/25
      formula['poisonLengthSteps']=[length]+[(numeric(source_row.get('ELevLen'+str(i),'')) or 0) for i in range(1,4)]
      
      formula['conversionNote']='Poison damage rate × base duration; HitShift-adjusted rate × length in frames.'
     else:formula=None;reason='Poison length unavailable; review required.'
    if formula:
     if complexity:reason='Skill may also use weapon-based damage; listed component only.'
     elif origin.startswith('missile'):reason='Missile component imported; multiple projectiles/impacts and special calculations excluded.'
     else:reason='Data-derived direct damage component; special multipliers and hits not modeled.'
     stats['missile' if origin.startswith('missile') else 'direct']+=1
  if not formula:stats['review']+=1
  charges=charge_data(r,missile_by_name)
  if charges and formula is None:formula=charges[0]['components'][0]['formula']
  desc=descs.get(r.get('skilldesc',''),{})
  display={k:v for k,v in desc.items() if v and (k.startswith(('ddam','p1dm','p2dm','p3dm','descmissile')) or k=='descdam')}
  out.append({'charges':charges,'descriptionDamage':display,'missileCalcCodes':{k:v for k,v in codes.items() if any(k in str(x) for x in display.values())},'id':klass.lower()+'-'+re.sub('[^a-z0-9]+','-',name.lower()).strip('-'),'gameId':int(eid),'name':DISPLAY_NAMES.get(name,name),'internalName':name,'className':klass,'formula':formula,'notes':reason})
 for entry in out:
  formulas=([entry['formula']] if entry['formula'] else [])+[c['formula'] for stage in entry.get('charges') or [] for c in stage['components']]
  for f in formulas:
   for sy in f.get('synergy',[]):
    sy['name']=DISPLAY_NAMES.get(sy['name'],sy['name'])
 from audit_pd2 import audit
 out=audit(out,rows,missiles,load(desc_path) if desc_path else [],(numeric,extract_synergies,TYPE,DISPLAY_NAMES))
 from summons_pd2 import add_summons
 out=add_summons(out,rows,load(monstats_path) if monstats_path else [],load(monlvl_path) if monlvl_path else [])
 # Keep archived models for audit, but omit equipment-dependent attacks from selection.
 for e in out:
  components=[c for stage in e.get('charges') or [] for c in stage['components']]
  if (e['formula'] and e['formula'].get('kind')=='weapon') or any(c['formula'].get('kind')=='weapon' for c in components) or (e['className']=='Barbarian' and e['name']!='War Cry'):
   e['excluded']=True;e['auditDetail']+=' Excluded from selection: requires player weapon/equipment damage inputs, or is outside the War Cry-only Barbarian scope.'
  if e['name']=='Thunder Storm':
   e.pop('charges',None);e['auditDetail']='One shared strike/nova lightning damage range is displayed. Wiki describes independent rolls; no doubled or combined hit is assumed.'
   e['info']='One shared lightning damage range for strike/nova; independent rolls are not added together.'
 stats['chargeSkills']=sum(bool(s.get('charges')) for s in out)
 stats['supported']=sum(s['formula'] is not None and not s.get('excluded') for s in out)
 stats['review']=len(out)-stats['supported']
 return out,stats
if __name__=='__main__':
 data,stats=make_data(*sys.argv[1:7]);print('// Generated from uploaded PD2 text files. Review special skill mechanics; do not assume exact displayed DPS.');print('const skills = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';');print('// Import summary: '+json.dumps(stats))
